import { useState, useEffect } from 'react';
import { Plus, Search, Calendar, DollarSign, ListTodo, Loader2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    client: '',
    description: '',
    startDate: '',
    deadline: '',
    totalCost: ''
  });

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [statusFormData, setStatusFormData] = useState({
    status: '',
    progress: 0,
    note: '',
    keyPoints: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsRes, clientsRes] = await Promise.all([
        api.get('/projects'),
        api.get('/clients')
      ]);
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setProjects([
        { _id: 1, name: 'E-Commerce Website', client: { company: 'Acme Corp' }, status: 'In Progress', progress: 65, deadline: '2023-12-01T00:00:00Z', totalCost: 4500 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/projects', formData);
      setProjects([...projects, data]);
      setIsModalOpen(false);
      setFormData({ name: '', client: '', description: '', startDate: '', deadline: '', totalCost: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project.');
    }
  };

  const openStatusModal = (project) => {
    setSelectedProject(project);
    setStatusFormData({
      status: project.status || 'Not Started',
      progress: project.progress || 0,
      note: project.note || '',
      keyPoints: project.keyPoints ? project.keyPoints.join('\n') : ''
    });
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        status: statusFormData.status,
        progress: Number(statusFormData.progress),
        note: statusFormData.note,
        keyPoints: statusFormData.keyPoints.split('\n').filter(p => p.trim() !== '')
      };
      
      const { data } = await api.put(`/projects/${selectedProject._id}`, payload);
      setProjects(projects.map(p => p._id === data._id ? data : p));
      setIsStatusModalOpen(false);
    } catch (error) {
      console.error('Failed to update project status:', error);
      alert('Failed to update project status.');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Not Started': return 'bg-gray-100 text-gray-700';
      case 'On Hold': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Project Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track progress, manage milestones, and oversee deliverables.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          <span>New Project</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-gray-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-primary rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-gray-200 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <button 
                  onClick={() => openStatusModal(project)}
                  className="text-gray-400 hover:text-secondary transition-colors opacity-0 group-hover:opacity-100"
                  title="Update Status"
                >
                  <ListTodo size={18} />
                </button>
              </div>
              
              <h3 className="text-lg font-bold text-secondary mb-1">{project.name}</h3>
              <p className="text-sm text-gray-500 mb-6">{project.client?.user?.name || project.client?.company || 'Unknown Client'}</p>
              
              <div className="mt-auto">
                <div className="mb-4">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-secondary">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-green-500' : 'bg-secondary'}`}
                      style={{ width: `${project.progress || 0}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    <span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Date'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <DollarSign size={14} />
                    <span className="font-semibold text-secondary">${project.totalCost?.toLocaleString() || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create New Project"
      >
        <form className="space-y-4" onSubmit={handleCreateProject}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Project Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all" 
                placeholder="e.g. Website Redesign" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Assign Client</label>
              <select 
                required
                value={formData.client}
                onChange={(e) => setFormData({...formData, client: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all text-secondary"
              >
                <option value="">Select a client...</option>
                {clients.map(c => (
                  <option key={c._id} value={c._id}>{c.user?.name || 'Unknown'} {c.company ? `(${c.company})` : ''}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <textarea 
                rows={3} 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all resize-none" 
                placeholder="Project details..."
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input 
                  type="date" 
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all text-gray-600" 
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Deadline</label>
                <input 
                  type="date" 
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all text-gray-600" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Total Cost ($)</label>
              <input 
                type="number" 
                value={formData.totalCost}
                onChange={(e) => setFormData({...formData, totalCost: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all" 
                placeholder="0.00" 
              />
            </div>
          </div>
          
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
              className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Status Modal */}
      <Modal 
        isOpen={isStatusModalOpen} 
        onClose={() => setIsStatusModalOpen(false)} 
        title="Update Project Status"
      >
        <form className="space-y-4" onSubmit={handleUpdateStatus}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select 
                  value={statusFormData.status}
                  onChange={(e) => setStatusFormData({...statusFormData, status: e.target.value})}
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all text-secondary"
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Progress (%)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={statusFormData.progress}
                  onChange={(e) => setStatusFormData({...statusFormData, progress: e.target.value})}
                  className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all" 
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status Note</label>
              <textarea 
                rows={2} 
                value={statusFormData.note}
                onChange={(e) => setStatusFormData({...statusFormData, note: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all resize-none" 
                placeholder="Brief note about current status..."
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Key Points (One per line)</label>
              <textarea 
                rows={4} 
                value={statusFormData.keyPoints}
                onChange={(e) => setStatusFormData({...statusFormData, keyPoints: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all resize-none" 
                placeholder="Point 1&#10;Point 2&#10;Point 3..."
              ></textarea>
            </div>
          </div>
          
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 mt-6">
            <button 
              type="button" 
              onClick={() => setIsStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              Update Status
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
