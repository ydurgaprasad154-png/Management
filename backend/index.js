import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import startCronJobs from './cron/jobs.js';

import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import portfolioProjectRoutes from './routes/portfolioProjectRoutes.js';
import portfolioServiceRoutes from './routes/portfolioServiceRoutes.js';
import testimonialRoutes from './routes/testimonialRoutes.js';
import technologyRoutes from './routes/technologyRoutes.js';
import homepageSettingsRoutes from './routes/homepageSettingsRoutes.js';

dotenv.config();

// Connect to MongoDB
connectDB();

// Start Background Cron Jobs
startCronJobs();


const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/domains', domainRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/portfolio-projects', portfolioProjectRoutes);
app.use('/api/portfolio-services', portfolioServiceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/technologies', technologyRoutes);
app.use('/api/homepage-settings', homepageSettingsRoutes);


app.get('/', (req, res) => {
  res.send('HFM Backend API is running...');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

