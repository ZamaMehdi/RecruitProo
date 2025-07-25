"use client";
import { useState } from "react";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 60 }, (_, i) => `${currentYear - i}`);
const endYears = Array.from({ length: 2030 - 1960 + 1 }, (_, i) => `${1960 + i}`);

const emptyEducation = {
  school: "",
  degree: "",
  fieldOfStudy: "",
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: ""
};
const emptyWork = {
  title: "",
  employmentType: "Full-time",
  company: "",
  isCurrent: true,
  startMonth: "",
  startYear: "",
  endMonth: "",
  endYear: "",
  description: ""
};
const employmentTypes = [
  "Full-time", "Part-time", "Internship", "Contract", "Freelance", "Temporary", "Other"
];

interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

interface WorkExperience {
  title: string;
  employmentType: string;
  company: string;
  isCurrent: boolean;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description: string;
}

interface Profile {
  id: string;
  name?: string;
  email: string;
  education: Education[];
  workExperience: WorkExperience[];
  phone?: string;
  github?: string;
  portfolio?: string;
}

export default function EditProfileForm({ profile }: { profile: Profile }) {
  // Move all useState hooks to the top
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || "",
    education: Array.isArray(profile?.education) ? profile.education as Education[] : [],
    workExperience: Array.isArray(profile?.workExperience) ? profile.workExperience as WorkExperience[] : [],
    phone: profile?.phone || "",
    github: profile?.github || "",
    portfolio: profile?.portfolio || "",
  });
  const [showEduForm, setShowEduForm] = useState(false);
  const [eduDraft, setEduDraft] = useState({ ...emptyEducation });
  const [showWorkForm, setShowWorkForm] = useState(false);
  const [workDraft, setWorkDraft] = useState({ ...emptyWork });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [eduError, setEduError] = useState("");
  const [workError, setWorkError] = useState("");
  const [editingEduIdx, setEditingEduIdx] = useState<number | null>(null);
  const [eduEditDraft, setEduEditDraft] = useState<typeof emptyEducation | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState<string>("");
  const [editingWorkIdx, setEditingWorkIdx] = useState<number | null>(null);
  const [workEditDraft, setWorkEditDraft] = useState<typeof emptyWork | null>(null);
  const [linkError, setLinkError] = useState("");

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  const validateEducation = (ed: typeof emptyEducation) => {
    return (
      ed.school.trim() &&
      ed.degree.trim() &&
      ed.fieldOfStudy.trim() &&
      ed.startMonth &&
      ed.startYear &&
      ed.endMonth &&
      ed.endYear
    );
  };

  const handleEduDraftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEduDraft({ ...eduDraft, [e.target.name]: e.target.value });
  };
  const saveEducation = () => {
    if (!validateEducation(eduDraft)) {
      setEduError("Please fill all required fields.");
      return;
    }
    setForm({ ...form, education: [...form.education, { ...eduDraft }] });
    setEduDraft({ ...emptyEducation });
    setShowEduForm(false);
    setEduError("");
  };
  const removeEducation = (idx: number) => setForm({ ...form, education: form.education.filter((_: Education, i: number) => i !== idx) });

  const startEditEducation = (idx: number) => {
    setEditingEduIdx(idx);
    setEduEditDraft({ ...form.education[idx] });
  };
  const cancelEditEducation = () => {
    setEditingEduIdx(null);
    setEduEditDraft(null);
    setEduError("");
  };
  const saveEditEducation = () => {
    if (!eduEditDraft || !validateEducation(eduEditDraft)) {
      setEduError("Please fill all required fields.");
      return;
    }
    const updated = form.education.map((ed: Education, i: number) => i === editingEduIdx ? { ...eduEditDraft } : ed);
    setForm({ ...form, education: updated });
    setEditingEduIdx(null);
    setEduEditDraft(null);
    setEduError("");
  };

  // Work experience handlers
  const handleWorkDraftChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let fieldValue: string | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      fieldValue = (e.target as HTMLInputElement).checked;
    }
    setWorkDraft({ ...workDraft, [name]: fieldValue });
  };
  const validateWork = (w: typeof emptyWork) => {
    return (
      w.title.trim() &&
      w.employmentType.trim() &&
      w.company.trim() &&
      w.startMonth &&
      w.startYear &&
      (w.isCurrent || (w.endMonth && w.endYear))
    );
  };

  const saveWork = () => {
    if (!validateWork(workDraft)) {
      setWorkError("Please fill all required fields.");
      return;
    }
    setForm({ ...form, workExperience: [...form.workExperience, { ...workDraft }] });
    setWorkDraft({ ...emptyWork });
    setShowWorkForm(false);
    setWorkError("");
  };
  const removeWork = (idx: number) => setForm({ ...form, workExperience: form.workExperience.filter((_: WorkExperience, i: number) => i !== idx) });

  const startEditField = (field: string) => {
    setEditingField(field);
    setFieldDraft((form as any)[field]);
  };
  const cancelEditField = () => {
    setEditingField(null);
    setFieldDraft("");
  };
  const saveEditField = () => {
    if (editingField === "github" || editingField === "portfolio") {
      try {
        const url = new URL(fieldDraft);
        if (!(url.protocol === "http:" || url.protocol === "https:")) throw new Error();
      } catch {
        setLinkError("Please enter a valid URL starting with http:// or https://");
        return;
      }
      setLinkError("");
    }
    setForm({ ...form, [editingField!]: fieldDraft });
    setEditingField(null);
    setFieldDraft("");
  };

  const startEditWork = (idx: number) => {
    setEditingWorkIdx(idx);
    setWorkEditDraft({ ...form.workExperience[idx] });
  };
  const cancelEditWork = () => {
    setEditingWorkIdx(null);
    setWorkEditDraft(null);
    setWorkError("");
  };
  const saveEditWork = () => {
    if (!workEditDraft || !validateWork(workEditDraft)) {
      setWorkError("Please fill all required fields.");
      return;
    }
    const updated = form.workExperience.map((w: WorkExperience, i: number) => i === editingWorkIdx ? { ...workEditDraft } : w);
    setForm({ ...form, workExperience: updated });
    setEditingWorkIdx(null);
    setWorkEditDraft(null);
    setWorkError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <div className="mb-8">
        <button onClick={() => setEditing(true)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition">Edit Profile</button>
        <div className="mt-4 space-y-1 text-sm">
          <div><b>Name:</b> {form.name}</div>
          <div><b>Email:</b> {profile.email}</div>
          <div><b>Education:</b>
            {form.education.length === 0 && <div className="ml-2 text-gray-500">No education added.</div>}
            {form.education.map((ed: Education, idx: number) => (
              <div key={idx} className="ml-2 p-2 border rounded mb-2 bg-white relative">
                {editing ? (
                  editingEduIdx === idx ? (
                    <div>
                      <input type="text" name="school" value={eduEditDraft?.school || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, school: e.target.value })} placeholder="School*" className="w-full border px-2 py-1 rounded mb-1" />
                      <input type="text" name="degree" value={eduEditDraft?.degree || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, degree: e.target.value })} placeholder="Degree*" className="w-full border px-2 py-1 rounded mb-1" />
                      <input type="text" name="fieldOfStudy" value={eduEditDraft?.fieldOfStudy || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, fieldOfStudy: e.target.value })} placeholder="Field of study*" className="w-full border px-2 py-1 rounded mb-1" />
                      <div className="flex gap-2 mb-1">
                        <select name="startMonth" value={eduEditDraft?.startMonth || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, startMonth: e.target.value })} className="border px-2 py-1 rounded" required>
                          <option value="">Start Month</option>
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select name="startYear" value={eduEditDraft?.startYear || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, startYear: e.target.value })} className="border px-2 py-1 rounded" required>
                          <option value="">Year</option>
                          {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 mb-1">
                        <select name="endMonth" value={eduEditDraft?.endMonth || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, endMonth: e.target.value })} className="border px-2 py-1 rounded" required>
                          <option value="">End Month</option>
                          {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select name="endYear" value={eduEditDraft?.endYear || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, endYear: e.target.value })} className="border px-2 py-1 rounded" required>
                          <option value="">Year</option>
                          {endYears.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                      </div>
                      {eduError && <div className="text-red-600 text-sm mb-2">{eduError}</div>}
                      <div className="flex gap-2 mt-2">
                        <button type="button" onClick={saveEditEducation} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition">Save</button>
                        <button type="button" onClick={cancelEditEducation} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold hover:bg-gray-300 transition">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="font-bold">{ed.school}</div>
                      <div>{ed.degree}{ed.fieldOfStudy && `, ${ed.fieldOfStudy}`}</div>
                      <div className="text-gray-600 text-xs">{ed.startMonth} {ed.startYear} - {ed.endMonth} {ed.endYear}</div>
                      <button type="button" onClick={() => startEditEducation(idx)} className="absolute top-2 right-16 text-blue-600">Edit</button>
                      <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-red-600">Remove</button>
                    </>
                  )
                ) : (
                  <>
                    <div className="font-bold">{ed.school}</div>
                    <div>{ed.degree}{ed.fieldOfStudy && `, ${ed.fieldOfStudy}`}</div>
                    <div className="text-gray-600 text-xs">{ed.startMonth} {ed.startYear} - {ed.endMonth} {ed.endYear}</div>
                  </>
                )}
              </div>
            ))}
          </div>
          <div><b>Work Experience:</b>
            {form.workExperience.length === 0 && <div className="ml-2 text-gray-500">No work experience added.</div>}
            {form.workExperience.map((w: WorkExperience, i: number) => (
              <div key={i} className="ml-2 p-2 border rounded mb-2 bg-white">
                <div className="font-bold">{w.title}</div>
                <div>{w.company}</div>
                <div className="text-gray-600 text-xs">
                  {w.startMonth} {w.startYear} – {w.isCurrent ? "Present" : `${w.endMonth} ${w.endYear}`}
                </div>
                {w.description && <div className="text-xs mt-1">{w.description.split("\n").map((line: string, idx: number) => <div key={idx}>• {line}</div>)}</div>}
              </div>
            ))}
          </div>
          <div><b>Phone:</b> {form.phone}</div>
          <div><b>GitHub:</b> {form.github ? <a href={form.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{form.github}</a> : "No link"}</div>
          <div><b>Portfolio:</b> {form.portfolio ? <a href={form.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{form.portfolio}</a> : "No link"}</div>
        </div>
        {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 space-y-3 bg-gray-50 p-4 rounded">
      <div className="font-semibold mb-2">Edit Profile</div>
      <div>
        <label className="block mb-1">Name</label>
        {editingField === "name" ? (
          <div className="flex gap-2 items-center">
            <input type="text" name="name" value={fieldDraft} onChange={e => setFieldDraft(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <button type="button" onClick={saveEditField} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Save</button>
            <button type="button" onClick={cancelEditField} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <span>{form.name}</span>
            <button type="button" onClick={() => startEditField("name") } className="text-blue-600">Edit</button>
          </div>
        )}
      </div>
      <div className="mb-2">
        <label className="block mb-1">Email</label>
        <div className="w-full border px-3 py-2 rounded bg-gray-100 text-gray-600">{profile.email}</div>
      </div>
      <div>
        <label className="block mb-1">Education</label>
        {form.education.map((ed: Education, idx: number) => (
          <div key={idx} className="mb-2 flex flex-col gap-1 border rounded p-2 bg-white relative">
            {editingEduIdx === idx ? (
              <div>
                <input type="text" name="school" value={eduEditDraft?.school || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, school: e.target.value })} placeholder="School*" className="w-full border px-2 py-1 rounded mb-1" />
                <input type="text" name="degree" value={eduEditDraft?.degree || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, degree: e.target.value })} placeholder="Degree*" className="w-full border px-2 py-1 rounded mb-1" />
                <input type="text" name="fieldOfStudy" value={eduEditDraft?.fieldOfStudy || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, fieldOfStudy: e.target.value })} placeholder="Field of study*" className="w-full border px-2 py-1 rounded mb-1" />
                <div className="flex gap-2 mb-1">
                  <select name="startMonth" value={eduEditDraft?.startMonth || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, startMonth: e.target.value })} className="border px-2 py-1 rounded" required>
                    <option value="">Start Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select name="startYear" value={eduEditDraft?.startYear || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, startYear: e.target.value })} className="border px-2 py-1 rounded" required>
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div className="flex gap-2 mb-1">
                  <select name="endMonth" value={eduEditDraft?.endMonth || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, endMonth: e.target.value })} className="border px-2 py-1 rounded" required>
                    <option value="">End Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select name="endYear" value={eduEditDraft?.endYear || ""} onChange={e => setEduEditDraft({ ...eduEditDraft!, endYear: e.target.value })} className="border px-2 py-1 rounded" required>
                    <option value="">Year</option>
                    {endYears.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {eduError && <div className="text-red-600 text-sm mb-2">{eduError}</div>}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={saveEditEducation} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition">Save</button>
                  <button type="button" onClick={cancelEditEducation} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold hover:bg-gray-300 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-bold">{ed.school}</div>
                <div>{ed.degree}{ed.fieldOfStudy && `, ${ed.fieldOfStudy}`}</div>
                <div className="text-gray-600 text-xs">{ed.startMonth} {ed.startYear} - {ed.endMonth} {ed.endYear}</div>
                <button type="button" onClick={() => startEditEducation(idx)} className="absolute top-2 right-16 text-blue-600">Edit</button>
                <button type="button" onClick={() => removeEducation(idx)} className="absolute top-2 right-2 text-red-600">Remove</button>
              </>
            )}
          </div>
        ))}
        {showEduForm ? (
          <div className="mb-2 p-2 border rounded bg-gray-50">
            <input type="text" name="school" value={eduDraft.school} onChange={handleEduDraftChange} placeholder="School*" className="w-full border px-2 py-1 rounded mb-1" />
            <input type="text" name="degree" value={eduDraft.degree} onChange={handleEduDraftChange} placeholder="Degree*" className="w-full border px-2 py-1 rounded mb-1" />
            <input type="text" name="fieldOfStudy" value={eduDraft.fieldOfStudy} onChange={handleEduDraftChange} placeholder="Field of study*" className="w-full border px-2 py-1 rounded mb-1" />
            <div className="flex gap-2 mb-1">
              <select name="startMonth" value={eduDraft.startMonth} onChange={handleEduDraftChange} className="border px-2 py-1 rounded" required>
                <option value="">Start Month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="startYear" value={eduDraft.startYear} onChange={handleEduDraftChange} className="border px-2 py-1 rounded" required>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mb-1">
              <select name="endMonth" value={eduDraft.endMonth} onChange={handleEduDraftChange} className="border px-2 py-1 rounded" required>
                <option value="">End Month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="endYear" value={eduDraft.endYear} onChange={handleEduDraftChange} className="border px-2 py-1 rounded" required>
                <option value="">Year</option>
                {endYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {eduError && <div className="text-red-600 text-sm mb-2">{eduError}</div>}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={saveEducation} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition">Save</button>
              <button type="button" onClick={() => setShowEduForm(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowEduForm(true)} className="text-blue-600 text-xl mt-2">+ Add Education</button>
        )}
      </div>
      <div>
        <label className="block mb-1">Work Experience</label>
        {form.workExperience.map((w: WorkExperience, idx: number) => (
          <div key={idx} className="mb-2 flex flex-col gap-1 border rounded p-2 bg-white relative">
            {editingWorkIdx === idx ? (
              <div>
                <input type="text" name="title" value={workEditDraft?.title || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, title: e.target.value })} placeholder="Title*" className="w-full border px-2 py-1 rounded mb-1" />
                <select name="employmentType" value={workEditDraft?.employmentType || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, employmentType: e.target.value })} className="w-full border px-2 py-1 rounded mb-1" required>
                  {employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <input type="text" name="company" value={workEditDraft?.company || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, company: e.target.value })} placeholder="Company or organization*" className="w-full border px-2 py-1 rounded mb-1" />
                <label className="flex items-center gap-2 mb-1">
                  <input type="checkbox" name="isCurrent" checked={workEditDraft?.isCurrent || false} onChange={e => setWorkEditDraft({ ...workEditDraft!, isCurrent: e.target.checked })} />
                  I am currently working in this role
                </label>
                <div className="flex gap-2 mb-1">
                  <select name="startMonth" value={workEditDraft?.startMonth || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, startMonth: e.target.value })} className="border px-2 py-1 rounded" required>
                    <option value="">Month</option>
                    {months.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <select name="startYear" value={workEditDraft?.startYear || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, startYear: e.target.value })} className="border px-2 py-1 rounded" required>
                    <option value="">Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                {!workEditDraft?.isCurrent && (
                  <div className="flex gap-2 mb-1">
                    <select name="endMonth" value={workEditDraft?.endMonth || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, endMonth: e.target.value })} className="border px-2 py-1 rounded" required>
                      <option value="">Month</option>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select name="endYear" value={workEditDraft?.endYear || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, endYear: e.target.value })} className="border px-2 py-1 rounded" required>
                      <option value="">Year</option>
                      {endYears.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                )}
                <textarea name="description" value={workEditDraft?.description || ""} onChange={e => setWorkEditDraft({ ...workEditDraft!, description: e.target.value })} placeholder="Description (bullet points, one per line)" className="w-full border px-2 py-1 rounded mb-1" />
                {workError && <div className="text-red-600 text-sm mb-2">{workError}</div>}
                <div className="flex gap-2 mt-2">
                  <button type="button" onClick={saveEditWork} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition">Save</button>
                  <button type="button" onClick={cancelEditWork} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold hover:bg-gray-300 transition">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="font-bold">{w.title}</div>
                <div>{w.company} · {w.employmentType}</div>
                <div className="text-gray-600 text-xs">
                  {w.startMonth} {w.startYear} - {w.isCurrent ? "Present" : `${w.endMonth} ${w.endYear}`}
                </div>
                {w.description && <div className="text-xs mt-1">{w.description.split("\n").map((line: string, i: number) => <div key={i}>• {line}</div>)}</div>}
                <button type="button" onClick={() => startEditWork(idx)} className="absolute top-2 right-16 text-blue-600">Edit</button>
                <button type="button" onClick={() => removeWork(idx)} className="absolute top-2 right-2 text-red-600">Remove</button>
              </>
            )}
          </div>
        ))}
        {showWorkForm ? (
          <div className="mb-2 p-2 border rounded bg-gray-50">
            <input type="text" name="title" value={workDraft.title} onChange={handleWorkDraftChange} placeholder="Title*" className="w-full border px-2 py-1 rounded mb-1" />
            <select name="employmentType" value={workDraft.employmentType} onChange={handleWorkDraftChange} className="w-full border px-2 py-1 rounded mb-1" required>
              {employmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input type="text" name="company" value={workDraft.company} onChange={handleWorkDraftChange} placeholder="Company or organization*" className="w-full border px-2 py-1 rounded mb-1" />
            <label className="flex items-center gap-2 mb-1">
              <input type="checkbox" name="isCurrent" checked={workDraft.isCurrent} onChange={handleWorkDraftChange} />
              I am currently working in this role
            </label>
            <div className="flex gap-2 mb-1">
              <select name="startMonth" value={workDraft.startMonth} onChange={handleWorkDraftChange} className="border px-2 py-1 rounded" required>
                <option value="">Month</option>
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <select name="startYear" value={workDraft.startYear} onChange={handleWorkDraftChange} className="border px-2 py-1 rounded" required>
                <option value="">Year</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            {!workDraft.isCurrent && (
              <div className="flex gap-2 mb-1">
                <select name="endMonth" value={workDraft.endMonth} onChange={handleWorkDraftChange} className="border px-2 py-1 rounded" required>
                  <option value="">Month</option>
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select name="endYear" value={workDraft.endYear} onChange={handleWorkDraftChange} className="border px-2 py-1 rounded" required>
                  <option value="">Year</option>
                  {endYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
            <textarea name="description" value={workDraft.description} onChange={handleWorkDraftChange} placeholder="Description (bullet points, one per line)" className="w-full border px-2 py-1 rounded mb-1" />
            {workError && <div className="text-red-600 text-sm mb-2">{workError}</div>}
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={saveWork} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold hover:bg-blue-700 transition">Save</button>
              <button type="button" onClick={() => setShowWorkForm(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold hover:bg-gray-300 transition">Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowWorkForm(true)} className="text-blue-600 text-xl mt-2">+ Add Experience</button>
        )}
      </div>
      <div>
        <label className="block mb-1">Phone</label>
        {editingField === "phone" ? (
          <div className="flex gap-2 items-center">
            <input type="text" name="phone" value={fieldDraft} onChange={e => setFieldDraft(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <button type="button" onClick={saveEditField} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Save</button>
            <button type="button" onClick={cancelEditField} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold">Cancel</button>
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            <span>{form.phone}</span>
            <button type="button" onClick={() => startEditField("phone") } className="text-blue-600">Edit</button>
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1">GitHub</label>
        {editingField === "github" ? (
          <div className="flex gap-2 items-center">
            <input type="text" name="github" value={fieldDraft} onChange={e => setFieldDraft(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="https://github.com/username" />
            <button type="button" onClick={saveEditField} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Save</button>
            <button type="button" onClick={cancelEditField} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold">Cancel</button>
            {linkError && editingField === "github" && <span className="text-red-600 text-sm ml-2">{linkError}</span>}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {form.github ? (
              <a href={form.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{form.github}</a>
            ) : <span className="text-gray-500">No link</span>}
            <button type="button" onClick={() => startEditField("github") } className="text-blue-600">Edit</button>
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1">Portfolio</label>
        {editingField === "portfolio" ? (
          <div className="flex gap-2 items-center">
            <input type="text" name="portfolio" value={fieldDraft} onChange={e => setFieldDraft(e.target.value)} className="w-full border px-3 py-2 rounded" placeholder="https://yourportfolio.com" />
            <button type="button" onClick={saveEditField} className="bg-blue-600 text-white px-3 py-1 rounded font-semibold">Save</button>
            <button type="button" onClick={cancelEditField} className="bg-gray-200 text-gray-800 px-3 py-1 rounded font-semibold">Cancel</button>
            {linkError && editingField === "portfolio" && <span className="text-red-600 text-sm ml-2">{linkError}</span>}
          </div>
        ) : (
          <div className="flex gap-2 items-center">
            {form.portfolio ? (
              <a href={form.portfolio} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{form.portfolio}</a>
            ) : <span className="text-gray-500">No link</span>}
            <button type="button" onClick={() => startEditField("portfolio") } className="text-blue-600">Edit</button>
          </div>
        )}
      </div>
      {error && <div className="text-red-600 text-sm">{error}</div>}
      <div className="flex gap-2 mt-2">
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </button>
        <button type="button" onClick={() => setEditing(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition">Cancel</button>
      </div>
    </form>
  );
} 