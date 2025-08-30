import { useEffect, useState } from "react";
import { useNavigate } from "react-router"; // keep consistent with your other file
import api from "../utils/api";

interface BreadAndLogoutProps {
  setActiveView: (view: string) => void;
  breadcrumbs: { label: string; view?: string }[];
}

export default function BreadAndLogout({ setActiveView, breadcrumbs }: BreadAndLogoutProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState("");
  const navigate = useNavigate();

  // Optional: protect the page—if no token, kick to login/root
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // or navigate("/") if that’s your login route
    }
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

      // Clear storages (mirror DashboardHeader behavior)
      localStorage.removeItem("token");
      localStorage.removeItem("firstName");
      sessionStorage.removeItem("firstName");

      setLogoutMessage("Logout successful!");

      // Close the modal before navigating
      (document.getElementById("logout_modal") as HTMLDialogElement)?.close();

      // Redirect to login/root
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      console.error(error);
      setLogoutMessage("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // If a breadcrumb view looks like a route (starts with "/"), navigate there.
  // Otherwise, fall back to SPA-style view switch.
  const handleCrumbClick = (view?: string) => {
    if (!view) return;
    if (view.startsWith("/")) navigate(view);
    else setActiveView(view);
  };

  return (
    <>
      <div className="relative flex items-center w-full pt-6 pb-2">
        {/* Breadcrumbs - centered */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <div className="breadcrumbs text-white">
            <ul>
              {breadcrumbs.map((b, i) => (
                <li key={`${i}-${b.label}`}>
                  <a onClick={() => handleCrumbClick(b.view)}>{b.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Logout button - right */}
        <button
          className="absolute right-6 text-md text-gray-300 underline z-10"
          onClick={() =>
            (document.getElementById("logout_modal") as HTMLDialogElement)?.showModal()
          }
        >
          Logout
        </button>
      </div>

      {/* Logout modal */}
      <dialog id="logout_modal" className="modal">
        <div className="modal-box w-11/12 max-w-md">
          <h3 className="text-center text-2xl font-bold">Confirm Logout</h3>
          <p className="mt-4 text-center text-gray-600">
            Are you sure you want to log out?
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
}
