import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const query = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});
    console.log("Users in Database:");
    users.forEach(u => {
      console.log(`- Name: ${u.name}, Email: ${u.email}, Username: ${u.username}, Role: ${u.role}, Status: ${u.status}`);
    });
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

query();
