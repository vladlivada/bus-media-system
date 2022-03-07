const WebSocket = require('ws');
let ws = null;
let connectionSocket = null;
module.exports = {
    initSocket: (server) => {
        ws = ws ?? new WebSocket.Server({
            server: server
        });
        if (!connectionSocket) {
            ws.on('connection', (socket) => {
                connectionSocket = socket;
                setInterval(() => connectionSocket.send(JSON.stringify({type: 'heartbeat'})), 5000)
            });
            ws.on('close', (err) => {
                console.error("WS connection closed", err);
            });
            ws.on('error', (err) => {
                console.error("WS connection error", err);
            });
        }
    },
    sendMessage: (message) => {
        connectionSocket?.send(message)
    }
}