import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../UserContext";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    const storedPassword = localStorage.getItem("rememberedPassword");
    if (storedEmail) {
      setEmail(storedEmail);
      setPassword(storedPassword);
    }
  }, []);

  async function loginUser(ev) {
    ev.preventDefault();

    try {
      const { data } = await axios.post("/login", { email, password });

      setUser(data.user);
      toast.success("Login successful!");

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      setRedirect(true);
    } catch (e) {
      if (e.response && e.response.data.error) {
        toast.error(e.response.data.error); 
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  }

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 px-8 py-10 rounded-lg border border-gray-800">
          <form className="flex flex-col gap-6" onSubmit={loginUser}>
            <h1 className="text-3xl font-bold text-red-600 text-center mb-6">
              Sign In
            </h1>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Email</label>
              <input
                type="email"
                className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-gray-300 font-medium">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-600 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  className="rounded border-gray-700 bg-gray-800 text-red-600 focus:ring-red-600"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                />
                Remember Me
              </label>
            </div>

            <button
              type="submit"
              className="bg-gray-300 text-black px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors mt-4"
            >
              Sign in
            </button>

            <div className="text-center mt-4">
              <span className="text-gray-400">Don't have an account? </span>
              <Link
                to="/register"
                className="text-red-600 hover:text-red-500 font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
