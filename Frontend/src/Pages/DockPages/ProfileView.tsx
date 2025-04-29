import React from "react";
import ProfilePic from "../../assets/Dashboard Page Assets/Renzo_Picture no background.png";

const Profile: React.FC = () => {
  return (
    <div className="profile-page flex flex-col md:flex-row justify-center items-center w-full h-full z-10 gap-6 p-0">
      {/* Profile Card Section */}
      <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center backdrop-blur-lg backdrop-hue-rotate-700 p-6 rounded-lg shadow-lg text-white">
        <div className="avatar">
          <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
            <img src={ProfilePic} alt="User Avatar" />
          </div>
        </div>
        <h2 className="text-2xl font-bold mt-4">John Doe</h2>
        <p className="text-gray-300">Dean View</p>
        <input type="file" className="file-input file-input-ghost" />
      </div>

      {/* Profile Details Section */}
      <div className="w-full md:w-1/2 h-full backdrop-blur-lg backdrop-hue-rotate-700 text-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold">Profile Information</h3>
        <div className="mt-4 space-y-3 text-lg">
          <p>
            <strong>Email:</strong> johndoe@example.com
          </p>
          <p>
            <strong>Location:</strong> San Francisco, CA
          </p>
          <p>
            <strong>Phone:</strong> +1 234 567 890
          </p>
          <p>
            <strong>Joined:</strong> January 2021
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
