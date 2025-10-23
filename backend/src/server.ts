import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/authRoutes';
import carRoutes from './routes/carRoutes';
import serviceRoutes from './routes/serviceRoutes';
import sparePartRoutes from './routes/sparePartRoutes';
import partOrderRoutes from './routes/partOrderRoutes';
import maintenanceReminderRoutes from './routes/maintenanceReminderRoutes';
import fuelEntryRoutes from './routes/fuelEntryRoutes';
import expenseRoutes from './routes/expenseRoutes';
import documentRoutes from './routes/documentRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connectDatabase();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/parts', sparePartRoutes);
app.use('/api/orders', partOrderRoutes);
app.use('/api/reminders', maintenanceReminderRoutes);
app.use('/api/fuel', fuelEntryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/documents', documentRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Car Management API is running' });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
