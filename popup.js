document.addEventListener('DOMContentLoaded', function () {
  const currencySelect = document.getElementById('currency');
  const packageSelect = document.getElementById('package');
  const apiKeyInput = document.getElementById('apiKey');
  const saveApiKeyButton = document.getElementById('saveApiKey');
  const convertButton = document.getElementById('convertButton');
  const statusElement = document.getElementById('status');
  const cheapest5List = document.getElementById('cheapest5');

  // Use the global currencyMap object
  const currencies = [...new Set(Object.values(window.currencyMap))];
  currencies.sort();

  currencies.forEach((currency) => {
    const option = document.createElement('option');
    option.value = currency;
    option.textContent = currency;
    currencySelect.appendChild(option);
  });

  currencySelect.value = 'SGD';
  chrome.storage.local.set({ baseCurrency: 'SGD' });

  // Fetch package options from the content script
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'getPackages' },
      function (response) {
        if (response && response.packages) {
          response.packages.forEach((package) => {
            const option = document.createElement('option');
            option.value = package;
            option.textContent = package;
            packageSelect.appendChild(option);
          });
        }
      }
    );
  });

  packageSelect.addEventListener('change', function () {
    updatePrices();
  });

  currencySelect.addEventListener('change', function () {
    updatePrices();
  });

  convertButton.addEventListener('click', function () {
    updatePrices();
    statusElement.textContent = 'Converting...';
  });

  function updatePrices() {
    const selectedCurrency = currencySelect.value;
    const selectedPackage = packageSelect.value;
    chrome.storage.local.set({ baseCurrency: selectedCurrency }, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: 'updateCurrency',
            currency: selectedCurrency,
            package: selectedPackage,
          },
          function (response) {
            if (response && response.success) {
              statusElement.textContent = 'Conversion complete!';
            } else {
              statusElement.textContent =
                'Conversion failed. Please try again.';
            }
          }
        );
      });
      checkAndUpdateRates();
    });
  }

  saveApiKeyButton.addEventListener('click', function () {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      statusElement.textContent = 'Please enter an API key.';
      return;
    }
    chrome.storage.local.set({ apiKey: apiKey }, function () {
      statusElement.textContent = 'API key saved successfully!';
      setTimeout(() => {
        statusElement.textContent = '';
      }, 3000);
    });
  });

  chrome.storage.local.get(['apiKey'], function (result) {
    if (result.apiKey) {
      apiKeyInput.value = result.apiKey;
    }
  });

  function displayCheapest5(cheapest5) {
    cheapest5List.innerHTML = '';
    cheapest5.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = `${item.country}: ${
        currencySelect.value
      } ${item.convertedAmount.toFixed(2)}`;
      cheapest5List.appendChild(li);
    });
  }

  // Add listener for cheapest 5 updates
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'updateCheapest5') {
      displayCheapest5(request.cheapest5);
    }
  });

  checkAndUpdateRates();
});

function checkAndUpdateRates() {
  chrome.storage.local.get(['exchangeRates', 'lastFetched'], (result) => {
    const now = new Date();
    const today = now.toDateString();
    const lastFetched = result.lastFetched
      ? new Date(result.lastFetched)
      : null;

    if (
      !result.exchangeRates ||
      !lastFetched ||
      lastFetched.toDateString() !== today
    ) {
      console.log('Fetching new exchange rates for today');
      chrome.runtime.sendMessage(
        { action: 'fetchExchangeRates' },
        (response) => {
          if (response.success) {
            chrome.storage.local.set(
              { exchangeRates: response.rates, lastFetched: now.getTime() },
              () => {
                console.log('Exchange rates updated for', today);
              }
            );
          } else {
            console.error('Failed to update exchange rates:', response.error);
          }
        }
      );
    } else {
      console.log(
        'Using stored exchange rates from',
        lastFetched.toDateString()
      );
    }
  });
}
