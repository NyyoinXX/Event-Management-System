import axios from "axios";
import { useEffect, useState, useContext } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import RsvpButton from '../components/RsvpButton';
import { UserContext } from "../UserContext";
import { toast } from "react-toastify";
import { format } from 'date-fns';

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [rsvpCounts, setRsvpCounts] = useState({ attending: 0, unavailable: 0 });
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const [availableSeats, setAvailableSeats] = useState(0);

  useEffect(() => {
    if (!id) return;

    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/event/${id}`);
        setEvent(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching event:", error);
        setError(error.response?.status === 404 
          ? "Event not found" 
          : "Failed to load event details"
        );
      }
    };

    fetchEvent();
  }, [id]);

  const calculateAvailableSeats = (eventCapacity, attendingCount) => {
    const capacity = parseInt(eventCapacity, 10) || 0;
    const attending = parseInt(attendingCount, 10) || 0;
    return Math.max(0, capacity - attending);
  };

  useEffect(() => {
    if (id && event) {
      const fetchRSVPs = async () => {
        try {
          const { data } = await axios.get(`/event/${id}/rsvps`);
          const counts = data.reduce((acc, rsvp) => {
            acc[rsvp.status.toLowerCase()] = (acc[rsvp.status.toLowerCase()] || 0) + 1;
            return acc;
          }, {});
          setRsvpCounts(counts);
          setAvailableSeats(calculateAvailableSeats(event.capacity, counts.attending));
        } catch (err) {
          console.error("Error fetching RSVPs:", err);
        }
      };
      fetchRSVPs();
    }
  }, [id, event]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      await axios.delete(`/event/${event.id}`);
      toast.success("Event deleted successfully");
      navigate("/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.error || "Failed to delete event");
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-400">
        <p className="text-xl mb-4">{error}</p>
        <Link 
          to="/events" 
          className="bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  if (!event) {
    return <div className="text-center py-10 text-gray-400">Loading event details...</div>;
  }

  return (
    <div className="flex flex-col mx-5 xl:mx-32 md:mx-10 mt-20 flex-grow">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {event.image && (
            <div className="w-full h-[400px] relative overflow-hidden rounded-lg border border-gray-800 mb-6">
              <img
                src={`${axios.defaults.baseURL}${event.imageUrl}`}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <h1 className="text-3xl md:text-4xl font-extrabold text-red-600 mb-4">
            {event.title?.toUpperCase()}
          </h1>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
            <div className="mb-4">
              <h3 className="font-bold text-gray-300 mb-2">Date and Time</h3>
              <p className="text-gray-400">
                {format(new Date(event.date), 'PPP')} at {event.time}
              </p>
            </div>

            <div>
              <h3 className="font-bold text-gray-300 mb-2">Location</h3>
              <p className="text-gray-400">{event.location}</p>
            </div>
          </div>

          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
            <h2 className="text-xl font-bold text-red-500 mb-3">About this Event</h2>
            <p className="text-gray-300 whitespace-pre-line">{event.description}</p>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 sticky top-24">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-red-500 mb-4">Event Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400">Organized by:</span>
                  <span className="ml-2 text-white">{event.organizedBy}</span>
                </div>
                <div>
                  <span className="text-gray-400">Category:</span>
                  <span className="ml-2 text-white capitalize">
                    {event.category?.replace('_', ' ').toLowerCase()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Total Capacity:</span>
                  <span className="ml-2 text-white">{event.capacity}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-6">
              <h3 className="text-xl font-bold text-red-500 mb-4">Attendance</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-green-500">
                    {rsvpCounts.attending || 0}
                  </span>
                  <span className="text-sm text-gray-400">Attending</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-blue-500">
                    {availableSeats}
                  </span>
                  <span className="text-sm text-gray-400">Available</span>
                </div>
                <div className="text-center">
                  <span className="block text-2xl font-bold text-red-500">
                    {rsvpCounts.unavailable || 0}
                  </span>
                  <span className="text-sm text-gray-400">Unavailable</span>
                </div>
              </div>

              <RsvpButton 
                eventId={event.id} 
                availableSeats={availableSeats}
                onRSVPUpdate={() => {
                  axios.get(`/event/${id}/rsvps`)
                    .then(response => {
                      const counts = response.data.reduce((acc, rsvp) => {
                        acc[rsvp.status.toLowerCase()] = (acc[rsvp.status.toLowerCase()] || 0) + 1;
                        return acc;
                      }, {});
                      setRsvpCounts(counts);
                      setAvailableSeats(calculateAvailableSeats(event.capacity, counts.attending));
                      
                      window.dispatchEvent(new Event('rsvp-updated'));
                    })
                    .catch(err => console.error("Error updating RSVPs:", err));
                }}
              />
            </div>

            {user?.role === 'admin' && (
              <div className="mt-6 pt-6 border-t border-gray-800">
                <button
                  onClick={handleDelete}
                  className="w-full bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
                >
                  Delete Event
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}