# DealWise - AI-Powered Deal Finding Platform

DealWise is an innovative platform that uses AI to help users find the best deals on limited-edition products, concert tickets, and collectibles. The platform features voice-enabled search and automated price negotiations with resellers.

## Features

### Core Functionality
- **Voice-Enabled Search**: Use voice commands to search for products
- **AI Price Negotiation**: Automated negotiation with multiple resellers
- **Real-Time Deal Comparison**: Compare prices, delivery times, and seller ratings
- **Email Notifications**: Get instant alerts for the best deals
- **Deal Analytics**: Track price history and market trends

### Technical Features
- **Voice Recognition**: Web Speech API integration
- **AI Integration**: OmniDimension API for intelligent negotiations
- **Data Logging**: Google Sheets integration for deal tracking
- **Email Service**: SendGrid integration for notifications
- **Responsive Design**: Mobile-first approach with modern UI

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Modern web browser with Web Speech API support
- API keys for:
  - OmniDimension AI
  - SendGrid
  - Google Sheets

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dealwise.git
cd dealwise
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory and add your API keys:
```env
OMNI_API_KEY=your_omni_dimension_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
GOOGLE_SHEETS_API_KEY=your_google_sheets_api_key
SPREADSHEET_ID=your_google_spreadsheet_id
```

4. Start the development server:
```bash
npm run dev
```

### Demo Mode
The application includes a demo mode for testing without API keys:
- Set `DEMO_MODE = true` in the configuration
- Mock data will be used for resellers and negotiations
- All features can be tested without real API calls

## Technology Stack

### Frontend
- HTML5/CSS3/JavaScript (ES6+)
- Web Speech API for voice recognition
- Font Awesome for icons
- CSS Grid/Flexbox for responsive layout

### Backend Integration
- OmniDimension AI API for negotiations
- SendGrid API for email notifications
- Google Sheets API for data logging
- Fetch API for HTTP requests

## Usage Guide

### Voice Search
1. Click the microphone icon
2. Speak your search query (e.g., "Find Nike Air Jordan 1 under $300")
3. The AI agent will process your request

### Text Search
1. Enter product name
2. Set maximum price (optional)
3. Select category
4. Click "Find Deals"

### Deal Notifications
1. Enter your email address
2. Click "Get Email Details" on any deal
3. Receive detailed information and price alerts

## Configuration

### OmniDimension AI Settings
```javascript
const OMNI_CONFIG = {
    agentConfig: {
        name: 'DealWise Agent',
        language: 'en-US',
        voice: 'neural-1'
    }
}
```

### Email Template Customization
Modify `email-service.js` to customize email templates:
```javascript
createDealAlertEmail(dealData) {
    // Customize email content and styling
}
```

### Google Sheets Integration
Configure in `sheets-logger.js`:
- Sheet name: 'Deals'
- Columns: Timestamp, Product, Price, Seller, etc.

## Data Structure

### Deal Object
```javascript
{
    reseller: string,
    price: number,
    originalPrice: number,
    discount: number,
    deliveryDays: number,
    rating: number,
    responseTime: string,
    availability: boolean
}
```

### Negotiation Log
```javascript
{
    type: 'agent' | 'reseller' | 'success' | 'error',
    timestamp: Date,
    message: string
}
```

## Testing

Run the test suite:
```bash
npm test
```

Test coverage includes:
- Voice recognition functionality
- Price negotiation logic
- Email notification system
- Data logging operations

## Security

- API keys stored securely in environment variables
- Input validation for all user data
- Rate limiting for API calls
- Secure email handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@dealwise.com or create an issue in the repository.

## Acknowledgments

- OmniDimension AI for their powerful negotiation API
- SendGrid for email services
- Google Sheets API for data management
- All contributors and testers

---

Made with ❤️ by the DealWise Team 