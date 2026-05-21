import { useState, useEffect } from 'react';
import { 
  FolderKanban, 
  Users, 
  Wallet, 
  Globe,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../utils/api';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [clientsRes, projectsRes, paymentsRes, servicesRes] = await Promise.all([
        api.get('/clients').catch(() => ({ data: [] })),
        api.get('/projects').catch(() => ({ data: [] })),
        api.get('/payments').catch(() => ({ data: [] })),
        api.get('/services').catch(() => ({ data: [] }))
      ]);

      const clients = clientsRes.data;
      const projects = projectsRes.data;
      const payments = paymentsRes.data;
      const services = servicesRes.data;

      // 1. Compute Stats
      const totalProjects = projects.length;
      const totalClients = clients.length;
      const totalEarned = payments.reduce((sum, p) => sum + (p.advanceAmount || p.amount || 0), 0);
      const activeServices = services.filter(s => s.status !== 'Completed').length;

      setStats([
        { label: 'Total Projects', value: totalProjects.toString(), icon: <FolderKanban size={24} />, trend: 'Active' },
        { label: 'Total Clients', value: totalClients.toString(), icon: <Users size={24} />, trend: 'Registered' },
        { label: 'Total Earned', value: `$${totalEarned.toLocaleString()}`, icon: <Wallet size={24} />, trend: 'All Time' },
        { label: 'Active Services', value: activeServices.toString(), icon: <Globe size={24} />, trend: 'Pending/In Progress' },
      ]);

      // 2. Compute Chart Data (Revenue by Month for the last 6 months)
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const revenueByMonth = {};
      
      // Initialize last 6 months with 0
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        revenueByMonth[`${monthNames[d.getMonth()]} ${d.getFullYear()}`] = 0;
      }

      payments.forEach(payment => {
        const date = new Date(payment.createdAt);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        if (revenueByMonth[key] !== undefined) {
          revenueByMonth[key] += (payment.advanceAmount || payment.amount || 0);
        }
      });

      const formattedChartData = Object.keys(revenueByMonth).map(key => ({
        name: key.split(' ')[0], // just the month name
        revenue: revenueByMonth[key]
      }));
      setChartData(formattedChartData);

      // 3. Compute Recent Activity
      const activities = [];
      
      clients.forEach(c => {
        activities.push({
          id: `client-${c._id}`,
          text: `New client "${c.company || c.user?.name}" added`,
          date: new Date(c.createdAt),
          type: 'client'
        });
      });

      payments.forEach(p => {
        activities.push({
          id: `payment-${p._id}`,
          text: `Payment of $${(p.advanceAmount || p.amount || 0).toLocaleString()} received`,
          date: new Date(p.createdAt),
          type: 'payment'
        });
      });

      services.forEach(s => {
        if (s.status === 'Completed') {
          activities.push({
            id: `service-${s._id}`,
            text: `Service "${s.description}" completed`,
            date: new Date(s.updatedAt || s.createdAt),
            type: 'service'
          });
        }
      });

      projects.forEach(p => {
        activities.push({
          id: `project-${p._id}`,
          text: `Project "${p.name}" created`,
          date: new Date(p.createdAt),
          type: 'project'
        });
      });

      // Sort by date descending and take top 5
      activities.sort((a, b) => b.date - a.date);
      
      const timeSince = (date) => {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
      };

      const recentActs = activities.slice(0, 5).map(act => ({
        ...act,
        time: timeSince(act.date)
      }));

      setRecentActivities(recentActs);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-secondary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time summary of your business.</p>
        </div>
        <button className="bg-secondary text-primary px-4 py-2 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors shadow-sm w-full sm:w-auto">
          Generate Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-primary p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col hover:border-gray-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-accent rounded-xl text-secondary">
                {stat.icon}
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-secondary mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="bg-primary p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2 hover:border-gray-200 transition-colors">
          <h3 className="text-lg font-bold text-secondary mb-6">Revenue Analytics (Last 6 Months)</h3>
          <div className="h-72" style={{ minHeight: '288px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dx={-10} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  cursor={{fill: '#f5f5f5'}} 
                  contentStyle={{borderRadius: '12px', border: '1px solid #f0f0f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="revenue" fill="#000000" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-primary p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-gray-200 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-secondary">Recent Activity</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">View All</button>
          </div>
          
          {recentActivities.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p className="text-sm">No recent activities.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex gap-4 relative group">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-secondary ring-4 ring-accent relative z-10 group-hover:bg-blue-600 group-hover:ring-blue-50 transition-colors"></div>
                  <div className="absolute top-3 left-1 w-0.5 h-full bg-gray-100 -z-0 last:hidden"></div>
                  <div>
                    <p className="text-sm font-medium text-secondary leading-snug">{activity.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
