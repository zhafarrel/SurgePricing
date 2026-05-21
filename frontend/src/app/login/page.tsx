"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        // Force a reload or push to trigger layout re-render
        window.location.href = "/"; 
      } else {
        setError(data.message || "Failed to login");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-full max-w-md glass rounded-2xl p-8 relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-synth-cyan to-synth-blue"></div>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-center gradient-text">Welcome Back</h2>
        <p className="text-synth-muted text-center mb-8">Enter your credentials to access your account</p>

        {error && (
          <div className="bg-synth-cyan/10 border-l-4 border-synth-cyan p-4 mb-6 flex items-start gap-3 neon-border-cyan">
            <AlertCircle className="text-synth-cyan shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(0,210,255,0.8)]" size={20} />
            <p className="text-white/90 text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-synth-text mb-2">Username</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-synth-muted" />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-black/50 text-white focus:bg-black/80 focus:outline-none focus:ring-1 focus:ring-synth-cyan focus:border-synth-cyan transition-all shadow-inner"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-synth-text mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-synth-muted" />
              </div>
              <input
                type="password"
                required
                className="block w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-black/50 text-white focus:bg-black/80 focus:outline-none focus:ring-1 focus:ring-synth-cyan focus:border-synth-cyan transition-all shadow-inner"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-synth-cyan to-synth-blue text-white py-3.5 rounded-lg font-bold text-base hover:shadow-[0_0_20px_rgba(0,210,255,0.6)] transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2 group mt-4 border border-white/20"
          >
            {loading ? "Signing in..." : "Sign In"}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-synth-muted">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-synth-cyan hover:neon-text-cyan hover:underline transition-all">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
