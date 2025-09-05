// Digital Notice Board JavaScript

class NoticeBoard {
    constructor() {
        this.notices = [];
        this.currentEditId = null;
        this.init();
        this.loadSampleData();
    }

    init() {
        // Get DOM elements
        this.noticesGrid = document.getElementById('noticesGrid');
        this.emptyState = document.getElementById('emptyState');
        this.modalOverlay = document.getElementById('modalOverlay');
        this.modalTitle = document.getElementById('modalTitle');
        this.noticeForm = document.getElementById('noticeForm');
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Load notices from localStorage if available
        this.loadNotices();
        this.renderNotices();
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

    handleFormSubmit() {
        const formData = new FormData(this.noticeForm);
        const noticeData = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim(),
            category: formData.get('category'),
            priority: formData.get('priority')
        };

        // Validation
        if (!noticeData.title || !noticeData.content) {
            alert('Please fill in both title and content.');
            return;
        }

        if (this.currentEditId) {
            // Update existing notice
            const noticeIndex = this.notices.findIndex(n => n.id === this.currentEditId);
            if (noticeIndex !== -1) {
                this.notices[noticeIndex] = {
                    ...this.notices[noticeIndex],
                    ...noticeData,
                    updatedAt: new Date().toISOString()
                };
            }
        } else {
            // Create new notice
            const newNotice = {
                id: this.generateId(),
                ...noticeData,
                createdAt: new Date().toISOString()
            };
            this.notices.unshift(newNotice); // Add to beginning
        }

        this.saveNotices();
        this.renderNotices();
        this.closeModal();
        
        // Show success message
        this.showToast(this.currentEditId ? 'Notice updated successfully!' : 'Notice added successfully!');
    }

    deleteNotice(id) {
        if (confirm('Are you sure you want to delete this notice?')) {
            this.notices = this.notices.filter(notice => notice.id !== id);
            this.saveNotices();
            this.renderNotices();
            this.showToast('Notice deleted successfully!');
        }
    }

    renderNotices() {
        if (this.notices.length === 0) {
            this.noticesGrid.innerHTML = '';
            this.emptyState.style.display = 'block';
            return;
        }

        this.emptyState.style.display = 'none';
        
        // Sort notices by creation date (newest first)
        const sortedNotices = [...this.notices].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        this.noticesGrid.innerHTML = sortedNotices.map(notice => 
            this.createNoticeHTML(notice)
        ).join('');
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
            this.noticesGrid.innerHTML = '<div class="no-results">No notices found.</div>';
            return;
        }

        this.noticesGrid.innerHTML = notices.map(notice => 
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

    // Import notices (for future enhancement)
    importNotices(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedNotices = JSON.parse(e.target.result);
                this.notices = [...this.notices, ...importedNotices];
                this.saveNotices();
                this.renderNotices();
                this.showToast('Notices imported successfully!');
            } catch (error) {
                alert('Error importing notices. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Initialize the notice board when the page loads
let noticeBoard;

document.addEventListener('DOMContentLoaded', () => {
    noticeBoard = new NoticeBoard();
    
    // Add some helpful console messages
    console.log('Digital Notice Board initialized!');
    console.log('Keyboard shortcuts:');
    console.log('- Ctrl/Cmd + N: Add new notice');
    console.log('- Escape: Close modal');
});

// Add some global utility functions for potential future use
window.NoticeBoard = NoticeBoard;
