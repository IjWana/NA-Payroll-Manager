import React, { useState } from "react";
import { Eye, EyeOff, ArrowUpRight } from "lucide-react";
import ImageSlideshow from "./ImageSlideShow";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const navigate = useNavigate();
  const [armyNumber, setArmyNumber] = useState("");
  const [tierNumber, setTierNumber] = useState("");
  const [error, setError] = useState("");
  const [visible, setVisible] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!armyNumber || !tierNumber) {
      setError("Both fields are required.");
      return;
    }

    if (!/^\d+$/.test(armyNumber)) {
      setError("Army number must be numeric.");
      return;
    }

    setError("");
    alert(`Signed in with Army Number: ${armyNumber}, Tier: ${tierNumber}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-700 p-4">
      <div className="flex gap-6 p-8 bg-white rounded-xl shadow-xl max-w-4xl w-full">

        {/* Image div */}
        <ImageSlideshow />
        {/* <div className=" w-96 h-full flex items-center justify-center rounded overflow-hidden bg-gray-100">
          <img
            src="/Images/Frame1.svg"
            alt="slide show"
            className="object-cover w-full h-full"
          /> 
        </div> */}

        {/* Form container */}
        <div className="flex flex-col justify-center flex-1 space-y-3">
          <div className="flex flex-col gap-2 mb-2 items-start">
            <img src="/Icons/NAFC_Logo.svg" alt="NAFC Logo" className="h-20" />

            {/* <img src="/Icons/Vector.svg" alt="Arrow Left" className="h-5 mt-2 cursor-pointer"/> */}
          </div>

          <h2 className="text-2xl text-gray-800">Sign In</h2>
          <p className="text-gray-600 text-sm mb-6">
            Sign in with your Army number and Tier number to gain access
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="armyNumber" className="block font-bold">
                Army Number
              </label>
              <p className="text-sm text-gray-500 mb-1">
                Enter your Army Number
              </p>
              <input
                id="armyNumber"
                type="text"
                placeholder="Enter Army Number"
                value={armyNumber}
                onChange={(e) => setArmyNumber(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none"/>
            </div>

            <div className="relative space-y-1">
              <label htmlFor="tierNumber" className="block font-bold">
                ID Number
              </label>
              <p className="text-sm text-gray-500 mb-1">
                This will identify your tier and access level
              </p>
              <input
                id="tierNumber"
                type={visible ? "text" : "password"}
                placeholder="Enter ID / Tier Number"
                value={tierNumber}
                onChange={(e) => setTierNumber(e.target.value)}
                className="w-full py-2 px-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none pr-10"/>
              <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute bottom-2 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label={visible ? "Hide tier number" : "Show tier number"}
              >
                {visible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            {error && (
              <p className="text-sm text-center text-red-500">{error}</p>
            )}

            <button
              type="submit"
              className="flex items-center justify-end w-full p-2 gap-40 font-semibold text-black transition-colors bg-gray-400 rounded-md hover:bg-gray-500"
            >
              Sign In
              <ArrowUpRight size={18} />
            </button>
             <p>Don't have an account? <span className="underline cursor-pointer hover:text-red-600"
            onClick={() => navigate("/SignUp")}>Click here to Sign Up</span></p>
          </form>
        </div>
      </div>
    </div>
  );
}

