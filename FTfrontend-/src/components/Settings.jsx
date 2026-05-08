import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const API_URL = "http://127.0.0.1:8000";

const Settings = () => {
  const { user, setUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    profile_photo: null,
  });
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        profile_photo: null,
      });
      setPreviewPhoto(
  user.profile_photo
    ? user.profile_photo.startsWith("http")
      ? user.profile_photo
      : `${API_URL}/storage/${user.profile_photo}`
    : `https://i.pravatar.cc/150?u=${user.email}`
);

    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile_photo" && files.length > 0) {
      setFormData((prev) => ({ ...prev, profile_photo: files[0] }));
      setPreviewPhoto(URL.createObjectURL(files[0]));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    // ✅ Frontend validation for password
    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const formPayload = new FormData();
    formPayload.append("name", formData.name);
    formPayload.append("email", formData.email);
    if (formData.password) formPayload.append("password", formData.password);
    if (formData.profile_photo)
      formPayload.append("profile_photo", formData.profile_photo);

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You are not logged in.");
        return;
      }

const response = await fetch(`${API_URL}/api/user/update-profile`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formPayload,
});



      const data = await response.json();

      if (response.status === 401) {
        setError("Session expired. Please login again.");
        return;
      }

      if (!response.ok) {
        setError(
          data.errors
            ? Object.values(data.errors).flat().join(", ")
            : data.message || "Update failed"
        );
        return;
      }

      if (data.user && setUser) {
        setUser((prevUser) => {
          const updatedUser = { ...prevUser, ...data.user };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return updatedUser;
        });

        setPreviewPhoto(
          data.user.profile_photo.startsWith("http")
            ? data.user.profile_photo + "?t=" + new Date().getTime()
            : `${API_URL}/storage/${data.user.profile_photo}?t=` +
                new Date().getTime()
        );
      }

      setMessage("Profile updated successfully.");
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="px-2 bg-gray-100 shadow-md max-w-3xl mx-auto mt-6 rounded-lg p-6">
      {/* <h1 className="text-2xl font-semibold mb-6 text-gray-900">Settings</h1> */}
      <div className="flex items-center space-x-6 mb-8">
        <img
          src={previewPhoto}
          alt={formData.name}
          className="rounded-full w-20 h-20 object-cover border border-gray-300"
        />
        <div>
          <h2 className="text-xl font-bold text-gray-800">{formData.name}</h2>
          <p className="text-gray-500 capitalize">{user.role}</p>
        </div>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {message && <p className="text-green-600 mb-4">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="block mb-1 font-medium text-gray-700"
          >
            Username
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block mb-1 font-medium text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
        </div>

        <div className="relative">
          <label
            htmlFor="password"
            className="block mb-1 font-medium text-gray-700"
          >
            New Password (leave blank to keep current)
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full border border-gray-300 rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring focus:ring-indigo-300"
          />
          <div
            className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer top-[2.2rem]"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-500" />
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="profile_photo"
            className="block mb-1 font-medium text-gray-700"
          >
            Profile Photo
          </label>
          <input
            type="file"
            name="profile_photo"
            id="profile_photo"
            accept="image/*"
            onChange={handleChange}
            className="w-full text-gray-700"
          />
        </div>

        <button
          type="submit"
          className="bg-slate-600 cursor-pointer hover:bg-gray-900 text-white py-2 px-4 rounded-md font-semibold transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Settings;
