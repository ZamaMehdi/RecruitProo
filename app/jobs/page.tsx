"use client";
import React, { useState, useEffect } from "react";

async function fetchJobs() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/jobs`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs()
      .then(data => {
        setJobs(data);
        setFilteredJobs(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = jobs;
    if (search.trim()) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (department) {
      filtered = filtered.filter(job => job.department === department);
    }
    if (location) {
      filtered = filtered.filter(job => job.location === location);
    }
    setFilteredJobs(filtered);
  }, [search, department, location, jobs]);

  // Get unique departments and locations for filters
  const departments = Array.from(new Set(jobs.map(j => j.department))).filter(Boolean);
  const locations = Array.from(new Set(jobs.map(j => j.location))).filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Job Listings</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        />
        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Departments</option>
          {departments.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        <select
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Locations</option>
          {locations.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <button
          onClick={() => {
            setSearch("");
            setDepartment("");
            setLocation("");
          }}
          className="bg-gray-200 text-gray-800 px-3 py-2 rounded font-semibold"
        >
          Reset
        </button>
      </div>
      {loading ? (
        <div className="text-gray-500">Loading jobs...</div>
      ) : (
        <table className="w-full border text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-3">Title</th>
              <th className="py-2 px-3">Department</th>
              <th className="py-2 px-3">Location</th>
              <th className="py-2 px-3">Salary</th>
              <th className="py-2 px-3">Posted</th>
              <th className="py-2 px-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-500">No jobs found.</td>
              </tr>
            )}
            {filteredJobs.map(job => (
              <tr key={job.id} className="border-t">
                <td className="py-2 px-3 font-medium">{job.title}</td>
                <td className="py-2 px-3">{job.department}</td>
                <td className="py-2 px-3">{job.location}</td>
                <td className="py-2 px-3">{job.salary || "-"}</td>
                <td className="py-2 px-3">{new Date(job.createdAt).toLocaleDateString()}</td>
                <td className="py-2 px-3">
                  <a href={`/jobs/${job.id}`} className="text-blue-600 hover:underline">View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 