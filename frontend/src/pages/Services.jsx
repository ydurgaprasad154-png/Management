import { useState, useEffect } from 'react';
import { Wrench, CheckCircle2, Clock, PlayCircle, Loader2, FolderKanban } from 'lucide-react';
import api from '../utils/api';

const STATUS_META = {
  'Pending':     { color: 'bg-amber-100 text-amber-700',  icon: <Clock size={13} />,        label: 'Pending' },
  'In Progress': { color: 'bg-blue-100 text-blue-700',    icon: <PlayCircle size={13} />,   label: 'In Progress' },
  'Completed':   { color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 size={13} />, label: 'Completed' },
};

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/services');
        setServices(data);
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const completed   = services.filter(s => s.status === 'Completed').length;
  const inProgress  = services.filter(s => s.status === 'In Progress').length;
  const pending     = services.filter(s => s.status === 'Pending').length;
  const totalCost   = services.reduce((sum, s) => sum + (s.cost || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Services & Maintenance</h1>
        <p className="text-sm text-gray-500 mt-1">Track all maintenance tasks and service updates on your projects.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-primary p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Total Services</p>
          <h3 className="text-2xl font-bold text-secondary mt-1">{loading ? '…' : services.length}</h3>
        </div>
        <div className="bg-primary p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Completed</p>
          <h3 className="text-2xl font-bold text-green-600 mt-1">{loading ? '…' : completed}</h3>
        </div>
        <div className="bg-primary p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">In Progress</p>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">{loading ? '…' : inProgress}</h3>
        </div>
        <div className="bg-primary p-4 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 font-medium">Pending</p>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{loading ? '…' : pending}</h3>
        </div>
      </div>

      {/* Services List */}
      <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-secondary">Service History</h3>
          {!loading && services.length > 0 && (
            <span className="text-xs text-gray-500 bg-accent px-3 py-1 rounded-full">
              Total Cost: <strong>₹{totalCost.toLocaleString()}</strong>
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : services.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Wrench size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No services logged yet.</p>
              <p className="text-xs mt-1 text-gray-300">Your maintenance history will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Cost</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {services.map(service => {
                  const meta = STATUS_META[service.status] || STATUS_META['Pending'];
                  return (
                    <tr key={service._id} className="hover:bg-accent/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-600 shrink-0">
                            <Wrench size={15} />
                          </div>
                          <span className="font-semibold text-secondary">{service.description}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">
                        {service.project?.name ? (
                          <span className="flex items-center gap-1.5">
                            <FolderKanban size={13} className="text-gray-400" />
                            {service.project.name}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-4 font-medium text-secondary">₹{(service.cost || 0).toLocaleString()}</td>
                      <td className="p-4 text-gray-500">{new Date(service.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ${meta.color}`}>
                          {meta.icon}{meta.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Services;
