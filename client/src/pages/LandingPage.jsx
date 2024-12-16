import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-black text-white min-h-screen pt-16">
      <div className="text-center max-w-4xl mx-auto px-6">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-red-600 tracking-tight">
            Academic City University
            <span className="block text-3xl md:text-5xl mt-2 text-white opacity-90">
              Events Hub
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Find all your campus events in one place.
            <span className="block mt-2 text-red-400">Connect. Engage. Experience.</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-8">
          <Link to="/events">
            <button className="px-8 py-4 bg-gray-300 text-black font-bold rounded-lg hover:bg-red-600 hover:text-white transform hover:translate-y-[-2px] transition-all duration-300 shadow-lg">
              Browse Events
            </button>
          </Link>
          <Link to="/register">
            <button className="px-8 py-4 bg-transparent border-2 border-gray-300 text-gray-300 font-bold rounded-lg hover:bg-red-600 hover:border-red-600 hover:text-white transform hover:translate-y-[-2px] transition-all duration-300">
              Join ACity Events
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
