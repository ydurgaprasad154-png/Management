import PortfolioService from '../models/PortfolioService.js';

// @desc    Get all portfolio services
// @route   GET /api/portfolio-services
// @access  Public
export const getServices = async (req, res) => {
  try {
    const services = await PortfolioService.find({ isDeleted: false });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching services' });
  }
};

// @desc    Create a portfolio service
// @route   POST /api/portfolio-services
// @access  Private/Admin
export const createService = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const service = await PortfolioService.create({ title, description, icon });
    res.status(201).json(service);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error creating service' });
  }
};

// @desc    Update a portfolio service
// @route   PUT /api/portfolio-services/:id
// @access  Private/Admin
export const updateService = async (req, res) => {
  try {
    const { title, description, icon } = req.body;
    const service = await PortfolioService.findById(req.params.id);

    if (!service || service.isDeleted) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.title = title || service.title;
    service.description = description || service.description;
    service.icon = icon !== undefined ? icon : service.icon;

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error updating service' });
  }
};

// @desc    Delete a portfolio service (soft delete)
// @route   DELETE /api/portfolio-services/:id
// @access  Private/Admin
export const deleteService = async (req, res) => {
  try {
    const service = await PortfolioService.findById(req.params.id);

    if (!service || service.isDeleted) {
      return res.status(404).json({ message: 'Service not found' });
    }

    service.isDeleted = true;
    await service.save();
    res.json({ message: 'Service removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error deleting service' });
  }
};
