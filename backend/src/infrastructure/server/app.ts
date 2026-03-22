import express from 'express';
import cors from 'cors';
import routes from '../../adapters/inbound/http/Router';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

export default app;
