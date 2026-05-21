import mongoose from 'mongoose';

const homepageSettingsSchema = mongoose.Schema(
  {
    // Hero Section
    heroTitle: {
      type: String,
      default: "We Engineer Digital Masterpieces",
    },
    heroSubtitle: {
      type: String,
      default: "Heven Studios designs, builds, and maintains ultra-premium digital solutions, combining flawless responsive development with high-end luxury styling.",
    },
    heroBgUrl: {
      type: String,
      default: "", // Cloudinary background image/video
    },
    heroCtaText: {
      type: String,
      default: "View Portfolio",
    },
    heroCtaLink: {
      type: String,
      default: "/projects",
    },

    // About Section
    aboutTitle: {
      type: String,
      default: "ABOUT THE STUDIO",
    },
    aboutSubtitle: {
      type: String,
      default: "Driven by detail, committed to performance & luxury aesthetic.",
    },
    aboutDescription: {
      type: String,
      default: "We operate at the intersection of aesthetic brilliance and engineering rigor. Our design philosophy values clarity, breathing room, bold dark schemes, and fine gold highlights.",
    },
    aboutImageUrl: {
      type: String,
      default: "",
    },
    
    // Counters / Stats
    statsProjects: {
      type: Number,
      default: 75,
    },
    statsClients: {
      type: Number,
      default: 99,
    },
    statsTech: {
      type: Number,
      default: 15,
    },
    statsExperience: {
      type: Number,
      default: 8,
    },

    // Contact Details
    contactEmail: {
      type: String,
      default: "hello@hevenstudios.com",
    },
    contactPhone: {
      type: String,
      default: "+1 (555) 234-5678",
    },
    contactAddress: {
      type: String,
      default: "120 Broadway, Suite 4000, New York, NY",
    },
    socialGithub: {
      type: String,
      default: "https://github.com",
    },
    socialLinkedin: {
      type: String,
      default: "https://linkedin.com",
    },
    socialTwitter: {
      type: String,
      default: "https://twitter.com",
    }
  },
  {
    timestamps: true,
  }
);

const HomepageSettings = mongoose.model('HomepageSettings', homepageSettingsSchema);
export default HomepageSettings;
