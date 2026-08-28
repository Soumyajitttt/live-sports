import dotenv from 'dotenv';
import connectDB from './config/db.js';
import server from './app.js';

dotenv.config();

const PORT = process.env.PORT;
const HOST = process.env.HOST ;

connectDB()
	.then(() => {
		server.listen(PORT, HOST, () => {
			const baseUrl = HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;

			console.log(`Server running on port ${PORT}`);
			console.log(`WebSocket server running on ${baseUrl.replace('http', 'ws')}/ws`);
		});
	})
	.catch((error) => {
		console.error('Failed to connect to the database:', error.message);
		process.exitCode = 1;
	});
