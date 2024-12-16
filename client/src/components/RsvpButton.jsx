import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { toast } from 'react-toastify';

export default function RsvpButton({ eventId, availableSeats, onRSVPUpdate }) {
  const { user } = useContext(UserContext);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRsvpStatus();
    } else {
      setLoading(false);
    }
  }, [user, eventId]);

  const fetchRsvpStatus = async () => {
    try {
      const { data } = await axios.get(`/event/${eventId}/my-rsvp`);
      setRsvpStatus(data?.status || null);
    } catch (error) {
      console.error('Error fetching RSVP status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status) => {
    if (!user) {
      toast.error('Please login to RSVP');
      return;
    }

    if (status === 'ATTENDING' && availableSeats === 0) {
      toast.error('Sorry, this event is at full capacity');
      return;
    }

    try {
      const { data } = await axios.post(`/event/${eventId}/rsvp`, { status });
      setRsvpStatus(data.status);
      toast.success(`Successfully marked as ${status.toLowerCase()}`);
      if (onRSVPUpdate) onRSVPUpdate();
    } catch (error) {
      console.error('Error updating RSVP:', error);
      toast.error('Failed to update RSVP status');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => handleRsvp('ATTENDING')}
        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
          rsvpStatus === 'ATTENDING' 
            ? 'bg-green-600 text-white ring-2 ring-green-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-green-600 hover:text-white'
        }`}
      >
        Attending
      </button>
      <button
        onClick={() => handleRsvp('UNAVAILABLE')}
        className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 ${
          rsvpStatus === 'UNAVAILABLE' 
            ? 'bg-red-600 text-white ring-2 ring-red-600' 
            : 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white'
        }`}
      >
        Unavailable
      </button>
    </div>
  );
} 