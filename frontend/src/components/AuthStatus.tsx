"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

export default function AuthStatus() {
  const [username, setUsername] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setUsername(null);
    window.location.href = "/login";
  };

  if (!mounted) return null;

  if (username) {
    return (
      <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/10">
        <div className="flex items-center gap-2 text-synth-muted">
          <User size={16} />
          <span className="font-medium text-sm text-synth-cyan">{username}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="text-synth-muted hover:neon-text-cyan hover:text-white transition-all flex items-center gap-1 text-sm font-medium"
          title="Logout"
        >
          <LogOut size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 ml-2 pl-4 border-l border-white/10">
      <Link href="/login" className="hover:neon-text-cyan text-synth-muted transition-all font-medium text-sm">
        Log In
      </Link>
      <Link href="/register" className="bg-gradient-to-r from-synth-cyan to-synth-blue text-white px-4 py-1.5 font-medium text-sm rounded hover:shadow-[0_0_15px_rgba(0,210,255,0.5)] transition-all border border-white/10">
        Register
      </Link>
    </div>
  );
}
