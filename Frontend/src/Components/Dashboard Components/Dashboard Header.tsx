import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../utils/api.ts";

const DashboardHeader = () => {
  const [firstName, setFirstName] = useState("User");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await api.get("/user-dashboard/", {
          headers: { Authorization: `Token ${token}` },
        });
        setFirstName(response.data.first_name || "User");
      } catch (error: any) {
        if (error.response?.status === 401) navigate("/login");
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      await api.post("/logout/", null, {
        headers: { Authorization: `Token ${token}` },
      });

      localStorage.removeItem("token");
      localStorage.removeItem("firstName");

      setLogoutMessage("Logout successful!");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      console.error(error);
      setLogoutMessage("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="absolute top-0 z-1 flex h-[15%] w-full items-end justify-between border-b-2 border-gray-600 px-6 shadow-2xl backdrop-blur-lg">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:gap-6">
          <h1 className="text-5xl font-bold text-white md:text-7xl">
            Hi, {firstName}
          </h1>
          <p className="text-md text-gray-300">
            Welcome to the Home Page
          </p>
        </div>
        <button
          className="text-md text-gray-300 underline"
          onClick={() =>
            (document.getElementById("logout_modal") as HTMLDialogElement)?.showModal()
          }
        >
          Logout
        </button>
      </header>

      <dialog id="logout_modal" className="modal">
        <div className="modal-box w-11/12 max-w-md">
          <h3 className="text-center text-2xl font-bold">Confirm Logout</h3>
          <p className="mt-4 text-center text-gray-600">
            Are you sure you want to log out of your account?
          </p>

          {logoutMessage && (
            <div
              className={`mt-4 rounded-lg px-4 py-2 text-sm ${logoutMessage.includes("successful")
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {logoutMessage}
            </div>
          )}

          <div className="modal-action">
            <button
              className="btn btn-cancel"
              disabled={isLoggingOut}
              onClick={() =>
                (document.getElementById("logout_modal") as HTMLDialogElement)?.close()
              }
            >
              Cancel
            </button>
            <button
              className="btn btn-primary text-white"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
};

export default DashboardHeader;

