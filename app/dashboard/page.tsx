import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PrismaClient, Application, Job } from "@prisma/client";
import EditProfileForm from "@/components/EditProfileForm";
import DashboardShell from "@/components/DashboardShell";
import Link from "next/link";

const prisma = new PrismaClient();

interface ApplicationWithJob extends Application {
  job: Job | null;
}

// Define local interfaces for Education and WorkExperience to match Profile
interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}
interface WorkExperience {
  title: string;
  employmentType: string;
  company: string;
  currentRole: boolean;
  startDate: string;
  endDate: string;
  description: string;
  isCurrent: boolean;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
}

export default async function DashboardPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect("/auth/signin");
  }
  if (session.user.role === "ADMIN") {
    redirect("/admin/dashboard");
  }
  const userId = session.user.id;
  const applications: ApplicationWithJob[] = await prisma.application.findMany({
    where: { userId },
    include: { job: true },
    orderBy: { createdAt: "desc" },
  });
  // Fetch profile directly from the database
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      education: true,
      workExperience: true,
      phone: true,
      github: true,
      portfolio: true,
    },
  });

  const safeProfile = profile
    ? {
        ...profile,
        name: profile.name ?? undefined,
        github: profile.github ?? undefined,
        portfolio: profile.portfolio ?? undefined,
        education: Array.isArray(profile.education) ? (profile.education as unknown as Education[]) : [],
        workExperience: Array.isArray(profile.workExperience) ? (profile.workExperience as unknown as WorkExperience[]) : [],
        phone: profile.phone ?? undefined,
      }
    : null;

  return (
    <DashboardShell>
      <div className="max-w-3xl mx-auto mt-16 p-0">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg p-8 shadow-md text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Applicant Dashboard</h1>
          <p className="mb-2 text-lg">Welcome, <span className="font-semibold">{session.user.name || session.user.email}</span>!</p>
        </div>
        <div className="bg-white rounded-b-lg shadow-md p-8 -mt-2 flex flex-col gap-8">
          <Link href="/jobs" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700 transition mb-4 shadow">Browse Jobs</Link>
          <div className="bg-gray-50 rounded-lg p-6 shadow-inner mb-4">
            {safeProfile ? (
              <EditProfileForm profile={safeProfile} />
            ) : (
              <div>Loading profile...</div>
            )}
          </div>
          <div className="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">Your Applications</h2>
            <table className="w-full border text-left rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-3">Job Title</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {applications.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">No applications found.</td>
                  </tr>
                )}
                {applications.map((app) => (
                  <tr key={app.id} className="border-t hover:bg-gray-100 transition">
                    <td className="py-2 px-3 font-medium">{app.job?.title || "-"}</td>
                    <td className="py-2 px-3">
                      <span className={
                        app.status === "ACCEPTED" ? "text-green-600 font-semibold" :
                        app.status === "REJECTED" ? "text-red-600 font-semibold" :
                        app.status === "ON_HOLD" ? "text-yellow-600 font-semibold" : "text-gray-800"
                      }>{app.status}</span>
                    </td>
                    <td className="py-2 px-3">{new Date(app.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
} 