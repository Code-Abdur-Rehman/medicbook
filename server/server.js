const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const errorHandler = require('./src/middleware/errorHandler');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'MediBook Multi-Hospital Appointment Platform',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/taxonomies', require('./src/routes/taxonomyRoutes'));
app.use('/api/hospitals', require('./src/routes/hospitalRoutes'));
app.use('/api/doctors', require('./src/routes/doctorRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/appointments', require('./src/routes/appointmentRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/stats', require('./src/routes/statsRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));

// 404 Route handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// Central Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[MediBook Server] running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
