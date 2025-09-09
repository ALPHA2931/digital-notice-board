# Digital Notice Board

A modern, responsive web-based digital notice board application for displaying and managing announcements, reminders, and messages.

![Digital Notice Board](https://img.shields.io/badge/Status-Ready-green) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ Features

### 📝 Notice Management
- **Create** new notices with title, content, category, and priority
- **Edit** existing notices inline
- **Delete** notices with confirmation
- **Auto-save** to browser localStorage

### 🔍 Search & Filter
- **Real-time search** through notice titles and content
- **Category filtering** (General, Urgent, Announcement, Event, Reminder)
- **Priority filtering** (Low, Medium, High)
- **Clear search** functionality

### 🎨 User Interface
- **Modern design** with gradient backgrounds and glassmorphism effects
- **Responsive layout** that works on desktop, tablet, and mobile
- **Interactive animations** and hover effects
- **Toast notifications** for user feedback
- **Modal dialogs** for creating/editing notices

### 💾 Data Management
- **Export notices** to JSON file for backup
- **Import notices** from JSON file with validation
- **Persistent storage** using browser localStorage
- **Sample data** included for demonstration

### ⚡ Advanced Features
- **Keyboard shortcuts** (Ctrl/Cmd+N for new notice, Escape to close modal)
- **Date sorting** (newest notices first)
- **Color-coded categories** and priorities
- **Empty state handling** with helpful messages

## 🚀 Quick Start

### Option 1: Using Python (Recommended)
1. Double-click `start-server.bat` to start the development server
2. Open your browser and navigate to `http://localhost:3000`

### Option 2: Using Node.js (if available)
```bash
npm install
npm start
```

### Option 3: Direct File Access
Simply open `index.html` directly in your web browser (some features may be limited due to CORS restrictions).

## 📱 Usage Guide

### Creating a Notice
1. Click the **"Add Notice"** button in the header
2. Fill in the required fields:
   - **Title**: Brief headline for your notice
   - **Content**: Detailed message or description
   - **Category**: Select from General, Urgent, Announcement, Event, or Reminder
   - **Priority**: Choose Low, Medium, or High priority
3. Click **"Save Notice"** to create

### Managing Notices
- **Edit**: Click the pencil icon on any notice card
- **Delete**: Click the trash icon (confirmation required)
- **Search**: Use the search bar to find specific notices
- **Filter**: Use the category and priority dropdowns to filter results

### Data Management
- **Export**: Click the "Export" button to download all notices as a JSON file
- **Import**: Click the "Import" button to upload a JSON file with notices

### Keyboard Shortcuts
- `Ctrl/Cmd + N`: Create a new notice
- `Escape`: Close any open modal

## 🏗️ Project Structure

```
digital-notice-board/
├── index.html              # Main HTML file
├── css/
│   └── style.css           # Stylesheet with modern design
├── js/
│   └── main.js            # JavaScript functionality
├── package.json           # Node.js dependencies
├── start-server.bat       # Windows batch file to start server
└── README.md             # This file
```

## 🎨 Design Features

### Color Scheme
- **Primary Gradient**: Purple to blue (`#667eea` to `#764ba2`)
- **Background**: Dynamic gradient backdrop
- **Cards**: Clean white with subtle shadows and glassmorphism
- **Categories**: Color-coded for easy identification

### Typography
- **Font**: Inter (Google Fonts) for modern, clean readability
- **Icons**: Font Awesome for consistent iconography

### Responsive Breakpoints
- **Desktop**: Full grid layout with all features
- **Tablet**: Adjusted grid with optimized spacing
- **Mobile**: Single column layout with touch-friendly controls

## 💾 Data Storage

The application uses browser localStorage to persist notices between sessions. Data is automatically saved when:
- Creating new notices
- Editing existing notices
- Deleting notices
- Importing notices

## 🔧 Customization

### Adding New Categories
Edit the category options in `index.html` (lines 60-66) and add corresponding CSS classes in `style.css`.

### Modifying Colors
Update the CSS custom properties in `style.css` to change the color scheme.

### Adding New Features
Extend the `NoticeBoard` class in `main.js` to add additional functionality.

## 🌐 Browser Support

- **Chrome**: 70+
- **Firefox**: 65+
- **Safari**: 12+
- **Edge**: 79+

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 🐛 Known Issues

- File import/export may not work when opening `index.html` directly due to browser security restrictions
- For best experience, use a local server (provided batch file)

## 📞 Support

If you encounter any issues or have suggestions for improvements, please create an issue in the repository.

---

**Made with ❤️ for better communication and organization**

# Digital Notice Board

A web-based digital notice board application for displaying announcements, messages, and important information.

## Features

- Display multiple notices in an organized layout
- Add, edit, and delete notices
- Responsive design for various screen sizes
- Real-time updates
- Clean and modern interface

## Getting Started

1. Open `index.html` in a web browser
2. Start adding notices to the board

## Project Structure

```
digital-notice-board/
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Main stylesheet
├── js/
│   └── main.js         # JavaScript functionality
├── assets/             # Images and other assets
├── src/                # Source files
└── docs/               # Documentation
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)

## License

This project is open source and available under the MIT License.
