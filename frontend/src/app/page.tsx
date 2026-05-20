"use client";

import { useEffect, useState, useRef } from "react";
import { ArrowRight, Zap, Users, Ticket, AlertCircle, CheckCircle2 } from "lucide-react";

const API_BASE = "http://localhost:3000/api";

interface StatusData {
  viewers: number;
  stok: number;
  harga_sekarang: number;
  revenue: number;
  status: string;
}

export default function Home() {
  const [data, setData] = useState<StatusData>({
    viewers: 0,
    stok: 0,
    harga_sekarang: 0,
    revenue: 0,
    status: "Normal",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  useEffect(() => {
    // Join lobby
    fetch(`${API_BASE}/masuk`, { method: "POST" }).catch(console.error);

    // Polling status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    }, 1000);

    // Leave lobby on unmount or beforeunload
    const handleBeforeUnload = () => {
      navigator.sendBeacon(`${API_BASE}/keluar`);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      navigator.sendBeacon(`${API_BASE}/keluar`);
    };
  }, []);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/beli`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();
      
      if (result.success) {
        showToast("Ticket secured successfully", "success");
      } else {
        showToast(result.message || "Failed to secure ticket", "error");
      }
    } catch (err) {
      showToast("Network error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isSoldOut = data.stok <= 0;
  const isSurge = data.status === "SURGE PRICING" || data.status === "CRITICAL SURGE";

  return (
    <div className="pb-20">
      <main className="max-w-5xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Ticket Details */}
        <div className="md:col-span-7 space-y-6">
          <h2 className="text-4xl font-bold tracking-tight mb-2">The Midnight Tour</h2>
          <p className="text-[#545454] text-lg">Neon City Arena, Sector 7 • Sat, Dec 31 • 9:00 PM</p>
          
          <div className="bg-white border border-[#E2E2E2] p-6 mt-8 shadow-sm">
            <h3 className="font-bold text-xl mb-4 border-b border-[#E2E2E2] pb-4">Event Information</h3>
            <p className="text-[#545454] leading-relaxed">
              Experience the ultimate synthwave journey with an exclusive VIP access. Due to extremely high demand, pricing for this event is dynamic and adjusts in real-time based on active viewers.
            </p>
          </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="md:col-span-5">
          <div className="bg-white border border-[#E2E2E2] shadow-sm sticky top-24">
            
            {/* Status Banner */}
            {isSurge && !isSoldOut && (
              <div className="bg-[#FFF0D4] px-6 py-4 flex gap-3 items-start border-b border-[#E2E2E2]">
                <Zap size={20} className="text-[#B97A00] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#B97A00] text-sm uppercase tracking-wide">Fares are higher due to demand</h4>
                  <p className="text-sm text-[#734A00] mt-1">{data.status} • {data.viewers} people are viewing this ticket right now.</p>
                </div>
              </div>
            )}

            {isSoldOut && (
              <div className="bg-[#F6F6F6] px-6 py-4 flex gap-3 items-start border-b border-[#E2E2E2]">
                <AlertCircle size={20} className="text-[#545454] shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-[#545454] text-sm uppercase tracking-wide">Sold Out</h4>
                  <p className="text-sm text-[#545454] mt-1">There are no more tickets available.</p>
                </div>
              </div>
            )}

            <div className="p-6">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-[#545454] font-medium text-sm mb-1 uppercase tracking-wider">VIP Access</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold tracking-tighter transition-all duration-300">
                      {formatCurrency(data.harga_sekarang)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-t border-[#E2E2E2]">
                  <div className="flex items-center gap-2 text-[#545454]">
                    <Ticket size={18} />
                    <span>Availability</span>
                  </div>
                  <span className="font-bold">{data.stok} left</span>
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={isSoldOut || loading}
                className="w-full bg-black text-white py-4 font-bold text-lg hover:bg-[#333333] transition-colors disabled:bg-[#E2E2E2] disabled:text-[#A6A6A6] disabled:cursor-not-allowed flex justify-center items-center gap-2 group"
              >
                {loading ? "Processing..." : isSoldOut ? "Sold Out" : "Order Ticket"}
                {!loading && !isSoldOut && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
              
              <p className="text-center text-xs text-[#545454] mt-4">
                By ordering, you agree to our terms of service and dynamic pricing policy.
              </p>
            </div>
          </div>
        </div>

      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className={`flex items-center gap-3 px-6 py-4 shadow-xl border ${
            toast.type === "success" 
              ? "bg-[#05A357] border-[#05A357] text-white" 
              : "bg-[#E11900] border-[#E11900] text-white"
          }`}>
            {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
