import Testimonial from '../models/Testimonial.js';

// @desc    Get all testimonials
// @route   GET /api/testimonials
// @access  Public
export const getTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isDeleted: false });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching testimonials' });
  }
};

// @desc    Create a testimonial
// @route   POST /api/testimonials
// @access  Private/Admin
export const createTestimonial = async (req, res) => {
  try {
    const { name, company, role, quote, rating, image } = req.body;
    if (!name || !quote) {
      return res.status(400).json({ message: 'Name and quote are required' });
    }

    const testimonial = await Testimonial.create({ name, company, role, quote, rating, image });
    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error creating testimonial' });
  }
};

// @desc    Update a testimonial
// @route   PUT /api/testimonials/:id
// @access  Private/Admin
export const updateTestimonial = async (req, res) => {
  try {
    const { name, company, role, quote, rating, image } = req.body;
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial || testimonial.isDeleted) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.name = name || testimonial.name;
    testimonial.company = company !== undefined ? company : testimonial.company;
    testimonial.role = role !== undefined ? role : testimonial.role;
    testimonial.quote = quote || testimonial.quote;
    testimonial.rating = rating !== undefined ? rating : testimonial.rating;
    testimonial.image = image !== undefined ? image : testimonial.image;

    const updated = await testimonial.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error updating testimonial' });
  }
};

// @desc    Delete a testimonial
// @route   DELETE /api/testimonials/:id
// @access  Private/Admin
export const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);

    if (!testimonial || testimonial.isDeleted) {
      return res.status(404).json({ message: 'Testimonial not found' });
    }

    testimonial.isDeleted = true;
    await testimonial.save();
    res.json({ message: 'Testimonial removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error deleting testimonial' });
  }
};
