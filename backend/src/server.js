require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const cognitiveRoutes = require('./routes/cognitiveRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const caregiverRoutes = require('./routes/caregiverRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
connectDB();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cognitive', cognitiveRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/caregiver', caregiverRoutes);

app.get('/', (req, res) => res.json({
  message: 'Welcome to MindSaathi API',
  authentication: 'Caregiver email/password + Elder 4-digit PIN',
  endpoints: {
    health: '/api/health',
    caregiverRegister: 'POST /api/auth/caregiver/register',
    caregiverLogin: 'POST /api/auth/caregiver/login',
    elderLogin: 'POST /api/auth/elder/login',
    me: 'GET /api/auth/me'
  }
}));

app.use((req, res) => res.status(404).json({ success: false, error: 'Endpoint not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🌱 MindSaathi Backend running on port ${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
  console.log('=========================================');
});

module.exports = app;
