import React, { useState } from "react";
import { Eye, EyeOff, PlusCircle } from "lucide-react";
import ImageSlideshow from "./ImageSlideShow";
import { FiArrowUpRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";


export default function SignUp() {

  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [errors, setErrors] = useState({});


    const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    armyNumber: "",
    idNumber: "",
    department: "",
    region: "",
    workType: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


 const validate = () => {
    let newErrors = {};
    if (!formData.firstName) newErrors.firstName = "First name is required";
    if (!formData.lastName) newErrors.lastName = "Last name is required";
    if (!formData.armyNumber) newErrors.armyNumber = "Army number is required";
    if (!formData.idNumber) newErrors.idNumber = "ID/Tier number is required";
    if (!formData.department) newErrors.department = "Select a department";
    if (!formData.region) newErrors.region = "Select a region";
    if (!formData.workType) newErrors.workType = "Select a work type";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      console.log("Form submitted:", formData);
      alert("Staff registered successfully!");
    }
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
          /> */}
        {/* </div> */}

        {/* Form container */}
        
        <form className="flex flex-col justify-center space-y-2" onSubmit={handleSubmit}>
          <div className="flex flex-row gap-2 justify-end items-center">
            <p className=" text-sm">Already have an account?</p>
            <button
              type="button" 
              onClick={() => navigate("/")}
              className="flex justify-center items-center gap-2 w-24 text-sm rounded-md border p-1 text-black hover:bg-gray-100 transition">
              Sign In
            </button>
          </div>
          <p className="text-sm text-left mt-2">
            <span className=" text-lg font-semibold">Sign up to access</span><br />
            Sign up with google account or use the form
          </p>

             <div className="space-y-1 relative">
              <label htmlFor="firstName" className="block font-semibold text-sm">
                First Name
              </label>

              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className="w-full py-1 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none" />
                <FiArrowUpRight className="absolute top-[29px] right-2 pointer-events-none" size={18} />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>


            <div className="space-y-1">
              <label htmlFor="middleName" className="block font-semibold text-sm">
                Middle Name
              </label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                placeholder="Enter your middle name"
                className="w-full py-1 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none" />
            </div>


          <div className="space-y-1">
            <label htmlFor="lastName" className="block font-semibold text-sm">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              className="w-full py-1 px-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-900 focus:outline-none" />
          </div>


          <div className="flex flex-row gap-2">
            <div className="space-y-1">
            <label htmlFor="armyNumber" className="block font-semibold text-sm">
              Army Number
            </label>
            <input
              type="text"
              name="armyNumber"
              value={formData.armyNumber}
              onChange={handleChange}
              placeholder="Enter your number"
              className="w-full text-sm rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-900"/>
            {errors.armyNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.armyNumber}</p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="idNumber" className="block font-semibold text-sm">
              ID/Tier Number
            </label>
            <div className="relative">
              <input
                type={visible ? "text" : "password"}
                name="idNumber"
                value={formData.idNumber}
                onChange={handleChange}
                placeholder="Enter your ID/Tier number"
                className="w-full text-sm rounded border content-center px-2 py-1 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-900"/>

                <button
                type="button"
                onClick={() => setVisible(!visible)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.idNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.idNumber}</p>
            )}
           </div>
          </div>


          <div className="space-y-1">
            <label htmlFor="department" className="block font-semibold text-sm">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full text-sm rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-900">
              <option value="">Select department</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              {/* Add more options as needed */}
            </select>
            {errors.department && (
              <p className="text-red-500 text-xs mt-1">{errors.department}</p>
            )}
          </div>


          <div className="space-y-1">
            <label htmlFor="region" className="block font-semibold text-sm">
              Region
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full text-sm rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-900">
              <option value="">Select region</option>
              <option value="North">North</option>
              <option value="South">South</option>
              <option value="East">East</option>
              <option value="West">West</option>
              {/* Add more options as needed */}
            </select>
            {errors.region && (
              <p className="text-red-500 text-xs mt-1">{errors.region}</p>
            )}
          </div>


          <div className="space-y-1">
            <label htmlFor="workType" className="block font-semibold text-sm">
              Work Type
            </label>
            <select
              name="workType"
              value={formData.workType}
              onChange={handleChange}
              className="w-full text-sm rounded border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-900">
              <option value="">Select work type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              {/* Add more options as needed */}
            </select>
            {errors.workType && (
              <p className="text-red-500 text-xs mt-1">{errors.workType}</p>
            )}
          </div>


          {/* Submit Button */}
          <button
            type="submit"
            className="flex justify-center gap-2 w-full rounded bg-green-700 px-4 py-2 font-semibold text-white hover:bg-green-800 transition">
            <PlusCircle size={18}/> Add Staff
          </button>
        </form>
      </div>
    </div>
  );
}


