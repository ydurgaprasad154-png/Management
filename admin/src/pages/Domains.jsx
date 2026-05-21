import { useState, useEffect } from 'react';
import { Plus, Globe, Server, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

const Domains = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domains, setDomains] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({ client: '', domainName: '', hostingProvider: '', expiryDate: '', status: 'Active' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [domRes, clientRes] = await Promise.all([
        api.get('/domains'),
        api.get('/clients')
      ]);
      setDomains(domRes.data);
      setClients(clientRes.data);
    } catch (error) {
      console.error('Error fetching domains:', error);
      // Fallback
      setDomains([{ _id: 1, domainName: 'acme-corp.com', client: { company: 'Acme Corp' }, provider: 'GoDaddy', expiryDate: '2024-12-15', status: 'Active' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDomain = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/domains', formData);
      setDomains([...domains, data]);
      setIsModalOpen(false);
      setFormData({ client: '', domainName: '', hostingProvider: '', expiryDate: '', status: 'Active' });
    } catch (error) {
      console.error('Failed to save domain:', error);
      alert('Failed to save record.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Domain & Hosting Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor renewals and prevent downtime for clients.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus size={18} />
          <span>Add Record</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-gray-400">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((record) => (
            <div key={record._id} className="bg-primary p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-blue-50 text-blue-600`}>
                  <Globe size={24} />
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                  record.status === 'Active' ? 'bg-green-100 text-green-700' : 
                  record.status === 'Pending Renewal' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {record.status !== 'Active' && <AlertCircle size={12} />}
                  {record.status}
                </span>
              </div>
              <h3 className="text-lg font-bold text-secondary">{record.domainName}</h3>
              <p className="text-sm text-gray-500 mb-4">{record.client?.user?.name || record.client?.company || 'Unknown Client'}</p>
              
              <div className="bg-accent rounded-lg p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-500">Provider:</span>
                  <span className="font-medium text-secondary">{record.hostingProvider || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Expires:</span>
                  <span className="font-medium text-secondary">{new Date(record.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-secondary hover:bg-accent transition-colors">
                Renew Now
              </button>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Domain / Hosting">
        <form className="space-y-4" onSubmit={handleCreateDomain}>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Select Client</label>
            <select 
              required
              value={formData.client}
              onChange={(e) => setFormData({...formData, client: e.target.value})}
              className="w-full p-2.5 bg-accent rounded-lg border-transparent text-sm outline-none text-secondary"
            >
              <option value="">Choose...</option>
              {clients.map(c => <option key={c._id} value={c._id}>{c.user?.name || 'Unknown'} {c.company ? `(${c.company})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Domain Name</label>
            <input 
              type="text" 
              required
              value={formData.domainName}
              onChange={(e) => setFormData({...formData, domainName: e.target.value})}
              className="w-full p-2.5 bg-accent rounded-lg border-transparent text-sm outline-none" 
              placeholder="e.g. acme-corp.com" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Provider</label>
              <input 
                type="text" 
                value={formData.hostingProvider}
                onChange={(e) => setFormData({...formData, hostingProvider: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent text-sm outline-none" 
                placeholder="e.g. AWS / GoDaddy" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Expiry Date</label>
              <input 
                type="date" 
                required
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full p-2.5 bg-accent rounded-lg border-transparent text-sm outline-none text-gray-600" 
              />
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm">Save Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Domains;
