# Swing Analysis Web App

A web application that uses device motion sensors to analyze swing movements.

## Local Development Setup

### Prerequisites
- Node.js installed
- npm (comes with Node.js)
- mkcert installed:
  ```bash
  # Windows (using chocolatey)
  choco install mkcert
  
  # Mac
  brew install mkcert
  ```

### Initial Setup

1. Initialize the Node.js project:
```bash
npm init -y
```

2. Install Vite development server:
```bash
npm install --save-dev vite
```

3. Create Vite configuration file (`vite.config.js`):
```javascript
export default {
    server: {
        host: true,    // Listen on all addresses
        port: 8080,
        https: true    // Enable HTTPS
    }
}
```

4. Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

5. Set up SSL certificates (in project root):
```bash
mkcert -install
mkcert localhost 127.0.0.1 ::1
```

### Running the Project

1. Start the development server:
```bash
npm run dev
```

2. Access the application:
- On computer: `https://localhost:8080`
- On mobile: `https://[your-computer-ip]:8080`
  - Find your IP using:
    ```bash
    # Windows
    ipconfig
    
    # Mac/Linux
    ip addr
    ```

### Project Structure
```
project-root/
├── package.json         # Project configuration and scripts
├── vite.config.js      # Vite server configuration
├── index.html          # Main HTML file
├── *.js                # JavaScript files
└── *.css               # CSS files
```

### Version Control

Add this `.gitignore`:
```gitignore
node_modules/
*.pem
dist/
.DS_Store
```

### Important Notes

- HTTPS is required for accessing device motion sensors
- Both devices (computer/phone) must be on the same network
- First-time mobile access might require accepting the certificate
- The development server provides hot reload functionality

### Production Build

For GitHub Pages deployment, the workflow is already configured in `.github/workflows/static.yml`