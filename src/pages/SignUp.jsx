import React, { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ImageSlideshow from "./ImageSlideShow";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export default function SignUp() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("Finance Officer");
  const [visible1, setVisible1] = useState(false);
  const [visible2, setVisible2] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isUsername = (v) => /^[a-zA-Z0-9._-]{3,}$/.test(v);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !username || !role || !password || !confirm) {
      return setError("All fields are required.");
    }
    if (!isEmail(email)) return setError("Enter a valid email.");
    if (!isUsername(username)) return setError("Username must be 3+ chars, letters/numbers/._- only.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    try {
      setSubmitting(true);
      const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, username, password, role, confirm }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return setError(data?.error || "Sign up failed. Try again.");
      }
      navigate("/login", { replace: true });
    } catch {
      setError("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
      <div className="flex gap-6 p-6 bg-white rounded-xl shadow-xl max-w-4xl w-full">
        {/* Left: slideshow */}
        <ImageSlideshow />

        {/* Right: form */}
        <div className="flex flex-col justify-center flex-1 space-y-1 w-full max-w-sm relative pl-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm">
              Already have an account?{" "}
              <Link to="/login" className="underline hover:text-indigo-700">Click here to Login</Link>
            </p>
          </div>

          <h2 className="text-2xl text-gray-800">Create Account</h2>
          <p className="text-gray-600 text-sm">Authorized users only.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative w-full max-w-sm">
              <label className="block font-bold" htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Surname first"
              />
            </div>

            <div className="relative w-full max-w-sm">
              <label className="block font-bold" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value.trim())}
                placeholder="majpmkokowa@army.mil.ng"
                autoComplete="email"
              />
            </div>

            <div className="relative w-full max-w-sm">
              <label className="block font-bold" htmlFor="username">Username</label>
              <input
                id="username"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={username}
                onChange={(e) => setUsername(e.target.value.trim())}
                placeholder="PMKokowa"
                autoComplete="username"
              />
            </div>

            <div className="relative w-full max-w-sm">
              <label className="block font-bold" htmlFor="role">Role</label>
              <select
                id="role"
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none bg-white"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="Finance Officer">Finance Officer</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div className="relative w-full max-w-sm">
              <label className="block font-bold" htmlFor="password">Password</label>
              <input
                id="password"
                type={visible1 ? "text" : "password"}
                className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setVisible1(!visible1)}
                className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700"
                aria-label={visible1 ? "Hide password" : "Show password"}
              >
                {visible1 ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="relative w-full max-w-sm">
              <label className="block font-bold" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm"
                type={visible2 ? "text" : "password"}
                className="w-full py-2 px-3 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setVisible2(s => !s)}
                className="absolute right-3 bottom-3 text-gray-500 hover:text-gray-700"
                aria-label={visible2 ? "Hide confirm password" : "Show confirm password"}
              >
                {visible2 ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center w-full max-w-sm p-2 gap-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              <UserPlus size={18} /> {submitting ? "Creating..." : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}