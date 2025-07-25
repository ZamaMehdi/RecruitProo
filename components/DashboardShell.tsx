"use client";
import LogoutButton from "./LogoutButton";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <LogoutButton />
      {children}
    </div>
  );
} 