import { WebSocket,WebSocketServer } from 'ws';

function sendJSON(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
    }   
};

function broadcastJSON(wss, data) {
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) continue;
        
        client.send(JSON.stringify(data));
    }
};

function attachWebSocketServer(server) {
    const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 });

    wss.on('connection', (socket) => {
        sendJSON(socket, { message: 'Welcome to the WebSocket server!' });

        socket.on('error', (err) => {
            console.error('WebSocket error:', err);
        });

    });

    function broadcastMatchCreated(match) {
        broadcastJSON(wss, { type: 'match_created', data: match });
    }

    return { broadcastMatchCreated };
}

export { sendJSON, broadcastJSON, attachWebSocketServer };