import React, { useState } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("request"); // request | reset | done
  const [identifier, setIdentifier] = useState(""); // email/username
  const [error, setError] = useState("");

  const [sentTo, setSentTo] = useState("");
  const [sentCode, setSentCode] = useState(""); // demo only (would be emailed)
  const [code, setCode] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showP1, setShowP1] = useState(false);
  const [showP2, setShowP2] = useState(false);

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
//   const isUsername = (v) => /^[a-zA-Z0-9._-]{3,}$/.test(v);

  const sendReset = (e) => {
    e.preventDefault();
    setError("");

    if (!identifier) return setError("Enter your email address.");
    if (!(isEmail(identifier))) {
      return setError("Enter a valid email address.");
    }

    // Demo: generate and “send” a code. In production, call your API.
    const code = String(Math.floor(100000 + Math.random() * 900000));
    sessionStorage.setItem("ps_reset_demo", JSON.stringify({ id: identifier, code }));
    setSentCode(code);
    setSentTo(identifier);
    setStep("reset");
  };

  const resetPassword = (e) => {
    e.preventDefault();
    setError("");

    const saved = JSON.parse(sessionStorage.getItem("ps_reset_demo") || "{}");
    if (!code || code !== saved.code) return setError("Invalid or expired code.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirm) return setError("Passwords do not match.");

    // Demo: clear code and redirect. Replace with real API call.
    sessionStorage.removeItem("ps_reset_demo");
    setStep("done");
    setTimeout(() => navigate("/login", { replace: true }), 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
      {/* Container without slideshow */}
      <div className="p-6 bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex flex-col justify-center space-y-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 w-fit"
            aria-label="Back to Login"
          >
            <ArrowLeft size={16} /> Back to Login
          </Link>

          {step === "request" && (
            <>
              <h2 className="text-2xl text-gray-800">Forgot Password</h2>
              <p className="text-gray-600 text-sm">
                Enter your email. We’ll send a verification code to reset your password.
              </p>

              <form onSubmit={sendReset} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="identifier" className="block font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="identifier"
                      type="text"
                      placeholder="e.g. majpmk@army.mil"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value.trim())}
                      className="w-[350px] py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none pl-9"
                    />
                    <Mail className="absolute left-2 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  className="w-[350px] py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Send reset code
                </button>
              </form>
            </>
          )}

          {step === "reset" && (
            <>
              <h2 className="text-2xl text-gray-800">Verify Code & Reset</h2>
              <p className="text-gray-600 text-sm">
                We sent a 6‑digit code to <span className="font-semibold">{sentTo}</span>.
                {process.env.NODE_ENV !== "production" && (
                  <span className="ml-2 text-xs text-gray-500">(Demo code: {sentCode})</span>
                )}
              </p>

              <form onSubmit={resetPassword} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="code" className="block font-bold">Verification Code</label>
                  <input
                    id="code"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6‑digit code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-[350px] py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <div className="relative space-y-1">
                  <label htmlFor="password" className="block font-bold">New Password</label>
                  <input
                    id="password"
                    type={showP1 ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-[350px] py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowP1((s) => !s)}
                    className="absolute right-3 bottom-2 text-gray-500 w-[70px] hover:text-gray-700"
                  >
                    {showP1 ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="relative space-y-1">
                  <label htmlFor="confirm" className="block font-bold">Confirm Password</label>
                  <input
                    id="confirm"
                    type={showP2 ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-[350px] py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowP2((s) => !s)}
                    className="absolute right-3 bottom-2 text-gray-500 w-[70px] hover:text-gray-700"
                  >
                    {showP2 ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  className="w-[350px] py-2 rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700"
                >
                  Reset password
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="flex flex-col items-start gap-2">
              <CheckCircle2 className="text-emerald-600" size={28} />
              <h2 className="text-xl font-semibold">Password updated</h2>
              <p className="text-sm text-gray-600">Redirecting to Login…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}