import '@testing-library/jest-dom';
import 'jest-fetch-mock';

// Mock the Web Speech API
global.webkitSpeechRecognition = class {
    constructor() {
        this.continuous = false;
        this.interimResults = false;
        this.lang = 'en-US';
    }
    start() {}
    stop() {}
    addEventListener() {}
    removeEventListener() {}
};

// Mock SendGrid API key
global.SENDGRID_API_KEY = 'TEST_KEY';

// Mock Google Sheets config
global.SHEETS_CONFIG = {
    spreadsheetId: 'TEST_SPREADSHEET_ID',
    credentials: {
        client_email: 'test@example.com',
        private_key: 'test_key'
    }
};

// Mock OmniDimension API key
global.OMNI_API_KEY = 'TEST_OMNI_KEY';

// Setup fetch mock
beforeEach(() => {
    fetchMock.resetMocks();
}); 