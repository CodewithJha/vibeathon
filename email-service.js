// Email Service using SendGrid
class EmailService {
    constructor() {
        this.emailHistory = [];
        this.SENDGRID_API_KEY = 'YOUR_SENDGRID_API_KEY'; // Replace with your actual SendGrid API key
        this.FROM_EMAIL = 'notifications@dealwise.com';
    }

    async sendDealAlert(userEmail, dealData) {
        const emailContent = this.createDealAlertEmail(dealData);
        
        try {
            // Show sending status in UI
            this.showNotification(userEmail, 'sending');

            const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.SENDGRID_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    personalizations: [{
                        to: [{ email: userEmail }],
                        subject: emailContent.subject
                    }],
                    from: { email: this.FROM_EMAIL, name: 'DealWise' },
                    content: [{
                        type: 'text/html',
                        value: this.convertToHTML(emailContent.body)
                    }]
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send email');
            }

            // Store in history
            this.emailHistory.push({
                to: userEmail,
                ...emailContent,
                timestamp: new Date()
            });

            // Show success notification
            this.showNotification(userEmail, 'success');

            return {
                success: true,
                messageId: response.headers.get('X-Message-Id'),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error sending email:', error);
            this.showNotification(userEmail, 'error');
            throw error;
        }
    }

    convertToHTML(body) {
        // Convert plain text email to HTML format
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { 
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                    }
                    .deal-info {
                        background: #f5f5f5;
                        padding: 20px;
                        border-radius: 8px;
                        margin: 20px 0;
                    }
                    .cta-button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #2563eb;
                        color: white;
                        text-decoration: none;
                        border-radius: 6px;
                        margin: 20px 0;
                    }
                </style>
            </head>
            <body>
                ${body.replace(/\n/g, '<br>')}
            </body>
            </html>
        `;
    }

    createDealAlertEmail(dealData) {
        const subject = `🎯 Great Deal Found: ${dealData.productName}`;
        
        const body = `
            <h1>Great Deal Alert!</h1>
            <p>We've found an amazing deal for you:</p>
            
            <div class="deal-info">
                <p>🏷️ <strong>Product:</strong> ${dealData.productName}</p>
                <p>💰 <strong>Price:</strong> $${dealData.price.toFixed(2)}</p>
                <p>🏪 <strong>Seller:</strong> ${dealData.reseller}</p>
                <p>⭐ <strong>Seller Rating:</strong> ${dealData.rating}</p>
                <p>🚚 <strong>Delivery Time:</strong> ${dealData.deliveryDays} days</p>
                <p>⏱️ <strong>Response Time:</strong> ${dealData.responseTime}</p>
            </div>

            <p>🔥 <strong>Why this is a great deal:</strong></p>
            <ul>
                <li>Competitive pricing</li>
                <li>Reliable seller</li>
                <li>Fast delivery</li>
                <li>Excellent value</li>
            </ul>

            <p>🔒 This offer has been verified by our AI agents</p>
            
            <a href="#" class="cta-button">View Deal Details</a>

            <p><em>Note: This deal may be time-sensitive. We recommend acting quickly if you're interested.</em></p>

            <p>Best regards,<br>DealWise Team</p>
        `;

        return { subject, body };
    }

    showNotification(userEmail, status) {
        // Remove any existing notification
        const existingNotification = document.querySelector('.email-notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'email-notification';

        let content = '';
        switch(status) {
            case 'sending':
                content = `
                    <div class="notification-content sending">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Sending email to ${userEmail}...</p>
                    </div>
                `;
                break;
            case 'success':
                content = `
                    <div class="notification-content success">
                        <i class="fas fa-check-circle"></i>
                        <p>Email sent successfully to ${userEmail}</p>
                    </div>
                `;
                break;
            case 'error':
                content = `
                    <div class="notification-content error">
                        <i class="fas fa-exclamation-circle"></i>
                        <p>Failed to send email to ${userEmail}</p>
                    </div>
                `;
                break;
        }

        notification.innerHTML = `
            ${content}
            <button class="close-notification">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to document
        document.body.appendChild(notification);

        // Handle close button
        const closeButton = notification.querySelector('.close-notification');
        closeButton.addEventListener('click', () => {
            notification.remove();
        });

        // Auto-remove after 5 seconds for success/error notifications
        if (status !== 'sending') {
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }, 5000);
        }
    }

    getEmailHistory() {
        return this.emailHistory;
    }
}

// Export the EmailService class
window.EmailService = EmailService; 