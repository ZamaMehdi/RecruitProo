"use client";
import React, { useEffect, useState } from "react";

const PAGE_SIZE = 10;

async function fetchApplications() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/admin/applications`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

async function updateStatus(id: string, status: string) {
  const res = await fetch(`/api/admin/applications/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json();
}

interface User {
  id: string;
  name?: string | null;
  email: string;
}

interface Job {
  id: string;
  title: string;
}

interface Answer {
  id: string;
  customQuestion: { question: string };
  answer: string;
}

interface ActionLog {
  id: string;
  action: string;
  timestamp: string;
}

interface Application {
  id: string;
  user: User;
  job: Job;
  status: string;
  resumeUrl?: string | null;
  createdAt: string;
  answers?: Answer[];
  actionLogs?: ActionLog[];
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filtered, setFiltered] = useState<Application[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [job, setJob] = useState("");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedData, setExpandedData] = useState<Application | null>(null);
  const [expandedLoading, setExpandedLoading] = useState(false);
  const [expandedError, setExpandedError] = useState("");

  useEffect(() => {
    fetchApplications()
      .then(data => {
        setApplications(data);
        setFiltered(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = applications;
    if (search.trim()) {
      filtered = filtered.filter(app =>
        app.job.title.toLowerCase().includes(search.toLowerCase()) ||
        app.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        app.user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status) {
      filtered = filtered.filter(app => app.status === status);
    }
    if (job) {
      filtered = filtered.filter(app => app.job.id === job);
    }
    setFiltered(filtered);
    setPage(1);
  }, [search, status, job, applications]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Unique jobs for filter
  const jobsMap = new Map();
  applications.forEach(a => {
    if (a.job && !jobsMap.has(a.job.id)) {
      jobsMap.set(a.job.id, { id: a.job.id, title: a.job.title });
    }
  });
  const jobs = Array.from(jobsMap.values());

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await updateStatus(id, newStatus);
      setApplications(applications =>
        applications.map(app =>
          app.id === id ? { ...app, status: newStatus } : app
        )
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const handleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedData(null);
      setExpandedError("");
      return;
    }
    setExpandedId(id);
    setExpandedLoading(true);
    setExpandedError("");
    try {
      const res = await fetch(`/api/admin/applications/${id}`);
      if (!res.ok) throw new Error("Failed to fetch application details");
      const data = await res.json();
      setExpandedData(data);
    } catch (err: any) {
      setExpandedError(err.message);
      setExpandedData(null);
    } finally {
      setExpandedLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">All Applications</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by job, applicant name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="ON_HOLD">On Hold</option>
        </select>
        <select
          value={job}
          onChange={e => setJob(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Jobs</option>
          {jobs.map(j => (
            <option key={j.id} value={j.id}>{j.title}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading applications...</div>
      ) : (
        <table className="w-full border text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3">Applicant</th>
              <th className="py-2 px-3">Email</th>
              <th className="py-2 px-3">Job</th>
              <th className="py-2 px-3">Status</th>
              <th className="py-2 px-3">Resume</th>
              <th className="py-2 px-3">Applied</th>
              <th className="py-2 px-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-center text-gray-500">No applications found.</td>
              </tr>
            )}
            {paginated.map(app => [
              <tr key={app.id} className="border-t cursor-pointer hover:bg-gray-50" onClick={() => handleExpand(app.id)}>
                <td className="py-2 px-3 font-medium">{app.user.name || "-"}</td>
                <td className="py-2 px-3">{app.user.email}</td>
                <td className="py-2 px-3">{app.job.title}</td>
                <td className="py-2 px-3">
                  <span className={
                    app.status === "ACCEPTED" ? "text-green-600" :
                    app.status === "REJECTED" ? "text-red-600" :
                    app.status === "ON_HOLD" ? "text-yellow-600" : "text-gray-800"
                  }>{app.status}</span>
                </td>
                <td className="py-2 px-3">
                  {app.resumeUrl ? <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline" onClick={e => e.stopPropagation()}>Resume</a> : "-"}
                </td>
                <td className="py-2 px-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-3">
                  <select
                    value={app.status}
                    onChange={e => { e.stopPropagation(); handleStatusChange(app.id, e.target.value); }}
                    disabled={updating === app.id}
                    className="border px-2 py-1 rounded"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="ACCEPTED">Accepted</option>
                    <option value="REJECTED">Rejected</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </td>
              </tr>,
              expandedId === app.id && expandedData && expandedData.id === app.id && (
                <tr key={app.id + "-expanded"}>
                  <td colSpan={7} className="bg-gray-50 px-6 py-4">
                    {expandedLoading && <div>Loading answers...</div>}
                    {expandedError && <div className="text-red-600">{expandedError}</div>}
                    {expandedData.answers && expandedData.answers.length > 0 ? (
                      <div>
                        <div className="font-semibold mb-2">Applicant Answers:</div>
                        <ul className="list-disc ml-6">
                          {expandedData.answers.map((ans) => (
                            <li key={ans.id} className="mb-1">
                              <span className="font-medium">{ans.customQuestion.question}:</span> {ans.answer || <span className="italic text-gray-500">No answer</span>}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : expandedData && <div className="italic text-gray-500">No answers submitted.</div>}
                    {expandedData.actionLogs && expandedData.actionLogs.length > 0 && (
                      <div className="mt-4">
                        <div className="font-semibold mb-2">Action Logs:</div>
                        <ul className="list-disc ml-6">
                          {expandedData.actionLogs.map((log) => (
                            <li key={log.id} className="mb-1">
                              <span className="font-medium">{log.action}</span> at {new Date(log.timestamp).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </td>
                </tr>
              )
            ])}
          </tbody>
        </table>
      )}
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex gap-2 mt-6 justify-center">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded ${p === page ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 