import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PrismaClient, Job as PrismaJob, Application } from "@prisma/client";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const prisma = new PrismaClient();

interface Job extends PrismaJob {
  applications: Application[];
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/auth/signin");
  }
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  if (!session.user.email) {
    return <div className="text-red-600">Admin email missing in session.</div>;
  }

  // Fetch jobs directly from Prisma
  const jobs: Job[] = await prisma.job.findMany({
    where: { adminEmail: session.user.email },
    include: { customQuestions: true, applications: true },
    orderBy: { createdAt: "desc" },
  });
  const totalJobs = jobs.length;
  const statusCounts: Record<string, number> = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto mt-16 p-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg p-8 shadow-md text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Admin Dashboard</h1>
          <p className="mb-2 text-lg">Welcome, <span className="font-semibold">{session.user.name || session.user.email}</span>!</p>
        </div>
        <div className="bg-white rounded-b-lg shadow-md p-8 -mt-2 flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl p-6 shadow flex flex-col items-center">
              <div className="text-lg font-semibold">Total Jobs</div>
              <div className="text-3xl font-extrabold mt-2">{totalJobs}</div>
            </div>
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white rounded-xl p-6 shadow flex flex-col items-center">
                <div className="text-lg font-semibold">{status.charAt(0) + status.slice(1).toLowerCase()}</div>
                <div className="text-3xl font-extrabold mt-2">{Number(count)}</div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
            <div className="font-semibold mb-2 text-gray-700">Applicants per Job</div>
            <ul className="divide-y divide-gray-200">
              {jobs.map((job) => (
                <li key={job.id} className="py-2 flex justify-between items-center">
                  <span className="font-medium text-gray-900">{job.title}</span>
                  <span className="text-gray-600">{job.applications.length} applicant{job.applications.length === 1 ? "" : "s"}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap gap-4 justify-end">
            <Link href="/admin/jobs/new" className="bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition shadow">+ Create New Job</Link>
            <Link href="/admin/applications" className="bg-green-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-green-700 transition shadow">View Applications</Link>
            <Link href="/admin/jobs" className="bg-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-purple-700 transition shadow">View & Edit Jobs</Link>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 