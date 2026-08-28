import express from 'express';
import http from 'http';
import { attachWebSocketServer } from './ws/server.js';

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello from Express server!');
});

import matchesRoutes from './routes/matches.routes.js';
app.use('/api/matches', matchesRoutes);

const {broadcastMatchCreated} = attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;

export default server;