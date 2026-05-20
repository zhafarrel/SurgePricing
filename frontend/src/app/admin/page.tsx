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

const API_BASE = "http://localhost:3000/api";

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

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/status`);
        if (res.ok) {
          const result = await res.json();
          setData(result);
          
          // Append to history
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
          
          setHistory((prev) => {
            const newHistory = [...prev, {
              time: timeStr,
              viewers: result.viewers,
              price: result.harga_sekarang
            }];
            // Keep only the last 30 data points (30 seconds)
            return newHistory.length > 30 ? newHistory.slice(newHistory.length - 30) : newHistory;
          });
        }
      } catch (err) {
        console.error("Failed to fetch status", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isSurge = data.status === "SURGE PRICING" || data.status === "CRITICAL SURGE";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8 flex items-center justify-between border-b border-[#E2E2E2] pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Live Statistics</h1>
          <p className="text-[#545454]">Real-time dynamic pricing engine monitor</p>
        </div>
        <div className={`px-4 py-2 flex items-center gap-2 font-bold uppercase tracking-wider text-sm border ${
          isSurge ? "bg-[#FFF0D4] border-[#B97A00] text-[#B97A00]" : 
          data.stok <= 0 ? "bg-[#F6F6F6] border-[#E2E2E2] text-[#545454]" : 
          "bg-[#E8F8F0] border-[#05A357] text-[#05A357]"
        }`}>
          <Activity size={18} />
          {data.status}
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#E2E2E2] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#545454] mb-4">
            <TrendingUp size={18} />
            <span className="font-medium text-sm uppercase tracking-wider">Gross Revenue</span>
          </div>
          <p className="text-3xl font-bold">{formatCurrency(data.revenue)}</p>
        </div>
        
        <div className="bg-white border border-[#E2E2E2] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#545454] mb-4">
            <Ticket size={18} />
            <span className="font-medium text-sm uppercase tracking-wider">Stock Left</span>
          </div>
          <p className="text-3xl font-bold">{data.stok}</p>
        </div>

        <div className="bg-white border border-[#E2E2E2] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#545454] mb-4">
            <Users size={18} />
            <span className="font-medium text-sm uppercase tracking-wider">Active Viewers</span>
          </div>
          <p className="text-3xl font-bold">{data.viewers}</p>
        </div>

        <div className="bg-white border border-[#E2E2E2] p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-[#545454] mb-4">
            <Activity size={18} />
            <span className="font-medium text-sm uppercase tracking-wider">Demand Ratio</span>
          </div>
          <p className="text-3xl font-bold">
            {data.stok > 0 ? (data.viewers / data.stok).toFixed(1) : 0}x
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-[#E2E2E2] p-6">
        <h3 className="font-bold text-lg mb-6 border-b border-[#E2E2E2] pb-4">Viewers vs Price Volatility (Last 30s)</h3>
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
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E2E2" vertical={false} />
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
                stroke="#E11900" 
                fontSize={12}
                tickFormatter={(val) => `Rp ${val/1000}k`}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '0px', border: '1px solid #E2E2E2', boxShadow: 'none' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }}/>
              <Line
                yAxisId="left"
                type="stepAfter"
                dataKey="viewers"
                name="Active Viewers"
                stroke="#000000"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
              <Line
                yAxisId="right"
                type="stepAfter"
                dataKey="price"
                name="Surge Price (IDR)"
                stroke="#E11900"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
