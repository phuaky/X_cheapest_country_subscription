# X Premium Currency Converter

X Premium Currency Converter is a Chrome extension that allows users to convert X Premium pricing to their preferred currency on the X Premium page.

## Features

- Convert X Premium pricing to any supported currency
- Display converted prices directly on the X Premium page
- Show the cheapest 5 countries after conversion
- Support for multiple X Premium packages
- Daily updated exchange rates

## Installation

1. Clone this repository or download it as a ZIP file and extract it.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable "Developer mode" in the top right corner.
4. Click "Load unpacked" and select the directory containing the extension files.

## Setup

1. After installing the extension, click on the extension icon in your Chrome toolbar.
2. You'll need to enter an API key from ExchangeRate-API. If you don't have one:
   - Visit [ExchangeRate-API](https://www.exchangerate-api.com/) and sign up for a free account.
   - Once registered, copy your API key from the dashboard.
3. Paste your API key into the "API Key" field in the extension popup and click "Save API Key".

## Usage

1. Navigate to the X Premium pricing page: https://help.x.com/en/using-x/x-premium
2. Click on the X Premium Currency Converter extension icon in your Chrome toolbar.
3. Select your desired currency from the dropdown menu.
4. (Optional) Select a specific X Premium package from the "Select Package" dropdown. If left blank, it will convert prices for all packages.
5. Click the "Convert" button.
6. The prices on the X Premium page will update to show the converted amounts in your selected currency.
7. The popup will display the 5 cheapest countries based on the converted prices.

## Troubleshooting

- If prices are not updating, try refreshing the X Premium page and converting again.
- Ensure you have entered a valid API key from ExchangeRate-API.
- Check your internet connection, as the extension requires internet access to fetch exchange rates.

## Privacy

This extension uses ExchangeRate-API to fetch current exchange rates. No personal data is collected or transmitted by this extension.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.