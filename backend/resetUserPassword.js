import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetPassword = async () => {
  const args = process.argv.slice(2);
  const emailOrUsername = args[0] || 'yadladurga2006@gmail.com';
  const newPassword = args[1] || 'password123';

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);

    const user = await User.findOne({
      $or: [
        { email: emailOrUsername },
        { username: emailOrUsername }
      ]
    });

    if (!user) {
      console.error(`Error: User with email/username "${emailOrUsername}" not found.`);
      process.exit(1);
    }

    user.password = newPassword;
    await user.save();

    console.log(`\nSuccess! Password for user "${user.email}" (${user.role}) has been reset to "${newPassword}".`);
    process.exit(0);
  } catch (err) {
    console.error("Failed to reset password:", err.message);
    process.exit(1);
  }
};

resetPassword();
