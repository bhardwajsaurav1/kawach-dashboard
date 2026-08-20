const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/personnel', require('./routes/personnel'));
app.use('/api/tanks', require('./routes/tanks'));
app.use('/api/workforce', require('./routes/workforce'));
app.use('/api/overhaul', require('./routes/overhaul'));
app.use('/api/telemetry', require('./routes/telemetry'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/testing', require('./routes/testing'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/users', require('./routes/users'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/dashboard-data', require('./routes/dashboardData'));
app.use('/api/predictive-ai', require('./routes/predictiveAI'));
app.use('/api/dygm', require('./routes/dygm'));

// Serve Frontend Static Build if available
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const fs = require('fs');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.use((req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('ARMOR-DT Backend API is running...');
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});