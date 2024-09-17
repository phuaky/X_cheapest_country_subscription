chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchExchangeRates') {
    fetchExchangeRates(request.base)
      .then((rates) => sendResponse({ success: true, rates: rates }))
      .catch((error) =>
        sendResponse({ success: false, error: error.toString() })
      );
    return true;
  }
});

async function fetchExchangeRates(base = 'SGD') {
  try {
    const result = await chrome.storage.local.get(['apiKey']);
    const apiKey = result.apiKey;

    if (!apiKey) {
      throw new Error(
        'API key not found. Please set it in the extension popup.'
      );
    }

    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${base}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    if (data.result === 'success') {
      console.log(
        'Exchange rates fetched successfully:',
        data.conversion_rates
      );
      return data.conversion_rates;
    } else {
      throw new Error('Failed to fetch exchange rates');
    }
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    throw error;
  }
}

chrome.runtime.onStartup.addListener(checkAndUpdateRates);

function checkAndUpdateRates() {
  chrome.storage.local.get(
    ['exchangeRates', 'lastFetched', 'baseCurrency'],
    (result) => {
      const now = new Date();
      const today = now.toDateString();
      const lastFetched = result.lastFetched
        ? new Date(result.lastFetched)
        : null;
      const baseCurrency = result.baseCurrency || 'SGD';

      if (
        !result.exchangeRates ||
        !lastFetched ||
        lastFetched.toDateString() !== today
      ) {
        console.log('Fetching new exchange rates for today');
        fetchExchangeRates(baseCurrency)
          .then((rates) => {
            chrome.storage.local.set(
              { exchangeRates: rates, lastFetched: now.getTime() },
              () => {
                console.log('Exchange rates updated for', today);
              }
            );
          })
          .catch((error) => {
            console.error('Failed to update exchange rates:', error);
          });
      } else {
        console.log(
          'Using stored exchange rates from',
          lastFetched.toDateString()
        );
      }
    }
  );
}
