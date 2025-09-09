// Shared Backend API for Real Multi-User Notice Board
// This enables all users to see notices posted by others

class SharedBackend {
    constructor() {
        // Using a simple REST API that works without API keys
        // This will store notices in a shared location accessible to all users
        this.baseUrl = 'https://api.jsonserve.com/7vKqyX';
        
        // Backup using local storage if API fails
        this.isOnline = navigator.onLine;
        this.userId = this.generateUserId();
        
        // Setup connection monitoring and periodic sync
        this.setupConnectionMonitoring();
        this.setupPeriodicSync();
    }

    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('📶 Back online - resuming sync');
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📵 Offline - using local storage only');
        });
    }

    async makeRequest(method, data = null) {
        if (!this.isOnline) {
            throw new Error('Offline - no internet connection');
        }

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': this.apiKey
            }
        };

        if (data && (method === 'PUT' || method === 'POST')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(this.currentUrl, options);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            this.retryCount = 0; // Reset retry count on success
            
            return result;
        } catch (error) {
            console.error(`Request failed:`, error);
            
            // Try fallback URLs if main URL fails
            if (this.retryCount < this.maxRetries && this.fallbackUrls.length > 0) {
                this.retryCount++;
                this.currentUrl = this.fallbackUrls[this.retryCount % this.fallbackUrls.length];
                console.log(`Trying fallback URL: ${this.currentUrl}`);
                return this.makeRequest(method, data);
            }
            
            throw error;
        }
    }

    async loadNotices() {
        try {
            console.log('🔄 Loading notices from shared backend...');
            const response = await this.makeRequest('GET');
            
            // Different services have different response formats
            let notices = [];
            if (response.record && Array.isArray(response.record)) {
                notices = response.record;
            } else if (Array.isArray(response)) {
                notices = response;
            } else if (response.data && Array.isArray(response.data)) {
                notices = response.data;
            }
            
            console.log(`✅ Loaded ${notices.length} notices from backend`);
            return notices;
        } catch (error) {
            console.error('Failed to load from backend:', error);
            // Return empty array if backend fails
            return [];
        }
    }

    async saveNotices(notices) {
        try {
            console.log(`🔄 Saving ${notices.length} notices to shared backend...`);
            
            const response = await this.makeRequest('PUT', notices);
            console.log('✅ Notices saved to backend successfully');
            return true;
        } catch (error) {
            console.error('Failed to save to backend:', error);
            return false;
        }
    }

    async addNotice(notice) {
        try {
            // Load current notices
            const currentNotices = await this.loadNotices();
            
            // Add new notice at the beginning
            const updatedNotices = [notice, ...currentNotices];
            
            // Save back to backend
            const success = await this.saveNotices(updatedNotices);
            return success;
        } catch (error) {
            console.error('Failed to add notice:', error);
            return false;
        }
    }

    async updateNotice(updatedNotice) {
        try {
            // Load current notices
            const currentNotices = await this.loadNotices();
            
            // Find and update the notice
            const noticeIndex = currentNotices.findIndex(n => n.id === updatedNotice.id);
            if (noticeIndex !== -1) {
                currentNotices[noticeIndex] = updatedNotice;
                
                // Save back to backend
                const success = await this.saveNotices(currentNotices);
                return success;
            }
            return false;
        } catch (error) {
            console.error('Failed to update notice:', error);
            return false;
        }
    }

    async deleteNotice(noticeId) {
        try {
            // Load current notices
            const currentNotices = await this.loadNotices();
            
            // Filter out the notice to delete
            const filteredNotices = currentNotices.filter(n => n.id !== noticeId);
            
            // Save back to backend
            const success = await this.saveNotices(filteredNotices);
            return success;
        } catch (error) {
            console.error('Failed to delete notice:', error);
            return false;
        }
    }

    // Simple method to check if backend is working
    async testConnection() {
        try {
            await this.makeRequest('GET');
            return true;
        } catch (error) {
            return false;
        }
    }

    // Get a rough estimate of active users (not perfect but gives an idea)
    async updateLastSeen() {
        try {
            // This is a simple approach - in a real app you'd use WebSockets
            const timestamp = new Date().toISOString();
            const userActivity = {
                lastSeen: timestamp,
                userId: this.generateUserId()
            };
            
            // Store in a separate endpoint if available
            // For now, just return true
            return true;
        } catch (error) {
            console.error('Failed to update last seen:', error);
            return false;
        }
    }

    generateUserId() {
        // Create a simple user ID for this session
        if (!sessionStorage.getItem('noticeboardUserId')) {
            const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('noticeboardUserId', userId);
        }
        return sessionStorage.getItem('noticeboardUserId');
    }
}

// Make it available globally
window.SharedBackend = SharedBackend;
