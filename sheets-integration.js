// Google Sheets Integration Configuration
const SHEETS_CONFIG = {
    spreadsheetId: '1ZpcdQQwvQmsaqg0OdiFbDzuH71bSaRV2ID2WE3_mR0Q',
    credentials: {
        type: "service_account",
        project_id: "apis-key-409615",
        private_key_id: "6ed339a7fe8fba148155403173b84c3ac26fed40",
        private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDHXyKQ50QiIlPz\nj81Bv1+XzIxlwEKdsRsCdiq/S9jiAOfVwWn7VyEPE3OyMBd0POQ7VyY6EkkZNwca\nQtU4SfNFMcVUL7ZN4xnMnkiREYj5PsZWetp+w9TjDn00Yq/OGatC94VJFPz1KpGh\nVJfmJBJyoqeug6zDDG6kb8wG6X4ZgHi+SWW77QB+J2o32jhoJeXiPrrv5KosM51x\nbL9bXWGL9zLHY2So0jnWsMAaU2WvLtIFN7Q6gDsbbQGF/+Y8gLVnKAdCDaMwpHLT\nF9EVvDfxeVbzCx53BLayeJ2BmBg36RjgA1PSRzkdONlJehANiESlwOcv/hsdNSKu\n4xgo1663AgMBAAECggEAR1VOIEtmsNHYeL48YehPkxgQKb3K9/HsqIpQDCbeoCpT\nyMLNoSyQ+vxqOliDo8a/oE2zszZkqh1qsKY19NBctqaypEb38tEtI22EqEb+W7Nu\nsnV9ZLq7mkvOV2Zx4YuEn87BBR95zFxhQ7hpKuJAKXzyAvpA3368vZ/0f4qeYA/a\nF/cuayaT8JIB6lEymS6dCJiyNiZi3UsvrI4K6gQDibcULrqAmxpBnRGItgrTNhRe\nk7DaEg7+3YKvAnZxO3nQRiv/N4U5byt3sgH52HI8L6NyYgnb8M5gjh72/2v2B8km\nkT3F5+OcTK1ihaXIMP0hbThZhsIB9TK9besOvrUXRQKBgQDrLyGkZxnjfwSiQIeU\nD2hmyfDbsBXEuiVVJFXcLgLo1S5Rqo73lekVAbqxJuxH7ObFRRBAJacCl9CqT/49\n/drRW9uiDbD3TCrEZ7rJC5wk8y9/vGjINDlITPKXNbN5BIF7FOQ3jYFZWHEeJEul\n8J3KS3+cjy1ogGSkMgCLJPoeGwKBgQDZBI3Yrisc9lY/H0CjzrqwNIjRZutR52Wg\n6ouYpd4Tk6wvBxt5Shmz5xlbcv2CEgGD654dBT29SajsRD5UTlucThxeylCpo6BN\nuRVhlKQHEp70H4vdCULdflbBfAM4BDNmPZ75nru6ya4fK+Ggsp0fY6QgFjjcEHCh\nl2osF3sLlQKBgEbGFi+tPyMw9CoHlUU/JcHY/3x9Du/2vIlUt+nchs+eZ6P32bI0\nEMJblNz+w5gZeJDg6bUEH7AuE4NNM0tge1sJc5ze1eR1rWERfipGLiUIccDU6Atn\ne92AGnjaljnS20w4yzzUfppufQv/DCzRrgpUkgCBLb8G9EJdMcCtzf8FAoGBAM56\nSMNKIvbxYWm5QHUaMgGIWkxx0Z8hvE34Gk1oMv0JWZ988aTa3c2PKU8a/xwMKajs\nOol9/RnlxXTWET+BNiRnJRMDBvAAIHsSh8dJ9y5LhzTZ9uac8yNuGvkIFr/rL0Qt\niN4TKqYzURmTVJ7ikh/VW8izm/G1KpR0Ta4ZwRZpAoGBANyrjCxNG0CTwcdfs7DX\nBu+drv+O6SQxTrxGENO2O3H1o9ZrESQg+yxg798wt9ptQ3hwUUEbazZPlgtY85DR\nOsYoR8oToq3s+RZJRo+KHBskdi6GbQNPvt9D/IaDEdzdtoaRNxpR13++M2338NQP\nW03qEuZ/or+ddapUHVzg1ws+\n-----END PRIVATE KEY-----\n",
        client_email: "dealwise-sheets@apis-key-409615.iam.gserviceaccount.com",
        client_id: "100962161975554496906"
    }
};

class RateLimiter {
    constructor(maxRequests, timeWindow) {
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = [];
    }

    async waitForSlot() {
        const now = Date.now();
        this.requests = this.requests.filter(time => time > now - this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = oldestRequest + this.timeWindow - now;
            await new Promise(resolve => setTimeout(resolve, waitTime));
            return this.waitForSlot();
        }
        
        this.requests.push(now);
    }
}

class SheetsLogger {
    constructor() {
        this.spreadsheetId = SHEETS_CONFIG.spreadsheetId;
        this.rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute
        this.initialized = false;
    }

    async initialize() {
        try {
            // Initialize headers if not already set
            await this.setupHeaders();
            this.initialized = true;
        } catch (error) {
            console.error('Error initializing Google Sheets:', error);
            throw error;
        }
    }

    async setupHeaders() {
        const headers = [
            'Timestamp',
            'Product Name',
            'Category',
            'Max Price',
            'Reseller Name',
            'Final Price',
            'Delivery Days',
            'Seller Rating',
            'Response Time',
            'Negotiation Status'
        ];

        try {
            await this.appendRow(headers);
        } catch (error) {
            console.error('Error setting up headers:', error);
            throw error;
        }
    }

    async appendRow(values) {
        try {
            const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets/' + this.spreadsheetId + '/values/A1:append?valueInputOption=USER_ENTERED', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${await this.getAccessToken()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    values: [values]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to append row to sheet');
            }

            return await response.json();
        } catch (error) {
            console.error('Error appending row:', error);
            throw error;
        }
    }

    async getAccessToken() {
        try {
            const jwtHeader = {
                alg: 'RS256',
                typ: 'JWT'
            };

            const now = Math.floor(Date.now() / 1000);
            const jwtClaimSet = {
                iss: SHEETS_CONFIG.credentials.client_email,
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                aud: 'https://oauth2.googleapis.com/token',
                exp: now + 3600,
                iat: now
            };

            const encodedHeader = btoa(JSON.stringify(jwtHeader));
            const encodedClaimSet = btoa(JSON.stringify(jwtClaimSet));
            const signatureInput = `${encodedHeader}.${encodedClaimSet}`;
            
            // Note: In a production environment, you would use a proper JWT signing library
            // This is a simplified version for demonstration
            const signature = await this.signJWT(signatureInput, SHEETS_CONFIG.credentials.private_key);
            const jwt = `${signatureInput}.${signature}`;

            const response = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            console.error('Error getting access token:', error);
            throw error;
        }
    }

    async signJWT(input, privateKey) {
        // In a production environment, use a proper JWT signing library
        // This is a placeholder for demonstration
        return 'signed-jwt-token';
    }

    async logDeal(dealData) {
        await this.rateLimiter.waitForSlot();
        
        try {
            const timestamp = new Date().toISOString();
            const row = [
                timestamp,
                dealData.productName,
                dealData.category,
                dealData.maxPrice || '',
                dealData.reseller,
                dealData.price,
                dealData.deliveryDays,
                dealData.rating,
                dealData.responseTime,
                'Success'
            ];

            await this.appendRow(row);
            console.log('Deal logged successfully to Google Sheets');
            return true;
        } catch (error) {
            console.error('Error logging deal:', error);
            throw error;
        }
    }

    async logNegotiation(negotiationData) {
        if (!this.initialized) {
            await this.initialize();
        }

        const row = [
            new Date().toISOString(),
            negotiationData.productName,
            negotiationData.category,
            negotiationData.maxPrice || '',
            negotiationData.reseller,
            negotiationData.initialPrice,
            '',  // delivery days not known during negotiation
            negotiationData.rating,
            negotiationData.responseTime,
            'Negotiating'
        ];

        try {
            await this.appendRow(row);
            console.log('Negotiation logged successfully to Google Sheets');
        } catch (error) {
            console.error('Error logging negotiation:', error);
            throw error;
        }
    }
}

// Export the SheetsLogger class
window.SheetsLogger = SheetsLogger; 