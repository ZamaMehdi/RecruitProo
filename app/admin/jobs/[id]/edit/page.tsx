"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const [form, setForm] = useState({
    title: "",
    department: "",
    location: "",
    salary: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);
    fetch(`/api/admin/jobs/${jobId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setForm({
          title: data.title || "",
          department: data.department || "",
          location: data.location || "",
          salary: data.salary || "",
          status: data.status || "ACTIVE",
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [jobId]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update job");
      setSuccess("Job updated successfully!");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Edit Job</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Title</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Department</label>
          <input type="text" name="department" value={form.department} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Location</label>
          <input type="text" name="location" value={form.location} onChange={handleChange} className="w-full border px-3 py-2 rounded" required />
        </div>
        <div>
          <label className="block mb-1 font-medium">Salary</label>
          <input type="text" name="salary" value={form.salary} onChange={handleChange} className="w-full border px-3 py-2 rounded" />
        </div>
        <div>
          <label className="block mb-1 font-medium">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="w-full border px-3 py-2 rounded">
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition">
          Save Changes
        </button>
      </form>
    </div>
  );
} 