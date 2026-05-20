import { ShoppingCart, Ticket, User } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center bg-gray-900 text-white rounded-full px-6 py-4 mb-12 max-w-6xl mx-auto shadow-lg">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
        <Ticket className="w-6 h-6 text-teal-400" />
        <span>CHAINTIX</span>
      </div>
      <div className="hidden md:flex gap-6 text-sm font-medium text-gray-300">
        <a href="#" className="hover:text-white transition">Browse Events</a>
        <a href="#" className="hover:text-white transition">How It Works</a>
        <a href="#" className="hover:text-white transition">Support</a>
      </div>
      <div className="flex gap-4 items-center">
        <User className="w-5 h-5 cursor-pointer hover:text-teal-400 transition" />
        <ShoppingCart className="w-5 h-5 cursor-pointer hover:text-teal-400 transition" />
        <button className="border border-gray-600 rounded-full px-5 py-1.5 text-sm hover:bg-gray-800 transition">
          Sign In
        </button>
      </div>
    </nav>
  );
}