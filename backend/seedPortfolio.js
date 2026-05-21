import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PortfolioProject from './models/PortfolioProject.js';

dotenv.config();

const PROJECTS = [
  {
    title: "Aura Luxury E-Commerce",
    slug: "aura-luxury-ecommerce",
    description: "Designed and engineered an ultra-premium online boutique specializing in limited-edition luxury timepieces. Features custom slide-out checkout systems, real-time Stripe webhooks, dynamic inventory scaling, and translation options.",
    thumbnail: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80"
    ],
    technologies: ["React", "Node.js", "Stripe", "MongoDB", "TailwindCSS", "Cloudinary"],
    category: "E-commerce",
    liveLink: "https://aura-luxury.example.com",
    githubLink: "https://github.com/heven/aura-luxury",
    featured: true,
    status: "Active",
    clientName: "Aura Horology Group",
    completedAt: new Date("2025-10-15")
  },
  {
    title: "Apex Asset Dashboard",
    slug: "apex-asset-dashboard",
    description: "A custom financial management console showing investments, yields, and transaction ledgers. Integrated real-time market polling services and detailed visual charts using custom HSL themed graphs.",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
    ],
    technologies: ["React", "Framer Motion", "Recharts", "Node.js", "MongoDB", "TailwindCSS"],
    category: "Web Development",
    liveLink: "https://apex-yields.example.com",
    githubLink: "https://github.com/heven/apex-assets",
    featured: true,
    status: "Active",
    clientName: "Apex Venture Capital",
    completedAt: new Date("2026-02-10")
  },
  {
    title: "Zenith Watch Companion",
    slug: "zenith-watch-companion",
    description: "Bespoke companion application for Zenith smart timepieces. Connects seamlessly with bluetooth controllers, features offline activity trackers, and aggregates luxury wellness metrics into dynamic dashboards.",
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1000&q=80",
    images: [
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
    ],
    technologies: ["React Native", "Expo", "Redux Toolkit", "Node.js", "Express", "MongoDB"],
    category: "Mobile App",
    liveLink: "https://zenith-app.example.com",
    githubLink: "",
    featured: true,
    status: "Active",
    clientName: "Zenith Horology Ltd",
    completedAt: new Date("2026-04-20")
  }
];

const seedPortfolio = async () => {
  try {
    console.log("Connecting to MongoDB at:", process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing public portfolio projects to prevent duplicate slug conflicts on seed
    await PortfolioProject.deleteMany({});
    console.log("Cleared existing portfolio projects.");

    const inserted = await PortfolioProject.insertMany(PROJECTS);
    console.log(`Successfully seeded ${inserted.length} portfolio projects!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding portfolio:', error);
    process.exit(1);
  }
};

seedPortfolio();
