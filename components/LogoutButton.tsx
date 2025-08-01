"use client";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition mb-4 float-right"
    >
      Logout
    </button>
  );
} 