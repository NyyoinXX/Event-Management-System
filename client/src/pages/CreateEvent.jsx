import { useContext, useState, useEffect } from "react";
import { UserContext } from "../UserContext";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function CreateEvent() {
  const { user, loading } = useContext(UserContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizedBy: "",
    date: "",
    time: "",
    location: "",
    category: "",
    capacity: "",
    image: null,
  });

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error("Please login to create events");
        navigate("/login");
      } else if (user.role !== "admin") {
        toast.error("Only administrators can create events");
        navigate("/");
      }
    }
  }, [user, loading, navigate]);

  const handleImageUpload = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to create events");
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      toast.error("Only administrators can create events");
      navigate("/");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("organizer", formData.organizedBy);
    data.append("date", formData.date);
    data.append("time", formData.time);
    data.append("location", formData.location);
    data.append("category", formData.category);
    data.append("capacity", formData.capacity);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const response = await axios.post("/createEvent", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true
      });

      if (response.data.event) {
        toast.success("Event created successfully!");
        navigate("/events");
      } else {
        throw new Error("Failed to create event");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Please login again");
        navigate("/login");
      } else if (error.response?.status === 403) {
        toast.error("Admin access required");
        navigate("/");
      } else {
        console.error("Error creating event:", error);
        toast.error(error.response?.data?.error || "Failed to create event");
      }
    }
  };

  if (loading) {
    return <div className="text-center mt-8 text-gray-400">Loading...</div>;
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-col mx-auto max-w-2xl px-4 py-8">
      <div>
        <h1 className="font-bold text-4xl mb-8 text-red-600">Create Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Title</label>
          <input
            type="text"
            name="title"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Organized By</label>
          <input
            type="text"
            name="organizedBy"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            value={formData.organizedBy}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Description</label>
          <textarea
            name="description"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none h-32 resize-none"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Event Date</label>
          <input
            type="date"
            name="date"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Event Time</label>
          <input
            type="time"
            name="time"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            value={formData.time}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Location</label>
          <input
            type="text"
            name="location"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            required
          >
            <option value="">Select a category</option>
            <option value="CLUB_ACTIVITY">Club Activity</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="SEMINAR">Seminar</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Capacity</label>
          <input
            type="number"
            name="capacity"
            min="1"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none"
            value={formData.capacity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-gray-300 font-medium">Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-red-600 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-300 file:text-black hover:file:bg-red-600 hover:file:text-white file:transition-colors"
            onChange={handleImageUpload}
          />
        </div>

        <button 
          className="mt-4 bg-gray-300 text-black px-6 py-3 rounded-lg font-semibold hover:bg-red-600 hover:text-white transition-colors"
          type="submit"
        >
          Create Event
        </button>
      </form>
    </div>
  );
}
