import Domain from '../models/Domain.js';

// @desc    Get all domains
// @route   GET /api/domains
// @access  Private/Admin
const getDomains = async (req, res) => {
  const domains = await Domain.find({}).populate({
    path: 'client',
    select: 'phone company user',
    populate: { path: 'user', select: 'name email' },
  });
  res.json(domains);
};

// @desc    Create a domain
// @route   POST /api/domains
// @access  Private/Admin
const createDomain = async (req, res) => {
  const { client, domainName, purchaseDate, expiryDate, hostingProvider, status } = req.body;

  const domain = new Domain({
    client,
    domainName,
    purchaseDate,
    expiryDate,
    hostingProvider,
    status,
  });

  const createdDomain = await domain.save();
  res.status(201).json(createdDomain);
};

export { getDomains, createDomain };
