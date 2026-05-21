import { useState, useEffect } from 'react';
import {
  Plus, Search, DollarSign, Clock, CheckCircle2,
  Loader2, Edit2, IndianRupee, TrendingUp, AlertCircle
} from 'lucide-react';
import Modal from '../components/ui/Modal';
import api from '../utils/api';

const STATUS_COLORS = {
  Completed: 'bg-green-100 text-green-700',
  Partial:   'bg-blue-100 text-blue-700',
  Pending:   'bg-amber-100 text-amber-700',
  Failed:    'bg-red-100 text-red-700',
};

const EMPTY_FORM = {
  client: '', project: '', totalAmount: '', advanceAmount: '', notes: ''
};

const Financials = () => {
  const [payments, setPayments]   = useState([]);
  const [clients, setClients]     = useState([]);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget]     = useState(null);
  const [formData, setFormData]   = useState(EMPTY_FORM);
  const [editForm, setEditForm]   = useState({ totalAmount: '', advanceAmount: '', notes: '' });
  const [saving, setSaving]       = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, clientRes, projRes] = await Promise.all([
        api.get('/payments'),
        api.get('/clients'),
        api.get('/projects'),
      ]);
      setPayments(payRes.data);
      setClients(clientRes.data);
      setProjects(projRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  /* ── filter projects by selected client ── */
  const clientProjects = formData.client
    ? projects.filter(p => p.client?._id === formData.client || p.client === formData.client)
    : projects;

  /* ── summaries ── */
  const totalRevenue  = payments.filter(p => p.status === 'Completed').reduce((s, p) => s + (p.totalAmount || 0), 0);
  const totalAdvance  = payments.reduce((s, p) => s + (p.advanceAmount || 0), 0);
  const totalPending  = payments.filter(p => !p.fullyPaid).reduce((s, p) => s + (p.pendingAmount || 0), 0);

  /* ── create ── */
  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/payments', {
        client:        formData.client || undefined,
        project:       formData.project || undefined,
        totalAmount:   Number(formData.totalAmount),
        advanceAmount: Number(formData.advanceAmount) || 0,
        notes:         formData.notes,
      });
      setPayments(prev => [data, ...prev]);
      setIsCreateOpen(false);
      setFormData(EMPTY_FORM);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save payment.');
    } finally {
      setSaving(false);
    }
  };

  /* ── open edit ── */
  const openEdit = (payment) => {
    setEditTarget(payment);
    setEditForm({
      totalAmount:   payment.totalAmount || 0,
      advanceAmount: payment.advanceAmount || 0,
      notes:         payment.notes || '',
    });
  };

  /* ── update ── */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put(`/payments/${editTarget._id}`, {
        totalAmount:   Number(editForm.totalAmount),
        advanceAmount: Number(editForm.advanceAmount),
        notes:         editForm.notes,
      });
      setPayments(prev => prev.map(p => p._id === editTarget._id ? data : p));
      setEditTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment.');
    } finally {
      setSaving(false);
    }
  };

  /* ── mark fully paid ── */
  const markFullyPaid = async (payment) => {
    if (!window.confirm('Mark this payment as fully paid?')) return;
    try {
      const { data } = await api.put(`/payments/${payment._id}`, { markFullyPaid: true });
      setPayments(prev => prev.map(p => p._id === payment._id ? data : p));
    } catch {
      alert('Failed to update payment.');
    }
  };

  const inp = 'w-full p-2.5 bg-accent rounded-lg border-transparent focus:border-gray-300 focus:bg-white focus:ring-0 text-sm outline-none transition-all';

  const filtered = payments.filter(p => {
    const q = search.toLowerCase();
    return (
      p.project?.name?.toLowerCase().includes(q) ||
      p.client?.user?.name?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Financial Management</h1>
          <p className="text-sm text-gray-500 mt-1">Track revenue, advance payments, and pending balances.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={18} /><span>Record Payment</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Collected</p>
            <h3 className="text-xl font-bold text-secondary">₹{totalRevenue.toLocaleString()}</h3>
            <p className="text-xs text-gray-400">{payments.filter(p => p.fullyPaid).length} fully paid</p>
          </div>
        </div>
        <div className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><TrendingUp size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Advance Received</p>
            <h3 className="text-xl font-bold text-secondary">₹{totalAdvance.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Pending</p>
            <h3 className="text-xl font-bold text-secondary">₹{totalPending.toLocaleString()}</h3>
            <p className="text-xs text-gray-400">{payments.filter(p => !p.fullyPaid).length} unpaid</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-secondary">Payment Records</h3>
          <div className="relative w-56">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 bg-accent rounded-lg text-sm border-none outline-none focus:ring-2 focus:ring-secondary/20 transition-all text-secondary" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12 text-gray-400"><Loader2 className="animate-spin" size={24} /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <DollarSign size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payment records yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Client</th>
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Advance</th>
                  <th className="p-4 font-medium">Pending</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filtered.map(payment => (
                  <tr key={payment._id} className="hover:bg-accent/30 transition-colors group">
                    <td className="p-4">
                      <p className="font-semibold text-secondary">{payment.client?.user?.name || '—'}</p>
                      <p className="text-xs text-gray-400">{payment.client?.company || ''}</p>
                    </td>
                    <td className="p-4 text-gray-600">{payment.project?.name || '—'}</td>
                    <td className="p-4 font-bold text-secondary">₹{(payment.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4 text-green-700 font-medium">₹{(payment.advanceAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      {payment.fullyPaid ? (
                        <span className="text-green-600 font-semibold text-xs">✅ Fully Paid</span>
                      ) : (
                        <span className="text-amber-700 font-medium">₹{(payment.pendingAmount || 0).toLocaleString()}</span>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-600'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!payment.fullyPaid && (
                          <button onClick={() => markFullyPaid(payment)}
                            className="text-xs bg-green-50 text-green-700 hover:bg-green-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1 transition-colors whitespace-nowrap">
                            <CheckCircle2 size={13} /> Mark Paid
                          </button>
                        )}
                        <button onClick={() => openEdit(payment)}
                          className="p-1.5 text-gray-400 hover:text-secondary hover:bg-accent rounded-md">
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Create Modal ── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Record New Payment">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Total Amount (₹) *</label>
              <input type="number" required min="0" value={formData.totalAmount}
                onChange={e => setFormData({ ...formData, totalAmount: e.target.value })}
                className={inp} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Advance Paid (₹)</label>
              <input type="number" min="0" value={formData.advanceAmount}
                onChange={e => setFormData({ ...formData, advanceAmount: e.target.value })}
                className={inp} placeholder="0.00" />
            </div>
          </div>
          {formData.totalAmount && (
            <div className="bg-accent/50 rounded-xl p-3 text-sm flex justify-between">
              <span className="text-gray-500">Pending balance:</span>
              <span className="font-bold text-secondary">
                ₹{Math.max(0, Number(formData.totalAmount) - Number(formData.advanceAmount || 0)).toLocaleString()}
              </span>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
            <textarea rows={2} value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className={`${inp} resize-none`} placeholder="e.g. First milestone payment" />
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm disabled:opacity-60 flex items-center gap-2">
              {saving && <Loader2 size={14} className="animate-spin" />} Save Payment
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Payment">
        {editTarget && (
          <form className="space-y-4" onSubmit={handleUpdate}>
            <div className="bg-accent/50 rounded-xl p-3 text-sm space-y-1">
              <p><span className="text-gray-500">Client:</span> <strong>{editTarget.client?.user?.name || '—'}</strong></p>
              <p><span className="text-gray-500">Project:</span> <strong>{editTarget.project?.name || '—'}</strong></p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Total Amount (₹)</label>
                <input type="number" min="0" value={editForm.totalAmount}
                  onChange={e => setEditForm({ ...editForm, totalAmount: e.target.value })}
                  className={inp} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Advance Paid (₹)</label>
                <input type="number" min="0" value={editForm.advanceAmount}
                  onChange={e => setEditForm({ ...editForm, advanceAmount: e.target.value })}
                  className={inp} />
              </div>
            </div>
            <div className="bg-accent/50 rounded-xl p-3 text-sm flex justify-between">
              <span className="text-gray-500">Pending after update:</span>
              <span className="font-bold text-secondary">
                ₹{Math.max(0, Number(editForm.totalAmount) - Number(editForm.advanceAmount)).toLocaleString()}
              </span>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
              <textarea rows={2} value={editForm.notes}
                onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                className={`${inp} resize-none`} />
            </div>
            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button type="button" onClick={() => setEditTarget(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-secondary text-primary rounded-lg hover:bg-gray-800 shadow-sm disabled:opacity-60 flex items-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />} Update Payment
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default Financials;
