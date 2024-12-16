import Footer from './pages/Footer';
import Header from './pages/Header';
import { Outlet, useLocation } from "react-router-dom";

export default function Layout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Header />
      <main className="flex-grow text-white">
        <Outlet />
      </main>
      {!isLandingPage && <Footer />}
    </div>
  );
}
