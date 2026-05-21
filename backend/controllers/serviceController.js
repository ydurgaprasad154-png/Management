import Service from '../models/Service.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import sendEmail from '../utils/emailService.js';


// @desc    Get all services (admin) or client's own services (client)
// @route   GET /api/services
// @access  Private
const getServices = async (req, res) => {
  try {
    let services;
    if (req.user.role === 'admin') {
      services = await Service.find({ isDeleted: { $ne: true } })
        .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
        .populate('project', 'name')
        .sort({ createdAt: -1 });
    } else {
      // Client: find their client record then filter services
      const client = await Client.findOne({ user: req.user._id });
      if (!client) return res.json([]);
      services = await Service.find({ client: client._id, isDeleted: { $ne: true } })
        .populate('project', 'name')
        .sort({ createdAt: -1 });
    }
    res.json(services);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services' });
  }
};

// @desc    Create a service
// @route   POST /api/services
// @access  Private/Admin
const createService = async (req, res) => {
  try {
    const { client, project, description, cost, status } = req.body;

    const service = new Service({ client, project, description, cost, status });
    const saved = await service.save();

    const populated = await Service.findById(saved._id)
      .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ message: err.message || 'Failed to create service' });
  }
};

// @desc    Update service status (and send completion email if Completed)
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateServiceStatus = async (req, res) => {
  try {
    const { status, description, cost } = req.body;

    const service = await Service.findById(req.params.id)
      .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
      .populate('project', 'name');

    if (!service) return res.status(404).json({ message: 'Service not found' });

    const previousStatus = service.status;
    if (status) service.status = status;
    if (description) service.description = description;
    if (cost !== undefined) service.cost = Number(cost);

    // Send completion email if just marked Completed & not already sent
    if (status === 'Completed' && previousStatus !== 'Completed' && !service.completionEmailSent) {
      const clientEmail = service.client?.user?.email;
      const clientName = service.client?.user?.name;
      const projectName = service.project?.name || 'your project';

      if (clientEmail) {
        const html = `
          <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; border-radius: 12px; overflow: hidden; border: 1px solid #e5e5e5;">
            <div style="background: #111; padding: 30px 40px; text-align: center;">
              <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">HEVEN</h1>
              <p style="color: #888; margin: 4px 0 0; font-size: 13px;">Freelance Manager</p>
            </div>
            <div style="padding: 36px 40px; background: #ffffff;">
              <h2 style="color: #111; margin-top: 0;">✅ Service Completed!</h2>
              <p style="color: #555; line-height: 1.7;">Hi <strong>${clientName}</strong>,</p>
              <p style="color: #555; line-height: 1.7;">We're pleased to inform you that the following service for <strong>${projectName}</strong> has been successfully completed:</p>
              
              <div style="background: #f5f5f5; border-radius: 10px; padding: 20px 24px; margin: 24px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin: 0 0 10px; color: #111; font-size: 15px;">📋 Service Details</h3>
                <p style="margin: 6px 0; color: #444;"><strong>Service:</strong> ${service.description}</p>
                <p style="margin: 6px 0; color: #444;"><strong>Project:</strong> ${projectName}</p>
                <p style="margin: 6px 0; color: #444;"><strong>Cost:</strong> ₹${service.cost}</p>
                <p style="margin: 6px 0; color: #444;"><strong>Completed On:</strong> ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p style="margin: 6px 0; color: #444;"><strong>Status:</strong> <span style="color: #16a34a; font-weight: bold;">✅ Completed</span></p>
              </div>

              <p style="color: #555; line-height: 1.7;">You can log in to your client portal to view the full service history and any related updates.</p>
              <p style="color: #555; margin-top: 24px;">Thank you for your trust in Heven.<br><strong>The Heven Team</strong></p>
            </div>
            <div style="background: #f5f5f5; padding: 16px 40px; text-align: center; border-top: 1px solid #e5e5e5;">
              <p style="margin: 0; font-size: 12px; color: #999;">© ${new Date().getFullYear()} Heven Freelance Manager · All rights reserved</p>
            </div>
          </div>
        `;
        try {
          await sendEmail({
            email: clientEmail,
            subject: `✅ Service Completed: ${service.description}`,
            htmlMessage: html,
            message: `Service "${service.description}" for ${projectName} has been completed.`,
          });
          service.completionEmailSent = true;
        } catch (emailErr) {
          console.error('Completion email failed:', emailErr);
        }
      }
    }

    await service.save();

    const updated = await Service.findById(service._id)
      .populate({ path: 'client', populate: { path: 'user', select: 'name email' } })
      .populate('project', 'name');

    res.json(updated);
  } catch (err) {
    console.error('Update service error:', err);
    res.status(500).json({ message: err.message || 'Failed to update service' });
  }
};

export { getServices, createService, updateServiceStatus };
