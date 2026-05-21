import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createCustomAdmin = async () => {
  // Grab command line arguments or use defaults
  const args = process.argv.slice(2);
  const name = args[0] || 'Custom Admin';
  const email = args[1] || 'customadmin@heven.com';
  const username = args[2] || 'customadmin';
  const password = args[3] || 'password123';
  const role = args[4] || 'admin'; // 'superadmin', 'admin', 'editor', 'manager'

  if (password.length < 6) {
    console.error("Error: Password must be at least 6 characters long.");
    process.exit(1);
  }

  const validRoles = ['superadmin', 'admin', 'editor', 'manager', 'client'];
  if (!validRoles.includes(role)) {
    console.error(`Error: Invalid role. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  try {
    console.log("Connecting to Database...");
    await mongoose.connect(process.env.MONGO_URI);

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      console.error(`Error: User with email "${email}" already exists.`);
      process.exit(1);
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      console.error(`Error: User with username "${username}" already exists.`);
      process.exit(1);
    }

    console.log(`Creating account for ${name} (${role})...`);
    const newAdmin = await User.create({
      name,
      email,
      username,
      password,
      role,
      status: 'active'
    });

    console.log("\nSuccess! Admin account created successfully:");
    console.log(`- ID: ${newAdmin._id}`);
    console.log(`- Name: ${newAdmin.name}`);
    console.log(`- Email: ${newAdmin.email}`);
    console.log(`- Username: ${newAdmin.username}`);
    console.log(`- Role: ${newAdmin.role}`);
    console.log(`- Status: ${newAdmin.status}`);

    process.exit(0);
  } catch (err) {
    console.error("Failed to create admin account:", err.message);
    process.exit(1);
  }
};

createCustomAdmin();
