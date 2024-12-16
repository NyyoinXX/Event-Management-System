import { Link } from "react-router-dom";
import { useContext } from "react";
import { UserContext } from "../UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Logo from '../assets/Logo.png';

export default function Header() {
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await axios.post('/logout');
      setUser(null);
      localStorage.removeItem('user');
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <header className="bg-black text-white py-4 px-8 shadow-lg fixed w-full top-0 z-50">
      <nav className="flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:underline">
          <img 
            src={Logo} 
            alt="ACITY Logo" 
            className="h-12 w-auto"
          />
        </Link>

        <div className="flex items-center gap-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/events" className="hover:underline">
            Events
          </Link>
          <Link to="/calendar" className="hover:underline">
            Calendar
          </Link>
          {user ? (
            <>
              <Link to="/useraccount" className="hover:underline">
                My Account
              </Link>
              {isAdmin && (
                <Link to="/createEvent" className="hover:underline">
                  Create Event
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="hover:underline bg-red-500 px-4 py-2 rounded text-white font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
