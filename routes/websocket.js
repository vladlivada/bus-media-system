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
            })
        }
    },
    sendMessage: (message) => {
        connectionSocket?.send(message)
    }
}