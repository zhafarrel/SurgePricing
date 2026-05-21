"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Activity, Ticket, TrendingUp, Users } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

interface EventData {
  id: string;
  title: string;
}

interface StatusData {
  viewers: number;
  stok: number;
  harga_sekarang: number;
  revenue: number;
  status: string;
}

interface ChartData {
  time: string;
  viewers: number;
  price: number;
}

export default function AdminStats() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [tickets, setTickets] = useState<{id: string, name: string}[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedTicketId, setSelectedTicketId] = useState<string>("");
  
  const [data, setData] = useState<StatusData>({
    viewers: 0,
    stok: 0,
    harga_sekarang: 0,
    revenue: 0,
    status: "Normal",
  });
  
  const [history, setHistory] = useState<ChartData[]>([]);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Fetch events list
  useEffect(() => {
    fetch(`${API_BASE}/events`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data.length > 0) {
          setEvents(result.data);
          setSelectedEventId(result.data[0].id);
        }
      });
  }, []);

  // Fetch tickets when event changes
  useEffect(() => {
    if (!selectedEventId) return;
    fetch(`${API_BASE}/events/${selectedEventId}`)
      .then(res => res.json())
      .then(result => {
        if (result.success && result.data && result.data.tickets) {
          setTickets(result.data.tickets);
          if (result.data.tickets.length > 0) {
            setSelectedTicketId(result.data.tickets[0].id);
          } else {
            setSelectedTicketId("");
          }
        }
      });
  }, [selectedEventId]);

  // Handle Event Change
  const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEventId(e.target.value);
  };

  useEffect(() => {
    if (!selectedEventId || !selectedTicketId) return;
    
    // Reset history when changing tracking target
    setHistory([]);

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status/${selectedEventId}/${selectedTicketId}`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
          
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          
          setHistory((prev) => {
            const newHistory = [...prev, {
              time: timeStr,
              viewers: result.viewers,
              price: result.harga_sekarang
            }];
            return newHistory.length > 30 ? newHistory.slice(newHistory.length - 30) : newHistory;
          });
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedEventId, selectedTicketId]);

  const handleResetViewers = async () => {
    if (!selectedEventId || !selectedTicketId) return;
    if (confirm("Reset active viewers to 0?")) {
      try {
        await fetch(`${API_BASE}/reset-viewers/${selectedEventId}/${selectedTicketId}`, { method: "POST" });
        setData(prev => ({...prev, viewers: 0}));
      } catch (err) {
        console.error("Failed to reset viewers");
      }
    }
  };

  const isSurge = data.status === "SURGE PRICING" || data.status === "CRITICAL SURGE";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between border-b border-black/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-black">Live Statistics</h1>
          <p className="text-synth-muted">Real-time dynamic pricing engine monitor</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          {events.length > 0 && (
            <>
              <select 
                value={selectedEventId} 
                onChange={handleEventChange}
                className="bg-white border border-black/20 text-black px-3 py-2 rounded shadow-sm focus:outline-none focus:border-black"
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{ev.title}</option>
                ))}
              </select>
              
              <select 
                value={selectedTicketId} 
                onChange={(e) => setSelectedTicketId(e.target.value)}
                className="bg-white border border-black/20 text-black px-3 py-2 rounded shadow-sm focus:outline-none focus:border-black"
              >
                {tickets.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </>
          )}

          <button 
            onClick={handleResetViewers}
            className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded text-sm font-bold shadow-sm hover:bg-red-100 transition-colors"
            title="Darurat: Klik ini jika angka viewers nyangkut karena bug browser refresh"
          >
            Reset Viewers
          </button>

          <div className={`px-4 py-2 flex items-center justify-center gap-2 font-bold uppercase tracking-wider text-sm border rounded ${
            isSurge ? "bg-black text-white border-black" : 
            data.stok <= 0 ? "bg-white border-black/10 text-synth-muted" : 
            "bg-gray-100 border-black/20 text-black"
          }`}>
            <Activity size={18} />
            {data.status}
          </div>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="glass rounded-xl p-6 flex flex-col justify-between hover:border-black/30 transition-all">
          <div className="flex items-center gap-2 text-synth-muted mb-4">
            <TrendingUp size={18} />
            <span className="font-medium text-sm uppercase tracking-widest">Gross Revenue</span>
          </div>
          <p className="text-3xl font-bold text-black">{formatCurrency(data.revenue)}</p>
        </div>
        
        <div className="glass rounded-xl p-6 flex flex-col justify-between hover:border-black/30 transition-all">
          <div className="flex items-center gap-2 text-synth-muted mb-4">
            <Ticket size={18} />
            <span className="font-medium text-sm uppercase tracking-widest">Stock Left</span>
          </div>
          <p className="text-3xl font-bold text-black">{data.stok}</p>
        </div>

        <div className="glass rounded-xl p-6 flex flex-col justify-between hover:border-black/30 transition-all">
          <div className="flex items-center gap-2 text-synth-muted mb-4">
            <Users size={18} />
            <span className="font-medium text-sm uppercase tracking-widest">Active Viewers</span>
          </div>
          <p className="text-3xl font-bold text-black">{data.viewers}</p>
        </div>

        <div className="glass rounded-xl p-6 flex flex-col justify-between hover:border-black/30 transition-all">
          <div className="flex items-center gap-2 text-synth-muted mb-4">
            <Activity size={18} />
            <span className="font-medium text-sm uppercase tracking-widest">Demand Ratio</span>
          </div>
          <p className="text-3xl font-bold text-black">
            {data.stok > 0 ? (data.viewers / data.stok).toFixed(1) : 0}x
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass rounded-xl p-6 border-black/10">
        <h3 className="font-bold text-lg mb-6 border-b border-black/10 pb-4 text-black">Viewers vs Price Volatility (Last 30s)</h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e2e2" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#545454"
                fontSize={12}
                tickMargin={10}
              />
              <YAxis 
                yAxisId="left" 
                stroke="#000000" 
                fontSize={12}
                allowDecimals={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#545454" 
                fontSize={12}
                tickFormatter={(val) => `Rp ${val/1000}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e2e2', backgroundColor: '#ffffff', color: '#000', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px', color: '#545454' }}/>
              <Line
                yAxisId="left"
                type="stepAfter"
                dataKey="viewers"
                name="Active Viewers"
                stroke="#000000"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#000', stroke: 'transparent' }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="stepAfter"
                dataKey="price"
                name="Surge Price (IDR)"
                stroke="#888888"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: '#888', stroke: 'transparent' }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
