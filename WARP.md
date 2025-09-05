# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Running the Application
```bash
# Install dependencies
npm install

# Start development server (opens on localhost:3000)
npm start

# Alternative development server with live reload
npm run dev

# Open directly in browser (no server needed)
# Simply open index.html in any web browser
```

### Development Testing
```bash
# Test in multiple browsers (manual testing required)
# Chrome, Firefox, Safari, Edge

# Check console for errors
# Open browser DevTools (F12) and monitor console

# Validate HTML
# Use browser DevTools or online HTML validators

# Test responsive design
# Use browser DevTools device emulation
```

## Architecture Overview

### Application Structure
This is a client-side web application built with vanilla HTML, CSS, and JavaScript using a class-based architecture pattern.

**Core Components:**
- `NoticeBoard` class: Main application controller that manages the entire notice board functionality
- Modal system: Handles add/edit operations for notices
- Local storage persistence: All data is stored in browser's localStorage
- Responsive grid layout: CSS Grid-based notice display system

### Key Design Patterns
- **Single Class Controller**: The `NoticeBoard` class acts as the main controller, managing all application state and DOM interactions
- **Event-driven Architecture**: Uses event listeners for user interactions and keyboard shortcuts
- **Template-based Rendering**: HTML is generated programmatically using template strings
- **Local Storage Pattern**: Data persistence handled through localStorage with JSON serialization

### Data Model
```javascript
// Notice object structure
{
  id: string,           // Unique identifier (timestamp + random)
  title: string,        // Notice title
  content: string,      // Notice content/description
  category: string,     // One of: general, urgent, announcement, event, reminder
  priority: string,     // One of: low, medium, high
  createdAt: string,    // ISO timestamp
  updatedAt?: string    // ISO timestamp (only for edited notices)
}
```

### File Architecture
- `index.html`: Single-page application entry point with complete DOM structure
- `js/main.js`: Contains the entire `NoticeBoard` class and application logic
- `css/style.css`: Complete styling including responsive design, modal system, and animations
- `package.json`: Development server configuration (live-server)

### Key Features Implementation
- **CRUD Operations**: Create, read, update, delete notices through modal interface
- **Categorization**: Five predefined categories with color-coded styling
- **Priority System**: Three-level priority system with visual indicators  
- **Search/Filter**: Prepared methods for future search and category filtering
- **Export/Import**: Future-ready methods for data portability
- **Responsive Design**: Mobile-first approach with breakpoints at 768px and 480px
- **Keyboard Shortcuts**: Ctrl/Cmd+N for new notice, Escape to close modal
- **Toast Notifications**: Dynamic success/error messaging system

### State Management
- All application state is managed within the `NoticeBoard` class instance
- Data persistence through localStorage with automatic save/load
- Sample data is automatically generated on first load
- Real-time UI updates after every data modification

### Browser Compatibility
- Modern browsers (ES6+ support required)
- Uses CSS Grid, Flexbox, and modern JavaScript features
- Font Awesome icons and Google Fonts (Inter) dependencies
- No build process required - runs directly in browser

### Development Patterns
- DOM elements are cached in the class constructor for performance
- HTML sanitization through `escapeHtml()` method prevents XSS
- Graceful error handling with try-catch blocks
- Console logging for debugging and helpful developer messages
