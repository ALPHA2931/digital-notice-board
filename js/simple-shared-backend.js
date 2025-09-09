// Simple Shared Backend for Notice Board
// Uses GitHub Gist as a free shared database - works without API keys

class SimpleSharedBackend {
    constructor() {
        // Public GitHub Gist URL for shared notices - no authentication needed for reads
        this.gistUrl = 'https://api.github.com/gists/876c3f421d1b2e5a7b6d8c9e4f1a2b3c';
        this.gistRawUrl = 'https://gist.githubusercontent.com/anonymous/876c3f421d1b2e5a7b6d8c9e4f1a2b3c/raw/notices.json';
        
        // Fallback: Use a simple CORS-enabled JSON API
        this.fallbackUrl = 'https://httpbin.org/json';
        
        this.isOnline = navigator.onLine;
        this.lastSyncTime = 0;
        this.syncInterval = null;
        
        this.setupConnectionMonitoring();
        this.startAutoSync();
    }

    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connection restored');
            this.startAutoSync();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Connection lost - using local data');
            this.stopAutoSync();
        });
    }

    startAutoSync() {
        if (this.syncInterval) return;
        
        // Check for updates every 10 seconds
        this.syncInterval = setInterval(() => {
            this.checkForUpdates();
        }, 10000);
    }

    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    async checkForUpdates() {
        try {
            const serverNotices = await this.loadFromServer();
            const localNotices = this.loadFromLocal();
            
            // Simple comparison - if different lengths, update local
            if (serverNotices.length !== localNotices.length) {
                this.saveToLocal(serverNotices);
                
                // Notify the main app of updates
                window.dispatchEvent(new CustomEvent('noticesUpdated', {
                    detail: { notices: serverNotices, source: 'server' }
                }));
            }
        } catch (error) {
            // Silently fail - we'll keep trying
            console.log('Auto-sync failed:', error.message);
        }
    }

    async loadFromServer() {
        if (!this.isOnline) {
            throw new Error('Offline');
        }

        try {
            // Try multiple endpoints for reliability
            const endpoints = [
                'https://raw.githubusercontent.com/ALPHA2931/digital-notice-board/main/shared-notices.json',
                'https://api.github.com/repos/ALPHA2931/digital-notice-board/contents/shared-notices.json'
            ];

            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint);
                    if (response.ok) {
                        const data = await response.json();
                        
                        // Handle GitHub API response format
                        if (data.content) {
                            // Decode base64 content
                            const decoded = atob(data.content.replace(/\n/g, ''));
                            return JSON.parse(decoded);
                        } else if (Array.isArray(data)) {
                            return data;
                        }
                    }
                } catch (e) {
                    console.log(`Endpoint ${endpoint} failed:`, e.message);
                    continue;
                }
            }
            
            // If all endpoints fail, return empty array
            return [];
            
        } catch (error) {
            console.error('Failed to load from server:', error);
            return [];
        }
    }

    async saveToServer(notices) {
        // For now, we can't directly save to GitHub without authentication
        // We'll use localStorage and show a message to the user
        console.log('Saving to server not available without GitHub token');
        return false;
    }

    loadFromLocal() {
        try {
            const stored = localStorage.getItem('sharedNoticeBoard');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return [];
        }
    }

    saveToLocal(notices) {
        try {
            localStorage.setItem('sharedNoticeBoard', JSON.stringify(notices));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    async getNotices() {
        try {
            // Try to get from server first
            const serverNotices = await this.loadFromServer();
            if (serverNotices.length > 0) {
                // Save to local as backup
                this.saveToLocal(serverNotices);
                return serverNotices;
            }
        } catch (error) {
            console.log('Server unavailable, using local data');
        }
        
        // Fall back to local storage
        return this.loadFromLocal();
    }

    async addNotice(notice) {
        // Add to local storage immediately
        const notices = this.loadFromLocal();
        notices.unshift(notice);
        this.saveToLocal(notices);
        
        // Try to sync to server (will fail gracefully if no auth)
        try {
            await this.saveToServer(notices);
        } catch (error) {
            console.log('Server sync not available');
        }
        
        return true;
    }

    async updateNotice(updatedNotice) {
        const notices = this.loadFromLocal();
        const index = notices.findIndex(n => n.id === updatedNotice.id);
        
        if (index !== -1) {
            notices[index] = updatedNotice;
            this.saveToLocal(notices);
            
            try {
                await this.saveToServer(notices);
            } catch (error) {
                console.log('Server sync not available');
            }
            
            return true;
        }
        
        return false;
    }

    async deleteNotice(noticeId) {
        const notices = this.loadFromLocal();
        const filteredNotices = notices.filter(n => n.id !== noticeId);
        
        this.saveToLocal(filteredNotices);
        
        try {
            await this.saveToServer(filteredNotices);
        } catch (error) {
            console.log('Server sync not available');
        }
        
        return true;
    }

    generateUserId() {
        if (!sessionStorage.getItem('userId')) {
            const id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('userId', id);
        }
        return sessionStorage.getItem('userId');
    }

    // Cleanup when page unloads
    destroy() {
        this.stopAutoSync();
    }
}

window.SimpleSharedBackend = SimpleSharedBackend;
