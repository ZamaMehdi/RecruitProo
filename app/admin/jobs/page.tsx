import React from "react";
import { getSession } from "@/lib/auth";
import { PrismaClient, Job as PrismaJob, Application } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

interface Job extends PrismaJob {
  applications: Application[];
}

export default async function AdminJobsPage() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    return <div className="text-red-600">Unauthorized</div>;
  }
  if (!session.user.email) {
    return <div className="text-red-600">Admin email missing in session.</div>;
  }

  let jobs: Job[] = [];
  let error = "";
  try {
    jobs = await prisma.job.findMany({
      where: { adminEmail: session.user.email },
      include: { customQuestions: true, applications: true },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">All Jobs</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <table className="w-full border text-left">
        <thead>
          <tr className="bg-gray-100">
            <th className="py-2 px-3">Title</th>
            <th className="py-2 px-3">Department</th>
            <th className="py-2 px-3">Location</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Applications</th>
            <th className="py-2 px-3">Posted</th>
            <th className="py-2 px-3">Edit</th>
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 && (
            <tr>
              <td colSpan={7} className="py-4 text-center text-gray-500">No jobs found.</td>
            </tr>
          )}
          {jobs.map(job => (
            <tr key={job.id} className="border-t">
              <td className="py-2 px-3 font-medium">{job.title}</td>
              <td className="py-2 px-3">{job.department}</td>
              <td className="py-2 px-3">{job.location}</td>
              <td className="py-2 px-3">{job.status}</td>
              <td className="py-2 px-3">{job.applications.length}</td>
              <td className="py-2 px-3">{new Date(job.createdAt).toLocaleDateString()}</td>
              <td className="py-2 px-3">
                <Link href={`/admin/jobs/${job.id}/edit`} className="text-blue-600 hover:underline">Edit</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 