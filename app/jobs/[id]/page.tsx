"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

const CLOUDINARY_UPLOAD_PRESET = "recruitpro_unsigned";
const CLOUDINARY_CLOUD_NAME = "dbpanvj73";

interface CustomQuestion {
  id: string;
  question: string;
  type: string;
  required: boolean;
}

interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  salary?: string;
  status: string;
  customQuestions: CustomQuestion[];
}

interface FormState {
  [key: string]: string;
}

async function fetchJob(id: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`) ||
    "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/jobs`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  const jobs: Job[] = await res.json();
  return jobs.find((job) => job.id === id);
}

export default function JobDetailsPage() {
  const params = useParams();
  const jobId = Array.isArray(params.id) ? params.id[0] : params.id;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState<FormState>({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const [fileError, setFileError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!jobId) {
      setError("Job not found");
      setLoading(false);
      return;
    }
    fetchJob(jobId)
      .then((job) => setJob(job ?? null))
      .catch(() => setError("Job not found"))
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">Loading...</div>;
  if (error || !job) return <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">{error || "Job not found"}</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, qid: string) => {
    setFileError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setFileError("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFileError("File size must be 5MB or less.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setForm((prev) => ({ ...prev, [`file_${qid}`]: data.secure_url }));
      } else {
        setFileError("Failed to upload file.");
      }
    } catch (err) {
      setFileError("Failed to upload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    setSuccess("");
    // Check if any FILE question is required and not uploaded
    const missingFile = job.customQuestions.some((q) => q.type === "FILE" && q.required && !form[`file_${q.id}`]);
    if (missingFile) {
      setSubmitError("Please upload the required file(s).");
      return;
    }
    try {
      const answers = job.customQuestions.map((q) => ({
        customQuestionId: q.id,
        answer: q.type === "FILE" ? form[`file_${q.id}`] || "" : form[`q_${q.id}`] || "",
      }));
      // If there's a FILE question, set resumeUrl to the first file answer
      const fileQ = job.customQuestions.find((q) => q.type === "FILE");
      const resumeUrlToSend = fileQ ? form[`file_${fileQ.id}`] : undefined;
      const res = await fetch(`/api/jobs/${job.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, resumeUrl: resumeUrlToSend }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit application");
      setSuccess("Application submitted successfully!");
      setForm({});
    } catch (err) {
      setSubmitError((err as Error).message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-2">{job.title}</h1>
      <div className="mb-4 text-gray-600">
        <span className="mr-4">Department: {job.department}</span>
        <span className="mr-4">Location: {job.location}</span>
        <span>Salary: {job.salary || "-"}</span>
      </div>
      <div className="mb-6">
        <span className="inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
          {job.status}
        </span>
      </div>
      <h2 className="text-lg font-semibold mb-2">Apply for this job</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {job.customQuestions.map((q) => (
          <div key={q.id}>
            <label className="block mb-1 font-medium">
              {q.question} {q.required && <span className="text-red-600">*</span>}
            </label>
            {q.type === "TEXT" && (
              <input type="text" name={`q_${q.id}`} value={form[`q_${q.id}`] || ""} onChange={handleChange} className="w-full border px-3 py-2 rounded" required={q.required} />
            )}
            {q.type === "YESNO" && (
              <select
                name={`q_${q.id}`}
                value={form[`q_${q.id}`] || ""}
                onChange={e => setForm({ ...form, [`q_${q.id}`]: e.target.value })}
                className="w-full border px-3 py-2 rounded"
                required={q.required}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            )}
            {q.type === "INTEGER" && (
              <input
                type="number"
                name={`q_${q.id}`}
                value={form[`q_${q.id}`] || ""}
                onChange={e => {
                  const val = e.target.value;
                  if (val === "" || (!isNaN(Number(val)) && Number(val) >= 0)) {
                    setForm({ ...form, [`q_${q.id}`]: val });
                  }
                }}
                className="w-full border px-3 py-2 rounded"
                min={0}
                required={q.required}
              />
            )}
            {q.type === "FILE" && (
              <div>
                <input
                  type="file"
                  name={`file_${q.id}`}
                  accept="application/pdf"
                  className="w-full"
                  required={q.required}
                  onChange={e => handleFileChange(e, q.id)}
                  disabled={uploading}
                />
                {form[`file_${q.id}`] && (
                  <a href={form[`file_${q.id}`]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">View uploaded file</a>
                )}
              </div>
            )}
          </div>
        ))}
        {fileError && <div className="text-red-600 text-sm">{fileError}</div>}
        {submitError && <div className="text-red-600 text-sm">{submitError}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={uploading}>
          {uploading ? "Uploading..." : "Submit Application"}
        </button>
      </form>
    </div>
  );
} 