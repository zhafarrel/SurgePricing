import { useState } from "react";
import { Activity, MapPin, ShoppingCart, Ticket, Zap, User } from "lucide-react";

export default function FeaturedEvent() {
  const [ticketData] = useState({
    viewers: 3455,
    stok: 100,
    harga_sekarang: 150000, 
    status: "CRITICAL SURGE (2.5X)",
  });

  const [loading, setLoading] = useState(false);

  const handleCheckoutMock = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("UI Test: Tombol Checkout berhasil diklik!");
    }, 1000);
  };

  const getStatusStyle = (status: string) => {
    if (status.includes("CRITICAL SURGE")) return "bg-red-100 text-red-700 border-red-200";
    if (status.includes("SURGE")) return "bg-orange-100 text-orange-700 border-orange-200";
    if (status.includes("SOLD OUT")) return "bg-gray-200 text-gray-500 border-gray-300";
    return "bg-green-100 text-green-700 border-green-200";
  };

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured</h2>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-6 flex flex-col md:flex-row gap-8">
        {/* Left: Graphic */}
        <div className="bg-[#E5EEED] rounded-xl flex items-center justify-center w-full md:w-1/3 aspect-video md:aspect-auto p-8 relative overflow-hidden">
          <Ticket className="w-24 h-24 text-teal-700 z-10 transform -rotate-12" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 translate-x-10 -translate-y-10"></div>
        </div>

        {/* Middle: Info & Active Traffic */}
        <div className="flex-1 flex flex-col justify-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 uppercase tracking-tight">
            VIP CONCERT ACCESS: <br /> STEVE AOKI
          </h3>
          <p className="text-gray-600 flex items-center gap-2 font-medium mb-6">
            July 26, 2026 • <MapPin className="w-4 h-4" /> New York, NY
          </p>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">LIVE Metrics</span>
          </div>
          <div className="flex items-center gap-4 text-gray-900">
            <Activity className="w-8 h-8 text-teal-600" />
            <div>
              <div className="text-3xl font-black">{ticketData.viewers.toLocaleString('id-ID')}</div>
              <div className="text-sm text-gray-500 font-medium">Active web traffic</div>
            </div>
          </div>
        </div>

        {/* Right: Pricing Engine & Checkout */}
        <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-6 md:pt-0 md:pl-8 flex flex-col justify-center">
          <div className="mb-4">
            <p className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-1">LIVE Metrics</p>
            <div className="flex items-center gap-2 text-3xl font-black text-gray-900">
              <User className="w-6 h-6 text-gray-600" />
              {ticketData.viewers.toLocaleString('id-ID')}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
            <div 
              className="bg-gray-800 h-2.5 rounded-full" 
              style={{ width: `${Math.max(0, Math.min(100, ticketData.stok))}%` }}
            ></div>
          </div>
          <p className="text-sm font-medium text-gray-600 mb-6">{ticketData.stok} tickets left.</p>

          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-bold mb-4 w-max ${getStatusStyle(ticketData.status)}`}>
            <Zap className="w-4 h-4" />
            {ticketData.status}
          </div>

          <button 
            onClick={handleCheckoutMock}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg active:scale-[0.98]"
          >
            <ShoppingCart className="w-5 h-5" />
            {loading ? "Processing..." : "Instant Checkout"}
          </button>
        </div>
      </div>
    </>
  );
}