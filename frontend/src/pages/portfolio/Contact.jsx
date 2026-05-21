import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Project Consultation',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/homepage-settings');
      setSettings(data);
    } catch (err) {
      console.error('Error loading contact settings:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API submission
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: 'Project Consultation', message: '' });
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-16">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="text-gold-premium font-bold text-xs uppercase tracking-widest">GET IN TOUCH</div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Let's Craft Something Rare</h1>
        <p className="text-sm text-gray-400">
          Have an upcoming project, design challenge, or system requirement? Fill out the consultation request or contact us directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-6">
        
        {/* Left Side: Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/5 border border-white/5 p-8 rounded-2xl space-y-8">
            <h3 className="font-bold text-white text-lg border-b border-white/5 pb-4 uppercase tracking-wider">Agency HQ</h3>
            
            <div className="flex gap-4">
              <div className="p-3 bg-gold-premium/5 border border-gold-premium/15 rounded-xl text-gold-premium h-fit">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Send Email</h4>
                <p className="text-xs text-gray-400 mt-1">For general updates & pricing queries:</p>
                <a 
                  href={`mailto:${settings?.contactEmail || 'hello@hevenstudios.com'}`} 
                  className="text-xs text-gold-premium hover:underline font-semibold block mt-1"
                >
                  {settings?.contactEmail || 'hello@hevenstudios.com'}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 bg-gold-premium/5 border border-gold-premium/15 rounded-xl text-gold-premium h-fit">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Call Direct</h4>
                <p className="text-xs text-gray-400 mt-1">Mon - Fri, 9am - 6pm EST:</p>
                <a 
                  href={`tel:${(settings?.contactPhone || '+15552345678').replace(/[^a-zA-Z0-9+]/g, '')}`} 
                  className="text-xs text-gold-premium hover:underline font-semibold block mt-1"
                >
                  {settings?.contactPhone || '+1 (555) 234-5678'}
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="p-3 bg-gold-premium/5 border border-gold-premium/15 rounded-xl text-gold-premium h-fit">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Visit Location</h4>
                <p className="text-xs text-gray-400 mt-1">Come share a coffee at our Manhattan office:</p>
                <span className="text-xs text-gray-300 font-semibold block mt-1">
                  {settings?.contactAddress || '120 Broadway, Suite 4000, New York, NY'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-gold-premium/10 to-gold/5 border border-gold-premium/15 p-6 rounded-2xl text-center space-y-2">
            <h4 className="font-bold text-gold-premium text-sm uppercase tracking-wider">Client Portal Access</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Already our client? Access your secure portal directly to follow task deliverables, make invoice payments, and download assets.
            </p>
          </div>
        </div>

        {/* Right Side: Consultation Form */}
        <div className="lg:col-span-7">
          <div className="bg-white/5 border border-white/5 p-8 rounded-2xl relative overflow-hidden">
            
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <CheckCircle2 className="text-gold-premium mx-auto" size={48} />
                <h3 className="text-xl font-bold text-white uppercase tracking-wider">Consultation Request Sent</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out. A senior design partner will review your system criteria and get back to you within 24 business hours.
                </p>
                <div className="pt-4">
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-2.5 border border-white/10 hover:border-gold-premium/30 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Send Another Message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-bold text-white text-lg border-b border-white/5 pb-4 uppercase tracking-wider">Request Proposal</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-gold-premium focus:ring-0 text-sm outline-none text-white placeholder-gray-600 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. client@brand.com"
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-gold-premium focus:ring-0 text-sm outline-none text-white placeholder-gray-600 transition-all"
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Subject Criteria</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-gold-premium focus:ring-0 text-sm outline-none text-white transition-all font-semibold"
                  >
                    <option value="Project Consultation" className="bg-[#0A0A0A] text-white">New Project Consultation</option>
                    <option value="Design Audit" className="bg-[#0A0A0A] text-white">UX / Design Audit</option>
                    <option value="System Migration" className="bg-[#0A0A0A] text-white">System Migration / Dev Support</option>
                    <option value="Branding Campaign" className="bg-[#0A0A0A] text-white">Brand / Style Direction</option>
                  </select>
                </div>

                {/* Message */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Message Description</label>
                  <textarea 
                    rows={5} 
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your brand goals, scope size, required deadlines..."
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-gold-premium focus:ring-0 text-sm outline-none text-white placeholder-gray-600 transition-all resize-none"
                  ></textarea>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gold-premium hover:bg-gold disabled:opacity-75 text-black font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-gold/25"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Sending inquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Contact;
