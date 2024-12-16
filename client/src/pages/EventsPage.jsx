import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { format } from "date-fns";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get("/events");
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      !selectedCategory || event.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="text-center py-10">Loading events...</div>;
  }

  return (
    <div className="mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-4 text-center text-red-600">
        Upcoming Events
      </h1>
      
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
        />
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full md:w-1/4 px-4 py-2 bg-gray-800 text-white border border-gray-700 rounded-lg focus:border-red-600 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="CLUB_ACTIVITY">Club Activities</option>
          <option value="WORKSHOP">Workshops</option>
          <option value="SEMINAR">Seminars</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-gray-900 p-4 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-800 hover:border-red-600"
            >
              {event.image && (
                <img
                  src={`${axios.defaults.baseURL}/uploads/${event.image}`}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h2 className="text-xl font-bold mb-2 text-white">
                {event.title}
              </h2>
              <p className="text-sm text-gray-400">
                <strong>Date:</strong> {format(new Date(event.date), 'PPP')}
              </p>
              <p className="text-sm text-gray-400">
                <strong>Time:</strong> {event.time}
              </p>
              <p className="text-sm text-gray-400">
                <strong>Location:</strong> {event.location}
              </p>
              <Link to={`/event/${event.id}`}>
                <button className="mt-4 bg-gray-300 text-black px-4 py-2 rounded-lg w-full hover:bg-red-600 hover:text-white transition-colors duration-300">
                  View Details
                </button>
              </Link>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-gray-400">
            No events found.
          </p>
        )}
      </div>
    </div>
  );
}
