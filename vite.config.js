import fs from 'fs'

export default {
    server: {
        host: '0.0.0.0',
        port: 8080,
        https: {
            key: fs.readFileSync('localhost-key.pem'),
            cert: fs.readFileSync('localhost.pem'),
        }
    }
}