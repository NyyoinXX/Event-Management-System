import { useContext, useEffect, useState } from "react";
import { UserContext } from "../UserContext";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";
import { format } from "date-fns";

export default function UserAccountPage() {
  const { user, loading } = useContext(UserContext);
  const [userEvents, setUserEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [adminEventResponses, setAdminEventResponses] = useState({});

  useEffect(() => {
    if (user) {
      fetchUserEvents();
      if (user.role === 'admin') {
        fetchEventResponses();
      }
      
      const handleRSVPUpdate = () => {
        fetchUserEvents();
      };
      
      window.addEventListener('rsvp-updated', handleRSVPUpdate);
      
      return () => {
        window.removeEventListener('rsvp-updated', handleRSVPUpdate);
      };
    }
  }, [user]);

  const fetchUserEvents = async () => {
    try {
      console.log('Fetching events for user:', user.id);
      const response = await axios.get(`/user/${user.id}/rsvps`);
      console.log('Received events:', response.data);
      setUserEvents(response.data);
    } catch (error) {
      console.error("Error fetching user events:", error);
    } finally {
      setLoadingEvents(false);
    }
  };

  const fetchEventResponses = async () => {
    try {
      const response = await axios.get('/admin/event-responses');
      setAdminEventResponses(response.data);
    } catch (error) {
      console.error("Error fetching event responses:", error);
    }
  };

  const refreshEvents = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-400">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 mt-16">
      {/* User Profile Section */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800 mb-8">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Profile</h1>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Name:</span>
            <span className="ml-2 text-white">{user.name}</span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="ml-2 text-white">{user.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Account Type:</span>
            <span className="ml-2 text-white capitalize">{user.role}</span>
          </div>
        </div>
      </div>

      {user.role === 'admin' ? (
        // Admin View
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Event Responses</h2>
          
          {Object.entries(adminEventResponses).map(([eventId, responses]) => (
            <div key={eventId} className="mb-8 border-b border-gray-800 pb-6 last:border-0">
              <h3 className="text-xl font-bold text-white mb-4">
                {responses.eventTitle}
              </h3>
              
              <div className="grid gap-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Total Responses:</span>
                    <span className="text-white">{responses.total}</span>
                  </div>
                  <div className="flex justify-between mb-4">
                    <span className="text-gray-400">Attending:</span>
                    <span className="text-green-500">{responses.attending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unavailable:</span>
                    <span className="text-red-500">{responses.unavailable}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-lg font-semibold text-gray-300 mb-3">Attendee List</h4>
                  <div className="space-y-2">
                    {responses.attendees.map(attendee => (
                      <div key={attendee.id} className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
                        <div>
                          <p className="text-white">{attendee.name}</p>
                          <p className="text-sm text-gray-400">{attendee.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          attendee.status === 'ATTENDING' 
                            ? 'bg-green-900 text-green-200' 
                            : 'bg-red-900 text-red-200'
                        }`}>
                          {attendee.status.toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Regular User View
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h2 className="text-2xl font-bold text-red-600 mb-6">My Events</h2>
          
          {loadingEvents ? (
            <div className="text-center py-4 text-gray-400">Loading events...</div>
          ) : userEvents.length > 0 ? (
            <div className="grid gap-4">
              {userEvents.map((event) => (
                <Link 
                  key={event.id} 
                  to={`/event/${event.id}`}
                  className="block bg-gray-800 p-4 rounded-lg hover:border-red-600 border border-gray-700 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {format(new Date(event.date), 'PPP')} at {event.time}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {event.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      event.status === 'ATTENDING' 
                        ? 'bg-green-900 text-green-200' 
                        : 'bg-red-900 text-red-200'
                    }`}>
                      {event.status.toLowerCase()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">You haven't RSVP'd to any events yet.</p>
              <Link 
                to="/events" 
                className="inline-block bg-gray-300 text-black px-6 py-2 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
              >
                Browse Events
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
