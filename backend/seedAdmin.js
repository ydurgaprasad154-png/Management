import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log("URI is: ", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    const userExists = await User.findOne({ email: 'admin@heven.com' });
    
    if (userExists) {
      console.log('Admin user already exists!');
      process.exit();
    }
    
    await User.create({
      name: 'System Admin',
      email: 'admin@heven.com',
      password: 'password123',
      role: 'admin',
    });
    
    console.log('Admin user successfully created!');
    console.log('Email: admin@heven.com');
    console.log('Password: password123');
    
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
