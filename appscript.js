function convertPricesToSGD() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dataRange = sheet.getDataRange();
  var data = dataRange.getValues();

  // Get headers and their indices
  var headers = data[0];
  var countryIndex = headers.indexOf('Country');
  var priceIndex = headers.indexOf('Premium+ Tier Annual Pricing (Web)');
  var currencyCodeIndex = headers.indexOf('Currency Code');
  var outputIndex = headers.indexOf('Converted Price in SGD'); // Column I

  // If "Converted Price in SGD" header doesn't exist, add it to the next empty column
  if (outputIndex === -1) {
    outputIndex = headers.length;
    sheet.getRange(1, outputIndex + 1).setValue('Converted Price in SGD');
  }

  // Collect unique currency codes
  var currencyCodesObj = {};
  for (var i = 1; i < data.length; i++) {
    var currencyCode = data[i][currencyCodeIndex];
    Logger.log('Row ' + (i + 1) + ', Currency Code: ' + currencyCode);
    if (currencyCode && !currencyCodesObj[currencyCode]) {
      currencyCodesObj[currencyCode] = true;
    }
  }
  var uniqueCurrencyCodes = Object.keys(currencyCodesObj);
  Logger.log('Unique Currency Codes: ' + uniqueCurrencyCodes);

  // Fetch exchange rates to SGD
  var exchangeRates = getExchangeRates(uniqueCurrencyCodes, 'SGD');

  // For each row, convert the price to SGD
  for (var i = 1; i < data.length; i++) {
    var currencyCode = data[i][currencyCodeIndex];
    var priceString = data[i][priceIndex];
    var amount = parsePrice(priceString);
    var exchangeRate = exchangeRates[currencyCode];

    if (amount !== null && exchangeRate) {
      var convertedAmount = amount / exchangeRate; // Since rates are SGD to other currencies
      // Round to two decimal places
      convertedAmount = Math.round(convertedAmount * 100) / 100;
      sheet.getRange(i + 1, outputIndex + 1).setValue(convertedAmount);
    } else {
      sheet.getRange(i + 1, outputIndex + 1).setValue('N/A');
    }
  }

  Logger.log('Prices converted to SGD in column ' + (outputIndex + 1));
}

function getExchangeRates(currencyCodes, baseCurrency) {
  var exchangeRates = {};

  if (!currencyCodes || currencyCodes.length === 0) {
    Logger.log('No currency codes provided to getExchangeRates.');
    return exchangeRates;
  }

  var apiUrl =
    'https://api.exchangerate.host/latest?base=' +
    baseCurrency +
    '&symbols=' +
    currencyCodes.join(',');

  // Fetch exchange rates
  try {
    var response = UrlFetchApp.fetch(apiUrl);
    var json = JSON.parse(response.getContentText());

    if (json && json.rates) {
      exchangeRates = json.rates;
    }
  } catch (e) {
    Logger.log('Error fetching exchange rates: ' + e);
  }
  return exchangeRates;
}

function parsePrice(priceString) {
  if (typeof priceString !== 'string') {
    return null;
  }
  // Remove currency symbols and any non-numeric characters except dot and comma
  var cleanString = priceString.replace(/[^0-9.,-]/g, '');

  // Handle different decimal and thousand separators
  var commaCount = (cleanString.match(/,/g) || []).length;
  var dotCount = (cleanString.match(/\./g) || []).length;

  if (commaCount > 1 && dotCount === 0) {
    // Comma as thousand separator, remove commas
    cleanString = cleanString.replace(/,/g, '');
  } else if (commaCount === 1 && dotCount === 0) {
    // Comma as decimal separator, replace with dot
    cleanString = cleanString.replace(',', '.');
  } else if (dotCount > 1 && commaCount === 0) {
    // Dot as thousand separator, remove dots
    cleanString = cleanString.replace(/\./g, '');
  } else if (dotCount === 1 && commaCount === 0) {
    // Dot as decimal separator, keep as is
  } else if (commaCount > 1 && dotCount > 0) {
    // Unusual format, remove commas
    cleanString = cleanString.replace(/,/g, '');
  } else {
    // Remove any commas used as thousand separators
    cleanString = cleanString.replace(/,/g, '');
  }

  var amount = parseFloat(cleanString);
  if (isNaN(amount)) {
    return null;
  }
  return amount;
}

function mapCurrencyCodes() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = sheet.getDataRange().getValues();
  var header = data.shift(); // Remove header row

  // Add "Currency Code" header to column H if it doesn't exist
  if (header[7] !== 'Currency Code') {
    sheet.getRange(1, 8).setValue('Currency Code');
  }

  var currencyMap = {
    // Countries priced in USD
    'United States': 'USD',
    Argentina: 'USD',
    Afghanistan: 'USD',
    Albania: 'USD',
    Algeria: 'USD',
    Angola: 'USD',
    Anguilla: 'USD',
    'Antigua and Barbuda': 'USD',
    Armenia: 'USD',
    Aruba: 'USD',
    Azerbaijan: 'USD',
    Bahamas: 'USD',
    Bahrain: 'USD',
    Barbados: 'USD',
    Belarus: 'USD',
    Belize: 'USD',
    Benin: 'USD',
    Bermuda: 'USD',
    Bhutan: 'USD',
    Bolivia: 'USD',
    Botswana: 'USD',
    'British Virgin Islands': 'USD',
    Brunei: 'USD',
    'Burkina Faso': 'USD',
    Cambodia: 'USD',
    Cameroon: 'USD',
    'Cape Verde': 'USD',
    'Cayman Islands': 'USD',
    Chad: 'USD',
    Comoros: 'USD',
    'Congo, Democratic Republic of the (Kinshasa)': 'USD',
    'Congo, Republic of the (Brazzaville)': 'USD',
    'Costa Rica': 'USD',
    "Cote D'Ivoire": 'USD',
    Djibouti: 'USD',
    Dominica: 'USD',
    'Dominican Republic': 'USD',
    Ecuador: 'USD',
    'El Salvador': 'USD',
    'Equatorial Guinea': 'USD',
    Eritrea: 'USD',
    Fiji: 'USD',
    Gabon: 'USD',
    Gambia: 'USD',
    Georgia: 'USD',
    Ghana: 'USD',
    Grenada: 'USD',
    Guatemala: 'USD',
    Guinea: 'USD',
    'Guinea-Bissau': 'USD',
    Guyana: 'USD',
    Haiti: 'USD',
    Honduras: 'USD',
    Iraq: 'USD',
    Jamaica: 'USD',
    Jordan: 'USD',
    Kuwait: 'USD',
    Kyrgyzstan: 'USD',
    Laos: 'USD',
    Lebanon: 'USD',
    Liberia: 'USD',
    Libya: 'USD',
    Macau: 'USD',
    Madagascar: 'USD',
    Malawi: 'USD',
    Maldives: 'USD',
    Mali: 'USD',
    Mauritania: 'USD',
    Mauritius: 'USD',
    Micronesia: 'USD',
    Moldova: 'USD',
    Mongolia: 'USD',
    Montserrat: 'USD',
    Morocco: 'USD',
    Mozambique: 'USD',
    Myanmar: 'USD',
    Namibia: 'USD',
    Nauru: 'USD',
    Nepal: 'USD',
    Nicaragua: 'USD',
    Niger: 'USD',
    'North Macedonia': 'USD',
    Oman: 'USD',
    Palau: 'USD',
    Panama: 'USD',
    'Papua New Guinea': 'USD',
    Paraguay: 'USD',
    Peru: 'USD',
    Qatar: 'USD',
    Rwanda: 'USD',
    Samoa: 'USD',
    'São Tomé and Príncipe': 'USD',
    Senegal: 'USD',
    Seychelles: 'USD',
    'Sierra Leone': 'USD',
    'Solomon Islands': 'USD',
    Somalia: 'USD',
    'Sri Lanka': 'USD',
    'St. Kitts and Nevis': 'USD',
    'St. Lucia': 'USD',
    'St. Vincent and the Grenadines': 'USD',
    Suriname: 'USD',
    Tajikistan: 'USD',
    Tonga: 'USD',
    'Trinidad and Tobago': 'USD',
    Tunisia: 'USD',
    Turkmenistan: 'USD',
    'Turks and Caicos Islands': 'USD',
    Uganda: 'USD',
    Uruguay: 'USD',
    Uzbekistan: 'USD',
    Vanuatu: 'USD',
    Venezuela: 'USD',
    Yemen: 'USD',
    Zambia: 'USD',
    Zimbabwe: 'USD',
    Eswatini: 'USD',

    // Countries priced in EUR
    France: 'EUR',
    Germany: 'EUR',
    Spain: 'EUR',
    Italy: 'EUR',
    Portugal: 'EUR',
    Netherlands: 'EUR',
    Ireland: 'EUR',
    Belgium: 'EUR',
    Finland: 'EUR',
    Greece: 'EUR',
    Austria: 'EUR',
    Lithuania: 'EUR',
    Slovakia: 'EUR',
    Latvia: 'EUR',
    Slovenia: 'EUR',
    Estonia: 'EUR',
    Croatia: 'EUR',
    Luxembourg: 'EUR',
    Malta: 'EUR',
    Cyprus: 'EUR',
    'San Marino': 'EUR',
    Serbia: 'EUR',
    'Vatican City': 'EUR',
    Monaco: 'EUR',
    Kosovo: 'EUR',
    Montenegro: 'EUR',
    'Bosnia and Herzegovina': 'EUR',
    Togo: 'EUR',
    'Central African Republic': 'EUR',

    // Countries priced in GBP
    'United Kingdom': 'GBP',
    Gibraltar: 'GBP',

    // Other countries and their pricing currencies
    Canada: 'CAD',
    Australia: 'AUD',
    'New Zealand': 'NZD',
    Japan: 'JPY',
    Brazil: 'BRL',
    India: 'INR',
    Indonesia: 'IDR',
    'Saudi Arabia': 'SAR',
    Poland: 'PLN',
    Sweden: 'SEK',
    Romania: 'RON',
    'Czech Republic': 'CZK',
    Denmark: 'DKK',
    Hungary: 'HUF',
    Bulgaria: 'BGN',
    Turkey: 'TRY',
    Mexico: 'MXN',
    Thailand: 'THB',
    Philippines: 'PHP',
    'South Africa': 'ZAR',
    'South Korea': 'KRW',
    Egypt: 'EGP',
    Nigeria: 'NGN',
    Malaysia: 'MYR',
    Colombia: 'COP',
    Chile: 'CLP',
    Singapore: 'SGD',
    'United Arab Emirates (UAE)': 'AED',
    Ukraine: 'USD', // Priced in USD according to your table
    Kenya: 'KES',
    Israel: 'ILS',
    Switzerland: 'CHF',
    Liechtenstein: 'CHF',
    Iceland: 'ISK',
    Norway: 'NOK',
    'Hong Kong': 'HKD',
    Pakistan: 'PKR',
    Peru: 'PEN',
    Taiwan: 'TWD',
    Tanzania: 'TZS',
    Vietnam: 'VND',
    Kazakhstan: 'KZT',
    Bangladesh: 'BDT',
    'Sri Lanka': 'USD', // Priced in USD according to your table
    Somolia: 'USD', // Priced in USD according to your table
  };

  for (var i = 0; i < data.length; i++) {
    var country = data[i][0];
    var currencyCode = currencyMap[country] || '';
    sheet.getRange(i + 2, 8).setValue(currencyCode);
  }

  Logger.log('Currency codes mapped to column H');
}
