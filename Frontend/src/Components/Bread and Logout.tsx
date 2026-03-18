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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setLogoutMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLogoutMessage("Session expired. Please log in again.");
        setTimeout(() => navigate("/login"), 300);
        return;
      }

        // Best-effort: clear HR temporary faculty context first
        try {
            await api.post("/clear-faculty-context/");
        } catch (clearError) {
          console.warn("Clear faculty context failed during logout (continuing):", clearError);
        }

      await api.post("/logout/", null, {
        headers: { Authorization: `Token ${token}` },
      });

      // Clear local/session data to prevent role/context bleed between users.
      [
        "token",
        "userRole",
        "faculty_id",
        "facultyId",
        "isTempFaculty",
        "is_superuser",
        "firstName",
        "lastName",
        "fullName",
        "visitCount",
      ].forEach((k) => localStorage.removeItem(k));
      ["firstName", "fullName", "userRole"].forEach((k) => sessionStorage.removeItem(k));

      setLogoutMessage("Logout successful!");
      (document.getElementById("logout_modal") as HTMLDialogElement)?.close();
      setTimeout(() => navigate("/"), 800);
    } catch (error) {
      console.error(error);
      setLogoutMessage("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCrumbClick = (view?: string) => {
    if (!view) return;
    if (view.startsWith("/")) navigate(view);
    else setActiveView(view);
  };

  return (
    <>
        <div className="relative flex w-full items-center pt-6 pb-2">
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
            className="group text-md absolute right-6 z-10 flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-gray-200 shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:border-red-400/40 hover:bg-red-500/10 hover:text-white"
          onClick={() =>
            (document.getElementById("logout_modal") as HTMLDialogElement)?.showModal()
          }
        >
          {/* Logout Icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5 transition-colors duration-200 group-hover:text-red-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
            />
          </svg>
          Logout
        </button>
      </div>

      {/* Logout modal */}
      <dialog id="logout_modal" className="modal">
        <div className="modal-box w-11/12 max-w-md border border-white/10 bg-[#111827] text-white shadow-2xl">
          <div className="mb-4 flex items-center gap-3 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-6 w-6 text-red-300"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M4.93 19h14.14c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.2 16c-.77 1.33.19 3 1.73 3Z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold">Confirm Logout</h3>
              <p className="text-sm text-white/70">This will end your current session.</p>
            </div>
          </div>

          <p className="mt-2 text-center text-sm text-white/70">
            Are you sure you want to log out?
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
              className="btn btn-cancel border-white/20 bg-white/10 text-white hover:bg-white/20"
              disabled={isLoggingOut}
              onClick={() =>
                (document.getElementById("logout_modal") as HTMLDialogElement)?.close()
              }
            >
              Cancel
            </button>
            <button
              className="btn border-none bg-red-600 text-white hover:bg-red-700"
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
