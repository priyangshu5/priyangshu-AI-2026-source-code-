// Main Application JavaScript - OpenRouter API with DuckDuckGo Search Integration
const API_CONFIG = {
    name: "OpenRouter AI",
    apiKey: "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",
    apiEndpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openai/chatgpt-4o-latest",
    
    // OpenRouter models
    models: {
        "deepseek/deepseek-v3.2-speciale": {
            id: "deepseek/deepseek-v3.2-speciale",
            name: "deepseek-v3.2-speciale",
            contextWindow: 16385,
            description: "Fast and capable GPT-3.5 model"
        },
        "google/gemini-3-pro-preview": {
            id: "google/gemini-3-pro-preview",
            name: "gemini-3-pro-preview",
            contextWindow: 16385,
            description: "GPT-3.5 with 16K context"
        },
        "gpt-4": {
            id: "openai/gpt-4",
            name: "GPT-4",
            contextWindow: 8192,
            description: "Most capable GPT-4 model"
        },
        "gpt-4-turbo": {
            id: "openai/gpt-4-turbo",
            name: "GPT-4 Turbo",
            contextWindow: 128000,
            description: "Latest GPT-4 with 128K context"
        },
        "claude-3-haiku": {
            id: "anthropic/claude-3-haiku",
            name: "Claude 3 Haiku",
            contextWindow: 200000,
            description: "Fast and efficient Claude model"
        },
        "claude-3-sonnet": {
            id: "anthropic/claude-3-sonnet",
            name: "Claude 3 Sonnet",
            contextWindow: 200000,
            description: "Balanced Claude model"
        },
        "claude-3-opus": {
            id: "anthropic/claude-3-opus",
            name: "Claude 3 Opus",
            contextWindow: 200000,
            description: "Most capable Claude model"
        },
        "gemini-pro": {
            id: "google/gemini-pro",
            name: "Gemini Pro",
            contextWindow: 32768,
            description: "Google's Gemini Pro model"
        },
        "llama-3-70b": {
            id: "meta-llama/llama-3-70b-instruct",
            name: "Llama 3 70B",
            contextWindow: 8192,
            description: "Meta's Llama 3 70B model"
        },
        "openai/gpt-5-image": {
            id: "openai/gpt-5-image",
            name: "gpt-5-image",
            contextWindow: 32768,
            description: "Mistral 7B model"
        }
    },
    
    // OpenRouter specific headers
    headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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",
        "HTTP-Referer": "https://priyangshu-ai.com",
        "X-Title": "Priyangshu AI"
    },
    
    // DuckDuckGo API Configuration - FIXED
    duckduckgo: {
        endpoint: "https://api.duckduckgo.com/",
        params: {
            format: "json",
            no_html: 1,
            skip_disambig: 1,
            t: "priyangshu_ai_chat",
            kp: 1,
            no_redirect: 1
        }
    }
};

// Search Triggers - Intelligent detection of real-time needs - ENHANCED
const SEARCH_TRIGGERS = {
    // Time-sensitive patterns
    timePatterns: [
        /\b(today|yesterday|tomorrow|now|current|latest|recent|breaking|live|upcoming|this week|this month|just now|nowadays)\b/i,
        /\b(news|update|score|result|weather|forecast|stock|price|crypto|bitcoin|ethereum|market|finance|sports)\b/i,
        /\b(202[4-9]|20[3-9]\d)\b/, // Current/future years
        /\b(hour|day|week|month|year)\s+(ago|from now|later|recently)\b/i,
        /\b(minute|second)\s+(ago|later)\b/i,
        /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/i,
        /\b(election|polls|vote|results|winner|loser)\b/i,
        /\b(covid|coronavirus|pandemic|virus|vaccine|cases)\b/i
    ],
    
    // Topic categories that need fresh data
    dynamicTopics: [
        'sports', 'politics', 'election', 'covid', 'pandemic', 'virus',
        'market', 'crypto', 'bitcoin', 'tech news', 'launch', 'release',
        'disaster', 'earthquake', 'hurricane', 'fire', 'accident', 'crash',
        'movie', 'film', 'series', 'show', 'celebrity', 'actor',
        'game', 'tournament', 'match', 'score', 'win', 'loss',
        'economy', 'inflation', 'rates', 'currency', 'dollar', 'euro',
        'technology', 'apple', 'google', 'microsoft', 'tesla', 'spacex',
        'health', 'medical', 'research', 'study', 'discovery',
        'weather', 'temperature', 'forecast', 'storm', 'rain',
        'breaking news', 'headlines', 'trending', 'viral'
    ],
    
    // Question types requiring real-time data
    questionPatterns: [
        /what('s| is) the latest/i,
        /what('s| is) happening (now|today|currently)/i,
        /any (new|recent) (updates|developments|news)/i,
        /how (is|are) (.*) (now|currently|today)/i,
        /can you tell me (.*) (latest|current)/i,
        /what are the (.*) (results|scores)/i,
        /what('s| is) the (.*) (now|today)/i,
        /show me (latest|current|recent)/i,
        /give me (today's|latest)/i,
        /tell me about (today|now)/i
    ],
    
    // Static knowledge patterns (DON'T search for these)
    staticPatterns: [
        /\b(what is|who is|define|meaning of|explain)\s+[a-z]+\b/i,
        /\b(how to|steps to|guide to|tutorial on)\b/i,
        /\b(philosophy|mathematics|physics|chemistry|biology)\b/i,
        /\b(history of|origin of|invented by|created by)\b/i,
        /\b(theory|principle|concept|definition)\b/i,
        /\b(always|never|everyone|everything|eternal|permanent)\b/i,
        /\b(ancient|classical|traditional|historical)\b/i,
        /\b(explain|describe|tell me about)\s+(the|a)\s+[a-z]+\b/i,
        /\b(why does|why is|why are|why do)\b/i
    ]
};

// ==================== SEARCH MANAGER CLASS ====================
class SearchManager {
    constructor() {
        this.searchCache = new Map();
        this.cacheDuration = 10 * 60 * 1000; // 10 minutes cache
        this.searchTimeout = 10000; // 10 second timeout for better reliability
        this.isSearchAvailable = true;
        this.searchQueue = [];
        this.processingQueue = false;
        this.stats = {
            totalSearches: 0,
            successfulSearches: 0,
            cacheHits: 0,
            lastSearchTime: null
        };
        this.consecutiveFailures = 0;
        this.maxConsecutiveFailures = 3;
        
        // Test connection on initialization
        this.testConnection();
    }
    
    /**
     * Test DuckDuckGo connection on startup
     */
    async testConnection() {
        try {
            const testUrl = `${API_CONFIG.duckduckgo.endpoint}?format=json&q=test&no_html=1&t=priyangshu_ai_chat`;
            const response = await fetch(testUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.ok) {
                console.log('✅ DuckDuckGo API connection successful');
                this.isSearchAvailable = true;
            } else {
                console.warn('⚠️ DuckDuckGo API test returned status:', response.status);
            }
        } catch (error) {
            console.warn('⚠️ DuckDuckGo API test failed:', error.message);
        }
    }
    
    /**
     * Intelligently determines if a query needs real-time information
     */
    shouldSearch(query) {
        // Don't search if query is too short
        const trimmedQuery = query.trim();
        if (trimmedQuery.length < 3) return false;
        
        // Don't search for greetings or simple questions
        const greetings = ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'];
        const lowerQuery = trimmedQuery.toLowerCase();
        
        for (const greeting of greetings) {
            if (lowerQuery.includes(greeting) && lowerQuery.length < 20) {
                console.log('👋 Greeting query - no search needed');
                return false;
            }
        }
        
        // Don't search for general knowledge or static information
        for (const pattern of SEARCH_TRIGGERS.staticPatterns) {
            if (pattern.test(query)) {
                console.log('📚 Static knowledge query - no search needed');
                return false;
            }
        }
        
        // Check for time-sensitive patterns
        let needsRealTime = false;
        
        // Pattern matching for time-sensitive queries
        for (const pattern of SEARCH_TRIGGERS.timePatterns) {
            if (pattern.test(query)) {
                needsRealTime = true;
                console.log('⏰ Matched time pattern:', pattern);
                break;
            }
        }
        
        // Topic matching for dynamic topics
        if (!needsRealTime) {
            for (const topic of SEARCH_TRIGGERS.dynamicTopics) {
                if (lowerQuery.includes(topic)) {
                    needsRealTime = true;
                    console.log('🎯 Matched dynamic topic:', topic);
                    break;
                }
            }
        }
        
        // Question pattern matching
        if (!needsRealTime) {
            for (const pattern of SEARCH_TRIGGERS.questionPatterns) {
                if (pattern.test(query)) {
                    needsRealTime = true;
                    console.log('❓ Matched question pattern:', pattern);
                    break;
                }
            }
        }
        
        console.log(`🔍 Search analysis: "${query.substring(0, 50)}..." - ${needsRealTime ? 'Needs real-time data' : 'Static knowledge'}`);
        return needsRealTime;
    }
    
    /**
     * Search DuckDuckGo API with cache and timeout - FIXED
     */
    async searchDuckDuckGo(query) {
        this.stats.totalSearches++;
        this.stats.lastSearchTime = new Date();
        
        // Check cache first
        const cacheKey = query.toLowerCase().trim();
        const cached = this.searchCache.get(cacheKey);
        
        if (cached && (Date.now() - cached.timestamp < this.cacheDuration)) {
            console.log('♻️ Using cached search results');
            this.stats.cacheHits++;
            return cached.data;
        }
        
        // Prepare API URL - FIXED: Properly encode query
        const params = new URLSearchParams({
            format: "json",
            no_html: "1",
            skip_disambig: "1",
            t: "priyangshu_ai_chat",
            kp: "1",
            no_redirect: "1",
            q: query
        });
        
        const url = `${API_CONFIG.duckduckgo.endpoint}?${params}`;
        
        console.log('🔍 Searching DuckDuckGo for:', query);
        console.log('📡 API URL:', url);
        
        try {
            // Use AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.searchTimeout);
            
            // Use fetch with proper headers - FIXED
            const response = await fetch(url, {
                signal: controller.signal,
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Origin': window.location.origin
                }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`Search API error: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Search response received:', data);
            
            // Process and cache results
            const processedResults = this.processSearchResults(data, query);
            
            // Only cache if we got useful results
            if (processedResults.hasResults) {
                this.searchCache.set(cacheKey, {
                    data: processedResults,
                    timestamp: Date.now()
                });
            }
            
            // Clean old cache entries
            this.cleanCache();
            
            // Reset consecutive failures on success
            this.consecutiveFailures = 0;
            this.stats.successfulSearches++;
            
            return processedResults;
            
        } catch (error) {
            console.warn('⚠️ Search failed:', error.message);
            this.consecutiveFailures++;
            
            // Return informative error response
            const errorResponse = {
                hasResults: false,
                error: error.message,
                source: 'DuckDuckGo',
                timestamp: new Date().toISOString(),
                query: query,
                abstract: `I couldn't fetch real-time information for "${query}". The search service might be temporarily unavailable.`,
                searchUrl: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`
            };
            
            // Disable search after consecutive failures
            if (this.consecutiveFailures >= this.maxConsecutiveFailures) {
                this.isSearchAvailable = false;
                console.warn('🔴 Search service temporarily disabled due to consecutive failures');
                
                // Re-enable after 30 seconds
                setTimeout(() => {
                    this.isSearchAvailable = true;
                    this.consecutiveFailures = 0;
                    console.log('🟢 Search service re-enabled');
                }, 30000);
            }
            
            return errorResponse;
        }
    }
    
    /**
     * Process and format search results - ENHANCED
     */
    processSearchResults(data, originalQuery) {
        console.log('Processing search results:', data);
        
        const results = {
            abstract: '',
            relatedTopics: [],
            infobox: {},
            hasResults: false,
            source: 'DuckDuckGo',
            timestamp: new Date().toISOString(),
            query: originalQuery,
            type: data.Type || 'unknown'
        };
        
        // Extract abstract text
        if (data.Abstract && data.AbstractText && data.AbstractText.trim() !== '') {
            results.abstract = data.AbstractText;
            results.hasResults = true;
            console.log('Found abstract:', results.abstract);
        }
        
        // Extract related topics
        if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
            results.relatedTopics = data.RelatedTopics
                .filter(topic => {
                    // Filter out empty topics and the "See more..." type entries
                    if (typeof topic === 'object' && topic.Text) {
                        const text = topic.Text.toLowerCase();
                        return !text.includes('see more') && 
                               !text.includes('category') &&
                               !text.includes('wikipedia') &&
                               text.trim() !== '';
                    } else if (typeof topic === 'string') {
                        return topic.trim() !== '';
                    }
                    return false;
                })
                .slice(0, 5) // Limit to 5 topics
                .map(topic => {
                    if (typeof topic === 'object') {
                        return {
                            text: topic.Text || topic,
                            url: topic.FirstURL || `https://duckduckgo.com/?q=${encodeURIComponent(originalQuery)}`,
                            source: topic.Name || 'DuckDuckGo'
                        };
                    } else {
                        return {
                            text: topic,
                            url: `https://duckduckgo.com/?q=${encodeURIComponent(originalQuery)}`,
                            source: 'DuckDuckGo'
                        };
                    }
                });
            
            if (results.relatedTopics.length > 0) {
                results.hasResults = true;
                console.log('Found related topics:', results.relatedTopics.length);
            }
        }
        
        // Extract infobox data
        if (data.Infobox && data.Infobox.content) {
            const content = this.extractInfoboxContent(data.Infobox.content);
            if (Object.keys(content).length > 0) {
                results.infobox = {
                    title: data.Heading || originalQuery,
                    content: content,
                    image: data.Image || data.Icon?.URL
                };
                results.hasResults = true;
                console.log('Found infobox with', Object.keys(content).length, 'entries');
            }
        }
        
        // If no abstract but there are results, try to extract from Redirect
        if (!results.abstract && data.Redirect) {
            results.abstract = `Found information about: ${data.Redirect}`;
            results.hasResults = true;
        }
        
        // Check if it's a disambiguation page
        if (data.Type === 'D' && results.relatedTopics.length > 0) {
            results.abstract = `This is a broad topic. Here are specific aspects:`;
            results.hasResults = true;
        }
        
        // Check for Definition
        if (!results.abstract && data.Definition) {
            results.abstract = data.Definition;
            results.hasResults = true;
        }
        
        // Check for Answer
        if (!results.abstract && data.Answer) {
            results.abstract = data.Answer;
            results.hasResults = true;
        }
        
        // Add search URL for reference
        results.searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(originalQuery)}`;
        
        // If still no results, create a helpful message
        if (!results.hasResults) {
            results.abstract = `No specific real-time information found for "${originalQuery}". Try rephrasing your question or check the search link for more results.`;
            results.hasResults = true; // We still want to show something to the user
        }
        
        console.log('Final processed results:', results);
        return results;
    }
    
    extractInfoboxContent(content) {
        if (!content) return {};
        
        const extracted = {};
        
        if (Array.isArray(content)) {
            content.forEach(item => {
                if (item && item.data_type === 'string' && item.label && item.value) {
                    extracted[item.label] = item.value;
                } else if (item && item.label && item.value) {
                    extracted[item.label] = item.value;
                }
            });
        } else if (typeof content === 'object') {
            Object.entries(content).forEach(([key, value]) => {
                if (value && typeof value === 'object' && value.value) {
                    extracted[key] = value.value;
                } else if (value) {
                    extracted[key] = value;
                }
            });
        }
        
        return extracted;
    }
    
    cleanCache() {
        const now = Date.now();
        let deleted = 0;
        for (const [key, value] of this.searchCache.entries()) {
            if (now - value.timestamp > this.cacheDuration * 2) {
                this.searchCache.delete(key);
                deleted++;
            }
        }
        if (deleted > 0) {
            console.log(`🗑️ Cleaned ${deleted} old cache entries`);
        }
    }
    
    /**
     * Queue search requests to avoid overwhelming the API
     */
    async queuedSearch(query) {
        return new Promise((resolve) => {
            this.searchQueue.push({ query, resolve });
            
            if (!this.processingQueue) {
                this.processSearchQueue();
            }
        });
    }
    
    async processSearchQueue() {
        if (this.processingQueue || this.searchQueue.length === 0) return;
        
        this.processingQueue = true;
        
        while (this.searchQueue.length > 0) {
            const { query, resolve } = this.searchQueue.shift();
            
            try {
                const results = await this.searchDuckDuckGo(query);
                resolve(results);
                
                // Add delay between searches (500ms) to be respectful to the API
                if (this.searchQueue.length > 0) {
                    await new Promise(r => setTimeout(r, 500));
                }
            } catch (error) {
                resolve({
                    hasResults: false,
                    error: error.message,
                    source: 'DuckDuckGo',
                    timestamp: new Date().toISOString(),
                    query: query
                });
            }
        }
        
        this.processingQueue = false;
    }
    
    getStats() {
        return {
            ...this.stats,
            cacheSize: this.searchCache.size,
            isAvailable: this.isSearchAvailable,
            consecutiveFailures: this.consecutiveFailures
        };
    }
}

// ==================== CHAT MANAGER CLASS ====================
class ChatManager {
    constructor() {
        this.messages = [];
        this.attachedFiles = [];
        this.isGeneratingResponse = false;
        this.scrollPosition = 0;
        this.isAtBottom = true;
        this.conversationHistory = [];
        this.apiStatus = "checking";
        this.currentModel = "gpt-3.5-turbo";
        
        // Initialize Search Manager
        this.searchManager = new SearchManager();
        
        // Add search stats
        this.searchStats = {
            totalSearches: 0,
            successfulSearches: 0,
            cacheHits: 0,
            lastSearchTime: null
        };
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadState();
        this.setupScrolling();
        this.initializeAPI();
        this.setupSearchStatsPanel();
    }
    
    initializeElements() {
        // Core UI Elements
        this.hamburgerMenu = document.getElementById('hamburgerMenu');
        this.sidebar = document.getElementById('sidebar');
        this.newChatBtn = document.getElementById('newChatBtn');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatMessages = document.getElementById('chatMessages');
        this.welcomeScreen = document.getElementById('welcomeScreen');
        this.chatMessagesContainer = document.getElementById('chatMessagesContainer');
        this.scrollIndicator = document.getElementById('scrollIndicator');
        
        // File Upload
        this.attachBtn = document.getElementById('attachBtn');
        this.fileUploadModal = document.getElementById('fileUploadModal');
        this.closeFileUpload = document.getElementById('closeFileUpload');
        this.uploadFileBtn = document.getElementById('uploadFile');
        this.uploadImageBtn = document.getElementById('uploadImage');
        this.fileAttachments = document.getElementById('fileAttachments');
        
        // Settings
        this.settingsBtn = document.getElementById('settingsBtn');
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.cancelSettings = document.getElementById('cancelSettings');
        this.saveSettings = document.getElementById('saveSettings');
        
        // Model Selection
        this.modelSelect = document.getElementById('modelSelect');
        this.currentModelDisplay = document.getElementById('currentModel');
        this.defaultModelSelect = document.getElementById('defaultModelSelect');
        
        // API Status
        this.apiStatusIndicator = document.getElementById('apiStatusIndicator');
        this.apiStatusText = document.getElementById('apiStatusText');
        
        // User Profile
        this.userProfileBtn = document.getElementById('userProfileBtn');
        this.darkModeToggle = document.getElementById('darkModeToggle');
        this.themeOptions = document.querySelectorAll('.theme-option');
        
        // Quick Prompts
        this.quickPromptBtns = document.querySelectorAll('.quick-prompt-btn');
    }
    
    setupEventListeners() {
        // Core Chat Events
        this.hamburgerMenu.addEventListener('click', () => this.toggleSidebar());
        this.newChatBtn.addEventListener('click', () => this.startNewChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keydown', (e) => this.handleInputKeydown(e));
        this.messageInput.addEventListener('input', () => this.autoResizeTextarea());
        
        // File Upload Events
        this.attachBtn.addEventListener('click', () => this.openFileUpload());
        this.closeFileUpload.addEventListener('click', () => this.closeFileUploadModal());
        this.uploadFileBtn.addEventListener('click', () => this.simulateFileUpload('file'));
        this.uploadImageBtn.addEventListener('click', () => this.simulateFileUpload('image'));
        
        // Settings Events
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.cancelSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveSettingsChanges());
        
        // Model Events
        this.modelSelect.addEventListener('change', (e) => this.updateModel(e.target.value));
        this.defaultModelSelect.addEventListener('change', () => this.updateDefaultModel());
        
        // Theme Events
        this.darkModeToggle.addEventListener('change', () => this.toggleDarkMode());
        this.themeOptions.forEach(option => {
            option.addEventListener('click', () => this.changeTheme(option.dataset.theme));
        });
        
        // Quick Prompts
        this.quickPromptBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                this.messageInput.value = prompt;
                this.messageInput.focus();
                this.autoResizeTextarea();
            });
        });
        
        // User Profile Dropdown
        if (this.userProfileBtn) {
            this.userProfileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const dropdown = document.getElementById('userDropdown');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });
        }
        
        // Close modals when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) this.closeSettingsModal();
            if (e.target === this.fileUploadModal) this.closeFileUploadModal();
            
            // Close user dropdown
            const dropdown = document.getElementById('userDropdown');
            if (dropdown && !e.target.closest('.user-dropdown') && dropdown.style.display === 'block') {
                dropdown.style.display = 'none';
            }
        });
        
        // Scroll indicator click
        this.scrollIndicator.addEventListener('click', () => this.scrollToBottom());
        
        // Debug: Add search test button (hidden in production)
        this.setupDebugTools();
    }
    
    async initializeAPI() {
        console.log('=== Priyangshu AI Initialization ===');
        console.log('API Provider:', API_CONFIG.name);
        console.log('Endpoint:', API_CONFIG.apiEndpoint);
        console.log('Default Model:', API_CONFIG.defaultModel);
        console.log('DuckDuckGo Search: Enabled (Automatic)');
        console.log('Search Triggers Configured:', Object.keys(SEARCH_TRIGGERS.timePatterns).length, 'patterns');
        
        // Populate model select dropdown
        this.populateModelSelect();
        
        // Test API connection
        await this.testAPIConnection();
        
        // Test DuckDuckGo connection
        await this.testDuckDuckGoConnection();
    }
    
    async testDuckDuckGoConnection() {
        console.log('🔍 Testing DuckDuckGo API connection...');
        
        try {
            // Test with a simple query
            const testQuery = "test";
            const testUrl = `${API_CONFIG.duckduckgo.endpoint}?format=json&q=${encodeURIComponent(testQuery)}&no_html=1&t=priyangshu_ai_chat`;
            
            const response = await fetch(testUrl, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ DuckDuckGo API connection successful', data);
                this.showNotification('DuckDuckGo search service connected', 'success');
            } else {
                console.warn('⚠️ DuckDuckGo API test returned status:', response.status);
                this.showNotification('DuckDuckGo search may have limited functionality', 'warning');
            }
        } catch (error) {
            console.warn('⚠️ DuckDuckGo API test failed:', error.message);
            this.showNotification('DuckDuckGo search may be unavailable', 'warning');
        }
    }
    
    populateModelSelect() {
        if (!this.modelSelect || !this.defaultModelSelect) return;
        
        // Clear existing options
        this.modelSelect.innerHTML = '';
        this.defaultModelSelect.innerHTML = '';
        
        // Add models to select dropdowns
        Object.entries(API_CONFIG.models).forEach(([key, model]) => {
            const option1 = document.createElement('option');
            option1.value = key;
            option1.textContent = `${model.name} (${model.contextWindow.toLocaleString()} context)`;
            
            const option2 = option1.cloneNode(true);
            
            this.modelSelect.appendChild(option1);
            this.defaultModelSelect.appendChild(option2);
        });
        
        // Set default selection
        this.modelSelect.value = this.currentModel;
        this.defaultModelSelect.value = this.currentModel;
        this.updateModelDisplay();
    }
    
    async testAPIConnection() {
        try {
            console.log('🔍 Testing OpenRouter API connection...');
            
            // Test with a simple models request
            const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_CONFIG.apiKey}`
                }
            });
            
            if (testResponse.ok) {
                console.log('✅ OpenRouter API connection successful');
                this.apiStatus = "connected";
                this.updateAPIStatusUI();
                this.showNotification('OpenRouter API connected successfully', 'success');
            } else {
                console.warn('⚠️ API test returned status:', testResponse.status);
                this.apiStatus = "warning";
                this.updateAPIStatusUI();
                this.showNotification('API connection has issues', 'warning');
            }
        } catch (error) {
            console.error('❌ API test failed:', error.message);
            this.apiStatus = "error";
            this.updateAPIStatusUI();
            this.showNotification('OpenRouter API connection failed', 'error');
        }
    }
    
    updateAPIStatusUI() {
        if (!this.apiStatusIndicator || !this.apiStatusText) return;
        
        const statusConfig = {
            connected: { 
                text: 'API Connected', 
                color: '#10a37f', 
                icon: 'fa-check-circle',
                bgColor: 'rgba(16, 163, 127, 0.1)'
            },
            warning: { 
                text: 'API Warning', 
                color: '#f59e0b', 
                icon: 'fa-exclamation-triangle',
                bgColor: 'rgba(245, 158, 11, 0.1)'
            },
            error: { 
                text: 'API Error', 
                color: '#ef4444', 
                icon: 'fa-exclamation-circle',
                bgColor: 'rgba(239, 68, 68, 0.1)'
            },
            checking: { 
                text: 'Checking API...', 
                color: '#3b82f6', 
                icon: 'fa-sync fa-spin',
                bgColor: 'rgba(59, 130, 246, 0.1)'
            }
        };
        
        const config = statusConfig[this.apiStatus] || statusConfig.error;
        
        this.apiStatusIndicator.innerHTML = `<i class="fas ${config.icon}"></i>`;
        this.apiStatusIndicator.style.color = config.color;
        this.apiStatusIndicator.style.backgroundColor = config.bgColor;
        this.apiStatusText.textContent = config.text;
        this.apiStatusText.style.color = config.color;
    }
    
    setupScrolling() {
        this.chatMessages.addEventListener('scroll', () => this.handleScroll());
    }
    
    handleScroll() {
        const scrollTop = this.chatMessages.scrollTop;
        const scrollHeight = this.chatMessages.scrollHeight;
        const clientHeight = this.chatMessages.clientHeight;
        
        this.isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        
        if (this.isAtBottom) {
            this.scrollIndicator.classList.remove('visible');
        } else {
            this.scrollIndicator.classList.add('visible');
        }
    }
    
    scrollToBottom(smooth = true) {
        this.chatMessages.scrollTo({
            top: this.chatMessages.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
        this.scrollIndicator.classList.remove('visible');
    }
    
    toggleSidebar() {
        this.sidebar.classList.toggle('active');
    }
    
    startNewChat() {
        if (this.messages.length > 0) {
            if (!confirm('Start a new chat? Current conversation will be saved.')) {
                return;
            }
        }
        
        this.messages = [];
        this.attachedFiles = [];
        this.conversationHistory = [];
        this.fileAttachments.innerHTML = '';
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        
        this.showWelcomeScreen();
        this.updateChatHistory();
        
        this.showNotification('New chat started', 'info');
    }
    
    showWelcomeScreen() {
        this.welcomeScreen.style.display = 'flex';
        this.chatMessages.innerHTML = '';
    }
    
    async sendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message && this.attachedFiles.length === 0) {
            this.showNotification('Please enter a message or attach a file', 'warning');
            return;
        }
        
        if (this.isGeneratingResponse) {
            this.showNotification('Please wait for the current response to complete', 'warning');
            return;
        }
        
        // Hide welcome screen
        this.welcomeScreen.style.display = 'none';
        
        // Add user message
        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: message,
            files: [...this.attachedFiles],
            timestamp: new Date(),
            status: 'sent'
        };
        
        this.addMessageToChat(userMessage);
        this.messages.push(userMessage);
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.attachedFiles = [];
        this.fileAttachments.innerHTML = '';
        
        // Generate AI response
        await this.generateAIResponse(message);
        
        // Save state
        this.saveState();
    }
    
    handleInputKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }
    
    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 200) + 'px';
    }
    
    addMessageToChat(messageData) {
        const messageElement = this.createMessageElement(messageData);
        this.chatMessages.appendChild(messageElement);
        
        if (this.isAtBottom) {
            this.scrollToBottom();
        }
        
        return messageElement;
    }
    
    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.sender}`;
        messageDiv.id = `message-${messageData.id}`;
        
        const isUser = messageData.sender === 'user';
        const avatarClass = isUser ? 'user-avatar' : 'ai-avatar';
        const avatarIcon = isUser ? 'fas fa-user' : 'fas fa-robot';
        const senderName = isUser ? 'You' : 'Priyangshu AI';
        
        // Add search indicator to AI messages with real-time data
        let searchBadge = '';
        if (!isUser && messageData.searchContext && messageData.searchContext.hasRealTimeData) {
            const timestamp = new Date(messageData.searchContext.timestamp);
            const timeAgo = Math.round((Date.now() - timestamp) / (1000 * 60)); // minutes ago
            
            let timeText = '';
            if (timeAgo < 1) {
                timeText = 'just now';
            } else if (timeAgo < 60) {
                timeText = `${timeAgo}m ago`;
            } else {
                const hoursAgo = Math.round(timeAgo / 60);
                timeText = `${hoursAgo}h ago`;
            }
            
            searchBadge = `
                <span class="search-badge" title="Includes real-time search results from ${messageData.searchContext.source} (updated ${timeText})">
                    <i class="fas fa-satellite-dish"></i> Live Data
                </span>
            `;
        }
        
        // Format time
        const time = messageData.timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        let messageContent = '';
        if (messageData.status === 'loading') {
            messageContent = `
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            
            // Add searching indicator if applicable
            if (messageData.searching) {
                messageContent += `<div class="search-loading"><i class="fas fa-search"></i> Searching for latest information...</div>`;
            }
        } else {
            messageContent = this.formatMessageText(messageData.text);
        }
        
        messageDiv.innerHTML = `
            <div class="message-avatar ${avatarClass}">
                <i class="${avatarIcon}"></i>
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">${senderName}</span>
                    ${searchBadge}
                    <span class="message-time">${time}</span>
                </div>
                <div class="message-text">${messageContent}</div>
                ${this.createFileAttachmentsHTML(messageData.files)}
                ${!isUser && messageData.status !== 'loading' ? this.createMessageActionsHTML(messageData.id) : ''}
            </div>
        `;
        
        // Add event listeners
        if (!isUser && messageData.status !== 'loading') {
            const copyBtn = messageDiv.querySelector('.copy-btn');
            const regenerateBtn = messageDiv.querySelector('.regenerate-btn');
            
            if (copyBtn) {
                copyBtn.addEventListener('click', () => this.copyToClipboard(messageData.text));
            }
            
            if (regenerateBtn) {
                regenerateBtn.addEventListener('click', () => this.regenerateResponse(messageData.id));
            }
        }
        
        return messageDiv;
    }
    
    createMessageActionsHTML(messageId) {
        return `
            <div class="message-actions">
                <button class="action-btn copy-btn" title="Copy to clipboard">
                    <i class="fas fa-copy"></i>
                    Copy
                </button>
                <button class="action-btn regenerate-btn" title="Regenerate response">
                    <i class="fas fa-redo"></i>
                    Regenerate
                </button>
            </div>
        `;
    }
    
    formatMessageText(text) {
        if (!text) return '';
        
        // Convert markdown-like syntax to HTML
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>')
            .replace(/^#{1,6}\s+(.*)/gm, (match, p1) => {
                const level = match.match(/^#+/)[0].length;
                return `<h${level}>${p1}</h${level}>`;
            });
    }
    
    createFileAttachmentsHTML(files) {
        if (!files || files.length === 0) return '';
        
        let html = '<div class="file-attachments-preview">';
        files.forEach(file => {
            html += `
                <div class="file-preview">
                    <i class="fas fa-${file.type === 'image' ? 'image' : 'file'}"></i>
                    <span>${file.name}</span>
                </div>
            `;
        });
        html += '</div>';
        return html;
    }
    
    /**
     * Enhanced AI response generation with DuckDuckGo search integration - FIXED
     */
    async generateAIResponse(userMessage) {
        this.isGeneratingResponse = true;
        
        // Add loading indicator
        const loadingMessage = {
            id: Date.now() + 1,
            sender: 'ai',
            text: '',
            timestamp: new Date(),
            status: 'loading',
            searching: false
        };
        
        const loadingElement = this.addMessageToChat(loadingMessage);
        
        try {
            // Check if we need to search
            let searchResults = null;
            const needsSearch = this.searchManager.shouldSearch(userMessage);
            
            // Perform search if needed
            if (needsSearch && this.searchManager.isSearchAvailable) {
                console.log('🚀 Initiating search for real-time data');
                loadingMessage.searching = true;
                this.updateMessageElement(loadingElement, loadingMessage);
                
                // Start search with timeout
                const searchPromise = this.searchManager.queuedSearch(userMessage);
                
                // Get search results (with timeout)
                searchResults = await Promise.race([
                    searchPromise,
                    new Promise(resolve => setTimeout(() => {
                        console.log('⏱️ Search timeout after 8 seconds');
                        resolve({
                            hasResults: false,
                            error: 'Search timeout',
                            source: 'DuckDuckGo',
                            timestamp: new Date().toISOString(),
                            query: userMessage,
                            abstract: `Search timed out while looking for "${userMessage}". You can try searching directly at DuckDuckGo.`,
                            searchUrl: `https://duckduckgo.com/?q=${encodeURIComponent(userMessage)}`
                        });
                    }, 8000))
                ]);
                
                console.log('🔍 Search results:', searchResults);
                
                // Check if search was successful and has results
                if (searchResults && searchResults.hasResults) {
                    console.log('✅ Search completed with results');
                    
                    // Remove loading indicator
                    loadingElement.remove();
                    
                    // Format and display search results ONLY
                    const searchResponse = this.formatSearchOnlyResponse(searchResults);
                    
                    // Add search response message
                    const searchMessage = {
                        id: Date.now(),
                        sender: 'ai',
                        text: searchResponse,
                        timestamp: new Date(),
                        status: 'sent',
                        searchContext: {
                            hasRealTimeData: true,
                            source: searchResults.source,
                            timestamp: searchResults.timestamp,
                            query: searchResults.query
                        }
                    };
                    
                    this.addMessageToChat(searchMessage);
                    this.messages.push(searchMessage);
                    
                    // Update stats
                    this.searchStats.successfulSearches++;
                    this.searchStats.lastSearchTime = new Date();
                    this.searchStats.totalSearches++;
                    
                    // Update search stats panel
                    this.updateSearchStats();
                    
                    // Save state and return
                    this.isGeneratingResponse = false;
                    this.saveState();
                    return;
                } else {
                    console.log('ℹ️ No relevant search results found, using AI');
                }
            } else if (!needsSearch) {
                console.log('📚 Using AI knowledge only (no search needed)');
            } else {
                console.log('⚠️ Search temporarily unavailable, using AI');
            }
            
            this.searchStats.totalSearches++;
            
            // If no search or search failed, use AI
            const messages = this.prepareMessagesForAPI(userMessage, searchResults);
            const aiResponse = await this.callOpenRouterAPI(messages);
            
            // Remove loading indicator
            loadingElement.remove();
            
            // Add AI response
            const aiMessage = {
                id: Date.now(),
                sender: 'ai',
                text: this.formatSearchEnhancedResponse(aiResponse, searchResults),
                timestamp: new Date(),
                status: 'sent',
                searchContext: searchResults && searchResults.hasResults ? {
                    hasRealTimeData: true,
                    source: searchResults.source,
                    timestamp: searchResults.timestamp,
                    query: searchResults.query
                } : null
            };
            
            this.addMessageToChat(aiMessage);
            this.messages.push(aiMessage);
            
            // Add to conversation history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });
            
            // Update API status
            this.apiStatus = "connected";
            this.updateAPIStatusUI();
            
            // Update search stats panel
            this.updateSearchStats();
            
        } catch (error) {
            console.error('❌ AI Response Error:', error);
            
            // Remove loading indicator
            loadingElement.remove();
            
            // Add error message
            const errorMessage = {
                id: Date.now(),
                sender: 'ai',
                text: this.getPureAPIErrorMessage(error),
                timestamp: new Date(),
                status: 'sent'
            };
            
            this.addMessageToChat(errorMessage);
            this.messages.push(errorMessage);
            
        } finally {
            this.isGeneratingResponse = false;
            this.saveState();
        }
    }
    
    /**
     * Format search results ONLY (no AI augmentation) - NEW
     */
    formatSearchOnlyResponse(searchResults) {
        let response = '**🔍 Search Results**\n\n';
        
        if (searchResults.abstract) {
            response += `**Summary:** ${searchResults.abstract}\n\n`;
        }
        
        if (Object.keys(searchResults.infobox).length > 0 && searchResults.infobox.content) {
            response += `**Key Information:**\n`;
            for (const [key, value] of Object.entries(searchResults.infobox.content)) {
                response += `• **${key}:** ${value}\n`;
            }
            response += '\n';
        }
        
        if (searchResults.relatedTopics && searchResults.relatedTopics.length > 0) {
            response += `**Related Topics:**\n`;
            searchResults.relatedTopics.forEach((topic, index) => {
                response += `${index + 1}. ${topic.text}\n`;
            });
            response += '\n';
        }
        
        response += `**Source:** DuckDuckGo\n`;
        response += `**Query:** "${searchResults.query}"\n`;
        response += `**Retrieved:** ${new Date(searchResults.timestamp).toLocaleString()}\n\n`;
        response += `[🔗 Open in DuckDuckGo](${searchResults.searchUrl})`;
        
        return response;
    }
    
    updateMessageElement(element, messageData) {
        const newElement = this.createMessageElement(messageData);
        element.parentNode.replaceChild(newElement, element);
        return newElement;
    }
    
    /**
     * Prepare messages for API with search context
     */
    prepareMessagesForAPI(userMessage, searchResults) {
        const messages = [];
        
        // Get current date and time
        const currentDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const currentTime = new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Base system message
        let systemMessage = `You are Priyangshu AI, an intelligent and helpful assistant.
Current date: ${currentDate}
Current time: ${currentTime}

Instructions:
1. Provide direct, accurate, and complete answers to user questions
2. Be concise but thorough when needed
3. Use markdown formatting (bold, lists, code blocks) for better readability
4. If you're unsure about something, admit it rather than making up information`;
        
        // Add search context if available
        if (searchResults && searchResults.hasResults) {
            systemMessage += `

**Real-Time Search Results Available:**
${this.formatSearchForAI(searchResults)}

**Instructions for Using Search Results:**
1. Use this real-time information if it's relevant and current
2. If the search results don't fully answer the question, supplement with your knowledge
3. Acknowledge the source when using search results
4. If search results are insufficient, rely on your knowledge but mention limitations`;
        } else if (this.searchManager.shouldSearch(userMessage) && searchResults && !searchResults.hasResults) {
            // If search was attempted but failed
            systemMessage += `

**Note:** I attempted to search for real-time information for "${userMessage}", but no relevant results were found or the search failed. I'll provide the best answer based on my knowledge up to ${currentDate}.`;
        }
        
        messages.push({
            role: 'system',
            content: systemMessage
        });
        
        // Add conversation history (last 5 messages for context)
        if (this.conversationHistory.length > 0) {
            const recentHistory = this.conversationHistory.slice(-5);
            messages.push(...recentHistory);
        }
        
        // Add current user message
        messages.push({
            role: 'user',
            content: userMessage
        });
        
        return messages;
    }
    
    /**
     * Format search results for AI consumption
     */
    formatSearchForAI(searchResults) {
        let formatted = '';
        
        if (searchResults.abstract) {
            formatted += `**Summary:** ${searchResults.abstract}\n\n`;
        }
        
        if (Object.keys(searchResults.infobox).length > 0 && searchResults.infobox.content) {
            formatted += `**Key Information:**\n`;
            for (const [key, value] of Object.entries(searchResults.infobox.content)) {
                formatted += `- ${key}: ${value}\n`;
            }
            formatted += '\n';
        }
        
        if (searchResults.relatedTopics && searchResults.relatedTopics.length > 0) {
            formatted += `**Related Topics:**\n`;
            searchResults.relatedTopics.forEach((topic, index) => {
                formatted += `${index + 1}. ${topic.text}\n`;
            });
            formatted += '\n';
        }
        
        if (searchResults.type && searchResults.type === 'D') {
            formatted += `*Note: This is a broad topic with multiple aspects. The above information covers the main points.*\n\n`;
        }
        
        formatted += `*Source: ${searchResults.source} | Query: "${searchResults.query}" | Retrieved: ${new Date(searchResults.timestamp).toLocaleString()}*`;
        
        return formatted;
    }
    
    /**
     * Format final response with search indicators
     */
    formatSearchEnhancedResponse(aiResponse, searchResults) {
        if (!searchResults || !searchResults.hasResults) {
            return aiResponse;
        }
        
        // Add subtle indicator that real-time data was used
        const timestamp = new Date(searchResults.timestamp);
        const timeAgo = Math.round((Date.now() - timestamp) / (1000 * 60)); // minutes ago
        
        let timeText = '';
        if (timeAgo < 1) {
            timeText = 'just now';
        } else if (timeAgo < 60) {
            timeText = `${timeAgo} minute${timeAgo > 1 ? 's' : ''} ago`;
        } else {
            const hoursAgo = Math.round(timeAgo / 60);
            timeText = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
        }
        
        const indicator = `\n\n---\n*🔄 Includes real-time information from DuckDuckGo (updated ${timeText})*`;
        
        return aiResponse + indicator;
    }
    
    getCurrentModelId() {
        const modelConfig = API_CONFIG.models[this.currentModel];
        return modelConfig ? modelConfig.id : API_CONFIG.defaultModel;
    }
    
    async callOpenRouterAPI(messages) {
        try {
            const modelId = this.getCurrentModelId();
            
            const response = await fetch(API_CONFIG.apiEndpoint, {
                method: 'POST',
                headers: API_CONFIG.headers,
                body: JSON.stringify({
                    model: modelId,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false
                })
            });
            
            if (!response.ok) {
                let errorData = {};
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { error: { message: await response.text() } };
                }
                
                console.error('❌ OpenRouter API Response Error:', {
                    status: response.status,
                    statusText: response.statusText,
                    data: errorData
                });
                
                // Handle specific OpenRouter errors
                if (response.status === 400) {
                    throw new Error(`400 Bad Request: ${errorData.error?.message || 'Invalid request format'}`);
                } else if (response.status === 401) {
                    throw new Error(`401 Unauthorized: Invalid API key or authentication failed.`);
                } else if (response.status === 429) {
                    throw new Error(`429 Rate Limit Exceeded: ${errorData.error?.message || 'Too many requests. Please try again later.'}`);
                } else if (response.status === 500) {
                    throw new Error(`500 Server Error: OpenRouter API is experiencing issues.`);
                } else {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}. ${errorData.error?.message || ''}`);
                }
            }
            
            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid API response format - no choices available');
            }
            
            console.log('✅ OpenRouter API Response Received Successfully:', {
                model: data.model,
                usage: data.usage
            });
            
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('❌ OpenRouter API Call Failed:', error);
            throw error;
        }
    }
    
    getPureAPIErrorMessage(error) {
        // Pure API error messages only - no fallback content
        if (error.message.includes('401')) {
            return `**OpenRouter API Authentication Error**\n\nYour API key is invalid or expired. Please check:\n\n1. Your API key is correct\n2. The key hasn't expired\n3. You have sufficient credits/balance\n\n**Error:** ${error.message}`;
        } else if (error.message.includes('429')) {
            return `**Rate Limit Exceeded**\n\nYou've exceeded the OpenRouter rate limits. Please wait a moment before trying again.\n\n**Error:** ${error.message}`;
        } else if (error.message.includes('500')) {
            return `**OpenRouter Server Error**\n\nThe OpenRouter API is currently experiencing technical difficulties. This is usually temporary.\n\n**Error:** ${error.message}\n\nPlease try again in a few minutes.`;
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return `**Network Connection Error**\n\nCannot connect to OpenRouter API.\n\n**Possible causes:**\n1. Internet connection issues\n2. CORS restrictions\n3. Firewall blocking the request\n\n**Error:** ${error.message}`;
        } else {
            return `**OpenRouter API Error**\n\nFailed to get response from AI service.\n\n**Error:** ${error.message}\n\n**Details:**\n- Provider: ${API_CONFIG.name}\n- Model: ${this.getCurrentModelId()}\n- Endpoint: ${API_CONFIG.apiEndpoint}`;
        }
    }
    
    updateModel(modelKey) {
        this.currentModel = modelKey;
        this.updateModelDisplay();
        this.showNotification(`Model changed to ${API_CONFIG.models[modelKey]?.name || modelKey}`, 'info');
    }
    
    updateModelDisplay() {
        if (this.currentModelDisplay) {
            const modelConfig = API_CONFIG.models[this.currentModel];
            this.currentModelDisplay.textContent = modelConfig ? modelConfig.name : this.currentModel;
        }
    }
    
    updateDefaultModel() {
        // Handled in saveSettingsChanges
    }
    
    regenerateResponse(messageId) {
        const messageIndex = this.messages.findIndex(m => m.id === messageId);
        if (messageIndex === -1) return;
        
        const previousMessage = this.messages[messageIndex - 1];
        if (!previousMessage || previousMessage.sender !== 'user') {
            this.showNotification('Cannot regenerate without a user message', 'warning');
            return;
        }
        
        // Remove the old AI response
        this.messages.splice(messageIndex, 1);
        if (this.conversationHistory.length > 0) {
            this.conversationHistory.pop();
        }
        
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.remove();
        }
        
        // Generate new response using API only
        this.generateAIResponse(previousMessage.text);
    }
    
    openFileUpload() {
        this.fileUploadModal.style.display = 'flex';
    }
    
    closeFileUploadModal() {
        this.fileUploadModal.style.display = 'none';
    }
    
    simulateFileUpload(type) {
        const files = {
            file: ['document.pdf', 'presentation.pptx', 'notes.txt'],
            image: ['screenshot.png', 'diagram.jpg', 'photo.jpeg']
        };
        
        const fileName = files[type][Math.floor(Math.random() * files[type].length)];
        const file = {
            name: fileName,
            type: type,
            size: Math.floor(Math.random() * 5000) + 100
        };
        
        this.attachedFiles.push(file);
        this.updateFileAttachmentsUI();
        
        this.showNotification(`${fileName} attached`, 'info');
        this.closeFileUploadModal();
    }
    
    updateFileAttachmentsUI() {
        this.fileAttachments.innerHTML = '';
        
        this.attachedFiles.forEach((file, index) => {
            const attachment = document.createElement('div');
            attachment.className = 'file-attachment';
            attachment.innerHTML = `
                <i class="fas fa-${file.type === 'image' ? 'image' : 'file'}"></i>
                <span>${file.name}</span>
                <button class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            attachment.querySelector('.remove-file').addEventListener('click', (e) => {
                e.preventDefault();
                this.attachedFiles.splice(index, 1);
                this.updateFileAttachmentsUI();
            });
            
            this.fileAttachments.appendChild(attachment);
        });
    }
    
    openSettings() {
        this.settingsModal.style.display = 'flex';
    }
    
    closeSettingsModal() {
        this.settingsModal.style.display = 'none';
    }
    
    saveSettingsChanges() {
        const defaultModel = this.defaultModelSelect.value;
        const saveHistory = document.getElementById('saveHistoryToggle')?.checked !== false;
        
        localStorage.setItem('defaultModel', defaultModel);
        localStorage.setItem('saveHistory', saveHistory);
        
        if (defaultModel !== this.currentModel) {
            this.updateModel(defaultModel);
        }
        
        this.showNotification('Settings saved', 'success');
        this.closeSettingsModal();
    }
    
    toggleDarkMode() {
        const newTheme = this.darkModeToggle.checked ? 'dark' : 'light';
        this.changeTheme(newTheme);
    }
    
    changeTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        this.darkModeToggle.checked = theme === 'dark';
        this.themeOptions.forEach(option => {
            option.classList.remove('active');
            if (option.dataset.theme === theme) {
                option.classList.add('active');
            }
        });
        
        this.showNotification(`${theme === 'dark' ? 'Dark' : 'Light'} theme activated`, 'info');
    }
    
    copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('Copied to clipboard', 'success');
        }).catch(() => {
            this.showNotification('Failed to copy', 'error');
        });
    }
    
    loadState() {
        // Load theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.changeTheme(savedTheme);
        
        // Load model
        const savedModel = localStorage.getItem('defaultModel') || 'gpt-3.5-turbo';
        this.currentModel = savedModel;
        this.updateModelDisplay();
        
        // Load chat history
        const saveHistory = localStorage.getItem('saveHistory') !== 'false';
        if (saveHistory) {
            const savedChat = localStorage.getItem('chatHistory');
            if (savedChat) {
                try {
                    const messages = JSON.parse(savedChat);
                    if (messages.length > 0) {
                        this.messages = messages;
                        this.showWelcomeScreen();
                        
                        // Rebuild conversation history
                        this.conversationHistory = [];
                        messages.forEach(msg => {
                            const message = {
                                ...msg,
                                timestamp: new Date(msg.timestamp)
                            };
                            
                            this.addMessageToChat(message);
                            
                            if (msg.sender === 'user') {
                                this.conversationHistory.push({
                                    role: 'user',
                                    content: msg.text
                                });
                            } else if (msg.sender === 'ai') {
                                this.conversationHistory.push({
                                    role: 'assistant',
                                    content: msg.text
                                });
                            }
                        });
                        
                        this.welcomeScreen.style.display = 'none';
                    }
                } catch (e) {
                    console.error('Failed to load chat history:', e);
                }
            }
        }
    }
    
    saveState() {
        const saveHistory = document.getElementById('saveHistoryToggle')?.checked !== false;
        if (saveHistory) {
            localStorage.setItem('chatHistory', JSON.stringify(this.messages));
        }
    }
    
    updateChatHistory() {
        const historyItems = document.querySelectorAll('.chat-history-item');
        historyItems.forEach(item => item.classList.remove('active'));
        if (historyItems[0]) {
            historyItems[0].classList.add('active');
        }
    }
    
    showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="close-notification">&times;</button>
        `;
        
        document.body.appendChild(notification);
        
        // Apply styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10a37f' : 
                         type === 'error' ? '#ef4444' : 
                         type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            font-size: 14px;
            max-width: 300px;
        `;
        
        notification.querySelector('.close-notification').addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }
    
    setupSearchStatsPanel() {
        // Create stats panel
        const statsPanel = document.createElement('div');
        statsPanel.className = 'search-stats hidden';
        statsPanel.id = 'searchStatsPanel';
        
        statsPanel.innerHTML = `
            <h4><i class="fas fa-satellite-dish"></i> Search Statistics</h4>
            <div>
                <span>Total Searches:</span>
                <span id="totalSearches">0</span>
            </div>
            <div>
                <span>Successful:</span>
                <span id="successfulSearches">0</span>
            </div>
            <div>
                <span>Cache Hits:</span>
                <span id="cacheHits">0</span>
            </div>
            <div>
                <span>Real-time Responses:</span>
                <span id="realTimeResponses">0</span>
            </div>
            <div class="stats-divider"></div>
            <div>
                <span>Search Status:</span>
                <span id="searchStatus" class="status-active">Active</span>
            </div>
            <div>
                <span>Cache Size:</span>
                <span id="cacheSize">0</span>
            </div>
        `;
        
        document.body.appendChild(statsPanel);
        
        // Toggle visibility with Ctrl+Shift+S
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                statsPanel.classList.toggle('hidden');
                if (!statsPanel.classList.contains('hidden')) {
                    this.updateSearchStats();
                }
            }
        });
        
        // Update stats periodically
        setInterval(() => this.updateSearchStats(), 5000);
    }
    
    updateSearchStats() {
        const panel = document.getElementById('searchStatsPanel');
        if (!panel || panel.classList.contains('hidden')) return;
        
        const stats = this.searchManager.getStats();
        
        document.getElementById('totalSearches').textContent = stats.totalSearches;
        document.getElementById('successfulSearches').textContent = stats.successfulSearches;
        document.getElementById('cacheHits').textContent = stats.cacheHits;
        document.getElementById('realTimeResponses').textContent = this.searchStats.successfulSearches;
        document.getElementById('cacheSize').textContent = stats.cacheSize;
        
        const statusElement = document.getElementById('searchStatus');
        if (stats.isAvailable) {
            statusElement.textContent = 'Active';
            statusElement.className = 'status-active';
        } else {
            statusElement.textContent = 'Temporarily Offline';
            statusElement.className = 'status-offline';
        }
    }
    
    setupDebugTools() {
        // Create debug button (hidden by default)
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '<i class="fas fa-bug"></i>';
        debugBtn.title = 'Debug Search';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 70px;
            right: 20px;
            background: #6b7280;
            color: white;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 1000;
            opacity: 0.7;
            transition: opacity 0.3s;
        `;
        
        debugBtn.addEventListener('click', () => {
            this.testSearchFunctionality();
        });
        
        debugBtn.addEventListener('mouseenter', () => {
            debugBtn.style.opacity = '1';
        });
        
        debugBtn.addEventListener('mouseleave', () => {
            debugBtn.style.opacity = '0.7';
        });
        
        document.body.appendChild(debugBtn);
    }
    
    async testSearchFunctionality() {
        console.log('🧪 Testing search functionality...');
        
        // Test 1: Check if search triggers work
        const testQueries = [
            "Today's news",
            "What is machine learning?",
            "Current weather in London",
            "Latest sports results",
            "How to bake a cake"
        ];
        
        for (const query of testQueries) {
            const shouldSearch = this.searchManager.shouldSearch(query);
            console.log(`Query: "${query}" - Should search: ${shouldSearch}`);
        }
        
        // Test 2: Test actual search
        const testSearchQuery = "Today's news";
        console.log(`Testing search for: "${testSearchQuery}"`);
        
        try {
            const results = await this.searchManager.searchDuckDuckGo(testSearchQuery);
            console.log('Search test results:', results);
            
            if (results.hasResults) {
                this.showNotification('Search test successful! Found results.', 'success');
            } else {
                this.showNotification('Search test completed but no results found.', 'warning');
            }
        } catch (error) {
            console.error('Search test failed:', error);
            this.showNotification('Search test failed: ' + error.message, 'error');
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.chatManager = new ChatManager();
    
    console.log('🚀 Priyangshu AI - OpenRouter with DuckDuckGo Search');
    console.log('📡 API Provider:', API_CONFIG.name);
    console.log('🔍 DuckDuckGo Search: Enabled (Automatic)');
    console.log('🔑 API Key:', API_CONFIG.apiKey.substring(0, 8) + '...');
    console.log('💡 Available Models:', Object.keys(API_CONFIG.models).length);
    console.log('✅ Ready to use!');
    console.log('💡 Press Ctrl+Shift+S to toggle search statistics');
    
    // Add CSS for API status and search features
    const style = document.createElement('style');
    style.textContent = `
        /* Search badge styling */
        .search-badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 2px 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
            margin-left: 8px;
            opacity: 0.9;
            animation: pulse 2s infinite;
            transition: all 0.3s ease;
            cursor: default;
        }
        
        .search-badge:hover {
            opacity: 1;
            transform: scale(1.05);
        }
        
        .search-badge i {
            font-size: 10px;
        }
        
        @keyframes pulse {
            0% { opacity: 0.9; }
            50% { opacity: 0.7; }
            100% { opacity: 0.9; }
        }
        
        /* Search stats panel */
        .search-stats {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 16px;
            font-size: 13px;
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            width: 220px;
            backdrop-filter: blur(10px);
            animation: slideInUp 0.3s ease;
            transition: all 0.3s ease;
        }
        
        .search-stats.hidden {
            display: none;
        }
        
        .search-stats h4 {
            margin: 0 0 12px 0;
            font-size: 14px;
            color: var(--text-color);
            opacity: 0.9;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .search-stats h4 i {
            color: var(--primary-color);
        }
        
        .search-stats div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
            padding: 4px 0;
            border-bottom: 1px solid var(--border-color);
        }
        
        .search-stats div:last-child {
            border-bottom: none;
        }
        
        .stats-divider {
            height: 1px;
            background: var(--border-color);
            margin: 8px 0;
        }
        
        .status-active {
            color: #10a37f;
            font-weight: 500;
        }
        
        .status-offline {
            color: #ef4444;
            font-weight: 500;
        }
        
        /* Real-time indicator */
        .real-time-indicator {
            display: inline-block;
            width: 8px;
            height: 8px;
            background: #10a37f;
            border-radius: 50%;
            margin-right: 6px;
            animation: blink 1.5s infinite;
        }
        
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        /* API status improvements */
        .api-status-indicator {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.3s ease;
        }
        
        .api-status-indicator i {
            font-size: 10px;
        }
        
        /* Animations */
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes slideInUp {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }
        
        /* Typing dots */
        .typing-dots {
            display: flex;
            gap: 4px;
            padding: 10px 0;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            background: var(--text-color);
            border-radius: 50%;
            animation: typing 1.4s infinite ease-in-out;
            opacity: 0.5;
        }
        
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
            0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
        }
        
        /* Search loading animation */
        .search-loading {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: var(--text-light);
            margin-top: 8px;
            padding: 4px 8px;
            background: var(--sidebar-color);
            border-radius: 6px;
            border: 1px solid var(--border-color);
        }
        
        .search-loading i {
            animation: spin 1s linear infinite;
            font-size: 10px;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Message text formatting */
        .message-text strong {
            font-weight: 600;
        }
        
        .message-text em {
            font-style: italic;
        }
        
        .message-text code {
            background-color: rgba(0,0,0,0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        
        .message-text pre {
            background-color: rgba(0,0,0,0.05);
            padding: 12px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 8px 0;
            font-family: 'Courier New', monospace;
            font-size: 14px;
        }
        
        .message-text h1, .message-text h2, .message-text h3, .message-text h4, .message-text h5, .message-text h6 {
            margin: 16px 0 8px 0;
            font-weight: 600;
        }
        
        .message-text h1 { font-size: 1.5em; }
        .message-text h2 { font-size: 1.3em; }
        .message-text h3 { font-size: 1.1em; }
        
        /* Links in messages */
        .message-text a {
            color: var(--primary-color);
            text-decoration: none;
            border-bottom: 1px dotted var(--primary-color);
            transition: all 0.2s ease;
        }
        
        .message-text a:hover {
            border-bottom: 1px solid var(--primary-color);
            opacity: 0.8;
        }
        
        /* Notification Styles */
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-color);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 12px 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--shadow-lg);
            z-index: 9999;
            animation: slideInRight 0.3s ease;
            font-size: 14px;
            max-width: 300px;
        }
        
        .notification.success {
            background: #10a37f;
            color: white;
            border-color: #0d8c6d;
        }
        
        .notification.error {
            background: #ef4444;
            color: white;
            border-color: #dc2626;
        }
        
        .notification.warning {
            background: #f59e0b;
            color: white;
            border-color: #d97706;
        }
        
        .notification.info {
            background: #3b82f6;
            color: white;
            border-color: #2563eb;
        }
        
        .close-notification {
            background: none;
            border: none;
            color: inherit;
            font-size: 18px;
            cursor: pointer;
            padding: 0;
            width: 24px;
            height: 24px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-left: auto;
            opacity: 0.8;
            transition: opacity 0.2s;
        }
        
        .close-notification:hover {
            opacity: 1;
        }
        
        /* File attachments preview in messages */
        .file-attachments-preview {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 8px;
        }
        
        .file-preview {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            background: var(--sidebar-color);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            font-size: 12px;
            color: var(--text-color);
        }
        
        .file-preview i {
            color: var(--primary-color);
            font-size: 12px;
        }
        
        /* Search-only response styling */
        .message-text .search-result-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            margin-bottom: 12px;
            display: inline-block;
        }
    `;
    document.head.appendChild(style);
});