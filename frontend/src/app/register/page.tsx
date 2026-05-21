"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Lock, User, AlertCircle, CheckCircle2, Mail } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        setError(data.message || "Failed to register");
      }
    } catch (err) {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="w-full max-w-md glass rounded-2xl p-8 relative overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-synth-cyan to-synth-blue"></div>
        <h2 className="text-4xl font-extrabold tracking-tight mb-2 text-center gradient-text">Create Account</h2>
        <p className="text-synth-muted text-center mb-8">Join the platform to secure your tickets</p>

        {error && (
          <div className="bg-synth-cyan/10 border-l-4 border-synth-cyan p-4 mb-6 flex items-start gap-3 neon-border-cyan">
            <AlertCircle className="text-synth-cyan shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(0,210,255,0.8)]" size={20} />
            <p className="text-white/90 text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-synth-cyan/20 border-l-4 border-synth-cyan p-4 mb-6 flex items-start gap-3 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <CheckCircle2 className="text-synth-cyan shrink-0 mt-0.5 drop-shadow-[0_0_5px_rgba(0,240,255,0.8)]" size={20} />
            <p className="text-white/90 text-sm font-medium">Registration successful! Redirecting to login...</p>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
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
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-synth-text mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-synth-muted" />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-3 rounded-lg border border-white/10 bg-black/50 text-white focus:bg-black/80 focus:outline-none focus:ring-1 focus:ring-synth-cyan focus:border-synth-cyan transition-all shadow-inner"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-gradient-to-r from-synth-cyan to-synth-blue text-white py-3.5 rounded-lg font-bold text-base hover:shadow-[0_0_20px_rgba(0,210,255,0.6)] transition-all disabled:opacity-50 disabled:grayscale flex justify-center items-center gap-2 group mt-4 border border-white/20"
          >
            {loading ? "Creating..." : "Create Account"}
            {!loading && !success && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-synth-muted">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-synth-cyan hover:neon-text-cyan hover:underline transition-all">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
