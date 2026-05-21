import { useState, useEffect } from 'react';
import { FolderKanban, Calendar, Clock, DollarSign, Loader2 } from 'lucide-react';
import api from '../utils/api';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-2xl font-bold text-secondary">My Projects</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status and timeline of all your active services.</p>
      </div>

      {loading ? (
         <div className="flex justify-center p-12 text-gray-400">
           <Loader2 className="animate-spin" size={24} />
         </div>
      ) : projects.length === 0 ? (
        <div className="bg-primary rounded-2xl border border-gray-100 p-14 text-center text-gray-400">
          <FolderKanban size={42} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No projects assigned yet.</p>
          <p className="text-xs mt-1 text-gray-300">Your projects will appear here once they are created.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {projects.map(project => (
            <div key={project._id} className="bg-primary rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 flex flex-col md:flex-row gap-8">
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-accent rounded-xl text-secondary">
                      <FolderKanban size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-secondary">{project.name}</h2>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block mt-2 ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-accent p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <Calendar size={14} />
                      <span className="text-xs font-medium">Start Date</span>
                    </div>
                    <p className="text-sm font-semibold text-secondary">{project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'}</p>
                  </div>
                  <div className="bg-accent p-3 rounded-lg">
                    <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                      <Clock size={14} />
                      <span className="text-xs font-medium">Deadline</span>
                    </div>
                    <p className="text-sm font-semibold text-secondary">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-secondary">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-accent rounded-full h-3 overflow-hidden mb-6">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
                
                <button className="w-full py-2.5 bg-secondary text-primary text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  View Timeline
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
