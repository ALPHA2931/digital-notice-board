// Firebase Configuration for Real-time Notice Board
// This will sync notices across all users in real-time

// Firebase configuration - You'll need to replace this with your own config
const firebaseConfig = {
    // Replace these values with your Firebase project config
    apiKey: "your-api-key-here",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com/",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};

// Initialize Firebase
let db;
let isFirebaseEnabled = false;

// Check if Firebase is available
if (typeof firebase !== 'undefined') {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.database();
        isFirebaseEnabled = true;
        console.log('🔥 Firebase initialized successfully - Real-time sync enabled!');
    } catch (error) {
        console.warn('Firebase initialization failed:', error);
        isFirebaseEnabled = false;
    }
} else {
    console.warn('Firebase SDK not loaded - Using localStorage only');
    isFirebaseEnabled = false;
}

// Firebase Database Helper Functions
class FirebaseNoticeManager {
    constructor() {
        this.noticesRef = db ? db.ref('notices') : null;
        this.onlineUsersRef = db ? db.ref('onlineUsers') : null;
        this.userId = this.generateUserId();
        this.setupPresence();
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupPresence() {
        if (!this.onlineUsersRef) return;
        
        // Track online users
        const userRef = this.onlineUsersRef.child(this.userId);
        userRef.set({
            online: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        });

        // Remove user when they disconnect
        userRef.onDisconnect().remove();
    }

    // Get all notices from Firebase
    async getNotices() {
        if (!this.noticesRef) return [];
        
        try {
            const snapshot = await this.noticesRef.once('value');
            const notices = snapshot.val();
            return notices ? Object.values(notices) : [];
        } catch (error) {
            console.error('Error fetching notices:', error);
            return [];
        }
    }

    // Save notice to Firebase
    async saveNotice(notice) {
        if (!this.noticesRef) return false;
        
        try {
            await this.noticesRef.child(notice.id).set({
                ...notice,
                lastModified: firebase.database.ServerValue.TIMESTAMP,
                modifiedBy: this.userId
            });
            return true;
        } catch (error) {
            console.error('Error saving notice:', error);
            return false;
        }
    }

    // Delete notice from Firebase
    async deleteNotice(noticeId) {
        if (!this.noticesRef) return false;
        
        try {
            await this.noticesRef.child(noticeId).remove();
            return true;
        } catch (error) {
            console.error('Error deleting notice:', error);
            return false;
        }
    }

    // Listen for real-time changes
    onNoticesChange(callback) {
        if (!this.noticesRef) return;
        
        this.noticesRef.on('value', (snapshot) => {
            const notices = snapshot.val();
            const noticesArray = notices ? Object.values(notices) : [];
            callback(noticesArray);
        });
    }

    // Get online users count
    onOnlineUsersChange(callback) {
        if (!this.onlineUsersRef) return;
        
        this.onlineUsersRef.on('value', (snapshot) => {
            const users = snapshot.val();
            const userCount = users ? Object.keys(users).length : 1;
            callback(userCount);
        });
    }

    // Sync with localStorage as backup
    syncWithLocalStorage(notices) {
        try {
            localStorage.setItem('digitalNoticeBoard', JSON.stringify(notices));
        } catch (error) {
            console.warn('Could not sync to localStorage:', error);
        }
    }
}

// Export for use in main.js
window.FirebaseNoticeManager = FirebaseNoticeManager;
window.isFirebaseEnabled = isFirebaseEnabled;
