import { useState, useEffect, useRef } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Globe, Star, Image, 
  UploadCloud, Loader2, X, Check, Eye, AlertCircle, Calendar,
  User, Tag, Folder
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

// Custom inline SVG icon because lucide-react v1.0.0+ does not export brand icons
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

const CATEGORIES = [
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'E-commerce',
  'AI & Machine Learning',
  'Software Development',
  'Branding & Design'
];

const Portfolio = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('all');

  // File uploading states
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [imagesUploading, setImagesUploading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail: '',
    images: [],
    technologies: '',
    category: 'Web Development',
    liveLink: '',
    githubLink: '',
    featured: false,
    status: 'Active',
    clientName: '',
    completedAt: new Date().toISOString().split('T')[0]
  });

  const thumbnailInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, [statusFilter]); // Re-fetch when status filter changes if needed, but we query with status=all by default

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/portfolio-projects?status=all&limit=100`);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Failed to fetch portfolio projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      thumbnail: '',
      images: [],
      technologies: '',
      category: 'Web Development',
      liveLink: '',
      githubLink: '',
      featured: false,
      status: 'Active',
      clientName: '',
      completedAt: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      thumbnail: project.thumbnail || '',
      images: project.images || [],
      technologies: project.technologies ? project.technologies.join(', ') : '',
      category: project.category || 'Web Development',
      liveLink: project.liveLink || '',
      githubLink: project.githubLink || '',
      featured: project.featured || false,
      status: project.status || 'Active',
      clientName: project.clientName || '',
      completedAt: project.completedAt ? new Date(project.completedAt).toISOString().split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project from your portfolio?')) return;
    try {
      await api.delete(`/portfolio-projects/${id}`);
      setProjects(projects.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete project:', error);
      alert('Failed to delete project');
    }
  };

  const handleFileUpload = async (e, type) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await uploadFiles(files, type);
  };

  const uploadFiles = async (files, type) => {
    const uploadData = new FormData();
    for (let i = 0; i < files.length; i++) {
      uploadData.append('images', files[i]);
    }

    try {
      if (type === 'thumbnail') setThumbnailUploading(true);
      else setImagesUploading(true);

      const { data } = await api.post('/portfolio-projects/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (data.urls && data.urls.length > 0) {
        if (type === 'thumbnail') {
          setFormData(prev => ({ ...prev, thumbnail: data.urls[0] }));
        } else {
          setFormData(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('File upload failed. Please try again.');
    } finally {
      setThumbnailUploading(false);
      setImagesUploading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await uploadFiles(files, type);
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: '' }));
  };

  const removeGalleryImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.thumbnail || !formData.category) {
      alert('Please fill in all required fields (Title, Description, Thumbnail, Category)');
      return;
    }

    // Process technologies string to array
    const techArray = formData.technologies
      ? formData.technologies.split(',').map(t => t.trim()).filter(t => t !== '')
      : [];

    const payload = {
      ...formData,
      technologies: techArray
    };

    try {
      if (editingProject) {
        // Edit project
        const { data } = await api.put(`/portfolio-projects/${editingProject._id}`, payload);
        setProjects(projects.map(p => p._id === data._id ? data : p));
      } else {
        // Create project
        const { data } = await api.post('/portfolio-projects', payload);
        setProjects([data, ...projects]);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save project:', error);
      alert(error.response?.data?.message || 'Failed to save project');
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technologies?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
    const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Portfolio Showcase Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage external projects showcased on your premium portfolio homepage.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          <span>Add Portfolio Project</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-primary border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search projects by title, tech..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
            <Folder size={14} />
            <span>Category:</span>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-2 bg-accent text-secondary rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 ml-2">
            <Check size={14} />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-accent text-secondary rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid of Projects */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={24} />
          <span>Loading portfolio projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-primary rounded-2xl border border-dashed border-gray-300 p-16 text-center text-gray-400 shadow-sm">
          <AlertCircle className="mx-auto mb-3" size={32} />
          <p className="text-sm font-medium">No portfolio projects found.</p>
          <p className="text-xs mt-1">Try resetting filters or add a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div key={project._id} className="bg-primary border border-gray-100 rounded-2xl shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-gray-200 transition-all">
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                <img 
                  src={project.thumbnail} 
                  alt={project.title} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Overlay Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full">
                    {project.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex gap-1.5">
                  {project.featured && (
                    <span className="bg-amber-500 text-white p-1 rounded-full shadow-sm" title="Featured Project">
                      <Star size={12} fill="currentColor" />
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shadow-sm ${
                    project.status === 'Active' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'
                  }`}>
                    {project.status}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg text-secondary line-clamp-1 mb-1">{project.title}</h3>
                
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
                  <Calendar size={12} />
                  <span>{project.completedAt ? new Date(project.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                  {project.clientName && (
                    <>
                      <span>•</span>
                      <User size={12} className="ml-1" />
                      <span>{project.clientName}</span>
                    </>
                  )}
                </div>

                <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{project.description}</p>
                
                {/* Tech Stack Badges */}
                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-5">
                    {project.technologies.slice(0, 4).map((tech, idx) => (
                      <span key={idx} className="bg-accent text-secondary text-[10px] font-semibold px-2 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 4 && (
                      <span className="text-[10px] text-gray-400 self-center font-medium">+{project.technologies.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Footer Links & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                  <div className="flex gap-2.5">
                    {project.liveLink && (
                      <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors" title="Live Preview">
                        <Globe size={18} />
                      </a>
                    )}
                    {project.githubLink && (
                      <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors" title="GitHub Code">
                        <Github size={18} />
                      </a>
                    )}
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenEditModal(project)}
                      className="p-1.5 hover:bg-accent rounded-lg text-gray-500 hover:text-secondary transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteProject(project._id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-500 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProject ? "Edit Portfolio Project" : "Add Portfolio Project"}
        size="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Project Title *</label>
              <input 
                type="text" 
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Premium E-commerce Store"
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category *</label>
              <select 
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all text-secondary font-medium"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Client Name (Optional)</label>
              <input 
                type="text" 
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="e.g. Nike, Inc."
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            {/* Completion Date */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Completion Date *</label>
              <input 
                type="date" 
                required
                value={formData.completedAt}
                onChange={(e) => setFormData({ ...formData, completedAt: e.target.value })}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all text-gray-600"
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Technologies Used (Comma-separated)</label>
            <input 
              type="text" 
              value={formData.technologies}
              onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
              placeholder="React, TailwindCSS, Node.js, MongoDB, Framer Motion"
              className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
            />
            {formData.technologies && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.technologies.split(',').map(t => t.trim()).filter(t => t !== '').map((tech, idx) => (
                  <span key={idx} className="bg-accent text-secondary text-[10px] font-semibold px-2 py-0.5 rounded">
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Demo Link */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Live Demo URL</label>
              <input 
                type="url" 
                value={formData.liveLink}
                onChange={(e) => setFormData({ ...formData, liveLink: e.target.value })}
                placeholder="https://example.com"
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
              />
            </div>

            {/* GitHub URL */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">GitHub Repo URL</label>
              <input 
                type="url" 
                value={formData.githubLink}
                onChange={(e) => setFormData({ ...formData, githubLink: e.target.value })}
                placeholder="https://github.com/username/project"
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-3 bg-accent rounded-xl">
            {/* Featured Project */}
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-secondary focus:ring-secondary cursor-pointer"
              />
              <label htmlFor="featured" className="text-sm font-semibold text-secondary cursor-pointer select-none">
                Featured Project
              </label>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 justify-end">
              <label className="text-sm font-semibold text-secondary">Status:</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="p-1.5 bg-primary text-secondary text-xs font-bold rounded-lg border border-gray-200 outline-none cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Project Description *</label>
            <textarea 
              rows={4} 
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the project scope, client requirement, challenges, and your solution..."
              className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white text-sm outline-none transition-all resize-none"
            ></textarea>
          </div>

          {/* Thumbnail Drag & Drop */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Project Thumbnail *</label>
            {formData.thumbnail ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 aspect-video max-w-xs group bg-gray-50">
                <img src={formData.thumbnail} alt="Thumbnail preview" className="object-cover w-full h-full" />
                <button 
                  type="button" 
                  onClick={removeThumbnail}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors opacity-90 hover:opacity-100 shadow-sm"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'thumbnail')}
                onClick={() => thumbnailInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-secondary rounded-xl p-6 text-center cursor-pointer transition-colors bg-accent/40"
              >
                <input 
                  type="file" 
                  ref={thumbnailInputRef}
                  onChange={(e) => handleFileUpload(e, 'thumbnail')}
                  accept="image/*"
                  className="hidden" 
                />
                {thumbnailUploading ? (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Loader2 className="animate-spin text-secondary" size={24} />
                    <span className="text-xs">Uploading image...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-gray-500">
                    <UploadCloud size={28} className="text-gray-400 group-hover:text-secondary transition-colors" />
                    <span className="text-xs font-semibold">Drag & drop thumbnail or <span className="text-secondary underline">browse</span></span>
                    <span className="text-[10px] text-gray-400">Supports JPG, PNG, WEBP (Recommended aspect 16:9)</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gallery Drag & Drop */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Project Gallery Images (Carousel)</label>
            
            {/* Gallery Previews */}
            {formData.images && formData.images.length > 0 && (
              <div className="flex flex-wrap gap-2.5 mb-3">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 group bg-gray-50 flex-shrink-0">
                    <img src={url} alt={`Gallery ${idx}`} className="object-cover w-full h-full" />
                    <button 
                      type="button" 
                      onClick={() => removeGalleryImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors opacity-95 shadow-sm"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div 
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'images')}
              onClick={() => galleryInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-secondary rounded-xl p-5 text-center cursor-pointer transition-colors bg-accent/40"
            >
              <input 
                type="file" 
                ref={galleryInputRef}
                onChange={(e) => handleFileUpload(e, 'images')}
                accept="image/*"
                multiple
                className="hidden" 
              />
              {imagesUploading ? (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Loader2 className="animate-spin text-secondary" size={24} />
                  <span className="text-xs">Uploading images...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 text-gray-500">
                  <UploadCloud size={24} className="text-gray-400" />
                  <span className="text-xs font-semibold">Drag & drop gallery images or <span className="text-secondary underline">browse</span></span>
                  <span className="text-[10px] text-gray-400">Select multiple images to show in project details carousel</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
            <button 
              type="button" 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              {editingProject ? "Update Project" : "Add Project"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Portfolio;
