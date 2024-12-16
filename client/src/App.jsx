import { Route, Routes } from 'react-router-dom';
import Layout from './Layout';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CreateEvent from './pages/CreateEvent';
import EventPage from './pages/EventPage';
import CalendarView from './pages/CalendarView';
import EventsPage from './pages/EventsPage';
import UserAccountPage from './pages/UserAccountPage';
import axios from 'axios';
import { UserContextProvider } from './UserContext';
import { ToastContainer } from 'react-toastify';
import ProtectedRoute from './components/ProtectedRoute';

axios.defaults.baseURL = 'http://localhost:4000';
axios.defaults.withCredentials = true;

function App() {
  return (
    <UserContextProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="events" element={<EventsPage />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="event/:id" element={<EventPage />} />
          
          <Route path="useraccount" element={
            <ProtectedRoute requireAuth>
              <UserAccountPage />
            </ProtectedRoute>
          } />
          <Route path="createevent" element={
            <ProtectedRoute requireAuth>
              <CreateEvent />
            </ProtectedRoute>
          } />

          <Route path="login" element={
            <ProtectedRoute requireAuth={false} redirectTo="/">
              <LoginPage />
            </ProtectedRoute>
          } />
          <Route path="register" element={
            <ProtectedRoute requireAuth={false} redirectTo="/">
              <RegisterPage />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </UserContextProvider>
  );
}

export default App;
