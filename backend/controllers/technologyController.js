import Technology from '../models/Technology.js';

// @desc    Get all technologies
// @route   GET /api/technologies
// @access  Public
export const getTechnologies = async (req, res) => {
  try {
    const technologies = await Technology.find({ isDeleted: false });
    res.json(technologies);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching technologies' });
  }
};

// @desc    Create a technology
// @route   POST /api/technologies
// @access  Private/Admin
export const createTechnology = async (req, res) => {
  try {
    const { name, icon, category } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Technology name is required' });
    }

    const tech = await Technology.create({ name, icon, category });
    res.status(201).json(tech);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error creating technology' });
  }
};

// @desc    Update a technology
// @route   PUT /api/technologies/:id
// @access  Private/Admin
export const updateTechnology = async (req, res) => {
  try {
    const { name, icon, category } = req.body;
    const tech = await Technology.findById(req.params.id);

    if (!tech || tech.isDeleted) {
      return res.status(404).json({ message: 'Technology not found' });
    }

    tech.name = name || tech.name;
    tech.icon = icon !== undefined ? icon : tech.icon;
    tech.category = category || tech.category;

    const updated = await tech.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error updating technology' });
  }
};

// @desc    Delete a technology
// @route   DELETE /api/technologies/:id
// @access  Private/Admin
export const deleteTechnology = async (req, res) => {
  try {
    const tech = await Technology.findById(req.params.id);

    if (!tech || tech.isDeleted) {
      return res.status(404).json({ message: 'Technology not found' });
    }

    tech.isDeleted = true;
    await tech.save();
    res.json({ message: 'Technology removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error deleting technology' });
  }
};
