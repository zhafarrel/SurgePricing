import { Activity, MapPin } from "lucide-react";

export default function TrendingEvents() {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Now</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-64 flex flex-col">
            <div className="bg-[#E5EEED] rounded-lg w-full flex-1 mb-4 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-gray-800 text-white p-1.5 rounded-full">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <h4 className="font-bold text-gray-900">Event Title {item}</h4>
            <p className="text-sm text-gray-500 mb-1">Date & Time</p>
            <div className="text-xs text-gray-400 flex flex-col gap-1">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Venue</span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> Location</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}