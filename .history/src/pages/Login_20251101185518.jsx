// import React, { useState } from "react";
// import { Eye, EyeOff, ArrowUpRight, Loader2 } from "lucide-react";
// import ImageSlideshow from "./ImageSlideShow";
// import { useNavigate } from "react-router-dom";

// const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

// export default function Login() {
//   const navigate = useNavigate();
//   const [identifier, setIdentifier] = useState(""); // email or username
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [visible, setVisible] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//   const isUsername = (v) => /^[a-zA-Z0-9._-]{3,}$/.test(v);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");

//     if (!identifier || !password) {
//       setError("Both fields are required.");
//       return;
//     }
//     if (!(isEmail(identifier) || isUsername(identifier))) {
//       setError("Enter a valid email or username (min 3 chars).");
//       return;
//     }
//     if (password.length < 6) {
//       setError("Password must be at least 6 characters.");
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await fetch(`${API_BASE}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({email: identifier.trim().toLowerCase(), password,}),
//       });
//       const data = await res.json().catch(() => ({}));
//       if (!res.ok) {
//         setError(data?.error || "Invalid credentials. Please try again.");
//         return;
//       }
//       localStorage.setItem("ps_auth", JSON.stringify({ token: data.token, user: data.user }));
//       navigate("/dashboard", { replace: true });
//     } catch {
//       setError("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
//       <div className="flex gap-6 p-6 bg-white rounded-xl shadow-xl max-w-3xl w-full">
//         <ImageSlideshow />

//         <div className="flex flex-col justify-center flex-1 space-y-3">
//           <div className="flex flex-col gap-2 mb-2 items-start">
//             <img src="/images/nafclogo.png" alt="NAFC Logo" className="h-20" />
//           </div>

//           <h2 className="text-2xl text-gray-800">Login</h2>
//           <p className="text-gray-600 text-sm mb-6">
//             Enter your email/username and password to <br/> access the Payroll Dashboard.
//           </p>

//           <form onSubmit={handleSubmit} className="space-y-3">
//             <div className="space-y-1 relative w-full max-w-sm">
//               <label htmlFor="identifier" className="block font-bold">
//                 Email or Username
//               </label>
//               <input
//                 id="identifier"
//                 type="text"
//                 placeholder="e.g. majpmk@army.mil.ng or pmkokowa"
//                 value={identifier}
//                 onChange={(e) => setIdentifier(e.target.value.trim())}
//                 className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none"
//                 autoComplete="username"
//               />
//             </div>

//             <div className="relative space-y-1 w-full max-w-sm">
//               <label htmlFor="password" className="block font-bold">
//                 Password
//               </label>
//               <input
//                 id="password"
//                 type={visible ? "text" : "password"}
//                 placeholder="Enter your password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none pr-10"
//                 autoComplete="current-password"
//               />
//               <button
//                 type="button"
//                 onClick={() => setVisible(!visible)}
//                 className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
//                 aria-label={visible ? "Hide password" : "Show password"}
//               >
//                 {visible ? <Eye size={18} /> : <EyeOff size={18} />}
//               </button>
//             </div>

//             <div className="flex items-center justify-between w-full max-w-sm">
//               <span className="text-sm text-gray-500">
//                 Finance officers only
//               </span>
//               <button
//                 type="button"
//                 onClick={() => navigate("/forgot-password")}
//                 className="text-sm text-indigo-600 hover:underline"
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             {error && <p className="text-sm text-center text-red-500">{error}</p>}

//             <button
//               type="submit"
//               disabled={loading}
//               className="flex items-center justify-center w-full max-w-sm p-2 gap-2 font-semibold text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60"
//             >
//               {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUpRight size={18} />}
//               {loading ? "Signing in..." : "Login"}
//             </button>

//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Eye, EyeOff, ArrowUpRight, Loader2 } from "lucide-react";
import ImageSlideshow from "./ImageSlideShow";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx"; //import useAuth

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); //use the context
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isUsername = (v) => /^[a-zA-Z0-9._-]{3,}$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Both fields are required.");
      return;
    }
    if (!(isEmail(identifier) || isUsername(identifier))) {
      setError("Enter a valid email or username (min 3 chars).");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      //Call the context login() method
      await login(identifier.trim().toLowerCase(), password);
      navigate("/dashboard", { replace: true }); // redirect on success
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
      <div className="flex gap-6 p-6 bg-white rounded-xl shadow-xl max-w-3xl w-full">
        <ImageSlideshow />

        <div className="flex flex-col justify-center flex-1 space-y-3">
          <div className="flex flex-col gap-2 mb-2 items-start">
            <img src="/images/nafclogo.png" alt="NAFC Logo" className="h-20" />
          </div>

          <h2 className="text-2xl text-gray-800">Login</h2>
          <p className="text-gray-600 text-sm mb-6">
            Enter your email/username and password to <br /> access the Payroll Dashboard.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1 relative w-full max-w-sm">
              <label htmlFor="identifier" className="block font-bold">
                Email or Username
              </label>
              <input
                id="identifier"
                type="text"
                placeholder="e.g. majpmk@army.mil.ng or pmkokowa"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value.trim())}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none"
                autoComplete="username"
              />
            </div>

            <div className="relative space-y-1 w-full max-w-sm">
              <label htmlFor="password" className="block font-bold">
                Password
              </label>
              <input
                id="password"
                type={visible ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none pr-10"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute bottom-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {visible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="flex items-center justify-between w-full max-w-sm">
              <span className="text-sm text-gray-500">
                Finance officers only
              </span>
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center w-full max-w-sm p-2 gap-2 font-semibold text-white transition-colors bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ArrowUpRight size={18} />
              )}
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
