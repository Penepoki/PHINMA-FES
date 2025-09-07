import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../utils/api.ts";

const greetings = ["Hi", "Bonjour", "Mabuhay"];

const DashboardHeader = () => {
  const [displayName, setDisplayName] = useState("User");
  const [greeting, setGreeting] = useState("Hi");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // --- Pick greeting based on visit counter ---
    const visitCount = parseInt(localStorage.getItem("visitCount") || "0", 10);
    const nextCount = visitCount + 1;
    localStorage.setItem("visitCount", nextCount.toString());
    setGreeting(greetings[visitCount % greetings.length]);

    // --- Fetch user data as before ---
    const fetchUserData = async () => {
      const cached = sessionStorage.getItem("fullName");
      if (cached) {
        setDisplayName(cached);
        return;
      }

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await api.get("/user-dashboard/", {
          headers: { Authorization: `Token ${token}` },
        });

        const name =
          response.data.full_name ||
          `${response.data.first_name ?? ""} ${response.data.last_name ?? ""}`.trim() ||
          "User";

        setDisplayName(name);
        sessionStorage.setItem("fullName", name);
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

        // Try to clear HR temp faculty context first (ignore if not HR)
        try {
            await api.post("/clear-faculty-context/");
        } catch {
        }

      await api.post("/logout/", null, {
        headers: { Authorization: `Token ${token}` },
      });

        // Clear both storages and user-related cache
      localStorage.removeItem("token");
        localStorage.removeItem("userRole");
        localStorage.removeItem("faculty_id");
        localStorage.removeItem("firstName");
        localStorage.removeItem("lastName");
      localStorage.removeItem("fullName");
      localStorage.removeItem("visitCount");
      sessionStorage.removeItem("fullName");

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
            <h1 className="text-5xl text-white md:text-7xl">
                <span className="font-thin">{greeting}</span>
                {", "}
                <span className="font-bold">{displayName}</span>
          </h1>
        </div>
        <button
            className="text-md flex items-center gap-2 text-gray-300 transition-transform duration-200 hover:scale-105 hover:underline"
          onClick={() =>
            (document.getElementById("logout_modal") as HTMLDialogElement)?.showModal()
          }
        >
          {/* Example logout icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
            />
          </svg>
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
                className={`mt-4 rounded-lg px-4 py-2 text-sm ${
                    logoutMessage.includes("successful")
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
