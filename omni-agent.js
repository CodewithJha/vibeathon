// OmniDimension Configuration
const OMNI_CONFIG = {
    apiKey: '_pZGSxUkjOzUs_wH9sbOaIEiQimzlpxDyghzP6UtbLM',
    baseUrl: 'https://api.omnidimension.ai/v1',
    agentConfig: {
        name: 'DealWise Agent',
        language: 'en-US',
        voice: 'neural-1',
        initialPrompt: `I am a DealWise agent, helping users find the best deals on limited-edition products. 
        I will assist in comparing prices, delivery times, and seller reliability.`
    }
};

const DEMO_MODE = true; // Set to true for demo mode

class OmniAgent {
    constructor() {
        this.apiKey = '_pZGSxUkjOzUs_wH9sbOaIEiQimzlpxDyghzP6UtbLM';
        this.baseUrl = 'https://api.omnidimension.ai/v1';
        this.isInitialized = false;
        this.currentSession = null;
    }

    async initializeAgent() {
        try {
            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                this.currentSession = `demo_session_${Date.now()}`;
                this.isInitialized = true;
                return true;
            }

            const response = await fetch(`${this.baseUrl}/agents/initialize`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'DealWise Agent',
                    language: 'en-US',
                    voice: 'neural-1',
                    initialPrompt: `I am a DealWise agent, helping users find the best deals on limited-edition products. 
                    I will assist in comparing prices, delivery times, and seller reliability.`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to initialize agent');
            }

            const data = await response.json();
            this.currentSession = data.sessionId;
            this.isInitialized = true;
            return true;
        } catch (error) {
            if (!DEMO_MODE) {
                console.error('Error initializing agent:', error);
                throw error;
            }
            // In demo mode, continue despite errors
            this.currentSession = `demo_session_${Date.now()}`;
            this.isInitialized = true;
            return true;
        }
    }

    async startConversation(searchParams) {
        try {
            if (DEMO_MODE) {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                return {
                    success: true,
                    conversationId: `demo_conv_${Date.now()}`,
                    status: 'active'
                };
            }

            const response = await fetch(`${this.baseUrl}/calls/start`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSession,
                    product: searchParams.name,
                    maxPrice: searchParams.maxPrice,
                    category: searchParams.category,
                    prompt: `Find the best deals for ${searchParams.name} under $${searchParams.maxPrice} in the ${searchParams.category} category.`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to start conversation');
            }

            const data = await response.json();
            return {
                success: true,
                conversationId: data.callId,
                status: data.status
            };
        } catch (error) {
            if (!DEMO_MODE) {
                console.error('Error starting conversation:', error);
                throw error;
            }
            // In demo mode, return mock success
            return {
                success: true,
                conversationId: `demo_conv_${Date.now()}`,
                status: 'active'
            };
        }
    }

    async negotiateWithReseller(reseller) {
        try {
            if (DEMO_MODE) {
                // Simulate negotiation delay
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Simulate successful negotiation with 5-15% discount
                const discountPercent = 5 + Math.random() * 10;
                const finalPrice = reseller.price * (1 - discountPercent / 100);
                
                return {
                    success: true,
                    finalPrice: Number(finalPrice.toFixed(2)),
                    negotiations: [
                        { price: reseller.price, time: new Date().toISOString(), type: 'initial' },
                        { price: finalPrice, time: new Date().toISOString(), type: 'final' }
                    ]
                };
            }

            const response = await fetch(`${this.baseUrl}/calls/negotiate`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSession,
                    resellerId: reseller.id,
                    initialPrice: reseller.price,
                    targetPrice: reseller.targetPrice,
                    prompt: `Negotiate the best price for this item. Current price is $${reseller.price}, target price is $${reseller.targetPrice}.`
                })
            });

            if (!response.ok) {
                throw new Error('Failed to negotiate with reseller');
            }

            return await response.json();
        } catch (error) {
            if (!DEMO_MODE) {
                console.error('Error during negotiation:', error);
                throw error;
            }
            // In demo mode, return mock success with smaller discount
            const discountPercent = 5 + Math.random() * 5;
            const finalPrice = reseller.price * (1 - discountPercent / 100);
            
            return {
                success: true,
                finalPrice: Number(finalPrice.toFixed(2)),
                negotiations: [
                    { price: reseller.price, time: new Date().toISOString(), type: 'initial' },
                    { price: finalPrice, time: new Date().toISOString(), type: 'final' }
                ]
            };
        }
    }

    async logInteraction(data) {
        if (DEMO_MODE) {
            // In demo mode, just log to console
            console.log('Demo Mode - Interaction logged:', data);
            return { success: true };
        }

        try {
            const response = await fetch(`${this.baseUrl}/calls/log`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSession,
                    timestamp: new Date().toISOString(),
                    ...data
                })
            });

            if (!response.ok) {
                throw new Error('Failed to log interaction');
            }

            return await response.json();
        } catch (error) {
            console.error('Error logging interaction:', error);
            // In demo mode, continue despite errors
            return { success: true };
        }
    }

    async endSession() {
        if (DEMO_MODE) {
            this.currentSession = null;
            this.isInitialized = false;
            return { success: true };
        }

        if (!this.currentSession) return;

        try {
            const response = await fetch(`${this.baseUrl}/calls/end`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSession
                })
            });

            if (!response.ok) {
                throw new Error('Failed to end session');
            }

            this.currentSession = null;
            this.isInitialized = false;
            return await response.json();
        } catch (error) {
            console.error('Error ending session:', error);
            // In demo mode, continue despite errors
            this.currentSession = null;
            this.isInitialized = false;
            return { success: true };
        }
    }
}

// Export the OmniAgent class
window.OmniAgent = OmniAgent; 