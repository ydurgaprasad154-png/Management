import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ username: 'superadmin' });
    if (!user) {
      console.log("User 'superadmin' not found in database!");
    } else {
      console.log(`User found: ${user.username} (${user.email})`);
      const isMatch = await user.matchPassword('password123');
      console.log("Password match for 'password123':", isMatch);
    }
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

test();
