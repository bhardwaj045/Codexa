import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { submissionApi } from '../api/submissionApi';
import { StatusBadge } from '../components/Badge';
import { Copy, Check, X, Clock } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';

export const SubmissionsPage = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const res = await submissionApi.getMySubmissions();
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to load submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AppLayout title="My Submissions">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header & Counter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              My Submissions
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Track your coding attempts and judge evaluation outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-[#0D684D] text-xs font-bold">
              Total Submissions: {submissions.length}
            </span>
          </div>
        </div>

        {/* Submissions Table Card */}
        <div className="bg-white border border-slate-300 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-8 h-8 border-3 border-[#0D684D] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm">Loading submission records...</p>
            </div>
          ) : submissions.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="text-base font-semibold text-slate-700">No submissions recorded yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Select a problem from the catalog to submit your first solution.
              </p>
              <Link
                to="/problems"
                className="inline-block mt-4 px-4 py-2 rounded-xl bg-[#0D684D] hover:bg-[#0A543E] text-white text-xs font-semibold"
              >
                Go to Problems
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Problem Title</th>
                    <th className="py-4 px-6">Language</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Runtime</th>
                    <th className="py-4 px-6">Memory</th>
                    <th className="py-4 px-6">Submitted At</th>
                    <th className="py-4 px-6 text-right">Source Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {submissions.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-400">
                        #{sub.id}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-900">
                        <Link
                          to={`/problems/${sub.problemId}`}
                          className="hover:text-[#0D684D] transition-colors"
                        >
                          {sub.problemTitle || `Problem #${sub.problemId}`}
                        </Link>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-semibold">
                          {sub.programmingLanguage || sub.language || 'JAVA'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={sub.submissionStatus || sub.status} />
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {sub.executionTimeMs != null ? `${sub.executionTimeMs} ms` : '—'}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {sub.memoryUsedMb 
                          ? `${sub.memoryUsedMb.toFixed(1)} MB` 
                          : sub.memoryUsedKb 
                            ? `${(sub.memoryUsedKb / 1024).toFixed(1)} MB` 
                            : '—'}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : '—'} {sub.submittedAt ? new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedSubmission(sub)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          View Code
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* View Code Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-base font-bold text-slate-900">
                    Submission #{selectedSubmission.id} • {selectedSubmission.problemTitle || `Problem #${selectedSubmission.problemId}`}
                  </h3>
                  <StatusBadge status={selectedSubmission.submissionStatus || selectedSubmission.status} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyCode(selectedSubmission.sourceCode || '')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {copiedCode ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Code viewer */}
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto font-mono text-xs max-h-96 leading-relaxed">
                  {selectedSubmission.sourceCode || '// No source code recorded'}
                </pre>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                <span>Language: <b className="text-slate-800">{selectedSubmission.programmingLanguage || selectedSubmission.language || 'JAVA'}</b></span>
                <span>Execution Time: <b className="text-slate-800">{selectedSubmission.executionTimeMs || 0} ms</b></span>
                <button
                  onClick={() => setSelectedSubmission(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#0D684D] text-white font-semibold hover:bg-[#0A543E] transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};
