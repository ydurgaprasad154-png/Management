import Project from '../models/Project.js';
import Client from '../models/Client.js';

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'admin') {
      projects = await Project.find({ isDeleted: { $ne: true } }).populate({
        path: 'client',
        select: 'phone company user',
        populate: { path: 'user', select: 'name email' },
      });
    } else {
      const client = await Client.findOne({ user: req.user._id });
      if (client) {
        projects = await Project.find({ client: client._id, isDeleted: { $ne: true } });
      } else {
        projects = [];
      }
    }
    res.json(projects);
  } catch (err) {
    console.error('Get projects error:', err);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
};

// @desc    Create a project
// @route   POST /api/projects
// @access  Private/Admin
const createProject = async (req, res) => {
  try {
    const { client, name, description, status, progress, startDate, deadline, totalCost } = req.body;

    const project = await Project.create({
      client,
      name,
      description,
      status,
      progress,
      startDate,
      deadline,
      totalCost,
    });

    // Populate client info for the response
    const populated = await Project.findById(project._id).populate({
      path: 'client',
      select: 'phone company user',
      populate: { path: 'user', select: 'name email' },
    });

    res.status(201).json(populated);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ message: err.message || 'Failed to create project' });
  }
};

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private/Admin
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { status, progress, note, keyPoints } = req.body;

    if (status !== undefined) project.status = status;
    if (progress !== undefined) project.progress = progress;
    if (note !== undefined) project.note = note;
    if (keyPoints !== undefined) project.keyPoints = keyPoints;

    await project.save();

    const populated = await Project.findById(project._id).populate({
      path: 'client',
      select: 'phone company user',
      populate: { path: 'user', select: 'name email' },
    });

    res.json(populated);
  } catch (err) {
    console.error('Update project error:', err);
    res.status(500).json({ message: 'Failed to update project' });
  }
};

export { getProjects, createProject, updateProject };
