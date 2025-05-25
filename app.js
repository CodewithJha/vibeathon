// Configuration
const DEMO_MODE = true; // Set to true for demo mode

// DOM Elements
const startSearchBtn = document.getElementById('startSearch');
const searchButton = document.getElementById('searchButton');
const productNameInput = document.getElementById('productName');
const maxPriceInput = document.getElementById('maxPrice');
const categorySelect = document.getElementById('category');
const resultsContainer = document.getElementById('results');
const dealsGrid = document.getElementById('dealsGrid');
const loadingSpinner = document.getElementById('loadingSpinner');
const voiceStatus = document.getElementById('voiceStatus');
const negotiationStatus = document.getElementById('negotiationStatus');
const negotiationLog = document.getElementById('negotiationLog');

// Mock data for demonstration
const mockResellers = [
    { name: 'Premium Deals', rating: 4.8, responseTime: '2h' },
    { name: 'FastShip Store', rating: 4.5, responseTime: '1h' },
    { name: 'Authentic Finds', rating: 4.9, responseTime: '3h' },
    { name: 'Deal Masters', rating: 4.6, responseTime: '4h' },
    { name: 'Top Sellers', rating: 4.7, responseTime: '2h' }
];

// Initialize OmniDimension agent
const omniAgent = new OmniAgent();
let isAgentInitialized = false;

// Initialize the agent when the page loads
async function initializeOmniAgent() {
    try {
        await omniAgent.initializeAgent();
        isAgentInitialized = true;
        console.log('OmniDimension agent initialized successfully');
        startSearchBtn.disabled = false;
        startSearchBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Voice Search';
    } catch (error) {
        console.error('Failed to initialize OmniDimension agent:', error);
        startSearchBtn.innerHTML = '<i class="fas fa-exclamation-circle"></i> Agent Unavailable';
        startSearchBtn.classList.add('error');
    }
}

// Initialize agent immediately
initializeOmniAgent();

// Voice recognition setup
let recognition = null;
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
}

// Initialize voice recognition
startSearchBtn.addEventListener('click', async () => {
    if (!isAgentInitialized) {
        alert('AI agent is initializing. Please wait a moment and try again.');
        // Try to initialize again
        await initializeOmniAgent();
        return;
    }

    if (recognition) {
        startVoiceRecognition();
    } else {
        alert('Voice recognition is not supported in your browser. Please use the text input instead.');
    }
});

function startVoiceRecognition() {
    startSearchBtn.disabled = true;
    voiceStatus.classList.remove('hidden');
    
    recognition.start();
    
    recognition.onresult = (event) => {
        const voiceInput = event.results[0][0].transcript;
        processVoiceInput(voiceInput);
    };
    
    recognition.onend = () => {
        startSearchBtn.disabled = false;
        voiceStatus.classList.add('hidden');
    };
    
    recognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        alert('There was an error with the voice recognition. Please try again or use text input.');
        startSearchBtn.disabled = false;
        voiceStatus.classList.add('hidden');
    };
}

async function processVoiceInput(input) {
    // Simple natural language processing
    const words = input.toLowerCase().split(' ');
    const productWords = [];
    let maxPrice = null;
    let category = '';
    
    words.forEach((word, index) => {
        if (word.includes('$') || (words[index - 1] && words[index - 1].toLowerCase() === 'under')) {
            maxPrice = parseInt(word.replace('$', ''));
        } else if (['sneakers', 'tickets', 'electronics', 'collectibles'].includes(word)) {
            category = word;
        } else if (!['find', 'search', 'for', 'me', 'please', 'want', 'looking'].includes(word)) {
            productWords.push(word);
        }
    });
    
    productNameInput.value = productWords.join(' ');
    if (maxPrice) maxPriceInput.value = maxPrice;
    if (category) categorySelect.value = category;

    // Start the search automatically after voice input
    searchButton.click();
}

// Search functionality
searchButton.addEventListener('click', async () => {
    const product = productNameInput.value.trim();
    const maxPrice = parseFloat(maxPriceInput.value) || null;
    const category = categorySelect.value;
    
    if (!product) {
        alert('Please enter a product name');
        return;
    }
    
    try {
        // Show loading state
        loadingSpinner.classList.remove('hidden');
        resultsContainer.classList.remove('hidden');
        negotiationStatus.classList.remove('hidden');
        dealsGrid.innerHTML = '';
        negotiationLog.innerHTML = '';
        
        // Add initial search log
        addNegotiationLog('agent', `Starting search for ${product}${maxPrice ? ` under $${maxPrice}` : ''} in ${category || 'all categories'}...`);

        // Start conversation with OmniDimension agent
        const conversation = await omniAgent.startConversation({
            name: product,
            maxPrice: maxPrice,
            category: category
        });

        if (!conversation.success) {
            throw new Error('Failed to start conversation');
        }

        // Search for deals
        const deals = await searchDealsWithAgent(product, maxPrice, category);
        
        // Display the results
        if (deals && deals.length > 0) {
            displayDeals(deals);
        } else {
            dealsGrid.innerHTML = `
                <div class="no-deals">
                    <p>No deals found matching your criteria. Please try adjusting your search.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error searching deals:', error);
        addNegotiationLog('error', 'Error occurred while searching for deals. Please try again.');
        dealsGrid.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-circle"></i>
                <p>Sorry, we encountered an error while searching for deals. Please try again later.</p>
            </div>
        `;
    } finally {
        loadingSpinner.classList.add('hidden');
    }
});

async function searchDealsWithAgent(product, maxPrice, category) {
    const deals = [];
    
    for (const reseller of mockResellers) {
        try {
            addNegotiationLog('agent', `Contacting ${reseller.name}...`);
            
            // Generate initial price based on max price or random range
            const initialPrice = generateRandomPrice(maxPrice);
            
            // Log the initial offer
            addNegotiationLog('reseller', 
                `${reseller.name} initial offer: $${initialPrice.toFixed(2)}`);
            
            // Simulate negotiation delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Calculate target price (10-15% lower than initial)
            const targetPrice = maxPrice ? Math.min(maxPrice, initialPrice * 0.85) : initialPrice * 0.85;
            
            // Negotiate with reseller
            const negotiationResult = await omniAgent.negotiateWithReseller({
                name: reseller.name,
                id: `reseller_${Date.now()}`,
                price: initialPrice,
                targetPrice: targetPrice
            });
            
            if (negotiationResult.success) {
                const finalPrice = negotiationResult.finalPrice || initialPrice;
                const deal = {
                    reseller: reseller.name,
                    price: Number(finalPrice.toFixed(2)),
                    originalPrice: Number(initialPrice.toFixed(2)),
                    discount: Math.round(((initialPrice - finalPrice) / initialPrice) * 100),
                    deliveryDays: Math.floor(Math.random() * 7) + 1,
                    rating: reseller.rating,
                    responseTime: reseller.responseTime,
                    availability: true,
                    productName: product,
                    category: category
                };
                
                deals.push(deal);
                addNegotiationLog('success', 
                    `Successfully negotiated with ${reseller.name}. Final price: $${deal.price.toFixed(2)} (${deal.discount}% off)`);
            }
        } catch (error) {
            console.error(`Error negotiating with ${reseller.name}:`, error);
            addNegotiationLog('error', 
                `Failed to negotiate with ${reseller.name}. Skipping to next reseller.`);
        }
    }
    
    // Sort deals by price and get top 3
    const sortedDeals = deals
        .sort((a, b) => a.price - b.price)
        .slice(0, 3);

    // Log the final deals found
    if (sortedDeals.length > 0) {
        addNegotiationLog('success', `Found ${sortedDeals.length} great deals for ${product}!`);
    } else {
        addNegotiationLog('error', `No deals found for ${product}. Try adjusting your search criteria.`);
    }

    return sortedDeals;
}

function generateRandomPrice(maxPrice) {
    const min = maxPrice ? maxPrice * 0.7 : 100;
    const max = maxPrice || 1000;
    const price = Math.floor(Math.random() * (max - min + 1)) + min;
    return Number(price.toFixed(2));
}

function addNegotiationLog(type, message) {
    const logEntry = document.createElement('p');
    logEntry.className = type;
    
    // Add demo mode indicator
    if (DEMO_MODE) {
        logEntry.innerHTML = `[DEMO MODE] ${message}`;
    } else {
        logEntry.innerHTML = message;
    }
    
    negotiationLog.appendChild(logEntry);
    negotiationLog.scrollTop = negotiationLog.scrollHeight;
}

function displayDeals(deals) {
    if (deals.length === 0) {
        dealsGrid.innerHTML = `
            <div class="no-deals">
                <p>No deals found matching your criteria. Please try adjusting your search.</p>
            </div>
        `;
        return;
    }
    
    // Clear existing deals
    dealsGrid.innerHTML = '';
    
    // Add demo mode notice
    if (DEMO_MODE) {
        const demoNotice = document.createElement('div');
        demoNotice.className = 'demo-notice';
        demoNotice.innerHTML = `
            <i class="fas fa-info-circle"></i>
            <p>Currently running in demo mode with simulated data</p>
        `;
        dealsGrid.appendChild(demoNotice);
    }
    
    deals.forEach((deal, index) => {
        // Ensure price is a number
        const price = Number(deal.price);
        const originalPrice = deal.originalPrice ? Number(deal.originalPrice) : null;
        const discount = deal.discount || 0;

        if (isNaN(price)) {
            console.error('Invalid price format:', deal.price);
            return;
        }

        const dealCard = document.createElement('div');
        dealCard.className = 'deal-card';
        dealCard.innerHTML = `
            <h3>${index + 1}. ${deal.reseller}</h3>
            <div class="price-container">
                <p class="price">$${price.toFixed(2)}</p>
                ${originalPrice ? `<p class="original-price">$${originalPrice.toFixed(2)}</p>` : ''}
                ${discount > 0 ? `<p class="discount-tag">-${discount}%</p>` : ''}
            </div>
            <div class="deal-details">
                <p><i class="fas fa-truck"></i> Delivery: ${deal.deliveryDays} day${deal.deliveryDays > 1 ? 's' : ''}</p>
                <p><i class="fas fa-star"></i> Seller Rating: ${deal.rating} ⭐</p>
                <p><i class="fas fa-clock"></i> Response Time: ${deal.responseTime}</p>
            </div>
            ${DEMO_MODE ? '<span class="demo-tag">Demo Data</span>' : ''}
            <button onclick="sendEmailNotification(${JSON.stringify({...deal, price}).replace(/"/g, '&quot;')})" class="cta-button">
                <i class="fas fa-envelope"></i> Get Email Details
            </button>
        `;
        dealsGrid.appendChild(dealCard);
    });
    
    // Log the deals to mock database/spreadsheet
    logDealsToDatabase(deals);
}

// Initialize services
const sheetsLogger = new SheetsLogger();
const emailService = new EmailService();

async function sendEmailNotification(deal) {
    const userEmail = document.getElementById('userEmail').value;
    
    if (!userEmail) {
        alert('Please enter your email address to receive deal notifications');
        return;
    }

    if (!isValidEmail(userEmail)) {
        alert('Please enter a valid email address');
        return;
    }

    try {
        // Send email notification
        await emailService.sendDealAlert(userEmail, {
            ...deal,
            productName: productNameInput.value
        });

        // Log the email interaction
        await omniAgent.logInteraction({
            type: 'email_notification',
            userEmail: userEmail,
            deal: deal
        });

    } catch (error) {
        console.error('Error sending email notification:', error);
        alert('There was an error sending the email notification. Please try again.');
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function logDealsToDatabase(deals) {
    try {
        // Log the deals using OmniDimension
        await omniAgent.logInteraction({
            type: 'deals_found',
            timestamp: new Date().toISOString(),
            searchQuery: {
                product: productNameInput.value,
                maxPrice: maxPriceInput.value,
                category: categorySelect.value
            },
            deals: deals
        });
    } catch (error) {
        console.error('Error logging deals to database:', error);
    }
}

// Add smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Clean up when the page is unloaded
window.addEventListener('beforeunload', async () => {
    if (isAgentInitialized) {
        try {
            await omniAgent.endSession();
        } catch (error) {
            console.error('Error ending agent session:', error);
        }
    }
}); 