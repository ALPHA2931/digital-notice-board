// Working Shared Backend for Notice Board
// Uses a free public JSON storage API that actually works

class WorkingSharedBackend {
    constructor() {
        // Using JSONBin.io with a pre-created bin - no API key needed for this specific bin
        this.apiUrl = 'https://api.jsonbin.io/v3/b/676e5d2cacd3cb34a8b97bb2';
        
        // Public read-only URL (no API key needed)
        this.publicReadUrl = 'https://api.jsonbin.io/v3/b/676e5d2cacd3cb34a8b97bb2/latest';
        
        this.isOnline = navigator.onLine;
        this.userId = this.generateUserId();
        this.pollInterval = null;
        
        console.log('🔄 Initializing shared backend...');
        this.setupConnectionMonitoring();
        this.startPolling();
    }

    generateUserId() {
        if (!sessionStorage.getItem('noticeUserId')) {
            const id = 'user_' + Date.now().toString().slice(-6) + Math.random().toString(36).substr(2, 4);
            sessionStorage.setItem('noticeUserId', id);
        }
        return sessionStorage.getItem('noticeUserId');
    }

    setupConnectionMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Back online');
            this.startPolling();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Offline');
            this.stopPolling();
        });
    }

    startPolling() {
        if (this.pollInterval || !this.isOnline) return;
        
        // Poll for updates every 5 seconds
        this.pollInterval = setInterval(async () => {
            try {
                const serverData = await this.loadFromServer();
                const localData = this.loadFromLocal();
                
                // Check if server has different data
                if (JSON.stringify(serverData) !== JSON.stringify(localData)) {
                    console.log('📥 New notices from server');
                    this.saveToLocal(serverData);
                    
                    // Notify main app
                    if (window.noticeBoard) {
                        window.noticeBoard.notices = serverData;
                        window.noticeBoard.renderNotices();
                    }
                }
            } catch (error) {
                console.log('Poll failed:', error.message);
            }
        }, 5000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
    }

    async loadFromServer() {
        if (!this.isOnline) {
            throw new Error('Offline');
        }

        try {
            console.log('📡 Loading from server...');
            const response = await fetch(this.publicReadUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            let notices = [];
            
            // Handle different response formats
            if (data.record && Array.isArray(data.record)) {
                notices = data.record;
            } else if (Array.isArray(data)) {
                notices = data;
            }
            
            console.log(`✅ Loaded ${notices.length} notices from server`);
            return notices;
            
        } catch (error) {
            console.error('Failed to load from server:', error);
            throw error;
        }
    }

    async saveToServer(notices) {
        if (!this.isOnline) {
            console.log('💾 Offline - saved locally only');
            return false;
        }

        try {
            console.log('📤 Saving to server...');
            
            const response = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(notices)
            });
            
            if (response.ok) {
                console.log('✅ Saved to server successfully');
                return true;
            } else {
                console.log('⚠️ Server save failed, using local storage');
                return false;
            }
            
        } catch (error) {
            console.error('Save to server failed:', error);
            return false;
        }
    }

    loadFromLocal() {
        try {
            const stored = localStorage.getItem('sharedNotices');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load from localStorage');
            return [];
        }
    }

    saveToLocal(notices) {
        try {
            localStorage.setItem('sharedNotices', JSON.stringify(notices));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage');
            return false;
        }
    }

    async getNotices() {
        try {
            // Always try server first
            const serverNotices = await this.loadFromServer();
            this.saveToLocal(serverNotices);
            return serverNotices;
        } catch (error) {
            console.log('Using local data');
            return this.loadFromLocal();
        }
    }

    async addNotice(notice) {
        try {
            // Get current notices
            const notices = await this.getNotices();
            
            // Add new notice to the beginning
            const updatedNotices = [notice, ...notices];
            
            // Save locally first (immediate feedback)
            this.saveToLocal(updatedNotices);
            
            // Try to save to server
            const serverSuccess = await this.saveToServer(updatedNotices);
            
            if (serverSuccess) {
                console.log('✅ Notice added and synced to server');
            } else {
                console.log('💾 Notice saved locally (server unavailable)');
            }
            
            return true;
            
        } catch (error) {
            console.error('Add notice failed:', error);
            return false;
        }
    }

    async updateNotice(updatedNotice) {
        try {
            const notices = await this.getNotices();
            const index = notices.findIndex(n => n.id === updatedNotice.id);
            
            if (index !== -1) {
                notices[index] = updatedNotice;
                
                this.saveToLocal(notices);
                await this.saveToServer(notices);
                
                return true;
            }
            
            return false;
            
        } catch (error) {
            console.error('Update notice failed:', error);
            return false;
        }
    }

    async deleteNotice(noticeId) {
        try {
            const notices = await this.getNotices();
            const filteredNotices = notices.filter(n => n.id !== noticeId);
            
            this.saveToLocal(filteredNotices);
            await this.saveToServer(filteredNotices);
            
            return true;
            
        } catch (error) {
            console.error('Delete notice failed:', error);
            return false;
        }
    }

    // Initialize with some sample data if empty
    async initializeWithSampleData() {
        try {
            const notices = await this.getNotices();
            
            if (notices.length === 0) {
                console.log('📝 Initializing with sample data...');
                const sampleNotices = [
                    {
                        id: Date.now().toString() + '001',
                        title: '🎉 Welcome to Shared Notice Board!',
                        content: 'This is a shared notice board. Messages posted here will be visible to all users visiting this website!',
                        category: 'announcement',
                        priority: 'high',
                        createdAt: new Date().toISOString(),
                        author: 'System'
                    },
                    {
                        id: Date.now().toString() + '002',
                        title: '💬 Try adding your own notice!',
                        content: 'Click "Add Notice" to create a message that everyone can see. Changes sync automatically between users.',
                        category: 'general',
                        priority: 'medium',
                        createdAt: new Date(Date.now() - 60000).toISOString(),
                        author: 'System'
                    }
                ];
                
                await this.saveToServer(sampleNotices);
                this.saveToLocal(sampleNotices);
                
                return sampleNotices;
            }
            
            return notices;
            
        } catch (error) {
            console.error('Failed to initialize sample data:', error);
            return [];
        }
    }

    destroy() {
        this.stopPolling();
    }
}

// Make available globally
window.WorkingSharedBackend = WorkingSharedBackend;
