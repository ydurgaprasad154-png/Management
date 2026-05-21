import { useState, useEffect } from 'react';
import { Download, Loader2, CheckCircle2, AlertCircle, TrendingUp, Wallet } from 'lucide-react';
import api from '../utils/api';

const STATUS_COLORS = {
  Completed: 'bg-green-100 text-green-700',
  Partial:   'bg-blue-100 text-blue-700',
  Pending:   'bg-amber-100 text-amber-700',
  Failed:    'bg-red-100 text-red-700',
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/payments');
        setPayments(data);
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Summary calculations using new schema fields
  const totalBilled  = payments.reduce((s, p) => s + (p.totalAmount   || 0), 0);
  const totalPaid    = payments.reduce((s, p) => s + (p.advanceAmount  || 0), 0);
  const totalPending = payments.filter(p => !p.fullyPaid).reduce((s, p) => s + (p.pendingAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary">Payments & Invoices</h1>
        <p className="text-sm text-gray-500 mt-1">View your billing history and payment status.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Wallet size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Billed</p>
            <h3 className="text-xl font-bold text-secondary">₹{totalBilled.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Total Paid</p>
            <h3 className="text-xl font-bold text-secondary">₹{totalPaid.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-primary p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><AlertCircle size={22} /></div>
          <div>
            <p className="text-xs font-medium text-gray-500">Pending Balance</p>
            <h3 className="text-xl font-bold text-secondary">₹{totalPending.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-primary rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-bold text-secondary">Billing History</h3>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center p-12 text-gray-400">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Wallet size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No payment records yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-accent/50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="p-4 font-medium">Project</th>
                  <th className="p-4 font-medium">Total Amount</th>
                  <th className="p-4 font-medium">Advance Paid</th>
                  <th className="p-4 font-medium">Pending</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {payments.map(payment => (
                  <tr key={payment._id} className="hover:bg-accent/30 transition-colors">
                    <td className="p-4">
                      <p className="font-semibold text-secondary">{payment.project?.name || '—'}</p>
                      {payment.notes && <p className="text-xs text-gray-400 mt-0.5">{payment.notes}</p>}
                    </td>
                    <td className="p-4 font-bold text-secondary">₹{(payment.totalAmount || 0).toLocaleString()}</td>
                    <td className="p-4 text-green-700 font-medium">₹{(payment.advanceAmount || 0).toLocaleString()}</td>
                    <td className="p-4">
                      {payment.fullyPaid ? (
                        <span className="text-green-600 font-semibold text-xs flex items-center gap-1">
                          <CheckCircle2 size={13} /> Fully Paid
                        </span>
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
                    <td className="p-4 text-right">
                      {payment.invoiceUrl ? (
                        <a href={payment.invoiceUrl} target="_blank" rel="noreferrer"
                          className="inline-flex p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Download Invoice">
                          <Download size={16} />
                        </a>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payments;
