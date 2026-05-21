import PortfolioProject from '../models/PortfolioProject.js';

// Helper to generate unique slug
const generateUniqueSlug = async (title, currentId = null) => {
  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  
  // Check if slug exists
  let query = { slug };
  if (currentId) {
    query._id = { $ne: currentId };
  }
  
  let slugExists = await PortfolioProject.findOne(query);
  let counter = 1;
  const baseSlug = slug;
  
  while (slugExists) {
    slug = `${baseSlug}-${counter}`;
    query.slug = slug;
    slugExists = await PortfolioProject.findOne(query);
    counter++;
  }
  
  return slug;
};

// @desc    Get all portfolio projects (public / queryable)
// @route   GET /api/portfolio-projects
// @access  Public
const getPortfolioProjects = async (req, res) => {
  try {
    const { search, category, featured, status, page = 1, limit = 12 } = req.query;
    
    const query = {};
    
    // Public requests should only see Active projects, unless specified (e.g. by Admin)
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      // By default, show active ones
      query.status = 'Active';
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { technologies: { $regex: search, $options: 'i' } },
      ];
    }
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const total = await PortfolioProject.countDocuments(query);
    const projects = await PortfolioProject.find(query)
      .sort({ completedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
      
    res.json({
      projects,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (err) {
    console.error('Get portfolio projects error:', err);
    res.status(500).json({ message: 'Failed to fetch portfolio projects' });
  }
};

// @desc    Get single portfolio project by slug
// @route   GET /api/portfolio-projects/slug/:slug
// @access  Public
const getPortfolioProjectBySlug = async (req, res) => {
  try {
    const project = await PortfolioProject.findOne({ slug: req.params.slug });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    console.error('Get portfolio project by slug error:', err);
    res.status(500).json({ message: 'Failed to fetch project details' });
  }
};

// @desc    Create portfolio project
// @route   POST /api/portfolio-projects
// @access  Private/Admin
const createPortfolioProject = async (req, res) => {
  try {
    const {
      title,
      description,
      thumbnail,
      images,
      technologies,
      category,
      liveLink,
      githubLink,
      featured,
      status,
      clientName,
      completedAt,
    } = req.body;

    if (!title || !description || !thumbnail || !category) {
      return res.status(400).json({ message: 'Required fields: title, description, thumbnail, category' });
    }

    const slug = await generateUniqueSlug(title);

    const project = await PortfolioProject.create({
      title,
      slug,
      description,
      thumbnail,
      images: images || [],
      technologies: technologies || [],
      category,
      liveLink: liveLink || '',
      githubLink: githubLink || '',
      featured: featured === true || featured === 'true',
      status: status || 'Active',
      clientName: clientName || '',
      completedAt: completedAt ? new Date(completedAt) : Date.now(),
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Create portfolio project error:', err);
    res.status(500).json({ message: err.message || 'Failed to create portfolio project' });
  }
};

// @desc    Update portfolio project
// @route   PUT /api/portfolio-projects/:id
// @access  Private/Admin
const updatePortfolioProject = async (req, res) => {
  try {
    const project = await PortfolioProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const {
      title,
      description,
      thumbnail,
      images,
      technologies,
      category,
      liveLink,
      githubLink,
      featured,
      status,
      clientName,
      completedAt,
    } = req.body;

    if (title && title !== project.title) {
      project.title = title;
      project.slug = await generateUniqueSlug(title, project._id);
    }

    if (description !== undefined) project.description = description;
    if (thumbnail !== undefined) project.thumbnail = thumbnail;
    if (images !== undefined) project.images = images;
    if (technologies !== undefined) project.technologies = technologies;
    if (category !== undefined) project.category = category;
    if (liveLink !== undefined) project.liveLink = liveLink;
    if (githubLink !== undefined) project.githubLink = githubLink;
    if (featured !== undefined) project.featured = featured === true || featured === 'true';
    if (status !== undefined) project.status = status;
    if (clientName !== undefined) project.clientName = clientName;
    if (completedAt !== undefined) project.completedAt = completedAt ? new Date(completedAt) : project.completedAt;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (err) {
    console.error('Update portfolio project error:', err);
    res.status(500).json({ message: err.message || 'Failed to update portfolio project' });
  }
};

// @desc    Delete portfolio project
// @route   DELETE /api/portfolio-projects/:id
// @access  Private/Admin
const deletePortfolioProject = async (req, res) => {
  try {
    const project = await PortfolioProject.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    await project.deleteOne();
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    console.error('Delete portfolio project error:', err);
    res.status(500).json({ message: 'Failed to delete portfolio project' });
  }
};

// @desc    Upload multiple files
// @route   POST /api/portfolio-projects/upload
// @access  Private/Admin
const uploadProjectImages = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    // req.files can be an array of files if multer.array is used, or object if fields
    const urls = [];
    if (Array.isArray(req.files)) {
      for (const file of req.files) {
        urls.push(file.path); // Cloudinary url is in file.path
      }
    } else if (typeof req.files === 'object') {
      const filesList = Object.values(req.files).flat();
      for (const file of filesList) {
        urls.push(file.path);
      }
    }
    
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
};

export {
  getPortfolioProjects,
  getPortfolioProjectBySlug,
  createPortfolioProject,
  updatePortfolioProject,
  deletePortfolioProject,
  uploadProjectImages,
};
