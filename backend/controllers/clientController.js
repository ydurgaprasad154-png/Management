import Client from '../models/Client.js';
import User from '../models/User.js';
import sendEmail from '../utils/emailService.js';

// Helper: generate random password
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pass = '';
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
};

// Helper: generate username from name
const generateUsername = (name) => {
  const base = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${base}${suffix}`;
};

// Send onboarding email
const sendOnboardingEmail = async ({ name, email, password, company }) => {
  const subject = `Welcome to Heven Freelance Manager – Your Account is Ready!`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5;">
      <div style="background: #111; padding: 30px 40px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">HEVEN</h1>
        <p style="color: #888; margin: 4px 0 0; font-size: 13px;">Freelance Manager</p>
      </div>
      <div style="padding: 36px 40px; background: #ffffff;">
        <h2 style="color: #111; margin-top: 0;">Welcome, ${name}! 🎉</h2>
        <p style="color: #555; line-height: 1.7;">Your client account has been created. You can now log in to your personal portal to track your projects, view payment status, and monitor services.</p>

        <div style="background: #f5f5f5; border-radius: 10px; padding: 20px 24px; margin: 24px 0; border-left: 4px solid #111;">
          <h3 style="margin: 0 0 12px; color: #111; font-size: 15px;">🔐 Your Login Credentials</h3>
          ${company ? `<p style="margin: 6px 0; color: #444;"><strong>Company:</strong> ${company}</p>` : ''}
          <p style="margin: 6px 0; color: #444;"><strong>Email / Username:</strong> ${email}</p>
          <p style="margin: 6px 0; color: #444;"><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #e8e8e8; padding: 2px 8px; border-radius: 4px;">${password}</span></p>
          <p style="margin: 10px 0 0; color: #444;"><strong>Portal URL:</strong> <a href="http://localhost:5175/login" style="color: #0066cc;">http://localhost:5175/login</a></p>
        </div>

        <h3 style="color: #111; font-size: 15px;">📋 What You Can Access</h3>
        <ul style="color: #555; line-height: 2; padding-left: 20px;">
          <li><strong>Projects</strong> — Track progress, status, and deadlines</li>
          <li><strong>Payments</strong> — View total cost, advance paid & pending balance</li>
          <li><strong>Services</strong> — See maintenance & support activity</li>
          <li><strong>Domains</strong> — Monitor hosting & renewal dates</li>
        </ul>

        <div style="background: #fffbea; border: 1px solid #f0e68c; border-radius: 8px; padding: 14px 18px; margin: 20px 0;">
          <p style="margin: 0; color: #6b5d00; font-size: 13px;">⚠️ Please change your password after your first login for security.</p>
        </div>

        <p style="color: #555;">If you have any questions, feel free to reach out to your project manager directly.</p>
        <p style="color: #555;">Best regards,<br><strong>The Heven Team</strong></p>
      </div>
      <div style="background: #f5f5f5; padding: 16px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
        <p style="margin: 0; font-size: 12px; color: #999;">© ${new Date().getFullYear()} Heven Freelance Manager · All rights reserved</p>
      </div>
    </div>
  `;

  try {
    await sendEmail({ email, subject, htmlMessage: html, message: `Welcome ${name}! Your account is ready.` });
  } catch (err) {
    console.error('Onboarding email failed:', err);
  }
};

// @desc    Get all clients
// @route   GET /api/clients
// @access  Private/Admin
const getClients = async (req, res) => {
  try {
    const clients = await Client.find({}).populate('user', 'name email username');
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch clients' });
  }
};

// @desc    Create a client (with auto or manual credentials)
// @route   POST /api/clients
// @access  Private/Admin
const createClient = async (req, res) => {
  try {
    const { name, email, phone, company, password: manualPassword, username: manualUsername } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists.' });
    }

    let password = manualPassword || generatePassword();
    let username = manualUsername || generateUsername(name);

    // Ensure username is unique — retry if collision
    let usernameExists = await User.findOne({ username });
    let retries = 0;
    while (usernameExists && retries < 5) {
      username = generateUsername(name);
      usernameExists = await User.findOne({ username });
      retries++;
    }

    const user = await User.create({ name, email, username, password, role: 'client' });

    const client = await Client.create({ user: user._id, phone, company });

    // Send automated onboarding email
    await sendOnboardingEmail({ name, email, password, company });

    const populated = await Client.findById(client._id).populate('user', 'name email username');
    res.status(201).json({ client: populated, generatedPassword: password, generatedUsername: username });
  } catch (err) {
    console.error('Create client error:', err.message, err.stack);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(400).json({ message: `A user with this ${field} already exists.` });
    }
    res.status(500).json({ message: err.message || 'Failed to create client' });
  }
};

// @desc    Update client info
// @route   PUT /api/clients/:id
// @access  Private/Admin
const updateClient = async (req, res) => {
  try {
    const { name, email, phone, company, password } = req.body;

    const client = await Client.findById(req.params.id).populate('user');
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Update User fields
    const user = await User.findById(client.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;
    await user.save();

    // Update Client fields
    if (phone) client.phone = phone;
    if (company !== undefined) client.company = company;
    await client.save();

    const populated = await Client.findById(client._id).populate('user', 'name email username');
    res.json(populated);
  } catch (err) {
    console.error('Update client error:', err);
    res.status(500).json({ message: err.message || 'Failed to update client' });
  }
};

// @desc    Delete (soft-delete) a client
// @route   DELETE /api/clients/:id
// @access  Private/Admin
const deleteClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    client.isDeleted = true;
    await client.save();
    res.json({ message: 'Client deactivated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete client' });
  }
};

// @desc    Resend credentials email to client
// @route   POST /api/clients/:id/resend-credentials
// @access  Private/Admin
const resendCredentials = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const client = await Client.findById(req.params.id).populate('user', 'name email username');
    if (!client) return res.status(404).json({ message: 'Client not found' });

    const password = newPassword || generatePassword();

    // Update password if new one generated
    const user = await User.findById(client.user._id);
    user.password = password;
    await user.save();

    await sendOnboardingEmail({
      name: client.user.name,
      email: client.user.email,
      password,
      company: client.company,
    });

    res.json({ message: 'Credentials email sent', generatedPassword: password });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend credentials' });
  }
};

export { getClients, createClient, updateClient, deleteClient, resendCredentials };
