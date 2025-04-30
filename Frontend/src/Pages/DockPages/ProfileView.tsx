import React, { useState } from "react";
import ProfilePic from "../../assets/Dashboard Page Assets/Renzo_Picture no background.png";

const Profile: React.FC = () => {
  const [profileData, setProfileData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    location: "San Francisco, CA",
    phone: "+1 234 567 890",
    joined: "January 2021",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="profile-page flex flex-col md:flex-row justify-center items-center w-full h-full z-10 gap-6 p-4 md:p-8">
      {/* Profile Card Section */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center backdrop-blur-lg p-6 rounded-xl shadow-2xl text-white">
        <div className="avatar">
          <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={ProfilePic} alt="User Avatar" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4">{profileData.name}</h2>
        <p className="text-gray-300">Dean View</p>
        <input type="file" className="file-input file-input-ghost mt-4" />
      </div>

      {/* Profile Details Section */}
      <div className="w-full md:w-1/2 h-full backdrop-blur-lg  text-white p-6 rounded-xl shadow-2xl">
        <h3 className="text-2xl font-bold mb-4">Profile Information</h3>
        <form className="space-y-4 text-lg">
          <div>
            <label className="block text-sm mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleChange}
              type="email"
              className="input input-bordered w-full text-black"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="location">
              Location
            </label>
            <input
              id="location"
              name="location"
              value={profileData.location}
              onChange={handleChange}
              type="text"
              className="input input-bordered w-full text-black"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="phone">
              Phone
            </label>
            <input
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleChange}
              type="tel"
              className="input input-bordered w-full text-black"
            />
          </div>
          <div>
            <label className="block text-sm mb-1" htmlFor="joined">
              Joined
            </label>
            <input
              id="joined"
              name="joined"
              value={profileData.joined}
              onChange={handleChange}
              type="text"
              disabled
              className="input input-bordered w-full text-gray-500 bg-gray-100 cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary mt-4 w-full md:w-auto"
            onClick={(e) => {
              e.preventDefault();
              alert("Profile saved successfully!");
            }}
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
