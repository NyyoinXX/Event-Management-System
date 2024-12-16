import axios from "axios";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, isSameDay } from "date-fns";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get("/events");
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, index) => (
    <div key={`empty-${index}`} className="p-2 bg-gray-900 border border-gray-800"></div>
  ));

  const getEventsForDay = (date) => {
    return events.filter(event => {
      try {
        const eventDate = new Date(event.date);
        return isSameDay(eventDate, date);
      } catch (error) {
        console.error(`Invalid date for event: ${event.id}`, error);
        return false;
      }
    });
  };

  const formatEventTime = (time) => {
    try {
      if (!time) return '';
      return time.slice(0, 5);
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading calendar...</div>;
  }

  return (
    <div className="p-4 md:mx-16 mt-20">
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <div className="flex items-center mb-6 justify-center gap-6">
          <button 
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            onClick={() => setCurrentMonth(prev => addMonths(prev, -1))}
          >
            Previous
          </button>
          <h2 className="text-2xl font-bold text-red-600">
            {format(currentMonth, "MMMM yyyy")}
          </h2>
          <button 
            className="px-4 py-2 bg-gray-300 text-black rounded-lg hover:bg-red-600 hover:text-white transition-all duration-300"
            onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
          >
            Next
          </button>
        </div>

        <div className="grid grid-cols-7 text-center">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
            <div key={day} className="p-2 font-semibold bg-gray-800 text-white border border-gray-700">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {emptyCells.concat(
            daysInMonth.map(date => {
              const dayEvents = getEventsForDay(date);
              const isToday = isSameDay(date, new Date());

              return (
                <div 
                  key={date.toISOString()} 
                  className={`min-h-[120px] p-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 transition-colors ${
                    isToday ? 'ring-2 ring-red-600' : ''
                  }`}
                >
                  <div className={`font-bold mb-2 ${isToday ? 'text-red-600' : 'text-gray-300'}`}>
                    {format(date, "d")}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.map(event => (
                      <Link 
                        key={event.id}
                        to={`/event/${event.id}`}
                        className="block"
                      >
                        <div className="text-sm p-2 bg-gray-800 text-white rounded-lg hover:bg-red-600 transition-colors group">
                          <div className="font-semibold truncate group-hover:text-white">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-400 group-hover:text-white">
                            {formatEventTime(event.time)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
