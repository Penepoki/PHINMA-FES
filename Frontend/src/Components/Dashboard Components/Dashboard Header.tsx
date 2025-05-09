import {
  useEffect,
  useState,
} from "react";

const DashboardHeader = () => {
  const [firstName, setFirstName] =
    useState("User");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token =
          localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://127.0.0.1:8000/api/user-dashboard/",
          {
            method: "GET",
            headers: {
              "Content-Type":
                "application/json",
              Authorization: `Token ${token}`, // <- This is key
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Failed to fetch user"
          );
        }

        const data =
          await response.json();
        const nameParts =
          data.name.split(" ");
        setFirstName(
          nameParts[1] || "User"
        );
        localStorage.setItem(
          "firstName",
          nameParts[1] || "User"
        );
      } catch (error) {
        console.error(
          "Error fetching user data:",
          error
        );
      }
    };

    fetchUserData();
  }, []);

  return (
    <header className="flex z-1 w-full h-[15%] px-6 border-gray-600 border-b-2 shadow-2xl absolute top-0 justify-between items-end backdrop-blur-lg">
      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 sm:gap-6">
        <h1 className="text-5xl md:text-7xl font-bold text-white">
          Hi, {firstName}
        </h1>
        <p className="text-md text-gray-300">
          Welcome to the Home Page
        </p>
      </div>
      <button
        className="underline text-gray-300 text-md"
        onClick={() => {
          localStorage.clear(); // optional: clear all user data
          alert("Logged out!");
          window.location.href = "/"; // or use navigate('/')
        }}
      >
        Logout
      </button>
    </header>
  );
};

export default DashboardHeader;
