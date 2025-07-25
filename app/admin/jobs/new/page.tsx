"use client";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

type CustomQuestion = {
  question: string;
  type: string;
  required: boolean;
};

const defaultQuestion: CustomQuestion = { question: "", type: "TEXT", required: false };

export default function NewJobPage() {
  const [form, setForm] = useState<{
    title: string;
    department: string;
    location: string;
    salary: string;
    status: string;
    customQuestions: CustomQuestion[];
  }>({
    title: "",
    department: "",
    location: "",
    salary: "",
    status: "ACTIVE",
    customQuestions: [{ ...defaultQuestion }],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleQuestionChange = (idx: number, e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const updated = [...form.customQuestions];
    const name = e.target.name as keyof CustomQuestion;
    let value: string | boolean = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    // Type guard for assignment
    if (name === "question" || name === "type") {
      value = String(value);
    }
    if (name === "required") {
      value = Boolean(value);
    }
    updated[idx][name] = value as never;
    setForm({ ...form, customQuestions: updated });
  };

  const addQuestion = () => {
    setForm({ ...form, customQuestions: [ ...form.customQuestions, { ...defaultQuestion } ] });
  };

  const removeQuestion = (idx: number) => {
    setForm({ ...form, customQuestions: form.customQuestions.filter((_, i) => i !== idx) });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to post job");
      setSuccess("Job posted successfully!");
      setForm({
        title: "",
        department: "",
        location: "",
        salary: "",
        status: "ACTIVE",
        customQuestions: [{ ...defaultQuestion }],
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Post a New Job</h1>
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
        <div>
          <label className="block mb-2 font-medium">Custom Questions</label>
          {form.customQuestions.map((q, idx) => (
            <div key={idx} className="mb-4 p-3 border rounded bg-gray-50">
              <input
                type="text"
                name="question"
                value={q.question}
                onChange={e => handleQuestionChange(idx, e)}
                className="w-full border px-2 py-1 rounded mb-2"
                placeholder="Enter question"
                required
              />
              <div className="flex gap-2 items-center mb-2">
                <label>Type:</label>
                <select name="type" value={q.type} onChange={e => handleQuestionChange(idx, e)} className="border px-2 py-1 rounded">
                  <option value="TEXT">Text</option>
                  <option value="YESNO">Yes/No</option>
                  <option value="FILE">File Upload</option>
                  <option value="INTEGER">Integer Input</option>
                </select>
                <label className="ml-4 flex items-center">
                  <input type="checkbox" name="required" checked={q.required} onChange={e => handleQuestionChange(idx, e)} className="mr-1" />
                  Required
                </label>
                {form.customQuestions.length > 1 && (
                  <button type="button" onClick={() => removeQuestion(idx)} className="ml-auto text-red-600 hover:underline">Remove</button>
                )}
              </div>
            </div>
          ))}
          <button type="button" onClick={addQuestion} className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Question</button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? "Posting..." : "Post Job"}
        </button>
      </form>
    </div>
  );
} 