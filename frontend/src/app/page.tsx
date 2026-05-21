"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Search } from "lucide-react";

const API_BASE = "http://localhost:3001/api";

interface EventData {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  category: string;
  image: string;
}

export default function Home() {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/events`);
        const result = await res.json();
        if (result.success) {
          setEvents(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 flex-1 w-full">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 gradient-text ">
          Discover Epic Events
        </h1>
        <p className="text-synth-muted text-lg max-w-2xl mb-8">
          Secure your tickets to the most anticipated concerts with our real-time dynamic pricing engine. Fast, secure, and purely powered by Redis.
        </p>

        <div className="relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search events by name or location..."
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-none leading-5 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all sm:text-sm shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-synth-cyan"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events
            .filter((event) => 
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
              event.location.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((event) => (
            <Link href={`/event/${event.id}`} key={event.id} className="group cursor-pointer block">
              <div className="glass rounded-none overflow-hidden h-full flex flex-col hover:border-black/30 hover: transition-all duration-300">
                <div className="h-48 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent z-10"></div>
                  <img 
                    src={event.image} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-black/40 border border-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md">
                    {event.category}
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1 relative z-20 -mt-6">
                  <h3 className="text-xl font-bold text-black mb-3 group-hover:neon-text-cyan transition-colors line-clamp-1">{event.title}</h3>
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-synth-muted flex items-center gap-2 font-medium">
                      <Calendar size={14} className="text-synth-cyan" />
                      {event.date}
                    </p>
                    <p className="text-sm text-synth-muted flex items-center gap-2 font-medium">
                      <MapPin size={14} className="text-synth-cyan" />
                      {event.location}
                    </p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-black/10 flex justify-between items-center">
                    <span className="text-sm font-bold text-black uppercase tracking-wider">Get Tickets &rarr;</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
