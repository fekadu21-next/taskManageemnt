import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
const Login = () => {
  const { login } = useAuth();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(credentials);
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="pl-24 pt-8 min-h-screen bg-gray-100 p-4">
      <div className="bg-[#F3F4F6] p-6 rounded-2xl w-[600px] border border-gray-800">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">User Login</h2>
        </div>
        <hr className="border-t border-gray-800 mb-8 mt-6" />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                name="email"
                type="text"
                required
                value={credentials.email}
                onChange={handleChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                />
                <div
                  className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
          <button
            type="submit"
            className="bg-[#4E73A3] hover:bg-slate-500 text-white font-semibold py-2 px-6 rounded-md shadow-md transition w-full sm:w-auto cursor-pointer"
          >
            Log in
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
