import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Award, Target, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import api from '../../utils/api';

const TIMELINE = [
  {
    year: "2018",
    title: "Agency Foundation",
    desc: "Heven Studios was established in New York with a core team of 3 developers, driven to bridge the gap between heavy software systems and luxury creative visuals."
  },
  {
    year: "2020",
    title: "Going Full-Stack React",
    desc: "We fully committed our design structures to React, MongoDB, and AWS cloud, optimizing responsive load times and fluid scroll interactions."
  },
  {
    year: "2022",
    title: "Global Client Expansion",
    desc: "Expanded services internationally, executing bespoke designs and client management panels for startups and luxury watchmakers in Zurich and Milan."
  },
  {
    year: "2024",
    title: "Next-Gen Framework Launch",
    desc: "Built our bespoke client project tracking panel (HFM Freelance Manager) to let our clients follow payments, invoices, milestones, and updates in real-time."
  },
  {
    year: "2026",
    title: "Premium Agency Showcases",
    desc: "Integrating state-of-the-art interactive effects, custom cursor dynamics, and server-side optimization techniques for next-generation clients."
  }
];

const VALUES = [
  {
    icon: <Award className="text-gold-premium" size={24} />,
    title: "Luxury Aesthetics",
    desc: "We specialize in bold black, crisp white, and gold accents, choosing tailored layouts that make your brand feel premium."
  },
  {
    icon: <Target className="text-gold-premium" size={24} />,
    title: "High Performance",
    desc: "Every asset is compiled, compressed, and lazy-loaded. No laggy transitions, slow scripts, or unoptimized images."
  },
  {
    icon: <ShieldCheck className="text-gold-premium" size={24} />,
    title: "Transparency First",
    desc: "With our proprietary client portal, clients track active project milestones, payments, and deadlines in real-time."
  }
];

const About = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/homepage-settings');
      setSettings(data);
    } catch (err) {
      console.error('Error fetching about settings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-gray-400 gap-3">
        <Loader2 className="animate-spin text-gold-premium" size={28} />
        <span className="text-xs uppercase tracking-widest font-semibold">Loading About Panel...</span>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-24 md:space-y-36">
      
      {/* Hero Header */}
      <section className="relative pt-12 max-w-7xl mx-auto px-6 text-center space-y-6">
        <div className="absolute top-1/3 left-1/2 w-80 h-80 bg-gold/5 rounded-full blur-[100px] pointer-events-none -translate-x-1/2" />
        
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-gold-premium font-bold text-xs uppercase tracking-widest"
        >
          {settings?.aboutTitle || "OUR PHILOSOPHY"}
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto"
        >
          {settings?.aboutSubtitle ? (
            <>
              {settings.aboutSubtitle.split(' ').slice(0, -2).join(' ')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-premium to-gold-light">
                {settings.aboutSubtitle.split(' ').slice(-2).join(' ')}
              </span>
            </>
          ) : (
            "We build digital systems that command attention."
          )}
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-sm max-w-2xl mx-auto leading-relaxed font-medium whitespace-pre-line"
        >
          {settings?.aboutDescription || 
            "Heven Studios is a boutique digital agency engineering high-end websites, software applications, and complete administrative systems for clients who demand excellence."
          }
        </motion.div>

        {settings?.aboutImageUrl && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden border border-white/5 bg-white/5 mt-8 shadow-xl"
          >
            <img src={settings.aboutImageUrl} alt="About Showcase Banner" className="w-full h-full object-cover" />
          </motion.div>
        )}
      </section>

      {/* Core Values */}
      <section className="max-w-7xl mx-auto px-6 space-y-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Our Core Commitments</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {VALUES.map((val, idx) => (
            <motion.div
              key={val.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/5 p-8 rounded-2xl space-y-4 hover:border-gold-premium/20 transition-all"
            >
              <div className="p-3 bg-gold-premium/5 border border-gold-premium/15 rounded-xl inline-block">
                {val.icon}
              </div>
              <h3 className="font-bold text-white text-lg">{val.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{val.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Timeline Section */}
      <section className="max-w-4xl mx-auto px-6 space-y-16">
        <div className="text-center space-y-3">
          <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">THE TIMELINE</div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">How We Evolved</h2>
        </div>

        <div className="relative border-l border-white/10 pl-6 sm:pl-10 space-y-12 ml-4">
          {TIMELINE.map((item, idx) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="relative space-y-2"
            >
              {/* Timeline dot */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 h-4 rounded-full bg-black border-2 border-gold-premium flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-gold-premium animate-ping" />
              </div>

              {/* Year indicator */}
              <div className="text-xs font-extrabold text-gold-premium tracking-wider uppercase">
                {item.year}
              </div>
              
              <h3 className="font-bold text-white text-base sm:text-lg">
                {item.title}
              </h3>
              
              <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vision Statement */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-[#050505] border border-white/5 p-10 sm:p-16 rounded-3xl text-center space-y-4">
          <Sparkles className="text-gold-premium mx-auto mb-2" size={32} />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">Uncompromising Standards</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto">
            We reject the template culture. Every line of CSS, every database handler query, and every animation frame is built by our senior architects to guarantee longevity and speed.
          </p>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-5xl mx-auto px-6">
        <div className="bg-gradient-to-r from-[#0C0C0C] to-[#151515] border border-white/5 p-8 rounded-3xl text-center space-y-4">
          <h2 className="text-xl font-bold text-white">Let's craft your next digital masterwork.</h2>
          <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
            Reach out today to discuss details, scope, scheduling, and engineering solutions.
          </p>
          <div className="pt-2">
            <a 
              href="/contact"
              className="inline-block px-6 py-2.5 bg-gold-premium text-black hover:bg-gold transition-all text-xs font-bold tracking-widest uppercase rounded-lg"
            >
              Get In Touch
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
