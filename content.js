function extractPricingData() {
  const table = document.querySelector('table');
  if (!table) return null;

  const rows = table.querySelectorAll('tr');
  const pricingData = [];

  rows.forEach((row, index) => {
    if (index === 0) return; // Skip header row
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) return;

    const country = cells[0].textContent.trim();
    const price = cells[1].textContent.trim();
    const currencyCode = getCurrencyCode(country);

    pricingData.push({ country, price, currencyCode });
  });

  return pricingData;
}

function getCurrencyCode(country) {
  // Use window.currencyMap instead of currencyMap
  return window.currencyMap[country] || 'Unknown';
}

function addConvertedPriceColumns(targetCurrency) {
  const table = document.querySelector('table');
  if (!table) return;

  const headerRow = table.querySelector('tr');
  if (!headerRow) return;

  const currencyCodeHeader = document.createElement('th');
  currencyCodeHeader.textContent = 'Currency Code';
  currencyCodeHeader.classList.add('currency-code-header');
  headerRow.appendChild(currencyCodeHeader);

  const convertedPriceHeader = document.createElement('th');
  convertedPriceHeader.textContent = `Price in ${targetCurrency}`;
  convertedPriceHeader.classList.add('converted-price-header');
  headerRow.appendChild(convertedPriceHeader);

  const dataRows = table.querySelectorAll('tr');
  dataRows.forEach((row, index) => {
    if (index === 0) return; // Skip header row

    const currencyCodeCell = document.createElement('td');
    currencyCodeCell.id = `currency-code-${index - 1}`;
    currencyCodeCell.classList.add('currency-code-cell');
    row.appendChild(currencyCodeCell);

    const convertedPriceCell = document.createElement('td');
    convertedPriceCell.id = `converted-price-${index - 1}`;
    convertedPriceCell.textContent = 'Loading...';
    convertedPriceCell.classList.add('converted-price-cell');
    row.appendChild(convertedPriceCell);
  });
}

function updatePrices(rates, targetCurrency, selectedPackage) {
  const table = document.querySelector('table');
  if (!table) return;

  const headerRow = table.querySelector('tr');
  const headers = Array.from(headerRow.querySelectorAll('th'));
  const packageIndex = selectedPackage
    ? headers.findIndex(
        (header) => header.textContent.trim() === selectedPackage
      )
    : 1; // Default to the first pricing column if no package is selected

  if (packageIndex === -1) return;

  const rows = table.querySelectorAll('tr');
  const priceData = [];

  rows.forEach((row, index) => {
    if (index === 0) return; // Skip header row

    const cells = row.querySelectorAll('td');
    const country = cells[0].textContent.trim();
    const price = cells[packageIndex].textContent.trim();
    const currencyCode = getCurrencyCode(country);

    const currencyCodeCell = row.querySelector('.currency-code-cell');
    const convertedPriceCell = row.querySelector('.converted-price-cell');

    if (!currencyCodeCell || !convertedPriceCell) return;

    currencyCodeCell.textContent = currencyCode;

    // Updated price parsing logic
    let originalAmount;
    if (currencyCode === 'PEN') {
      // For Peru, remove 'S/.' and any commas, then parse
      originalAmount = parseFloat(price.replace('S/.', '').replace(',', ''));
    } else {
      // For other countries, use the existing logic
      originalAmount = parseFloat(price.replace(/[^0-9.]/g, ''));
    }

    if (isNaN(originalAmount)) {
      convertedPriceCell.textContent = 'N/A';
      return;
    }

    const rate = rates[currencyCode];
    if (!rate) {
      convertedPriceCell.textContent = 'N/A';
      return;
    }

    const convertedAmount = originalAmount / rate;
    convertedPriceCell.textContent = `${targetCurrency} ${convertedAmount.toFixed(
      2
    )}`;

    priceData.push({ country, convertedAmount });
  });

  // Sort and get the cheapest 5
  const cheapest5 = priceData
    .sort((a, b) => a.convertedAmount - b.convertedAmount)
    .slice(0, 5);

  // Send the cheapest 5 to the popup
  chrome.runtime.sendMessage({ action: 'updateCheapest5', cheapest5 });

  return { success: true };
}

function init() {
  chrome.storage.local.get(['baseCurrency'], (result) => {
    const baseCurrency = result.baseCurrency || 'SGD';

    const table = document.querySelector('table');
    if (table) {
      addConvertedPriceColumns(baseCurrency);
      chrome.runtime.sendMessage(
        { action: 'fetchExchangeRates', base: baseCurrency },
        (response) => {
          if (response.success) {
            updatePrices(response.rates, baseCurrency);
          } else {
            console.error('Failed to fetch exchange rates:', response.error);
          }
        }
      );
    } else {
      const observer = new MutationObserver((mutations, obs) => {
        const table = document.querySelector('table');
        if (table) {
          addConvertedPriceColumns(baseCurrency);
          chrome.runtime.sendMessage(
            { action: 'fetchExchangeRates', base: baseCurrency },
            (response) => {
              if (response.success) {
                updatePrices(response.rates, baseCurrency);
              } else {
                console.error(
                  'Failed to fetch exchange rates:',
                  response.error
                );
              }
            }
          );
          obs.disconnect();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }
  });

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateCurrency') {
      chrome.storage.local.get(['exchangeRates'], (result) => {
        if (result.exchangeRates) {
          updatePrices(result.exchangeRates, request.currency, request.package);
          sendResponse({ success: true });
        } else {
          console.error('Exchange rates not found in storage');
          sendResponse({ success: false });
        }
      });
      return true; // Indicates that the response is asynchronous
    } else if (request.action === 'getPackages') {
      sendResponse({ packages: getPackages() });
    }
  });
}

init();

function getPackages() {
  const table = document.querySelector('table');
  if (!table) return [];

  const headerRow = table.querySelector('tr');
  if (!headerRow) return [];

  const headers = Array.from(headerRow.querySelectorAll('th'));
  return headers.slice(1).map((header) => header.textContent.trim());
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateCurrency') {
    chrome.storage.local.get(['exchangeRates'], (result) => {
      if (result.exchangeRates) {
        updatePrices(result.exchangeRates, request.currency, request.package);
        sendResponse({ success: true });
      } else {
        console.error('Exchange rates not found in storage');
        sendResponse({ success: false });
      }
    });
    return true; // Indicates that the response is asynchronous
  } else if (request.action === 'getPackages') {
    sendResponse({ packages: getPackages() });
  }
});
