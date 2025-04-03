const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const userRoutes = require('./routes/api/userRoutes');
const { protect } = require('./middleware/authMiddleware');

// Load environment variables
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arts_mu', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Create Express app
const app = express();

// Middleware
app.use(express.json());

app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static(path.join(__dirname, '../frontend')));

app.use(express.static('frontend', {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

const profileImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/profile/');
  },
  filename: (req, file, cb) => {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const profileImageUpload = multer({ storage: profileImageStorage });

// Serve static files from the uploads directory
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));

// Serve static files from the uploads directory
app.use('/uploads/artworks', express.static(path.join(__dirname, 'uploads/artworks')));

app.use('/frontend', express.static(path.join(__dirname, '../frontend')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set correct MIME type for JavaScript modules
app.use((req, res, next) => {
    if (req.url.endsWith('.js')) {
        res.type('application/javascript');
    }
    next();
});

// Routes
const artistRoutes = require('./routes/api/artistRoutes');
const artworkRoutes = require('./routes/api/artworkRoutes');
const authRoutes = require('./routes/api/authRoutes');
const cartRoutes = require('./routes/api/cartRoutes');
const orderRoutes = require('./routes/api/orderRoutes');
// const userRoutes = require('./routes/api/userRoutes');

// Mount routes
app.use('/api/artists', artistRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/uploads/profile', express.static(path.join(__dirname, 'uploads/profile')));


// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});