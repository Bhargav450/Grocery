const express = require('express');
const dotenv = require('dotenv');
const {sequelize}=require('./config/db');
const authRoutes=require('./routes/authRoutes');
const userRoute=require('./routes/userRoutes');
const adminRoute=require('./routes/adminRoutes');




// Initialize dotenv to load environment variables
dotenv.config();

// Initialize the Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api', authRoutes);
app.use('/api/user',userRoute);
app.use('/api/admin',adminRoute);
PORT=3000
// Function to connect to the database and start the server
const connectDatabases = async () => {
  try {
    // Authenticate the connection to the PostgreSQL database
    await sequelize.authenticate();
    console.log('PostgreSQL connected');

    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Error connecting to databases:', err);
  }
};


connectDatabases();





