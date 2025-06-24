import express, { Express, Request, Response } from 'express';
import cors from 'cors';

const app: Express = express();
const port = process.env.PORT || 3001; // backend port

// Middlewares
app.use(cors()); // enable CORS
app.use(express.json()); // make Express can read JSON body

// Test Route
app.get('/api', (req: Request, res: Response) => {
    res.json({ message: 'Hello from ModernRDL Server!' });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});