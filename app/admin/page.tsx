'use client';

/**
 * Admin Lead Dashboard
 * Protected by password. Shows all B2B enquiries with status management.
 */

import { useState, useEffect, useCallback } from 'react';
import type { LeadRow } from '@/lib/supabase';

const STATUS_OPTIONS = ['New', 'Contacted', 'Qualified', 'Quoted', 'Converted', 'Closed'];
const STATUS_COLORS: Record<string, string> = {
  New: 'bg-blue-500/20 text-blue-300',
  Contacted: 'bg-yellow-500/20 text-yellow-300',
  Qualified: 'bg-green-500/20 text-green-300',
  Quoted: 'bg-purple-500/20 text-purple-300',
  Converted: 'bg-emerald-500/20 text-emerald-300',
  Closed: 'bg-gray-500/20 text-gray-400',
};

export default function AdminDashboard() {
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/leads', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setAuthenticated(false);
        setError('Invalid password');
        return;
      }
      const data = await res.json();
      if (data.leads) setLeads(data.leads);
    } catch {
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [password]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthenticated(true);
  };

  useEffect(() => {
    if (authenticated) fetchLeads();
  }, [authenticated, fetchLeads]);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({ status }),
      });
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
      if (selectedLead?.id === id) setSelectedLead({ ...selectedLead, status });
    } catch {
      setError('Failed to update status');
    }
  };

  // Login screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <h1 className="font-sora text-2xl text-ivory text-center">Admin Dashboard</h1>
          <p className="text-ivory/60 text-sm text-center">Enter password to access leads</p>
          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 bg-obsidian border border-ivory/20 rounded-lg text-ivory focus:border-champagne-gold focus:outline-none"
            required
          />
          <button
            type="submit"
            className="w-full px-4 py-3 bg-champagne-gold text-obsidian font-sora font-semibold rounded-lg hover:bg-champagne-gold/90"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  // Lead detail modal
  if (selectedLead) {
    return (
      <div className="min-h-screen bg-obsidian pt-20 px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setSelectedLead(null)}
            className="min-h-[44px] flex items-center gap-2 mb-6 px-4 py-2 bg-forest-green/40 border border-ivory/15 rounded-lg text-ivory hover:text-champagne-gold hover:border-champagne-gold/40 transition-colors duration-200 font-inter text-[15px] font-medium cursor-pointer"
          >
            <span aria-hidden="true">←</span>
            <span>Back to Leads</span>
          </button>
          <div className="bg-forest-green/30 border border-ivory/10 rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="font-sora text-xl text-ivory">{selectedLead.name}</h2>
              <select
                value={selectedLead.status}
                onChange={(e) => updateStatus(selectedLead.id, e.target.value)}
                className="bg-obsidian border border-ivory/20 text-ivory text-sm rounded-lg px-3 py-1.5"
              >
                {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 tablet:grid-cols-2 gap-4 text-sm">
              <div><span className="text-ivory/50">Company:</span><p className="text-ivory">{selectedLead.company}</p></div>
              <div><span className="text-ivory/50">Email:</span><p className="text-ivory">{selectedLead.email}</p></div>
              <div><span className="text-ivory/50">Country:</span><p className="text-ivory">{selectedLead.country}</p></div>
              <div><span className="text-ivory/50">WhatsApp:</span><p className="text-ivory">{selectedLead.whatsapp || '—'}</p></div>
              <div><span className="text-ivory/50">Product Interest:</span><p className="text-ivory">{selectedLead.product_interest}</p></div>
              <div><span className="text-ivory/50">Quantity:</span><p className="text-ivory">{selectedLead.quantity || '—'}</p></div>
              <div className="tablet:col-span-2"><span className="text-ivory/50">Customization:</span><p className="text-ivory">{selectedLead.customization_requirements || '—'}</p></div>
              <div><span className="text-ivory/50">Submitted:</span><p className="text-ivory">{new Date(selectedLead.created_at).toLocaleString()}</p></div>
            </div>
            {/* Quick actions */}
            <div className="flex gap-3 pt-4 border-t border-ivory/10">
              <a
                href={`mailto:${selectedLead.email}`}
                className="px-4 py-2 bg-forest-green border border-ivory/20 text-ivory text-sm rounded-lg hover:border-champagne-gold"
              >
                Email Customer
              </a>
              {selectedLead.whatsapp && (
                <a
                  href={`https://wa.me/${selectedLead.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-forest-green border border-ivory/20 text-ivory text-sm rounded-lg hover:border-champagne-gold"
                >
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => updateStatus(selectedLead.id, 'Contacted')}
                className="px-4 py-2 bg-champagne-gold/20 text-champagne-gold text-sm rounded-lg hover:bg-champagne-gold/30"
              >
                Mark as Contacted
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Leads table
  return (
    <div className="min-h-screen bg-obsidian p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="font-sora text-2xl text-ivory">Leads Dashboard</h1>
          <button onClick={fetchLeads} className="text-ivory/60 hover:text-ivory text-sm">
            Refresh
          </button>
        </div>

        {loading && <p className="text-ivory/60 text-center">Loading...</p>}
        {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-ivory/50 border-b border-ivory/10">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="border-b border-ivory/5 hover:bg-forest-green/20 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-ivory/70">{new Date(lead.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-ivory">{lead.name}</td>
                  <td className="px-4 py-3 text-ivory">{lead.company}</td>
                  <td className="px-4 py-3 text-ivory/70">{lead.country}</td>
                  <td className="px-4 py-3 text-ivory/70">{lead.product_interest}</td>
                  <td className="px-4 py-3 text-ivory/70">{lead.quantity || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLORS[lead.status] || ''}`}>
                      {lead.status}
                    </span>
                  </td>
                </tr>
              ))}
              {leads.length === 0 && !loading && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-ivory/40">No leads yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
