import { useState, useEffect } from 'react';
import { Plus, Wrench, CheckCircle2, Loader2, Edit2, Clock, PlayCircle } from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

const STATUS_META = {
  Pending:     { color: 'bg-amber-100 text-amber-700',  icon: <Clock size={13} /> },
  'In Progress': { color: 'bg-blue-100 text-blue-700',    icon: <PlayCircle size={13} /> },
  Completed:   { color: 'bg-green-100 text-green-700',  icon: <CheckCircle2 size={13} /> },
};

const EMPTY_FORM = { client: '', project: '', description: '', cost: '', status: 'Pending' };

const Services = () => {
  const [services, setServices] = useState([]);
  const [clients, setClients]   = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState({ status: '', description: '', cost: '' });
  const [saving, setSaving]     = useState(false);
  const [emailSent, setEmailSent] = useState(''); // service _id that just got email

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, cRes, pRes] = await Promise.all([
        api.get('/services'),
        api.get('/clients'),
        api.get('/projects'),
      ]);
      setServices(sRes.data);
      setClients(cRes.data);
      setProjects(pRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── filter projects by client ── */
  const clientProjects = formData.client
    ? projects.filter(p => p.client?._id === formData.client || p.client === formData.client)
    : projects;

  /* ── create ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/services', {
        client:      formData.client || undefined,
        project:     formData.project || undefined,
        description: formData.description,
        cost:        Number(formData.cost),
        status:      formData.status,
      });
      setServices(prev => [data, ...prev]);
      setIsCreateOpen(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  /* ── open edit modal ── */
  const openEdit = (service) => {
    setEditTarget(service);
    setEditForm({
      status:      service.status,
      description: service.description,
      cost:        service.cost,
    });
  };

  /* ── update status ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/services/${editTarget._id}`, {
        status:      editForm.status,
        description: editForm.description,
        cost:        Number(editForm.cost),
      });
      setServices(prev => prev.map(s => s._id === editTarget._id ? data : s));
      if (editForm.status === 'Completed' && editTarget.status !== 'Completed') {
        setEmailSent(editTarget._id);
        setTimeout(() => setEmailSent(''), 4000);
      }
      setEditTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update service.');
    } finally {
      setSaving(false);
    }
  };

  /* ── quick status change ── */
  const quickStatus = async (service, newStatus) => {
    try {
      const { data } = await api.put(`/services/${service._id}`, { status: newStatus });
      setServices(prev => prev.map(s => s._id === service._id ? data : s));
      if (newStatus === 'Completed') {
        setEmailSent(service._id);
        setTimeout(() => setEmailSent(''), 4000);
      }
    } catch {
      alert('Failed to update status.');
    }
  };

  const inp = 'w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Service & Maintenance</h1>
          <p className="text-sm text-gray-500 mt-1">Log updates, bug fixes, and maintenance tasks per client.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /><span>Log Service</span>
        </button>
      </div>

      {/* Email sent toast */}
      {emailSent && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-3 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          Service marked complete — completion email sent to client! ✅
        </div>
      )}

      {/* Table */}
      <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12 text-gray-400"><Loader2 className="animate-spin" size={24} /></div>
          ) : services.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Wrench size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No services logged yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Service</th>
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Cost</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {services.map(service => {
                  const meta = STATUS_META[service.status] || STATUS_META.Pending;
                  return (
                    <tr key={service._id} className="hover:bg-accent/30 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-100 rounded-lg text-gray-600 shrink-0"><Wrench size={15} /></div>
                          <span className="font-semibold text-secondary">{service.description}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-secondary text-sm">{service.client?.user?.name || '—'}</p>
                        <p className="text-xs text-gray-400">{service.client?.company || ''}</p>
                      </td>
                      <td className="p-4 text-gray-600">{service.project?.name || '—'}</td>
                      <td className="p-4 font-medium text-secondary">₹{service.cost}</td>
                      <td className="p-4 text-gray-500">{new Date(service.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${meta.color}`}>
                          {meta.icon}{service.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {service.status !== 'Completed' && (
                            <>
                              {service.status === 'Pending' && (
                                <button
                                  onClick={() => quickStatus(service, 'In Progress')}
                                  className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors"
                                >
                                  ▶ Start
                                </button>
                              )}
                              <button
                                onClick={() => quickStatus(service, 'Completed')}
                                className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 whitespace-nowrap transition-colors"
                              >
                                <CheckCircle2 size={13} /> Done
                              </button>
                            </>
                          )}
                          <button onClick={() => openEdit(service)}
                            className="p-1.5 text-gray-400 hover:text-secondary hover:bg-accent rounded-md">
                            <Edit2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create Modal ── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Log New Service">
        <form className="space-y-4" onSubmit={handleCreate}>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Client</label>
            <select value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value, project: '' })}
              className={`${inp} text-secondary`}>
              <option value="">Select client...</option>
              {clients.map(c => (
                <option key={c._id} value={c._id}>{c.user?.name || 'Unknown'} {c.company ? `(${c.company})` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Project</label>
            <select value={formData.project} onChange={e => setFormData({ ...formData, project: e.target.value })}
              className={`${inp} text-secondary`}>
              <option value="">Select project...</option>
              {clientProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Service Title / Description *</label>
            <input required value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className={inp} placeholder="e.g. Server Migration, Bug Fix — Login Screen" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cost (₹) *</label>
              <input type="number" required min="0" value={formData.cost}
                onChange={e => setFormData({ ...formData, cost: e.target.value })}
                className={inp} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                className={`${inp} text-secondary`}>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm disabled:opacity-60 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Save Service
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit / Status Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Service">
        {editTarget && (
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="bg-accent/50 rounded-xl p-3 text-sm space-y-1">
              <p><span className="text-gray-500">Client:</span> <strong>{editTarget.client?.user?.name || '—'}</strong></p>
              <p><span className="text-gray-500">Project:</span> <strong>{editTarget.project?.name || '—'}</strong></p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
              <input required value={editForm.description}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className={inp} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cost (₹)</label>
                <input type="number" min="0" value={editForm.cost}
                  onChange={e => setEditForm({ ...editForm, cost: e.target.value })}
                  className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  className={`${inp} text-secondary`}>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            {editForm.status === 'Completed' && editTarget.status !== 'Completed' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                Marking as Completed will automatically send a service completion email to the client.
              </div>
            )}
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm disabled:opacity-60 flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Update Service
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Services;
