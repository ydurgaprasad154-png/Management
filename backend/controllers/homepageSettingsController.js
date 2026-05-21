import HomepageSettings from '../models/HomepageSettings.js';

// @desc    Get homepage settings
// @route   GET /api/homepage-settings
// @access  Public
export const getSettings = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();
    
    // Seed default settings document if none exists
    if (!settings) {
      settings = await HomepageSettings.create({});
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error fetching homepage settings' });
  }
};

// @desc    Update homepage settings
// @route   PUT /api/homepage-settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    let settings = await HomepageSettings.findOne();
    if (!settings) {
      settings = await HomepageSettings.create({});
    }

    const {
      heroTitle, heroSubtitle, heroBgUrl, heroCtaText, heroCtaLink,
      aboutTitle, aboutSubtitle, aboutDescription, aboutImageUrl,
      statsProjects, statsClients, statsTech, statsExperience,
      contactEmail, contactPhone, contactAddress,
      socialGithub, socialLinkedin, socialTwitter
    } = req.body;

    settings.heroTitle = heroTitle !== undefined ? heroTitle : settings.heroTitle;
    settings.heroSubtitle = heroSubtitle !== undefined ? heroSubtitle : settings.heroSubtitle;
    settings.heroBgUrl = heroBgUrl !== undefined ? heroBgUrl : settings.heroBgUrl;
    settings.heroCtaText = heroCtaText !== undefined ? heroCtaText : settings.heroCtaText;
    settings.heroCtaLink = heroCtaLink !== undefined ? heroCtaLink : settings.heroCtaLink;

    settings.aboutTitle = aboutTitle !== undefined ? aboutTitle : settings.aboutTitle;
    settings.aboutSubtitle = aboutSubtitle !== undefined ? aboutSubtitle : settings.aboutSubtitle;
    settings.aboutDescription = aboutDescription !== undefined ? aboutDescription : settings.aboutDescription;
    settings.aboutImageUrl = aboutImageUrl !== undefined ? aboutImageUrl : settings.aboutImageUrl;

    settings.statsProjects = statsProjects !== undefined ? Number(statsProjects) : settings.statsProjects;
    settings.statsClients = statsClients !== undefined ? Number(statsClients) : settings.statsClients;
    settings.statsTech = statsTech !== undefined ? Number(statsTech) : settings.statsTech;
    settings.statsExperience = statsExperience !== undefined ? Number(statsExperience) : settings.statsExperience;

    settings.contactEmail = contactEmail !== undefined ? contactEmail : settings.contactEmail;
    settings.contactPhone = contactPhone !== undefined ? contactPhone : settings.contactPhone;
    settings.contactAddress = contactAddress !== undefined ? contactAddress : settings.contactAddress;

    settings.socialGithub = socialGithub !== undefined ? socialGithub : settings.socialGithub;
    settings.socialLinkedin = socialLinkedin !== undefined ? socialLinkedin : settings.socialLinkedin;
    settings.socialTwitter = socialTwitter !== undefined ? socialTwitter : settings.socialTwitter;

    const updated = await settings.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error updating homepage settings' });
  }
};
