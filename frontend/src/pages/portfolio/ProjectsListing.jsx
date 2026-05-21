import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Tag, Calendar, Globe, ArrowRight, Loader2, Filter, AlertTriangle } from 'lucide-react';
import api from '../../utils/api';

const CATEGORIES = [
  'All',
  'Web Development',
  'Mobile App',
  'UI/UX Design',
  'E-commerce',
  'AI & Machine Learning',
  'Software Development',
  'Branding & Design'
];

const ProjectsListing = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);
  const limit = 6; // Show 6 per page for nice grid spacing

  // Debounce search term to minimize API requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset page on search change
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProjects();
  }, [debouncedSearch, selectedCategory, page]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const categoryParam = selectedCategory !== 'All' ? selectedCategory : '';
      const { data } = await api.get('/portfolio-projects', {
        params: {
          search: debouncedSearch,
          category: categoryParam,
          page,
          limit,
          status: 'Active' // Public view only gets Active ones
        }
      });
      
      setProjects(data.projects || []);
      setTotalPages(data.pages || 1);
      setTotalProjects(data.total || 0);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setPage(1); // Reset page on category change
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">Our Works</h1>
        <p className="text-sm text-gray-400">
          Explore our premium showcases, high-performance web systems, and custom designs managed dynamically from our administrative console.
        </p>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pt-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-500" />
          <input 
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full p-3 bg-white/5 border border-white/10 rounded-xl focus:border-gold-premium focus:ring-0 text-sm outline-none transition-all text-white placeholder-gray-500"
          />
        </div>

        {/* Categories Carousel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none -mx-6 px-6 md:mx-0 md:px-0 max-w-full">
          <div className="flex-shrink-0 text-gray-500 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 mr-2">
            <Filter size={14} />
            <span>Filter:</span>
          </div>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all border whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-gold-premium text-black border-gold-premium'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden aspect-[4/5] animate-pulse flex flex-col justify-end p-6">
              <div className="h-6 bg-white/10 rounded w-1/4 mb-3"></div>
              <div className="h-8 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-white/10 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-16 text-center text-gray-500 space-y-4">
          <AlertTriangle className="mx-auto text-gold-premium/40" size={48} />
          <div>
            <h3 className="font-bold text-white text-base">No Projects Found</h3>
            <p className="text-xs mt-1">Try adapting your search parameters or check another category.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {projects.map((project, idx) => (
              <motion.div
                layout
                key={project._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className="bg-white/5 border border-white/5 rounded-2xl overflow-hidden group hover:border-gold-premium/30 transition-all flex flex-col hover:shadow-xl hover:shadow-gold/5"
              >
                {/* Thumbnail */}
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

                {/* Details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2">
                    <Calendar size={10} />
                    <span>{project.completedAt ? new Date(project.completedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'}</span>
                    {project.clientName && (
                      <>
                        <span>•</span>
                        <span>{project.clientName}</span>
                      </>
                    )}
                  </div>
                  
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
                    <span>Explore Project</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-10">
          <button
            onClick={() => setPage(p => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/10 rounded-xl hover:border-gold-premium text-gray-300 disabled:opacity-50 disabled:hover:border-white/10 transition-colors"
          >
            Prev
          </button>
          
          <div className="text-xs text-gray-400">
            Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
          </div>

          <button
            onClick={() => setPage(p => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-white/10 rounded-xl hover:border-gold-premium text-gray-300 disabled:opacity-50 disabled:hover:border-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsListing;
