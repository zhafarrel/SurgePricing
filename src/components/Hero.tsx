import { MapPin, Search } from "lucide-react";

export default function Hero() {
  return (
    <div className="text-center mb-12 text-white">
      <h1 className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-md">Discover events around you.</h1>
      <p className="text-lg md:text-xl font-medium text-gray-100 drop-shadow">Find your next memory in seconds.</p>
      
      <div className="mt-8 flex justify-center">
        <div className="flex items-center bg-white rounded-full p-2 px-4 shadow-xl w-full max-w-2xl">
          <Search className="w-5 h-5 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search for Events Nearby..." 
            className="flex-1 outline-none text-gray-700 bg-transparent"
          />
          <div className="border-l border-gray-300 h-6 mx-4"></div>
          <MapPin className="w-5 h-5 text-gray-400 mr-2" />
          <select className="outline-none text-gray-700 bg-transparent cursor-pointer">
            <option>New York, NY</option>
            <option>Jakarta, ID</option>
          </select>
        </div>
      </div>
    </div>
  );
}