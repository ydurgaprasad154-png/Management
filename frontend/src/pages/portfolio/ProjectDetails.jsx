import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Globe, Calendar, User, Tag, 
  ArrowRight, ShieldCheck, Zap, Sparkles, CheckCircle2,
  Lightbulb, AlertCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';

// Custom inline SVG icons because lucide-react v1.0.0+ does not export brand icons
const Github = ({ size = 20, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

// Dynamic feature generator based on project category
const getDynamicFeatures = (category) => {
  switch (category) {
    case 'Web Development':
    case 'Software Development':
      return [
        { title: "Bespoke Architecture", desc: "Built with a lightweight custom core to ensure maximum maintainability and zero boilerplate bloat." },
        { title: "SEO Optimization", desc: "Fully structured semantic HTML with optimized metadata, generating near-perfect Lighthouse scores." },
        { title: "Global CDN Integration", desc: "Assets, images, and static resources distributed globally for sub-second load times." }
      ];
    case 'Mobile App':
      return [
        { title: "Native Smoothness", desc: "Animations, gestures, and layout transitions running at a consistent 60fps." },
        { title: "Offline Capabilities", desc: "Offline data persistence using secure local caching, automatically syncing when connection is restored." },
        { title: "Push Notification System", desc: "Targeted push system for higher engagement rates and immediate client alerts." }
      ];
    case 'UI/UX Design':
    case 'Branding & Design':
      return [
        { title: "Unified Design System", desc: "A robust component-based design guide covering colors, typography, grids, and assets." },
        { title: "Intuitive Flow", desc: "User flows optimized through wireframe iterations to reduce click-fatigue and cognitive load." },
        { title: "Premium Animations", desc: "Micro-interactions and transitions tailored to communicate brand premium feel." }
      ];
    case 'E-commerce':
      return [
        { title: "Secure Payments", desc: "Integrated with Stripe, Razorpay, or Paypal featuring encryption and webhook validation." },
        { title: "Dynamic Cart & Checkout", desc: "Real-time cost adjustments, promo code evaluation, and seamless tax calculation." },
        { title: "Inventory Management", desc: "Admin control system with stock depletion notices and instant state updates." }
      ];
    default:
      return [
        { title: "Custom Dashboard", desc: "Dynamic administrative controls for real-time adjustments and content uploads." },
        { title: "Responsive Layout", desc: "Polished to look stunning and display correctly across all mobile, tablet, and desktop viewports." },
        { title: "Security Layers", desc: "Protected endpoints, rate limiting, and encrypted storage configurations." }
      ];
  }
};

// Dynamic challenge generator
const getDynamicChallenges = (category) => {
  switch (category) {
    case 'Web Development':
    case 'Software Development':
    case 'E-commerce':
      return {
        challenge: "The primary challenge was managing complex state queries while preserving low page-load speeds, especially under poor mobile networks.",
        solution: "We implemented advanced local API caching and server-side route splitting, ensuring only critical resources are fetched on first visit."
      };
    case 'Mobile App':
      return {
        challenge: "Synchronizing local offline caches with live Atlas database clusters without creating write conflicts or draining phone batteries.",
        solution: "We wrote a custom queued synchronization middleware that runs background synchronization only during critical actions or connectivity shifts."
      };
    default:
      return {
        challenge: "Maintaining a luxury minimalist aesthetic without sacrificing rich visual features, heavy portfolio images, or readable typography hierarchies.",
        solution: "We integrated Cloudinary WebP automatic conversion alongside custom lazy-loading skeleton components to ensure fluid layouts."
      };
  }
};

const ProjectDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    fetchProjectDetails();
    // Scroll to top on load
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [slug]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/portfolio-projects/slug/${slug}`);
      setProject(data);
      setActiveImageIndex(0);

      // Fetch related projects (same category)
      const relatedRes = await api.get('/portfolio-projects', {
        params: {
          category: data.category,
          limit: 3,
          status: 'Active'
        }
      });
      // Filter out current project
      const filtered = (relatedRes.data.projects || []).filter(p => p._id !== data._id);
      setRelatedProjects(filtered);
    } catch (err) {
      console.error('Error fetching project details:', err);
      // Redirect home if project not found
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-gray-400">
        <Loader2 className="animate-spin text-gold-premium mb-2" size={32} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading project details...</span>
      </div>
    );
  }

  if (!project) return null;

  const features = getDynamicFeatures(project.category);
  const challengeSolution = getDynamicChallenges(project.category);
  const gallery = [project.thumbnail, ...(project.images || [])].filter(Boolean);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="pb-24">
      {/* 1. HERO HEADER IMAGE */}
      <section className="relative h-[50vh] sm:h-[65vh] w-full bg-black overflow-hidden flex items-end">
        <div className="absolute inset-0">
          <img 
            src={project.thumbnail} 
            alt={project.title} 
            className="w-full h-full object-cover opacity-45 scale-105 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/40 to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto w-full px-6 pb-12 relative z-10 space-y-4">
          <Link 
            to="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gold-premium uppercase tracking-wider mb-2 group transition-all"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Works</span>
          </Link>
          
          <div className="inline-block bg-gold-premium/10 border border-gold-premium/25 text-gold-premium text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full">
            {project.category}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            {project.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-gold-premium" />
              <span>{project.completedAt ? new Date(project.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : 'N/A'}</span>
            </div>
            {project.clientName && (
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-gold-premium" />
                <span>Client: {project.clientName}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. PROJECT CONTENT */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
        {/* Left Side: Description & Details */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Main Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white border-l-2 border-gold-premium pl-3">
              Project Overview
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Features list */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white border-l-2 border-gold-premium pl-3">
              Key Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 p-5 rounded-xl space-y-2 hover:border-gold-premium/10 transition-colors">
                  <div className="flex items-center gap-2 text-gold-premium">
                    <CheckCircle2 size={18} />
                    <h3 className="font-semibold text-sm text-white">{feat.title}</h3>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Challenges & Solutions */}
          <div className="bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/5 p-8 rounded-2xl space-y-6">
            <h2 className="text-xl font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Zap size={20} className="text-gold-premium" />
              <span>Challenges & Solution</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed">
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-red-400">
                  <AlertCircle size={14} />
                  <span>The Challenge</span>
                </div>
                <p className="text-gray-400">{challengeSolution.challenge}</p>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-green-400">
                  <Lightbulb size={14} />
                  <span>The Solution</span>
                </div>
                <p className="text-gray-400">{challengeSolution.solution}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Links, Tech, and Gallery Carousel */}
        <div className="lg:col-span-4 space-y-8">
          {/* Action Callouts */}
          <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider mb-2">Project Assets</h3>
            
            {project.liveLink && (
              <a 
                href={project.liveLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-gold-premium hover:bg-gold text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/25"
              >
                <Globe size={16} />
                <span>Live Demo</span>
              </a>
            )}

            {project.githubLink && (
              <a 
                href={project.githubLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <Github size={16} />
                <span>GitHub Repository</span>
              </a>
            )}

            {!project.liveLink && !project.githubLink && (
              <div className="text-xs text-gray-500 italic text-center py-2">
                Links are restricted for private client security.
              </div>
            )}
          </div>

          {/* Tech Stack Badges */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <span 
                    key={idx} 
                    className="bg-white/10 text-gray-200 border border-white/5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Gallery Carousel */}
          {gallery.length > 1 && (
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider pl-1">Project Gallery</h3>
              
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40 border border-white/5 group">
                <img 
                  src={gallery[activeImageIndex]} 
                  alt={`Gallery screenshot ${activeImageIndex}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Navigation Arrows */}
                <button 
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 rounded-full text-white hover:text-gold-premium transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/60 rounded-full text-white hover:text-gold-premium transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight size={16} />
                </button>

                {/* Counter */}
                <div className="absolute bottom-2 right-2 bg-black/70 text-[9px] font-semibold text-white px-2 py-0.5 rounded-full border border-white/10">
                  {activeImageIndex + 1} / {gallery.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border flex-shrink-0 transition-all ${
                      idx === activeImageIndex ? 'border-gold-premium scale-95' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="mini thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. RELATED PROJECTS */}
      {relatedProjects.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pt-20 mt-20 border-t border-white/5 space-y-10">
          <h2 className="text-2xl font-bold tracking-tight text-white">Related Projects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {relatedProjects.map((proj) => (
              <div 
                key={proj._id} 
                className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden group hover:border-gold-premium/30 transition-all flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-white/5">
                  <img src={proj.thumbnail} alt={proj.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[9px] text-gold-premium font-bold uppercase tracking-wider mb-1">{proj.category}</span>
                  <h3 className="font-bold text-white text-base mb-2 group-hover:text-gold-premium transition-colors">{proj.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 flex-1">{proj.description}</p>
                  <Link 
                    to={`/projects/${proj.slug}`}
                    className="text-xs font-bold text-white hover:text-gold-premium uppercase tracking-widest flex items-center gap-1 group/btn"
                  >
                    <span>View Project</span>
                    <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProjectDetails;
