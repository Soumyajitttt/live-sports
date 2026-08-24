import express from 'express';


const app = express();

app.use(express.json());

app.get('/', (req, res) => {
	res.send('Hello from Express server!');
});

import matchesRoutes from './routes/matches.routes.js';
app.use('/api/matches', matchesRoutes);

export default app;