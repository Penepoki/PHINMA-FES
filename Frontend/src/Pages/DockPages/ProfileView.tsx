import React, { useState } from "react";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import ProfilePic from "../../assets/Dashboard Page Assets/Renzo_Picture no background.png";

interface ProfileProps {
  setActiveView: (view: string) => void;
}

function Profile({
  setActiveView,
}: ProfileProps) {
  const [profileData, setProfileData] =
    useState({
      name: "John Doe",
      email: "johndoe@example.com",
      location: "San Francisco, CA",
      phone: "+1 234 567 890",
      joined: "January 2021",
    });

  const [passwords, setPasswords] =
    useState({
      current: "",
      new: "",
      confirm: "",
    });

  const [
    showPassword,
    setShowPassword,
  ] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (
      passwords.new &&
      passwords.new !==
        passwords.confirm
    ) {
      alert(
        "New passwords do not match!"
      );
      return;
    }
    // TODO: Integrate with backend for saving profile and password
    alert(
      "Profile and password changes saved!"
    );
  };

  return (
    <div className="custom-container">
      <div className="breadcrumbs text-md text-white">
        <ul>
          <li>
            <a
              onClick={() =>
                setActiveView("home")
              }
            >
              Home
            </a>
          </li>
          <li>
            <a>Profile View</a>
          </li>
        </ul>
      </div>
      <div className="profile-page flex flex-col lg:flex-row items-start w-full min-h-screen z-10 gap-6 px-4 py-6 md:px-8 md:py-10">
        {/* Profile Card Section */}
        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center backdrop-blur-lg p-6 rounded-xl shadow-2xl text-white">
          <div className="avatar">
            <div className="w-20 md:w-46 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <img
                src={ProfilePic}
                alt="User Avatar"
              />
            </div>
          </div>
          <h2 className="text-2xl font-bold mt-4">
            {profileData.name}
          </h2>
          <p className="text-gray-300">
            Dean View
          </p>
          <input
            type="file"
            className="file-input file-input-ghost mt-4"
          />
        </div>

        {/* Profile Details Section */}
        <div className="w-full md:w-1/2 h-full backdrop-blur-lg text-white p-6 rounded-xl shadow-2xl overflow-y-auto overflow-x-clip">
          <h3 className="text-2xl font-bold mb-4">
            Profile Information
          </h3>
          <form
            onSubmit={handleSave}
            className="space-y-4 text-lg"
          >
            <div>
              <label className="block text-sm mb-1">
                Email
              </label>
              <input
                name="email"
                value={
                  profileData.email
                }
                onChange={handleChange}
                type="email"
                className="input input-bordered w-full text-black"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Location
              </label>
              <input
                name="location"
                value={
                  profileData.location
                }
                onChange={handleChange}
                type="text"
                className="input input-bordered w-full text-black"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Phone
              </label>
              <input
                name="phone"
                value={
                  profileData.phone
                }
                onChange={handleChange}
                type="tel"
                className="input input-bordered w-full text-black"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">
                Joined
              </label>
              <input
                value={
                  profileData.joined
                }
                type="text"
                disabled
                className="input input-bordered w-full text-gray-500 bg-gray-100 cursor-not-allowed"
              />
            </div>

            <hr className="my-4 border-gray-500" />

            <h4 className="text-xl font-semibold">
              Change Password
            </h4>
            {[
              "current",
              "new",
              "confirm",
            ].map((field) => (
              <div
                key={field}
                className="relative"
              >
                <label className="block text-sm mb-1 capitalize">
                  {field === "confirm"
                    ? "Confirm New Password"
                    : `${field} Password`}
                </label>
                <input
                  type={
                    showPassword[
                      field as keyof typeof showPassword
                    ]
                      ? "text"
                      : "password"
                  }
                  name={field}
                  value={
                    passwords[
                      field as keyof typeof passwords
                    ]
                  }
                  onChange={
                    handlePasswordChange
                  }
                  className="input input-bordered w-full text-black pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) => ({
                        ...prev,
                        [field]:
                          !prev[
                            field as keyof typeof prev
                          ],
                      })
                    )
                  }
                  className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword[
                    field as keyof typeof showPassword
                  ] ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            ))}

            <button
              type="submit"
              className="btn btn-primary mt-4 w-full md:w-auto text-white"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
