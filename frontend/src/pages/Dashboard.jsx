import { useState, useEffect } from 'react';
import { FolderKanban, Wallet, Clock, Wrench, Loader2, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects]   = useState([]);
  const [payments, setPayments]   = useState([]);
  const [services, setServices]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const [pjRes, pyRes, svRes] = await Promise.all([
          api.get('/projects'),
          api.get('/payments'),
          api.get('/services'),
        ]);
        setProjects(pjRes.data);
        setPayments(pyRes.data);
        setServices(svRes.data);
      } catch (e) {
        console.error('Dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const activeProjects   = projects.filter(p => p.status === 'In Progress').length;
  const totalPaid        = payments.reduce((s, p) => s + (p.advanceAmount || 0), 0);
  const totalPending     = payments.filter(p => !p.fullyPaid).reduce((s, p) => s + (p.pendingAmount || 0), 0);
  const pendingServices  = services.filter(s => s.status !== 'Completed').length;

  const stats = [
    { label: 'Active Projects',    value: loading ? '…' : activeProjects,                  icon: <FolderKanban size={22} />, color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Paid',         value: loading ? '…' : `₹${totalPaid.toLocaleString()}`,  icon: <CheckCircle2 size={22} />, color: 'bg-green-50 text-green-600' },
    { label: 'Pending Payments',   value: loading ? '…' : `₹${totalPending.toLocaleString()}`, icon: <AlertCircle size={22} />, color: 'bg-amber-50 text-amber-600' },
    { label: 'Pending Services',   value: loading ? '…' : pendingServices,                  icon: <Wrench size={22} />,       color: 'bg-purple-50 text-purple-600' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':   return 'bg-green-100 text-green-700';
      case 'In Progress': return 'bg-blue-100 text-blue-700';
      case 'Not Started': return 'bg-gray-100 text-gray-700';
      case 'On Hold':     return 'bg-amber-100 text-amber-700';
      default:            return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-secondary">
          Welcome back, {user?.name || 'Client'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.color}`}>{stat.icon}</div>
            <div>
              <p className="text-xs font-medium text-gray-500">{stat.label}</p>
              <h3 className="text-xl font-bold text-secondary mt-0.5">
                {loading ? <span className="inline-block w-12 h-5 bg-accent animate-pulse rounded" /> : stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Active Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-secondary">Active Projects</h2>
          <Link to="/portal/projects" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-10 text-gray-400"><Loader2 className="animate-spin" size={24} /></div>
        ) : projects.length === 0 ? (
          <div className="bg-primary rounded-2xl border border-gray-100 p-10 text-center text-gray-400">
            <FolderKanban size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects assigned yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.slice(0, 4).map(project => (
              <div key={project._id} className="bg-primary rounded-2xl shadow-sm border border-gray-100 p-6 hover:border-gray-200 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-base font-bold text-secondary">{project.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>

                <div className="mb-3">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-500">Progress</span>
                    <span className="text-secondary">{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-accent rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${project.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}</span>
                  <Link to="/portal/projects" className="font-medium text-blue-600 hover:underline">Details →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Payments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-secondary">Recent Payments</h2>
          <Link to="/portal/payments" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8 text-gray-400"><Loader2 className="animate-spin" size={22} /></div>
        ) : payments.length === 0 ? (
          <div className="bg-primary rounded-2xl border border-gray-100 p-8 text-center text-gray-400">
            <Wallet size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No payment records yet.</p>
          </div>
        ) : (
          <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Paid</th>
                  <th className="p-4 font-medium">Pending</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {payments.slice(0, 5).map(p => (
                  <tr key={p._id} className="hover:bg-accent/30 transition-colors">
                    <td className="p-4 font-medium text-secondary">{p.project?.name || '—'}</td>
                    <td className="p-4 text-secondary">₹{(p.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4 text-green-700">₹{(p.advanceAmount || 0).toLocaleString()}</td>
                    <td className="p-4 text-amber-700">
                      {p.fullyPaid ? <span className="text-green-600 font-semibold">✅ Paid</span> : `₹${(p.pendingAmount || 0).toLocaleString()}`}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        p.status === 'Partial'   ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
