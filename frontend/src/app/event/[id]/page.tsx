"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Zap, Users, Ticket, AlertCircle, CheckCircle2, MapPin, Calendar } from "lucide-react";
import Link from "next/link";

const API_BASE = "http://localhost:3001/api";

interface TicketData {
  id: string;
  name: string;
  base_price: number;
  initial_stock: number;
  current_stock: number;
}

interface EventDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  image: string;
  tickets: TicketData[];
}

interface StatusData {
  viewers: number;
  stok: number;
  harga_sekarang: number;
  revenue: number;
  status: string;
}

export default function EventCheckout({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const router = useRouter();
  
  const [eventData, setEventData] = useState<EventDetail | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<string>("");
  const [status, setStatus] = useState<StatusData>({
    viewers: 0,
    stok: 0,
    harga_sekarang: 0,
    revenue: 0,
    status: "Loading...",
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Fetch Event Details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${API_BASE}/events/${eventId}`);
        const result = await res.json();
        if (result.success && result.data) {
          setEventData(result.data);
          if (result.data.tickets.length > 0) {
            setSelectedTicket(result.data.tickets[0].id);
          }
        }
      } catch (err) {
        console.error("Failed to fetch event", err);
      }
    };
    fetchEvent();
  }, [eventId]);

  // Handle Presence and Polling
  useEffect(() => {
    if (!selectedTicket) return;

    // Join room
    fetch(`${API_BASE}/masuk/${eventId}/${selectedTicket}`, { method: "POST" });

    // Polling status
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${eventId}/${selectedTicket}`);
        if (res.ok) {
          const result = await res.json();
          setStatus(result);
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    }, 1000);

    // Leave room on unmount or ticket change
    return () => {
      clearInterval(interval);
      fetch(`${API_BASE}/keluar/${eventId}/${selectedTicket}`, { method: "POST", keepalive: true });
    };
  }, [eventId, selectedTicket]);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/beli/${eventId}/${selectedTicket}`, { method: "POST" });
      const result = await res.json();
      
      setToast({
        type: result.success ? "success" : "error",
        message: result.message || (result.success ? "Ticket secured successfully!" : "Failed to secure ticket")
      });

      if (result.success) {
        setTimeout(() => router.push("/"), 2000);
      }
    } catch (err) {
      setToast({ type: "error", message: "Network error occurred" });
    }
    setLoading(false);
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (!eventData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-synth-cyan"></div>
      </div>
    );
  }

  const isSurge = status.status === "SURGE PRICING" || status.status === "CRITICAL SURGE";
  const isSoldOut = status.status === "SOLD OUT" || status.stok <= 0;

  return (
    <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full relative">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Left Column: Event Details */}
        <div className="md:col-span-7 space-y-6">
          <Link href="/" className="text-synth-cyan flex items-center gap-2 hover:underline mb-8 font-medium w-fit hover:text-white transition-colors">
            ← Back to Events
          </Link>
          <div className="rounded-2xl overflow-hidden h-64 relative mb-8 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
             <div className="absolute inset-0 bg-gradient-to-t from-[#040d1a] to-transparent z-10"></div>
             <img src={eventData.image} alt={eventData.title} className="w-full h-full object-cover" />
             <div className="absolute bottom-4 left-4 z-20">
               <span className="bg-synth-cyan/20 border border-synth-cyan text-synth-cyan text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md shadow-[0_0_10px_rgba(0,210,255,0.2)]">
                 {eventData.category}
               </span>
             </div>
          </div>

          <h2 className="text-5xl font-extrabold tracking-tight mb-2 gradient-text uppercase drop-shadow-[0_0_15px_rgba(0,210,255,0.3)]">
            {eventData.title}
          </h2>
          <div className="space-y-2 mb-4">
            <p className="text-synth-cyan text-lg flex items-center gap-2 font-medium">
              <Calendar size={18} /> {eventData.date}
            </p>
            <p className="text-synth-cyan text-lg flex items-center gap-2 font-medium">
              <MapPin size={18} /> {eventData.location}
            </p>
          </div>
          
          <div className="glass p-6 mt-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-synth-cyan to-synth-blue"></div>
            <h3 className="font-bold text-xl mb-4 border-b border-white/10 pb-4 text-synth-text flex items-center gap-2">
              Event Information
            </h3>
            <p className="text-synth-muted leading-relaxed">
              {eventData.description}
            </p>
          </div>
        </div>

        {/* Right Column: Dynamic Pricing Engine */}
        <div className="md:col-span-5 relative">
          <div className="glass rounded-2xl overflow-hidden sticky top-24 shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10">
            {/* Header */}
            <div className="bg-gradient-to-r from-synth-blue to-synth-teal px-6 py-4 flex items-center gap-3 border-b border-white/10">
              <Zap className="text-synth-cyan" size={24} />
              <h3 className="font-bold text-xl text-white tracking-tight">Surge Engine</h3>
            </div>

            {/* Ticket Selector */}
            <div className="p-6 border-b border-white/10 bg-black/20">
              <label className="block text-sm font-medium text-synth-muted mb-3">Select Ticket Tier</label>
              <div className="grid grid-cols-2 gap-3">
                {eventData.tickets.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t.id)}
                    className={`py-2 px-3 rounded-lg border text-sm font-bold transition-all ${
                      selectedTicket === t.id 
                        ? "bg-synth-cyan/20 border-synth-cyan text-synth-cyan shadow-[0_0_10px_rgba(0,210,255,0.2)]" 
                        : "bg-black/40 border-white/10 text-synth-muted hover:border-synth-cyan/50 hover:text-white"
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Banner */}
            {isSurge && !isSoldOut && (
              <div className="bg-synth-cyan/10 px-6 py-4 flex gap-3 items-start border-b border-synth-cyan neon-border-cyan animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-synth-cyan/5 to-transparent"></div>
                <Zap size={20} className="text-synth-cyan shrink-0 mt-0.5 relative z-10 drop-shadow-[0_0_8px_rgba(0,210,255,0.8)]" />
                <div className="relative z-10">
                  <h4 className="font-bold text-synth-cyan text-sm uppercase tracking-widest">Fares are higher due to demand</h4>
                  <p className="text-sm text-white/90 mt-1"><span className="font-bold neon-text-cyan">{status.status}</span> • {status.viewers} people are viewing this ticket right now.</p>
                </div>
              </div>
            )}

            {isSoldOut && (
              <div className="bg-red-500/10 px-6 py-4 flex gap-3 items-center border-b border-red-500/50 text-red-400">
                <AlertCircle size={20} />
                <h4 className="font-bold">Tickets Sold Out</h4>
              </div>
            )}

            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                <span className="text-synth-muted font-medium flex items-center gap-2">
                  <Ticket size={16} /> Stock Available
                </span>
                <span className={`font-bold text-xl ${isSoldOut ? 'text-red-400' : 'text-synth-text'}`}>
                  {status.stok} <span className="text-sm font-normal text-synth-muted">left</span>
                </span>
              </div>

              <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                <span className="text-synth-muted font-medium flex items-center gap-2">
                  <Users size={16} /> Active Viewers
                </span>
                <span className="font-bold text-xl text-synth-text flex items-center gap-2">
                  {status.viewers} 
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-synth-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-synth-cyan shadow-[0_0_8px_var(--color-synth-cyan)]"></span>
                  </span>
                </span>
              </div>

              <div className="pt-6 border-t border-white/10">
                <p className="text-sm text-synth-muted mb-2 font-medium uppercase tracking-widest">Current Price</p>
                <div className="flex items-end gap-3 mb-6">
                  <p className={`text-4xl font-extrabold ${isSurge ? 'neon-text-cyan' : 'text-synth-text'} transition-colors duration-300`}>
                    {formatCurrency(status.harga_sekarang)}
                  </p>
                  {isSurge && <span className="text-synth-cyan font-bold mb-1 text-sm bg-synth-cyan/10 px-2 py-0.5 rounded border border-synth-cyan/30">Surge Applied</span>}
                </div>
              </div>

              <button
                onClick={handleBuy}
                disabled={isSoldOut || loading}
                className="w-full bg-gradient-to-r from-synth-cyan to-synth-blue text-white py-4 font-bold text-lg rounded-lg hover:shadow-[0_0_20px_rgba(0,210,255,0.6)] transition-all disabled:opacity-50 disabled:grayscale disabled:shadow-none flex justify-center items-center gap-2 group border border-white/20"
              >
                {loading ? "Processing..." : isSoldOut ? "Sold Out" : "Order Ticket"}
                {!loading && !isSoldOut && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
          <div className={`glass rounded-full flex items-center gap-3 px-6 py-4 shadow-[0_0_30px_rgba(0,0,0,0.8)] border ${
            toast.type === "success" 
              ? "border-green-500 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
              : "border-synth-cyan/50 text-synth-cyan drop-shadow-[0_0_10px_rgba(0,210,255,0.5)]"
          }`}>
            {toast.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}
    </main>
  );
}
