import { SheetsLogger } from '../sheets-integration';

describe('SheetsLogger', () => {
    let sheetsLogger;
    const mockDealData = {
        productName: 'Test Product',
        category: 'Electronics',
        price: 99.99,
        reseller: 'Test Seller',
        rating: 4.5,
        deliveryDays: 3,
        responseTime: '2h'
    };

    beforeEach(() => {
        sheetsLogger = new SheetsLogger();
        fetchMock.resetMocks();
    });

    describe('logDeal', () => {
        it('should log deal successfully with rate limiting', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

            const result = await sheetsLogger.logDeal(mockDealData);

            expect(result).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith(
                expect.stringContaining(sheetsLogger.spreadsheetId),
                expect.any(Object)
            );
        });

        it('should handle API errors', async () => {
            fetchMock.mockRejectOnce(new Error('API Error'));

            await expect(sheetsLogger.logDeal(mockDealData))
                .rejects.toThrow('Failed to log deal to Google Sheets');
        });
    });

    describe('RateLimiter', () => {
        it('should enforce rate limits', async () => {
            const startTime = Date.now();
            const promises = [];

            // Try to make 60 requests (more than the 50 per minute limit)
            for (let i = 0; i < 60; i++) {
                promises.push(sheetsLogger.rateLimiter.waitForSlot());
            }

            await Promise.all(promises);
            const duration = Date.now() - startTime;

            // Should take at least 1 minute due to rate limiting
            expect(duration).toBeGreaterThanOrEqual(60000);
        });
    });

    describe('logNegotiation', () => {
        const mockNegotiationData = {
            productName: 'Test Product',
            category: 'Electronics',
            maxPrice: 150,
            reseller: 'Test Seller',
            initialPrice: 120,
            rating: 4.5,
            responseTime: '2h'
        };

        it('should log negotiation with correct format', async () => {
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

            await sheetsLogger.logNegotiation(mockNegotiationData);

            const fetchCalls = fetchMock.mock.calls;
            const lastCall = fetchCalls[fetchCalls.length - 1];
            const requestBody = JSON.parse(lastCall[1].body);

            expect(requestBody.values[0]).toContain(mockNegotiationData.productName);
            expect(requestBody.values[0]).toContain(mockNegotiationData.category);
            expect(requestBody.values[0]).toContain('Negotiating');
        });
    });
}); 