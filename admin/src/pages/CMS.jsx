import { useState, useEffect, useRef } from 'react';
import { 
  Layers, Plus, Edit2, Trash2, Save, UploadCloud, Loader2, X, Check, 
  AlertCircle, Star, Phone, Mail, MapPin, Link as LinkIcon, Monitor, 
  Smartphone, Code, Cpu, Shield, Zap, Sparkles
} from 'lucide-react';
import api from '../utils/api';
import Modal from '../components/ui/Modal';

const TABS = [
  { id: 'hero-about', name: 'Hero & About', icon: <Layers size={16} /> },
  { id: 'services', name: 'Services', icon: <Cpu size={16} /> },
  { id: 'technologies', name: 'Technologies', icon: <Code size={16} /> },
  { id: 'testimonials', name: 'Testimonials', icon: <Star size={16} /> },
  { id: 'contact', name: 'Contact Details', icon: <Mail size={16} /> },
];

const CATEGORIES = ['Frontend', 'Backend', 'Database', 'Cloud & DevOps', 'AI & Data Science', 'Design & Other'];

const CMS = () => {
  const [activeTab, setActiveTab] = useState('hero-about');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // --- Singleton Settings State ---
  const [settings, setSettings] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroBgUrl: '',
    heroCtaText: '',
    heroCtaLink: '',
    aboutTitle: '',
    aboutSubtitle: '',
    aboutDescription: '',
    aboutImageUrl: '',
    statsProjects: 0,
    statsClients: 0,
    statsTech: 0,
    statsExperience: 0,
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    socialGithub: '',
    socialLinkedin: '',
    socialTwitter: ''
  });

  // --- Collections States ---
  const [services, setServices] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  // --- CRUD Modals States ---
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'service', 'tech', 'testimonial'
  const [editingItem, setEditingItem] = useState(null);
  
  // --- Form States for collections ---
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', icon: 'Code' });
  const [techForm, setTechForm] = useState({ name: '', icon: '', category: 'Frontend' });
  const [testimonialForm, setTestimonialForm] = useState({ name: '', company: '', role: '', quote: '', rating: 5, image: '' });

  // --- File uploads progress ---
  const [uploadingType, setUploadingType] = useState(''); // 'heroBg', 'aboutImg', 'techIcon', 'clientPhoto'
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchSettings();
    fetchCollections();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/homepage-settings');
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      const [srvRes, techRes, testRes] = await Promise.all([
        api.get('/portfolio-services'),
        api.get('/technologies'),
        api.get('/testimonials')
      ]);
      setServices(srvRes.data);
      setTechnologies(techRes.data);
      setTestimonials(testRes.data);
    } catch (error) {
      console.error('Error fetching CMS collections:', error);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await api.put('/homepage-settings', settings);
      setSettings(data);
      alert('Homepage settings successfully saved!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // --- File Upload Manager ---
  const handleImageUpload = async (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file);

    try {
      setUploadingType(targetField);
      const { data } = await api.post('/portfolio-projects/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.urls && data.urls.length > 0) {
        const uploadedUrl = data.urls[0];
        
        if (targetField === 'heroBg' || targetField === 'aboutImg') {
          setSettings(prev => ({
            ...prev,
            [targetField === 'heroBg' ? 'heroBgUrl' : 'aboutImageUrl']: uploadedUrl
          }));
        } else if (targetField === 'techIcon') {
          setTechForm(prev => ({ ...prev, icon: uploadedUrl }));
        } else if (targetField === 'clientPhoto') {
          setTestimonialForm(prev => ({ ...prev, image: uploadedUrl }));
        }
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingType('');
    }
  };

  // --- CRUD Actions ---
  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    if (type === 'service') {
      setServiceForm({ title: '', description: '', icon: 'Code' });
    } else if (type === 'tech') {
      setTechForm({ name: '', icon: '', category: 'Frontend' });
    } else if (type === 'testimonial') {
      setTestimonialForm({ name: '', company: '', role: '', quote: '', rating: 5, image: '' });
    }
    setModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    if (type === 'service') {
      setServiceForm({ title: item.title, description: item.description, icon: item.icon || 'Code' });
    } else if (type === 'tech') {
      setTechForm({ name: item.name, icon: item.icon || '', category: item.category || 'Frontend' });
    } else if (type === 'testimonial') {
      setTestimonialForm({ 
        name: item.name, 
        company: item.company || '', 
        role: item.role || '', 
        quote: item.quote, 
        rating: item.rating || 5, 
        image: item.image || '' 
      });
    }
    setModalOpen(true);
  };

  const handleDeleteItem = async (type, id) => {
    if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
    try {
      if (type === 'service') {
        await api.delete(`/portfolio-services/${id}`);
        setServices(services.filter(s => s._id !== id));
      } else if (type === 'tech') {
        await api.delete(`/technologies/${id}`);
        setTechnologies(technologies.filter(t => t._id !== id));
      } else if (type === 'testimonial') {
        await api.delete(`/testimonials/${id}`);
        setTestimonials(testimonials.filter(t => t._id !== id));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      alert(`Failed to delete ${type}`);
    }
  };

  const handleSubmitModalForm = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (modalType === 'service') {
        if (editingItem) {
          const { data } = await api.put(`/portfolio-services/${editingItem._id}`, serviceForm);
          setServices(services.map(s => s._id === data._id ? data : s));
        } else {
          const { data } = await api.post('/portfolio-services', serviceForm);
          setServices([data, ...services]);
        }
      } else if (modalType === 'tech') {
        if (editingItem) {
          const { data } = await api.put(`/technologies/${editingItem._id}`, techForm);
          setTechnologies(technologies.map(t => t._id === data._id ? data : t));
        } else {
          const { data } = await api.post('/technologies', techForm);
          setTechnologies([data, ...technologies]);
        }
      } else if (modalType === 'testimonial') {
        if (editingItem) {
          const { data } = await api.put(`/testimonials/${editingItem._id}`, testimonialForm);
          setTestimonials(testimonials.map(t => t._id === data._id ? data : t));
        } else {
          const { data } = await api.post('/testimonials', testimonialForm);
          setTestimonials([data, ...testimonials]);
        }
      }
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to submit form:', error);
      alert(error.response?.data?.message || 'Action failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-secondary text-secondary">Website CMS Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure layout, assets, capabilities, testimonials, and brand stack details.</p>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-gray-200 gap-2 overflow-x-auto pb-px">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all whitespace-nowrap -mb-px
              ${activeTab === tab.id 
                ? 'border-secondary text-secondary' 
                : 'border-transparent text-gray-500 hover:text-secondary hover:border-gray-300'
              }`}
          >
            {tab.icon}
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>Fetching dynamic settings...</span>
        </div>
      ) : (
        <div className="bg-primary border border-gray-100 rounded-2xl shadow-sm p-6">
          
          {/* TAB 1: HERO & ABOUT */}
          {activeTab === 'hero-about' && (
            <form onSubmit={handleSaveSettings} className="space-y-8">
              {/* Hero Setup */}
              <div>
                <h3 className="text-base font-bold text-secondary border-b border-gray-100 pb-2 mb-4">Hero Banner Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hero Title</label>
                      <input 
                        type="text"
                        value={settings.heroTitle}
                        onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Hero Subtitle</label>
                      <textarea 
                        rows={3}
                        value={settings.heroSubtitle}
                        onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all resize-none"
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CTA Label</label>
                        <input 
                          type="text"
                          value={settings.heroCtaText}
                          onChange={(e) => setSettings({ ...settings, heroCtaText: e.target.value })}
                          className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">CTA Action Route</label>
                        <input 
                          type="text"
                          value={settings.heroCtaLink}
                          onChange={(e) => setSettings({ ...settings, heroCtaLink: e.target.value })}
                          className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Hero Background Asset (Image/Video URL)</label>
                    <div className="space-y-3">
                      {settings.heroBgUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video bg-black flex items-center justify-center">
                          {settings.heroBgUrl.endsWith('.mp4') ? (
                            <video src={settings.heroBgUrl} className="w-full h-full object-cover" muted loop autoPlay />
                          ) : (
                            <img src={settings.heroBgUrl} alt="Hero BG preview" className="object-cover w-full h-full" />
                          )}
                          <button 
                            type="button" 
                            onClick={() => setSettings({ ...settings, heroBgUrl: '' })}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 hover:border-secondary rounded-xl p-8 text-center cursor-pointer transition-colors bg-accent/40 aspect-video flex flex-col justify-center items-center"
                        >
                          <input 
                            type="file" 
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(e, 'heroBg')}
                            accept="image/*,video/mp4"
                            className="hidden" 
                          />
                          {uploadingType === 'heroBg' ? (
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                              <Loader2 className="animate-spin text-secondary" size={24} />
                              <span className="text-xs">Uploading media...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-gray-500">
                              <UploadCloud size={32} className="text-gray-400" />
                              <span className="text-xs font-semibold">Upload hero wallpaper or video</span>
                              <span className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP, MP4</span>
                            </div>
                          )}
                        </div>
                      )}
                      <input 
                        type="url"
                        placeholder="Or paste external URL directly"
                        value={settings.heroBgUrl}
                        onChange={(e) => setSettings({ ...settings, heroBgUrl: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* About Setup */}
              <div>
                <h3 className="text-base font-bold text-secondary border-b border-gray-100 pb-2 mb-4">About Studio Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About Section Title</label>
                      <input 
                        type="text"
                        value={settings.aboutTitle}
                        onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">About Section Tagline</label>
                      <input 
                        type="text"
                        value={settings.aboutSubtitle}
                        onChange={(e) => setSettings({ ...settings, aboutSubtitle: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company Description</label>
                      <textarea 
                        rows={5}
                        value={settings.aboutDescription}
                        onChange={(e) => setSettings({ ...settings, aboutDescription: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">About Section Showcase Image</label>
                    <div className="space-y-3">
                      {settings.aboutImageUrl ? (
                        <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video max-w-sm bg-gray-50">
                          <img src={settings.aboutImageUrl} alt="About preview" className="object-cover w-full h-full" />
                          <button 
                            type="button" 
                            onClick={() => setSettings({ ...settings, aboutImageUrl: '' })}
                            className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = (e) => handleImageUpload(e, 'aboutImg');
                            input.click();
                          }}
                          className="border-2 border-dashed border-gray-300 hover:border-secondary rounded-xl p-8 text-center cursor-pointer transition-colors bg-accent/40 aspect-video max-w-sm flex flex-col justify-center items-center"
                        >
                          {uploadingType === 'aboutImg' ? (
                            <div className="flex flex-col items-center gap-2 text-gray-500">
                              <Loader2 className="animate-spin text-secondary" size={24} />
                              <span className="text-xs">Uploading image...</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-1.5 text-gray-500">
                              <UploadCloud size={32} className="text-gray-400" />
                              <span className="text-xs font-semibold">Upload Showcase Graphic</span>
                              <span className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP</span>
                            </div>
                          )}
                        </div>
                      )}
                      <input 
                        type="url"
                        placeholder="Paste image URL directly"
                        value={settings.aboutImageUrl}
                        onChange={(e) => setSettings({ ...settings, aboutImageUrl: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Counters Setup */}
              <div>
                <h3 className="text-base font-bold text-secondary border-b border-gray-100 pb-2 mb-4">Counters & Statistics Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Projects Completed</label>
                    <input 
                      type="number"
                      value={settings.statsProjects}
                      onChange={(e) => setSettings({ ...settings, statsProjects: e.target.value })}
                      className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all font-bold text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Happy Clients</label>
                    <input 
                      type="number"
                      value={settings.statsClients}
                      onChange={(e) => setSettings({ ...settings, statsClients: e.target.value })}
                      className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all font-bold text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Technologies Stacked</label>
                    <input 
                      type="number"
                      value={settings.statsTech}
                      onChange={(e) => setSettings({ ...settings, statsTech: e.target.value })}
                      className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all font-bold text-secondary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Years of Experience</label>
                    <input 
                      type="number"
                      value={settings.statsExperience}
                      onChange={(e) => setSettings({ ...settings, statsExperience: e.target.value })}
                      className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all font-bold text-secondary"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action */}
              <div className="pt-5 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary text-primary px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-secondary">Public Agency Services</h3>
                  <p className="text-xs text-gray-500">Add or edit the core technological services you offer client inquiries.</p>
                </div>
                <button
                  onClick={() => openAddModal('service')}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map(srv => (
                  <div key={srv._id} className="border border-gray-100 rounded-xl p-5 bg-primary relative group shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2.5 bg-accent text-secondary rounded-lg font-bold text-sm">
                          {srv.icon || 'Code'}
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal('service', srv)}
                            className="p-1 hover:bg-accent rounded text-gray-500 hover:text-secondary"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('service', srv._id)}
                            className="p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <h4 className="font-bold text-secondary text-sm mb-1">{srv.title}</h4>
                      <p className="text-xs text-gray-500 line-clamp-3">{srv.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TECHNOLOGIES */}
          {activeTab === 'technologies' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-secondary">Developer Stack & Tools</h3>
                  <p className="text-xs text-gray-500">Maintain logos and categories for frameworks, systems, and platforms.</p>
                </div>
                <button
                  onClick={() => openAddModal('tech')}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Tech Logo</span>
                </button>
              </div>

              {CATEGORIES.map(category => {
                const categoryTech = technologies.filter(t => t.category === category);
                if (categoryTech.length === 0) return null;
                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50 pb-1">{category}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {categoryTech.map(tech => (
                        <div key={tech._id} className="border border-gray-100 bg-primary p-3 rounded-lg flex items-center justify-between group hover:border-gray-200 transition-all shadow-sm">
                          <div className="flex items-center gap-2.5">
                            {tech.icon ? (
                              <img src={tech.icon} alt={tech.name} className="w-6 h-6 object-contain" />
                            ) : (
                              <Code size={18} className="text-gray-400" />
                            )}
                            <span className="text-xs font-semibold text-secondary">{tech.name}</span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal('tech', tech)}
                              className="p-1 hover:bg-accent rounded text-gray-400 hover:text-secondary"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem('tech', tech._id)}
                              className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-600"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: TESTIMONIALS */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-secondary">Client Testimonials</h3>
                  <p className="text-xs text-gray-500">Provide luxury dynamic feedback sliders visible on the homepage.</p>
                </div>
                <button
                  onClick={() => openAddModal('testimonial')}
                  className="bg-secondary text-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} />
                  <span>Add Testimonial</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map(test => (
                  <div key={test._id} className="border border-gray-100 rounded-xl p-5 bg-primary relative group shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          {test.image ? (
                            <img src={test.image} alt={test.name} className="w-9 h-9 rounded-full object-cover border border-gray-200" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-accent text-secondary font-bold text-xs flex items-center justify-center">
                              {test.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold text-secondary text-xs">{test.name}</h4>
                            <p className="text-[10px] text-gray-400 font-semibold">{test.role} {test.company ? `@ ${test.company}` : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal('testimonial', test)}
                            className="p-1 hover:bg-accent rounded text-gray-500 hover:text-secondary"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteItem('testimonial', test._id)}
                            className="p-1 hover:bg-red-50 rounded text-gray-500 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-0.5 text-amber-500 mb-2">
                        {[...Array(test.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                      </div>

                      <p className="text-xs text-gray-500 italic line-clamp-4">"{test.quote}"</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CONTACT DETAILS */}
          {activeTab === 'contact' && (
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-secondary border-b border-gray-100 pb-2 mb-4">Contact Info & Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Public Email</label>
                      <input 
                        type="email"
                        value={settings.contactEmail}
                        onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Phone Line</label>
                      <input 
                        type="text"
                        value={settings.contactPhone}
                        onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Studio Address</label>
                      <input 
                        type="text"
                        value={settings.contactAddress}
                        onChange={(e) => setSettings({ ...settings, contactAddress: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">GitHub Agency Profile</label>
                      <input 
                        type="url"
                        value={settings.socialGithub}
                        onChange={(e) => setSettings({ ...settings, socialGithub: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">LinkedIn Business Profile</label>
                      <input 
                        type="url"
                        value={settings.socialLinkedin}
                        onChange={(e) => setSettings({ ...settings, socialLinkedin: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Twitter Account</label>
                      <input 
                        type="url"
                        value={settings.socialTwitter}
                        onChange={(e) => setSettings({ ...settings, socialTwitter: e.target.value })}
                        className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Action */}
              <div className="pt-5 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-secondary text-primary px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  <span>Save Configuration</span>
                </button>
              </div>
            </form>
          )}

        </div>
      )}

      {/* Dynamic Modal for CRUD Collections */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? `Edit ${modalType}` : `Add New ${modalType}`}
        size="lg"
      >
        <form onSubmit={handleSubmitModalForm} className="space-y-4">
          
          {/* SERVICE FORM */}
          {modalType === 'service' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Title *</label>
                <input 
                  type="text" 
                  required
                  value={serviceForm.title}
                  onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })}
                  placeholder="e.g. AI Agents Development"
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Icon/Concept Label</label>
                <input 
                  type="text" 
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({ ...serviceForm, icon: e.target.value })}
                  placeholder="e.g. Code, Monitor, Sparkles, Shield, Cpu"
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Service Description *</label>
                <textarea 
                  rows={4} 
                  required
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  placeholder="Explain scope, deliverables, and architecture guarantees..."
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all resize-none"
                ></textarea>
              </div>
            </div>
          )}

          {/* TECHNOLOGY FORM */}
          {modalType === 'tech' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Tech Name *</label>
                <input 
                  type="text" 
                  required
                  value={techForm.name}
                  onChange={(e) => setTechForm({ ...techForm, name: e.target.value })}
                  placeholder="e.g. Next.js, Docker, Kubernetes"
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category *</label>
                <select 
                  required
                  value={techForm.category}
                  onChange={(e) => setTechForm({ ...techForm, category: e.target.value })}
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all text-secondary font-medium"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Tech Vector Logo (Image URL)</label>
                <div className="space-y-2">
                  {techForm.icon ? (
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 w-16 h-16 bg-gray-50 flex items-center justify-center p-1">
                      <img src={techForm.icon} alt="Tech Logo" className="object-contain w-full h-full" />
                      <button 
                        type="button" 
                        onClick={() => setTechForm(prev => ({ ...prev, icon: '' }))}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-600 text-white rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handleImageUpload(e, 'techIcon');
                        input.click();
                      }}
                      className="border-2 border-dashed border-gray-300 hover:border-secondary rounded-lg p-4 text-center cursor-pointer transition-colors bg-accent/40 w-16 h-16 flex items-center justify-center"
                    >
                      {uploadingType === 'techIcon' ? (
                        <Loader2 className="animate-spin text-secondary" size={14} />
                      ) : (
                        <UploadCloud size={18} className="text-gray-400" />
                      )}
                    </div>
                  )}
                  <input 
                    type="url" 
                    placeholder="Or paste external vector URL"
                    value={techForm.icon}
                    onChange={(e) => setTechForm({ ...techForm, icon: e.target.value })}
                    className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TESTIMONIAL FORM */}
          {modalType === 'testimonial' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Client Name *</label>
                  <input 
                    type="text" 
                    required
                    value={testimonialForm.name}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                    className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Client Title/Role</label>
                  <input 
                    type="text" 
                    value={testimonialForm.role}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                    placeholder="e.g. CTO, VP of Product"
                    className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Company/Brand Name</label>
                  <input 
                    type="text" 
                    value={testimonialForm.company}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, company: e.target.value })}
                    className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Rating *</label>
                  <select 
                    value={testimonialForm.rating}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, rating: Number(e.target.value) })}
                    className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all text-secondary font-medium"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{r} Stars</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Quote Description *</label>
                <textarea 
                  rows={4} 
                  required
                  value={testimonialForm.quote}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })}
                  placeholder="Paste client testimonial text here..."
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all resize-none"
                ></textarea>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Client Profile Photo</label>
                <div className="space-y-2">
                  {testimonialForm.image ? (
                    <div className="relative rounded-full overflow-hidden border border-gray-200 w-16 h-16 bg-gray-50">
                      <img src={testimonialForm.image} alt="Client Photo" className="object-cover w-full h-full" />
                      <button 
                        type="button" 
                        onClick={() => setTestimonialForm(prev => ({ ...prev, image: '' }))}
                        className="absolute top-0 right-0 p-0.5 bg-red-600 text-white rounded-full"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => handleImageUpload(e, 'clientPhoto');
                        input.click();
                      }}
                      className="border-2 border-dashed border-gray-300 hover:border-secondary rounded-full p-4 text-center cursor-pointer transition-colors bg-accent/40 w-16 h-16 flex items-center justify-center"
                    >
                      {uploadingType === 'clientPhoto' ? (
                        <Loader2 className="animate-spin text-secondary" size={14} />
                      ) : (
                        <UploadCloud size={18} className="text-gray-400" />
                      )}
                    </div>
                  )}
                  <input 
                    type="url" 
                    placeholder="Or paste external photo link directly"
                    value={testimonialForm.image}
                    onChange={(e) => setTestimonialForm({ ...testimonialForm, image: e.target.value })}
                    className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
            <button 
              type="button" 
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="px-5 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 transition-colors shadow-sm flex items-center gap-1.5"
            >
              {saving && <Loader2 className="animate-spin" size={14} />}
              <span>{editingItem ? 'Update' : 'Add'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CMS;
