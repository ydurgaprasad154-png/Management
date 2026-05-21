import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, Award, ChevronLeft, ChevronRight, Quote, ArrowRight, Loader2,
  Code, Monitor, Smartphone, Cpu, Shield, Zap, Sparkles, Layers, Globe, Database, Server, Terminal, Activity
} from 'lucide-react';
import api from '../../utils/api';

// Render Lucide icons dynamically based on saved icon string
const IconMap = ({ name, size = 32, className = "text-gold-premium" }) => {
  switch (name) {
    case 'Monitor': return <Monitor size={size} className={className} />;
    case 'Smartphone': return <Smartphone size={size} className={className} />;
    case 'Cpu': return <Cpu size={size} className={className} />;
    case 'Shield': return <Shield size={size} className={className} />;
    case 'Zap': return <Zap size={size} className={className} />;
    case 'Sparkles': return <Sparkles size={size} className={className} />;
    case 'Layers': return <Layers size={size} className={className} />;
    case 'Globe': return <Globe size={size} className={className} />;
    case 'Database': return <Database size={size} className={className} />;
    case 'Server': return <Server size={size} className={className} />;
    case 'Terminal': return <Terminal size={size} className={className} />;
    case 'Activity': return <Activity size={size} className={className} />;
    default: return <Code size={size} className={className} />;
  }
};

// Simple CountUp Component for animated counters
const CountUp = ({ to, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(to);
    if (isNaN(end) || start === end) return;

    const totalMiliseconds = duration * 1000;
    const incrementTime = Math.max(Math.floor(totalMiliseconds / end), 30);
    
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [to, duration]);

  return <span>{count}</span>;
};

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Auto-slides testimonials every 6 seconds
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials]);

  const fetchHomeData = async () => {
    try {
      setLoading(true);
      const [settRes, projRes, srvRes, techRes, testRes] = await Promise.all([
        api.get('/homepage-settings'),
        api.get('/portfolio-projects?featured=true&limit=3'),
        api.get('/portfolio-services'),
        api.get('/technologies'),
        api.get('/testimonials')
      ]);

      setSettings(settRes.data);
      setFeaturedProjects(projRes.data.projects || []);
      setServices(srvRes.data || []);
      setTechnologies(techRes.data || []);
      setTestimonials(testRes.data || []);
    } catch (err) {
      console.error('Error fetching home panel details:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    if (testimonials.length === 0) return;
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-gold-premium" size={32} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading Premium Studio...</span>
      </div>
    );
  }

  return (
    <div className="space-y-24 md:space-y-36 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center px-6 overflow-hidden bg-black">
        {/* Background Video or Wallpaper */}
        {settings?.heroBgUrl ? (
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black z-10" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black z-10" />
            {settings.heroBgUrl.endsWith('.mp4') ? (
              <video src={settings.heroBgUrl} className="w-full h-full object-cover opacity-35" muted loop autoPlay playsInline />
            ) : (
              <img src={settings.heroBgUrl} alt="Background" className="w-full h-full object-cover opacity-25" />
            )}
          </div>
        ) : (
          <>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gold-premium/5 rounded-full blur-[150px] pointer-events-none" />
          </>
        )}

        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-9 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 border border-gold-premium/30 bg-gold-premium/5 px-4 py-1.5 rounded-full text-gold-premium text-xs font-semibold uppercase tracking-widest"
            >
              <Award size={14} />
              <span>Premium Luxury Web Agency</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white"
            >
              {settings?.heroTitle ? (
                <>
                  {settings.heroTitle.split(' ').slice(0, -2).join(' ')}{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-premium to-gold-light">
                    {settings.heroTitle.split(' ').slice(-2).join(' ')}
                  </span>
                </>
              ) : (
                "We Engineer Digital Masterpieces"
              )}
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-gray-400 text-base sm:text-lg max-w-2xl font-medium leading-relaxed"
            >
              {settings?.heroSubtitle || "Heven Studios designs, builds, and maintains ultra-premium digital solutions, combining flawless responsive development with high-end luxury styling."}
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link 
                to={settings?.heroCtaLink || "/projects"}
                className="px-8 py-4 bg-gold-premium text-black hover:bg-gold hover:scale-105 transition-all text-sm font-bold tracking-widest uppercase rounded-xl flex items-center gap-2 group shadow-lg shadow-gold/20"
              >
                <span>{settings?.heroCtaText || "View Portfolio"}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/contact"
                className="px-8 py-4 border border-white/10 hover:border-gold-premium/45 text-white bg-white/5 hover:bg-white/10 transition-all text-sm font-bold tracking-widest uppercase rounded-xl"
              >
                Book Consultation
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. ABOUT/BRAND SECTION */}
      <section className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -35 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">
            {settings?.aboutTitle || "ABOUT THE STUDIO"}
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
            {settings?.aboutSubtitle || "Driven by detail, committed to performance & luxury aesthetic."}
          </h2>
          <div className="text-gray-400 leading-relaxed text-sm space-y-4 whitespace-pre-line">
            {settings?.aboutDescription || 
              "We operate at the intersection of aesthetic brilliance and engineering rigor. Our design philosophy values clarity, breathing room, bold dark schemes, and fine gold highlights.\n\nEvery pixel is considered. Every animation is smoothed to 60fps. We don't build generic templates; we craft bespoke digital systems tailored to elevate your business."
            }
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-5 relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-white/10 bg-white/5 shadow-xl shadow-gold/5 flex items-center justify-center"
        >
          {settings?.aboutImageUrl ? (
            <img src={settings.aboutImageUrl} alt="About Showcase" className="w-full h-full object-cover" />
          ) : (
            <div className="grid grid-cols-2 gap-4 p-8 w-full h-full">
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-1.5"><Monitor className="text-gold-premium" size={24} /><span className="text-white text-xs font-bold">Design</span></div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-1.5"><Cpu className="text-gold-premium" size={24} /><span className="text-white text-xs font-bold">AI Agents</span></div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-1.5"><Layers className="text-gold-premium" size={24} /><span className="text-white text-xs font-bold">Bespoke UI</span></div>
              <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col justify-center gap-1.5"><Smartphone className="text-gold-premium" size={24} /><span className="text-white text-xs font-bold">App Stack</span></div>
            </div>
          )}
        </motion.div>
      </section>

      {/* 3. DYNAMIC CMS SERVICES SECTION */}
      {services.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">WHAT WE DELIVER</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Bespoke Digital Services</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">Luxury engineering solutions to power next-generation software products.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv, idx) => (
              <motion.div
                key={srv._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="bg-white/5 border border-white/5 hover:border-gold-premium/20 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 relative group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gold-premium/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold-premium/10 transition-colors" />
                <div className="mb-5 p-3.5 bg-white/5 border border-white/10 text-gold-premium rounded-xl w-fit group-hover:scale-105 transition-transform duration-300">
                  <IconMap name={srv.icon} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{srv.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{srv.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 4. STATISTICS SECTION */}
      <section className="bg-[#050505] py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-2"
          >
            <div className="text-4xl sm:text-5xl font-extrabold text-white">
              <CountUp to={settings?.statsProjects ?? 75} />+
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Projects Launched</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <div className="text-4xl sm:text-5xl font-extrabold text-gold-premium">
              <CountUp to={settings?.statsClients ?? 99} />%
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Client Retention</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <div className="text-4xl sm:text-5xl font-extrabold text-white">
              <CountUp to={settings?.statsTech ?? 15} />+
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Core Technologies</div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <div className="text-4xl sm:text-5xl font-extrabold text-white">
              <CountUp to={settings?.statsExperience ?? 8} />
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">Years Experience</div>
          </motion.div>
        </div>
      </section>

      {/* 5. FEATURED PROJECTS */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-3">
            <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">SELECTED WORK</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Featured Showcases</h2>
          </div>
          <Link 
            to="/projects"
            className="text-sm font-bold text-gold-premium hover:text-gold tracking-widest uppercase flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>See All Projects</span>
            <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        {featuredProjects.length === 0 ? (
          <div className="bg-white/5 border border-white/5 rounded-2xl p-16 text-center text-gray-400">
            No projects featured yet. Check back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, idx) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden group hover:border-gold-premium/30 transition-all flex flex-col hover:shadow-xl hover:shadow-gold/5"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-white/5">
                  <img 
                    src={project.thumbnail} 
                    alt={project.title} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60" />
                  <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-[10px] text-white font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-white/10">
                    {project.category}
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-xl text-white group-hover:text-gold-premium transition-colors mb-2">
                    {project.title}
                  </h3>
                  <p className="text-xs text-gray-400 line-clamp-3 mb-6 flex-1">
                    {project.description}
                  </p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {project.technologies.slice(0, 3).map((tech, i) => (
                        <span key={i} className="text-[10px] bg-white/5 border border-white/5 text-gray-300 font-semibold px-2 py-0.5 rounded uppercase tracking-wider">
                          {tech}
                        </span>
                      ))}
                      {project.technologies.length > 3 && (
                        <span className="text-[10px] text-gray-500 self-center">+{project.technologies.length - 3}</span>
                      )}
                    </div>
                  )}

                  <Link 
                    to={`/projects/${project.slug}`}
                    className="w-full text-center py-3 border border-white/10 group-hover:border-gold-premium/40 hover:bg-gold-premium hover:text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-1"
                  >
                    <span>View Project</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 6. TECHNOLOGY STACK SECTION */}
      {technologies.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center space-y-3">
            <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">OUR CAPABILITIES</div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">Technological Arsenal</h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto">We use modern frameworks to build secure, SEO-optimized, and lightning-fast digital solutions.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {technologies.map((tech, idx) => (
              <motion.div 
                key={tech._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.04 }}
                className="bg-white/5 border border-white/5 p-5 rounded-xl hover:border-gold-premium/20 transition-all flex flex-col items-center justify-center gap-3 text-center group"
              >
                {tech.icon ? (
                  <img src={tech.icon} alt={tech.name} className="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <Code size={28} className="text-gray-400 group-hover:text-gold-premium transition-colors" />
                )}
                <div>
                  <h4 className="font-bold text-white text-xs">{tech.name}</h4>
                  <span className="text-[9px] text-gray-500 uppercase tracking-widest mt-0.5 block">{tech.category}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* 7. CLIENT TESTIMONIALS */}
      {testimonials.length > 0 && (
        <section className="bg-[#050505] py-20 border-y border-white/5 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gold/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          
          <div className="max-w-4xl mx-auto px-6 space-y-8 text-center relative z-10">
            <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">TESTIMONIALS</div>
            
            <div className="relative min-h-[180px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <Quote className="text-gold-premium/20 mx-auto mb-2" size={40} />
                  <p className="text-lg sm:text-xl font-medium italic leading-relaxed text-gray-300 max-w-3xl mx-auto">
                    "{testimonials[activeTestimonial]?.quote}"
                  </p>
                  
                  <div className="flex items-center justify-center gap-3">
                    {testimonials[activeTestimonial]?.image ? (
                      <img src={testimonials[activeTestimonial].image} alt={testimonials[activeTestimonial].name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/5 text-gold-premium font-bold text-xs flex items-center justify-center">
                        {testimonials[activeTestimonial]?.name.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <h4 className="font-bold text-white text-xs">{testimonials[activeTestimonial]?.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">{testimonials[activeTestimonial]?.role} {testimonials[activeTestimonial]?.company ? `@ ${testimonials[activeTestimonial].company}` : ''}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Testimonial Controls */}
            {testimonials.length > 1 && (
              <div className="flex justify-center items-center gap-4">
                <button 
                  onClick={prevTestimonial}
                  className="p-2 border border-white/10 hover:border-gold-premium/40 hover:text-white rounded-full transition-all text-gray-400"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === activeTestimonial ? 'bg-gold-premium w-4' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
                <button 
                  onClick={nextTestimonial}
                  className="p-2 border border-white/10 hover:border-gold-premium/40 hover:text-white rounded-full transition-all text-gray-400"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 8. CONTACT CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-12">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#0C0C0C] to-[#151515] border border-white/5 p-10 md:p-16 rounded-3xl text-center space-y-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-[50px] pointer-events-none" />
          
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to elevate your online presence?
          </h2>
          <p className="text-sm text-gray-400 max-w-lg mx-auto leading-relaxed">
            Let's build a bespoke digital showcase that drives conversions and positions your brand at the pinnacle of luxury.
          </p>
          <div className="pt-4">
            <Link 
              to="/contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-premium hover:bg-gold text-black text-sm font-bold tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-gold/25"
            >
              <span>Request Quote</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
