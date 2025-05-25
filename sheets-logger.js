class SheetsLogger {
    constructor() {
        this.SHEETS_API_KEY = 'YOUR_GOOGLE_SHEETS_API_KEY'; // Replace with your actual API key
        this.SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // Replace with your actual spreadsheet ID
        this.initialized = false;
    }

    async initialize() {
        try {
            // Load the Google Sheets API client
            await this.loadGoogleSheetsAPI();
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('Error initializing Google Sheets:', error);
            throw error;
        }
    }

    async loadGoogleSheetsAPI() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://apis.google.com/js/api.js';
            script.onload = () => {
                gapi.load('client', async () => {
                    try {
                        await gapi.client.init({
                            apiKey: this.SHEETS_API_KEY,
                            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4']
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            };
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }

    async logDealData(dealData) {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const values = [
                [
                    new Date().toISOString(),
                    dealData.productName,
                    dealData.reseller,
                    dealData.price.toString(),
                    dealData.deliveryDays.toString(),
                    dealData.rating.toString(),
                    dealData.responseTime
                ]
            ];

            const response = await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: this.SPREADSHEET_ID,
                range: 'Deals!A:G',
                valueInputOption: 'USER_ENTERED',
                insertDataOption: 'INSERT_ROWS',
                resource: {
                    values: values
                }
            });

            return {
                success: true,
                updatedRange: response.result.updates.updatedRange
            };
        } catch (error) {
            console.error('Error logging to Google Sheets:', error);
            throw error;
        }
    }

    async getLoggedDeals() {
        if (!this.initialized) {
            await this.initialize();
        }

        try {
            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: this.SPREADSHEET_ID,
                range: 'Deals!A:G'
            });

            return response.result.values || [];
        } catch (error) {
            console.error('Error fetching deals from Google Sheets:', error);
            throw error;
        }
    }
} 