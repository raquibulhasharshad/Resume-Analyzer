import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { History as HistoryIcon, Trash2, Eye, Calendar, FileText, Search, RefreshCw, FileSearch, AlertTriangle, X } from 'lucide-react';
import { getHistoryApi, getAnalysisByIdApi, deleteAnalysisApi } from '../services/api';
import Toast from '../components/Toast';
import { formatLocalDateTime } from '../utils/dateFormatter';

export default function History() {
  const navigate = useNavigate();
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'error' });

  // Delete Modal State
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getHistoryApi();
      setHistoryList(data);
    } catch (err) {
      setToast({ message: 'Failed to load analysis history from server.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetails = async (id) => {
    try {
      const detail = await getAnalysisByIdApi(id);
      navigate('/results', { state: { analysisResult: detail } });
    } catch (err) {
      setToast({ message: 'Failed to load analysis record details.', type: 'error' });
    }
  };

  const openDeleteModal = (item, e) => {
    e.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);

    try {
      await deleteAnalysisApi(itemToDelete.id);
      setToast({ message: 'Analysis record deleted successfully.', type: 'success' });
      setHistoryList(historyList.filter(item => item.id !== itemToDelete.id));
      setItemToDelete(null);
    } catch (err) {
      setToast({ message: 'Failed to delete record.', type: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  const filteredList = historyList.filter(item =>
    item.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.resume_filename?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {toast.message && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'error' })} />
      )}

      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <HistoryIcon className="w-8 h-8 text-indigo-400" />
            <span>Analysis History Database</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Review past resume vs. job description match evaluations stored in PostgreSQL
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search history..."
              className="bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 w-48 sm:w-64"
            />
          </div>

          <button
            onClick={fetchHistory}
            className="p-2.5 rounded-xl glass-panel border border-gray-800 text-gray-400 hover:text-white transition-colors"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* HISTORY TABLE CONTAINER */}
      <div className="glass-panel rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 space-y-4">
            <div className="h-12 bg-gray-900/50 rounded-xl shimmer-loader" />
            <div className="h-12 bg-gray-900/50 rounded-xl shimmer-loader" />
            <div className="h-12 bg-gray-900/50 rounded-xl shimmer-loader" />
          </div>
        ) : filteredList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/80 border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Resume File</th>
                  <th className="py-4 px-6">Target Job Title</th>
                  <th className="py-4 px-6">Match Score</th>
                  <th className="py-4 px-6">Date Analyzed</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60 text-sm">
                {filteredList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleViewDetails(item.id)}
                    className="hover:bg-gray-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-6 font-mono text-xs text-gray-400">#{item.id}</td>
                    <td className="py-4 px-6 font-medium text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="truncate max-w-xs">{item.resume_filename}</span>
                    </td>
                    <td className="py-4 px-6 text-gray-200 font-medium">
                      {item.job_title}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                          item.match_score >= 80
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : item.match_score >= 60
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : item.match_score >= 40
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {item.match_score}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {formatLocalDateTime(item.created_at)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewDetails(item.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Analysis
                        </button>
                        <button
                          onClick={(e) => openDeleteModal(item, e)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 px-4 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-900 text-gray-400 border border-gray-800 mx-auto flex items-center justify-center">
              <HistoryIcon className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-white">No History Records Found</p>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Run your first resume match analysis to store reports in the PostgreSQL database.
            </p>
            <Link
              to="/analyze"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-600/20"
            >
              <FileSearch className="w-4 h-4" />
              <span>Start Analysis</span>
            </Link>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in zoom-in-95">
            <button
              onClick={() => setItemToDelete(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete Analysis History?</h3>
                <p className="text-xs text-gray-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 mb-6 bg-gray-950/60 p-3.5 rounded-xl border border-gray-800/80 leading-relaxed">
              Are you sure you want to delete the report for <strong className="text-white">{itemToDelete.job_title}</strong> (<span className="text-indigo-300 font-mono text-xs">{itemToDelete.resume_filename}</span>)?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Deleting...' : 'Delete Record'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
