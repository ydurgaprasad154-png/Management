import { useState, useEffect, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Mail, Loader2,
  RefreshCw, Eye, EyeOff, Copy, CheckCircle, User, Phone, Building, FolderOpen, X
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

/* ── helpers ─────────────────────────────────────────── */
const generatePassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};
const generateUsername = (name) => {
  const base = name.toLowerCase().replace(/\s+/g, '.').replace(/[^a-z0-9.]/g, '');
  return `${base}${Math.floor(100 + Math.random() * 900)}`;
};

const INITIAL_FORM = { name: '', email: '', phone: '', company: '', username: '', password: '', autoCredentials: true };

const Clients = () => {
  const [clients, setClients]           = useState([]);
  const [projects, setProjects]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);   // client being edited
  const [clientProjects, setClientProjects] = useState(null); // { client, projects[] }
  const [formData, setFormData]         = useState(INITIAL_FORM);
  const [showPass, setShowPass]         = useState(false);
  const [copied, setCopied]             = useState('');
  const [saving, setSaving]             = useState(false);
  const [credResult, setCredResult]     = useState(null);   // { password, username } after create

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes] = await Promise.all([api.get('/clients'), api.get('/projects')]);
      setClients(cRes.data);
      setProjects(pRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── open edit modal ── */
  const openEdit = (client) => {
    setEditTarget(client);
    setFormData({
      name: client.user?.name || '',
      email: client.user?.email || '',
      phone: client.phone || '',
      company: client.company || '',
      username: client.user?.username || '',
      password: '',
      autoCredentials: false,
    });
    setShowPass(false);
  };

  /* ── open create modal ── */
  const openCreate = () => {
    setFormData({ ...INITIAL_FORM, password: generatePassword() }); // pre-fill password
    setCredResult(null);
    setShowPass(false);
    setIsCreateOpen(true);
  };

  /* ── auto-fill username & password when name typed ── */
  const handleNameChange = (val) => {
    const updated = { ...formData, name: val };
    if (updated.autoCredentials) {
      // Always regenerate when name changes so credentials stay in sync
      updated.username = val.trim() ? generateUsername(val) : '';
      updated.password = val.trim() ? generatePassword() : '';
    }
    setFormData(updated);
  };

  const regenerateCreds = () => {
    setFormData(f => ({
      ...f,
      username: generateUsername(f.name || 'client'),
      password: generatePassword(),
    }));
  };

  /* ── copy to clipboard ── */
  const copyText = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  /* ── create client ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Always send the credentials shown in the form so email matches what admin sees
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        username: formData.username || generateUsername(formData.name),
        password: formData.password || generatePassword(),
      };
      const { data } = await api.post('/clients', payload);
      setClients(prev => [...prev, data.client]);
      setCredResult({ password: data.generatedPassword, username: data.generatedUsername });
      setIsCreateOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create client.');
    } finally {
      setSaving(false);
    }
  };

  /* ── update client ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
      };
      if (formData.password) payload.password = formData.password;
      const { data } = await api.put(`/clients/${editTarget._id}`, payload);
      setClients(prev => prev.map(c => c._id === editTarget._id ? data : c));
      setEditTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update client.');
    } finally {
      setSaving(false);
    }
  };

  /* ── soft delete ── */
  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this client?')) return;
    try {
      await api.delete(`/clients/${id}`);
      setClients(prev => prev.map(c => c._id === id ? { ...c, isDeleted: true } : c));
    } catch {
      alert('Failed to deactivate client.');
    }
  };

  /* ── resend credentials ── */
  const handleResend = async (client) => {
    if (!window.confirm(`Resend credentials email to ${client.user?.email}?`)) return;
    try {
      const { data } = await api.post(`/clients/${client._id}/resend-credentials`, {});
      setCredResult({ password: data.generatedPassword, username: client.user?.username });
      alert('Credentials email sent!');
    } catch {
      alert('Failed to send email.');
    }
  };

  /* ── view client projects ── */
  const viewClientProjects = (client) => {
    const cp = projects.filter(p => p.client?._id === client._id || p.client === client._id);
    setClientProjects({ client, projects: cp });
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    return (
      c.user?.name?.toLowerCase().includes(q) ||
      c.user?.email?.toLowerCase().includes(q) ||
      c.company?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
    );
  });

  /* ── shared input class ── */
  const inp = 'w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Client Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage clients, credentials, and their projects.</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /><span>Add Client</span>
        </button>
      </div>

      {/* Credential result banner */}
      {credResult && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-green-800 text-sm">✅ Client created! Onboarding email sent.</p>
            <p className="text-xs text-green-700 mt-1">
              Username: <span className="font-mono font-bold">{credResult.username}</span>&nbsp;|&nbsp;
              Password: <span className="font-mono font-bold">{credResult.password}</span>
            </p>
          </div>
          <button onClick={() => setCredResult(null)} className="text-green-600 hover:text-green-800"><X size={18} /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              type="text" placeholder="Search clients..."
              className="w-full pl-9 pr-4 py-2 bg-accent rounded-lg text-sm border-none focus:ring-2 focus:ring-secondary/20 outline-none transition-all text-secondary"
            />
          </div>
          <span className="text-xs text-gray-400">{filtered.length} client{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12 text-gray-400"><Loader2 className="animate-spin" size={24} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <User size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No clients found.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Client Info</th>
                  <th className="p-4 font-medium">Username</th>
                  <th className="p-4 font-medium">Company</th>
                  <th className="p-4 font-medium">Phone</th>
                  <th className="p-4 font-medium">Joined</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Projects</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(client => {
                  const name  = client.user?.name  || 'Unknown';
                  const email = client.user?.email || 'N/A';
                  const uname = client.user?.username || '—';
                  const clientProjectCount = projects.filter(p =>
                    p.client?._id === client._id || p.client === client._id
                  ).length;

                  return (
                    <tr key={client._id} className="hover:bg-accent/30 transition-colors group">
                      {/* Name + email */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary text-primary flex items-center justify-center font-bold text-sm shrink-0">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-secondary">{name}</p>
                            <p className="text-xs text-gray-500">{email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Username */}
                      <td className="p-4">
                        <span className="font-mono text-xs bg-accent px-2 py-1 rounded text-secondary">{uname}</span>
                      </td>
                      {/* Company */}
                      <td className="p-4 text-secondary">{client.company || '—'}</td>
                      {/* Phone */}
                      <td className="p-4 text-gray-500">{client.phone || '—'}</td>
                      {/* Joined */}
                      <td className="p-4 text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
                      {/* Status */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${!client.isDeleted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {!client.isDeleted ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Projects */}
                      <td className="p-4">
                        <button
                          onClick={() => viewClientProjects(client)}
                          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors"
                        >
                          <FolderOpen size={14} />{clientProjectCount} project{clientProjectCount !== 1 ? 's' : ''}
                        </button>
                      </td>
                      {/* Actions */}
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleResend(client)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md" title="Resend credentials">
                            <Mail size={16} />
                          </button>
                          <button onClick={() => openEdit(client)} className="p-1.5 text-gray-400 hover:text-secondary hover:bg-accent rounded-md" title="Edit">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(client._id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md" title="Deactivate">
                            <Trash2 size={16} />
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
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add New Client">
        <form className="space-y-4" onSubmit={handleCreate}>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name *</label>
              <input required value={formData.name} onChange={e => handleNameChange(e.target.value)}
                className={inp} placeholder="John Doe" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
              <input type="email" required value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className={inp} placeholder="john@example.com" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone *</label>
              <input required value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className={inp} placeholder="+91 98765 43210" />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
              <input value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                className={inp} placeholder="Acme Corp" />
            </div>
          </div>

          {/* Credentials Section */}
          <div className="border border-gray-100 rounded-xl p-4 space-y-3 bg-accent/30">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Login Credentials</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-xs text-gray-500">Auto-generate</span>
                <div
                  onClick={() => setFormData(f => ({ ...f, autoCredentials: !f.autoCredentials }))}
                  className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${formData.autoCredentials ? 'bg-secondary' : 'bg-gray-300'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all ${formData.autoCredentials ? 'left-5' : 'left-0.5'}`} />
                </div>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                <div className="relative">
                  <input value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    readOnly={formData.autoCredentials}
                    className={`${inp} ${formData.autoCredentials ? 'opacity-60 cursor-not-allowed' : ''} pr-8 font-mono`}
                    placeholder="auto.generated" />
                  <button type="button" onClick={() => copyText(formData.username, 'uname')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary">
                    {copied === 'uname' ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    readOnly={formData.autoCredentials}
                    className={`${inp} ${formData.autoCredentials ? 'opacity-60 cursor-not-allowed' : ''} pr-16 font-mono`}
                    placeholder="••••••••••" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button type="button" onClick={() => setShowPass(s => !s)} className="text-gray-400 hover:text-secondary">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button type="button" onClick={() => copyText(formData.password, 'pass')} className="text-gray-400 hover:text-secondary">
                      {copied === 'pass' ? <CheckCircle size={14} className="text-green-600" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {formData.autoCredentials && (
              <button type="button" onClick={regenerateCreds}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors mt-1">
                <RefreshCw size={13} /> Regenerate credentials
              </button>
            )}
            <p className="text-xs text-gray-400">Credentials will be emailed automatically to the client on creation.</p>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm disabled:opacity-60 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />}
              Save Client
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Client Info">
        {editTarget && (
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inp} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className={inp} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className={inp} />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Company</label>
                <input value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={`${inp} pr-16 font-mono`} placeholder="Enter new password" />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <button type="button" onClick={() => setShowPass(s => !s)} className="text-gray-400 hover:text-secondary">
                      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button type="button" onClick={() => {
                      const p = generatePassword();
                      setFormData(f => ({ ...f, password: p }));
                      setShowPass(true);
                    }} className="text-gray-400 hover:text-secondary" title="Generate new password">
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm disabled:opacity-60 flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}Update Client
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Client Projects Modal ── */}
      <Modal isOpen={!!clientProjects} onClose={() => setClientProjects(null)}
        title={clientProjects ? `${clientProjects.client.user?.name}'s Projects` : ''}>
        {clientProjects && (
          <div className="space-y-3">
            {clientProjects.projects.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No projects assigned yet.</p>
            ) : clientProjects.projects.map(p => (
              <div key={p._id} className="flex items-center justify-between p-3 bg-accent rounded-xl">
                <div>
                  <p className="font-semibold text-secondary text-sm">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.description || 'No description'}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  p.status === 'Completed' ? 'bg-green-100 text-green-700' :
                  p.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  p.status === 'On Hold' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                }`}>{p.status}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients;
