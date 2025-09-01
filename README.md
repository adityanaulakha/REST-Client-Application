# REST Client Application

A professional REST API testing tool built with React and Express, similar to Postman. Test HTTP endpoints, view responses, and manage request history with advanced features like pagination and caching.

## 🚀 Features

### Core Functionality
- **Multi-Method Support**: Send GET, POST, PUT, DELETE, and PATCH requests
- **Request Builder**: Interactive form with URL input, headers, and body configuration  
- **Response Viewer**: Formatted display of response status, headers, and body
- **Request History**: Persistent storage of all requests with search and filtering

### Advanced Features
- **Cursor-Based Pagination**: Efficient loading of large request histories
- **Client-Side Caching**: IndexedDB storage via localforage for offline access
- **Large Response Handling**: Automatic file storage for responses exceeding size limits
- **SSRF Protection**: URL validation and configurable host allowlists for security
- **Modern UI**: Clean, responsive interface with enhanced user experience

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- Axios for HTTP requests
- LocalForage for client-side storage

**Backend:**
- Express.js server
- MikroORM with SQLite database
- File system storage for large responses
- CORS and security middleware

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Warewe - Full Stack Assignment"
   ```

2. **Install dependencies**
   ```bash
   # Backend dependencies
   cd backend
   npm install
   
   # Frontend dependencies  
   cd ../frontend
   npm install
   ```

3. **Start the backend server**
   ```powershell
   node "d:\NEW LEARNING\Web Dev\Warewe - Full Stack Assignment\backend\index.js"
   ```
   
   The backend will start on `http://localhost:4000`

4. **Start the frontend development server**
   ```powershell
   npm run dev --prefix "d:\NEW LEARNING\Web Dev\Warewe - Full Stack Assignment\frontend"
   ```
   
   The frontend will be available at `http://localhost:5173` or `http://localhost:5174`

## ⚙️ Configuration

### Environment Variables

**Backend Configuration:**
- `ALLOWED_HOSTS` (optional): Comma-separated list of allowed hostnames for request proxying
  ```
  ALLOWED_HOSTS=jsonplaceholder.typicode.com,api.github.com
  ```
- `MAX_INLINE_RESPONSE` (optional): Maximum response size in bytes to store in database (default: 200,000)
  ```
  MAX_INLINE_RESPONSE=500000
  ```

### Database
- SQLite database is automatically created at `backend/history.db`
- Request history is stored with timestamps, response data, and metadata
- Large responses are offloaded to `backend/storage/` directory

## 📁 Project Structure

```
Warewe - Full Stack Assignment/
├── backend/
│   ├── index.js              # Express server and API routes
│   ├── mikro-orm.config.js   # Database configuration
│   ├── package.json          # Backend dependencies
│   ├── entities/
│   │   └── RequestHistory.js # Database entity
│   └── storage/              # Large response files
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main application component
│   │   ├── main.jsx          # React entry point
│   │   └── components/
│   │       ├── RequestBuilder.jsx    # HTTP request form
│   │       ├── ResponseViewer.jsx    # Response display
│   │       ├── HistoryPanel.jsx      # Request history
│   │       ├── KeyValueEditor.jsx    # Headers editor
│   │       └── ThemeToggle.jsx       # UI theme switcher
│   ├── index.html
│   ├── package.json          # Frontend dependencies
│   └── vite.config.js        # Vite configuration
└── README.md
```

## 🎯 Usage

1. **Making Requests**
   - Select HTTP method (GET, POST, PUT, DELETE, PATCH)
   - Enter the target URL
   - Add headers if needed (key-value pairs)
   - Add request body for POST/PUT requests (JSON format)
   - Click "Send Request"

2. **Viewing Responses**
   - Response status, headers, and body are displayed in the right panel
   - JSON responses are automatically formatted
   - Error messages are clearly displayed

3. **Managing History**
   - All requests are automatically saved to history
   - Search requests by URL or filter by HTTP method
   - Click any history item to view its response
   - Use "Load More" for pagination through large histories
   - Clear cache to reset local storage

## 🔧 API Endpoints

### Backend REST API

- `POST /api/relay` - Proxy HTTP requests to external APIs
- `GET /api/history` - Retrieve request history with pagination
- `GET /api/history/:id` - Get specific request details
- `GET /storage/:filename` - Serve large response files

## 🛡️ Security Features

- **SSRF Protection**: Validates URLs and supports hostname allowlists
- **CORS Configuration**: Properly configured for frontend-backend communication
- **Input Validation**: Sanitizes and validates all user inputs
- **File Storage Security**: Large responses stored securely on filesystem

## 🚀 Performance Optimizations

- **Cursor-Based Pagination**: Efficient handling of large datasets
- **Client-Side Caching**: Reduces server load and improves response times
- **Large Response Offloading**: Prevents database bloat with file storage
- **Request Deduplication**: Prevents duplicate entries in history

## 🔄 Future Enhancements

- **Authentication & Authorization**: User accounts and API key management
- **Request Collections**: Organize requests into folders/collections
- **Environment Variables**: Support for different deployment environments
- **Export/Import**: Backup and restore request collections
- **Automated Testing**: Test suite integration with supertest
- **Real-time Updates**: WebSocket support for live request monitoring

## 🐛 Troubleshooting

**Backend not starting:**
- Check if port 4000 is available
- Verify Node.js installation and version
- Check for missing dependencies with `npm install`

**Frontend connection issues:**
- Ensure backend is running on port 4000
- Check CORS configuration
- Verify frontend is accessing correct backend URL

**Database issues:**
- SQLite database is created automatically
- Check file permissions in the backend directory
- Remove `history.db` to reset database

## 📄 License

This project is for educational purposes as part of a full-stack development assignment.

---

**Built with ❤️ using React, Express, and modern web technologies**

