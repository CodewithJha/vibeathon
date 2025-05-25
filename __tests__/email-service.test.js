import { EmailService } from '../email-service';

describe('EmailService', () => {
    let emailService;
    const mockDealData = {
        productName: 'Test Product',
        price: 99.99,
        reseller: 'Test Seller',
        rating: 4.5,
        deliveryDays: 3,
        responseTime: '2h'
    };

    beforeEach(() => {
        emailService = new EmailService();
        document.body.innerHTML = '';
    });

    describe('sendDealAlert', () => {
        it('should send email successfully', async () => {
            const userEmail = 'test@example.com';
            fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

            const result = await emailService.sendDealAlert(userEmail, mockDealData);

            expect(result.success).toBe(true);
            expect(fetchMock).toHaveBeenCalledWith(
                'https://api.sendgrid.com/v3/mail/send',
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Authorization': `Bearer ${emailService.SENDGRID_API_KEY}`,
                    })
                })
            );
        });

        it('should show error notification on failure', async () => {
            const userEmail = 'test@example.com';
            fetchMock.mockRejectOnce(new Error('API Error'));

            await expect(emailService.sendDealAlert(userEmail, mockDealData))
                .rejects.toThrow('API Error');

            const errorNotification = document.querySelector('.notification-content.error');
            expect(errorNotification).toBeTruthy();
        });
    });

    describe('createDealAlertEmail', () => {
        it('should create email content with correct format', () => {
            const emailContent = emailService.createDealAlertEmail(mockDealData);

            expect(emailContent.subject).toContain(mockDealData.productName);
            expect(emailContent.body).toContain(mockDealData.productName);
            expect(emailContent.body).toContain(mockDealData.price.toFixed(2));
            expect(emailContent.body).toContain(mockDealData.reseller);
        });
    });

    describe('showNotification', () => {
        it('should show and auto-remove success notification', async () => {
            jest.useFakeTimers();
            
            emailService.showNotification('test@example.com', 'success');
            
            const notification = document.querySelector('.email-notification');
            expect(notification).toBeTruthy();
            
            jest.advanceTimersByTime(5000);
            expect(document.querySelector('.email-notification')).toBeFalsy();
            
            jest.useRealTimers();
        });

        it('should keep sending notification visible', () => {
            jest.useFakeTimers();
            
            emailService.showNotification('test@example.com', 'sending');
            
            jest.advanceTimersByTime(5000);
            const notification = document.querySelector('.email-notification');
            expect(notification).toBeTruthy();
            
            jest.useRealTimers();
        });
    });
}); 