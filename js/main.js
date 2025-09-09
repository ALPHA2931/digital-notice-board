// Digital Notice Board JavaScript

class NoticeBoard {
    constructor() {
        this.notices = [];
        this.currentEditId = null;
        
        // Shared backend for real multi-user functionality
        this.sharedBackend = null;
        this.isSharedMode = false;
        
        this.init();
        this.initializeSharedBackend();
    }

    init() {
        // Get DOM elements
        this.noticesGrid = document.getElementById('noticesGrid');
        this.emptyState = document.getElementById('emptyState');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalTitle = document.getElementById('modalTitle');
        this.noticeForm = document.getElementById('noticeForm');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearch');
        this.categoryFilter = document.getElementById('categoryFilter');
        this.priorityFilter = document.getElementById('priorityFilter');
        this.exportBtn = document.getElementById('exportBtn');
        this.importFile = document.getElementById('importFile');
        
        // Sync status elements
        this.syncStatus = document.getElementById('syncStatus');
        this.syncIcon = document.getElementById('syncIcon');
        this.syncText = document.getElementById('syncText');
        this.onlineUsers = document.getElementById('onlineUsers');
        this.userCount = document.getElementById('userCount');
        
        // Current filters
        this.currentSearch = '';
        this.currentCategoryFilter = 'all';
        this.currentPriorityFilter = 'all';
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Load notices from localStorage if available
        this.loadNotices();
        this.renderNotices();
    }

    async initializeSharedBackend() {
        // Wait a moment for scripts to load
        setTimeout(async () => {
            if (window.WorkingSharedBackend) {
                try {
                    console.log('🌍 Initializing shared backend...');
                    this.sharedBackend = new window.WorkingSharedBackend();
                    this.isSharedMode = true;
                    
                    // Load notices from shared backend
                    await this.loadNoticesFromSharedBackend();
                    
                    this.updateSyncStatus('connected', 'Shared Mode');
                    this.showToast('🌍 Multi-user mode enabled! Notices are shared with all users.');
                    
                } catch (error) {
                    console.error('Shared backend setup failed:', error);
                    this.isSharedMode = false;
                    this.updateSyncStatus('disconnected', 'Local Mode');
                    this.loadSampleData();
                    this.renderNotices();
                }
            } else {
                console.log('Shared backend not available - using local mode');
                this.isSharedMode = false;
                this.updateSyncStatus('disconnected', 'Local Mode');
                this.loadSampleData();
                this.renderNotices();
            }
        }, 1000);
    }

    async loadNoticesFromSharedBackend() {
        if (!this.sharedBackend) return;
        
        try {
            this.updateSyncStatus('connecting', 'Loading...');
            
            // Try to get notices from shared backend
            let notices = await this.sharedBackend.getNotices();
            
            // If no notices exist, initialize with sample data
            if (notices.length === 0) {
                notices = await this.sharedBackend.initializeWithSampleData();
            }
            
            this.notices = notices;
            this.renderNotices();
            
            this.updateSyncStatus('connected', 'Shared Mode');
            console.log(`✅ Loaded ${notices.length} shared notices`);
            
        } catch (error) {
            console.error('Failed to load from shared backend:', error);
            this.updateSyncStatus('disconnected', 'Local Mode');
            this.loadSampleData();
            this.renderNotices();
        }
    }

    setupRealTimeSync() {
        if (!this.firebaseManager) return;
        
        // Listen for real-time notice changes
        this.firebaseManager.onNoticesChange((notices) => {
            this.notices = notices;
            this.firebaseManager.syncWithLocalStorage(notices);
            this.renderNotices();
        });
        
        // Listen for online users count
        this.firebaseManager.onOnlineUsersChange((count) => {
            this.updateOnlineUsers(count);
        });
        
        // Load initial data from Firebase
        this.loadNoticesFromFirebase();
    }

    async loadNoticesFromFirebase() {
        if (!this.firebaseManager) return;
        
        try {
            this.updateSyncStatus('connecting', 'Syncing...');
            const firebaseNotices = await this.firebaseManager.getNotices();
            
            if (firebaseNotices.length > 0) {
                this.notices = firebaseNotices;
                this.renderNotices();
            } else if (this.notices.length > 0) {
                // Upload local notices to Firebase if Firebase is empty
                for (const notice of this.notices) {
                    await this.firebaseManager.saveNotice(notice);
                }
            }
            
            this.updateSyncStatus('connected', 'Real-time Sync');
        } catch (error) {
            console.error('Failed to load from Firebase:', error);
            this.updateSyncStatus('disconnected', 'Sync Failed');
        }
    }

    updateSyncStatus(status, text) {
        if (!this.syncStatus) return;
        
        this.syncStatus.className = `sync-status ${status}`;
        this.syncText.textContent = text;
        
        // Update icon based on status
        switch (status) {
            case 'connected':
                this.syncIcon.className = 'fas fa-sync-alt';
                break;
            case 'connecting':
                this.syncIcon.className = 'fas fa-spinner fa-spin';
                break;
            case 'disconnected':
                this.syncIcon.className = 'fas fa-wifi-slash';
                break;
        }
    }

    updateOnlineUsers(count) {
        if (!this.onlineUsers) return;
        
        if (count > 1) {
            this.onlineUsers.style.display = 'flex';
            this.userCount.textContent = count;
        } else {
            this.onlineUsers.style.display = 'none';
        }
    }

    bindEventListeners() {
        // Add notice button
        document.getElementById('addNoticeBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Close modal buttons
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });
        
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.closeModal();
        });

        // Modal overlay click to close
        this.modalOverlay.addEventListener('click', (e) => {
            if (e.target === this.modalOverlay) {
                this.closeModal();
            }
        });

        // Form submission
        this.noticeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Search functionality
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.trim();
            this.updateClearButton();
            this.applyFilters();
        });

        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.currentSearch = '';
            this.updateClearButton();
            this.applyFilters();
        });

        // Filter functionality
        this.categoryFilter.addEventListener('change', (e) => {
            this.currentCategoryFilter = e.target.value;
            this.applyFilters();
        });

        this.priorityFilter.addEventListener('change', (e) => {
            this.currentPriorityFilter = e.target.value;
            this.applyFilters();
        });

        // Export/Import functionality
        this.exportBtn.addEventListener('click', () => {
            this.exportNotices();
        });

        this.importFile.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importNotices(file);
                e.target.value = ''; // Reset file input
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
            if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.openModal();
            }
        });
    }

    loadSampleData() {
        // Only load sample data if no notices exist
        if (this.notices.length === 0) {
            const sampleNotices = [
                {
                    id: this.generateId(),
                    title: 'Welcome to Digital Notice Board',
                    content: 'This is your digital notice board! You can add, edit, and delete notices. Click the "Add Notice" button to create your first notice.',
                    category: 'announcement',
                    priority: 'medium',
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    title: 'Team Meeting Tomorrow',
                    content: 'Don\'t forget about our weekly team meeting tomorrow at 2:00 PM in the conference room. We\'ll be discussing project updates and next week\'s goals.',
                    category: 'reminder',
                    priority: 'high',
                    createdAt: new Date(Date.now() - 86400000).toISOString() // Yesterday
                },
                {
                    id: this.generateId(),
                    title: 'System Maintenance',
                    content: 'Scheduled system maintenance will occur this weekend from 2:00 AM to 6:00 AM. Some services may be temporarily unavailable.',
                    category: 'urgent',
                    priority: 'high',
                    createdAt: new Date(Date.now() - 172800000).toISOString() // 2 days ago
                }
            ];
            
            this.notices = sampleNotices;
            this.saveNotices();
        }
    }

    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    loadNotices() {
        try {
            const stored = localStorage.getItem('digitalNoticeBoard');
            if (stored) {
                this.notices = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error loading notices:', error);
            this.notices = [];
        }
    }

    saveNotices() {
        try {
            localStorage.setItem('digitalNoticeBoard', JSON.stringify(this.notices));
        } catch (error) {
            console.error('Error saving notices:', error);
        }
    }

    openModal(notice = null) {
        this.currentEditId = notice ? notice.id : null;
        
        if (notice) {
            // Edit mode
            this.modalTitle.textContent = 'Edit Notice';
            document.getElementById('noticeTitle').value = notice.title;
            document.getElementById('noticeContent').value = notice.content;
            document.getElementById('noticeCategory').value = notice.category;
            document.getElementById('noticePriority').value = notice.priority;
        } else {
            // Add mode
            this.modalTitle.textContent = 'Add New Notice';
            this.noticeForm.reset();
        }
        
        this.modalOverlay.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus on title field
        setTimeout(() => {
            document.getElementById('noticeTitle').focus();
        }, 100);
    }

    closeModal() {
        this.modalOverlay.style.display = 'none';
        document.body.style.overflow = '';
        this.currentEditId = null;
        this.noticeForm.reset();
    }

    async handleFormSubmit() {
        console.log('Form submission started');
        
        const formData = new FormData(this.noticeForm);
        const noticeData = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim(),
            category: formData.get('category'),
            priority: formData.get('priority')
        };
        
        console.log('Notice data:', noticeData);

        // Validation
        if (!noticeData.title || !noticeData.content) {
            alert('Please fill in both title and content.');
            return;
        }

        let notice;
        if (this.currentEditId) {
            // Update existing notice
            const noticeIndex = this.notices.findIndex(n => n.id === this.currentEditId);
            if (noticeIndex !== -1) {
                notice = {
                    ...this.notices[noticeIndex],
                    ...noticeData,
                    updatedAt: new Date().toISOString()
                };
                this.notices[noticeIndex] = notice;
            }
        } else {
            // Create new notice
            notice = {
                id: this.generateId(),
                ...noticeData,
                createdAt: new Date().toISOString()
            };
            this.notices.unshift(notice); // Add to beginning
        }

        // Use shared backend if available
        if (this.isSharedMode && this.sharedBackend && notice) {
            try {
                if (this.currentEditId) {
                    // Update existing notice
                    await this.sharedBackend.updateNotice(notice);
                    this.showToast('🌍 Notice updated and shared with all users!');
                } else {
                    // Add new notice
                    await this.sharedBackend.addNotice(notice);
                    this.showToast('🌍 Notice added and shared with all users!');
                }
                
                // Update local notices array to reflect the change immediately
                if (this.currentEditId) {
                    const index = this.notices.findIndex(n => n.id === this.currentEditId);
                    if (index !== -1) {
                        this.notices[index] = notice;
                    }
                } else {
                    this.notices.unshift(notice);
                }
                
                this.renderNotices();
                
            } catch (error) {
                console.error('Failed to sync with shared backend:', error);
                // Fall back to local storage
                this.saveNotices();
                this.renderNotices();
                this.showToast('Saved locally - sharing failed');
            }
        } else {
            // Shared backend not available, use localStorage only
            this.saveNotices();
            this.renderNotices();
            this.showToast(this.currentEditId ? 'Notice updated!' : 'Notice added!');
        }
        
        this.closeModal();
    }

    async deleteNotice(id) {
        if (confirm('Are you sure you want to delete this notice?')) {
            // Remove from local array
            this.notices = this.notices.filter(notice => notice.id !== id);
            
            // Use shared backend if available
            if (this.isSharedMode && this.sharedBackend) {
                try {
                    await this.sharedBackend.deleteNotice(id);
                    this.showToast('🌍 Notice deleted and updated for all users!');
                    this.renderNotices();
                } catch (error) {
                    console.error('Failed to delete from shared backend:', error);
                    // Fall back to local storage
                    this.saveNotices();
                    this.renderNotices();
                    this.showToast('Deleted locally - sharing failed');
                }
            } else {
                // Shared backend not available, use localStorage only
                this.saveNotices();
                this.renderNotices();
                this.showToast('Notice deleted!');
            }
        }
    }

    updateClearButton() {
        this.clearSearchBtn.style.display = this.currentSearch ? 'block' : 'none';
    }

    applyFilters() {
        let filteredNotices = [...this.notices];

        // Apply search filter
        if (this.currentSearch) {
            const searchLower = this.currentSearch.toLowerCase();
            filteredNotices = filteredNotices.filter(notice => 
                notice.title.toLowerCase().includes(searchLower) ||
                notice.content.toLowerCase().includes(searchLower)
            );
        }

        // Apply category filter
        if (this.currentCategoryFilter !== 'all') {
            filteredNotices = filteredNotices.filter(notice => 
                notice.category === this.currentCategoryFilter
            );
        }

        // Apply priority filter
        if (this.currentPriorityFilter !== 'all') {
            filteredNotices = filteredNotices.filter(notice => 
                notice.priority === this.currentPriorityFilter
            );
        }

        this.renderFilteredNotices(filteredNotices);
    }

    renderNotices() {
        this.applyFilters(); // Use filtering instead of direct render
    }

    createNoticeHTML(notice) {
        const createdDate = new Date(notice.createdAt);
        const formattedDate = createdDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="notice-card" data-id="${notice.id}">
                <div class="notice-header">
                    <h3 class="notice-title">${this.escapeHtml(notice.title)}</h3>
                    <div class="notice-actions">
                        <button class="action-btn edit" onclick="noticeBoard.openModal(noticeBoard.notices.find(n => n.id === '${notice.id}'))" title="Edit notice">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="noticeBoard.deleteNotice('${notice.id}')" title="Delete notice">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="notice-content">${this.escapeHtml(notice.content)}</div>
                <div class="notice-meta">
                    <div class="notice-tags">
                        <span class="notice-category category-${notice.category}">${notice.category}</span>
                        <span class="notice-priority priority-${notice.priority}">${notice.priority}</span>
                    </div>
                    <div class="notice-date">${formattedDate}</div>
                </div>
            </div>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        // Add toast styles
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#2c3e50',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
            zIndex: '9999',
            fontSize: '0.9rem',
            fontWeight: '500',
            opacity: '0',
            transform: 'translateY(50px)',
            transition: 'all 0.3s ease'
        });
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(50px)';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // Search functionality (for future enhancement)
    searchNotices(query) {
        const filtered = this.notices.filter(notice => 
            notice.title.toLowerCase().includes(query.toLowerCase()) ||
            notice.content.toLowerCase().includes(query.toLowerCase())
        );
        
        // Render filtered results
        this.renderFilteredNotices(filtered);
    }

    // Filter by category (for future enhancement)
    filterByCategory(category) {
        const filtered = category === 'all' 
            ? this.notices 
            : this.notices.filter(notice => notice.category === category);
        
        this.renderFilteredNotices(filtered);
    }

    renderFilteredNotices(notices) {
        if (notices.length === 0) {
            if (this.notices.length === 0) {
                // No notices at all
                this.noticesGrid.innerHTML = '';
                this.emptyState.style.display = 'block';
            } else {
                // No notices match current filters
                this.emptyState.style.display = 'none';
                this.noticesGrid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No notices found</h3>
                        <p>Try adjusting your search or filter criteria.</p>
                    </div>
                `;
            }
            return;
        }

        this.emptyState.style.display = 'none';
        
        // Sort notices by creation date (newest first)
        const sortedNotices = [...notices].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        this.noticesGrid.innerHTML = sortedNotices.map(notice => 
            this.createNoticeHTML(notice)
        ).join('');
    }

    // Export notices (for future enhancement)
    exportNotices() {
        const dataStr = JSON.stringify(this.notices, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `notices_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }

    // Import notices
    importNotices(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate that importedData is an array
                if (!Array.isArray(importedData)) {
                    throw new Error('Invalid file format: Expected an array of notices.');
                }
                
                // Validate each notice has required fields
                const validNotices = importedData.filter(notice => 
                    notice.title && notice.content && notice.category && notice.priority
                );
                
                if (validNotices.length === 0) {
                    throw new Error('No valid notices found in the file.');
                }
                
                // Add unique IDs and timestamps to imported notices
                const processedNotices = validNotices.map(notice => ({
                    ...notice,
                    id: this.generateId(),
                    createdAt: notice.createdAt || new Date().toISOString(),
                    imported: true
                }));
                
                // Merge with existing notices
                this.notices = [...this.notices, ...processedNotices];
                this.saveNotices();
                this.renderNotices();
                
                this.showToast(`Successfully imported ${processedNotices.length} notice${processedNotices.length !== 1 ? 's' : ''}!`);
                
                if (validNotices.length < importedData.length) {
                    this.showToast(`Note: ${importedData.length - validNotices.length} invalid notice${importedData.length - validNotices.length !== 1 ? 's were' : ' was'} skipped.`);
                }
            } catch (error) {
                console.error('Import error:', error);
                alert(`Error importing notices: ${error.message}`);
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the notice board when the page loads
let noticeBoard;

document.addEventListener('DOMContentLoaded', () => {
    noticeBoard = new NoticeBoard();
    
    // Make globally available for shared backend
    window.noticeBoard = noticeBoard;
    
    // Add some helpful console messages
    console.log('Digital Notice Board initialized!');
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd + N: Add new notice');
    console.log('- Escape: Close modal');
});

// Add some global utility functions for potential future use
window.NoticeBoard = NoticeBoard;
