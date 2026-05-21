import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const seedAdmins = async () => {
  try {
    console.log("Connecting to Database at URI: ", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    // Delete existing admin emails to prevent collision
    const emailsToSeed = ['admin@heven.com', 'staff@heven.com', 'editor@heven.com', 'manager@heven.com'];
    await User.deleteMany({ email: { $in: emailsToSeed } });
    await User.deleteMany({ username: { $in: ['superadmin', 'admin', 'editor', 'manager'] } });

    // Seed Super Admin
    await User.create({
      name: 'Super Administrator',
      email: 'admin@heven.com',
      username: 'superadmin',
      password: 'password123',
      role: 'superadmin',
      status: 'active',
    });

    // Seed Standard Admin
    await User.create({
      name: 'Standard Admin',
      email: 'staff@heven.com',
      username: 'admin',
      password: 'password123',
      role: 'admin',
      status: 'active',
    });

    // Seed Editor
    await User.create({
      name: 'Content Editor',
      email: 'editor@heven.com',
      username: 'editor',
      password: 'password123',
      role: 'editor',
      status: 'active',
    });

    // Seed Manager
    await User.create({
      name: 'Operations Manager',
      email: 'manager@heven.com',
      username: 'manager',
      password: 'password123',
      role: 'manager',
      status: 'active',
    });

    console.log('\nSuccess! RBAC Admin accounts seeded successfully:');
    console.log('- Super Admin: username="superadmin", email="admin@heven.com", pass="password123"');
    console.log('- Admin:       username="admin",      email="staff@heven.com", pass="password123"');
    console.log('- Editor:      username="editor",     email="editor@heven.com", pass="password123"');
    console.log('- Manager:     username="manager",    email="manager@heven.com", pass="password123"');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin accounts:', error);
    process.exit(1);
  }
};

seedAdmins();
