import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import SchoolCards from "../../../Components/Dashboard Components/HR Components/School Cards";
import api from "../../../utils/api";

function Home() {
  const [schools, setSchools] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Fetch faculties (schools) from backend
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await api.get("/faculty/faculties/", {
          headers: { Authorization: `Token ${token}` },
        });

        const data = Array.isArray(res.data) ? res.data : [];
        const schoolCards = data.map((f: any) => ({
          id: f.id,
          name: f.name,
          fullname: f.name,
          image: null,
        }));

        setSchools(schoolCards);
      } catch (e: any) {
        console.error("Failed to fetch faculties:", e);
        setLoadError("Failed to load schools. Please try again.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [navigate]);

  const handleSchoolClick = async (schoolNameOrId: any) => {
    try {
      const picked =
        schools.find((s) => s.name === schoolNameOrId || s.id === schoolNameOrId) || null;
      if (!picked) return;

      const token = localStorage.getItem("token");

      // 1) Clear any previous temp context (safe if none)
      await api.post(
        "/clear-faculty-context/",
        {},
        { headers: { Authorization: `Token ${token}` } },
      );

      // 2) Set the new context
      await api.post(
        "/set-faculty-context/",
        { faculty_id: picked.id },
        { headers: { Authorization: `Token ${token}` } },
      );

      // 3) Mark this session as “viewing as Dean”
      localStorage.setItem("isTempFaculty", "true");
      localStorage.setItem("facultyId", String(picked.id));
      localStorage.setItem("faculty_id", String(picked.id));

      // 4) Navigate to the Dean dashboard for that faculty
      navigate("/Dashboard/dean", {
        state: { facultyId: picked.id, collegeName: picked.name },
      });
    } catch (err) {
      console.error("Failed to switch faculty context:", err);
    }
  };

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center gap-y-6">
      <DashboardHeader />
      <div
        className="mt-60 flex h-full w-full flex-col items-center justify-start overflow-auto bg-black/5 rounded-2xl">
        {selectedSchool ? (
          <>
            <h2 className="mt-6 mb-4 text-4xl font-bold text-white">
              School: {selectedSchool.name}
            </h2>
            <button
              className="btn absolute left-20 mt-6 mb-4 bg-[#1c402a] text-xs text-gray-400 hover:scale-105"
              onClick={() => setSelectedSchool(null)}
            >
              ← Back to Schools
            </button>
            {/* You can show more details or CollegeCards here if needed */}
            <div className="text-white">Selected School ID: {selectedSchool.id}</div>
          </>
        ) : (
          <>
            {loadError && (
              <div className="alert alert-error mb-4 w-full max-w-4xl">
                <span>{loadError}</span>
              </div>
            )}

            {/* ▼ New title above the cards */}
            <div className="w-full text-center px-6 pt-6">
              <h2 className="text-2xl font-semibold text-white">
                PHINMA Saint Jude College Manila Departments
              </h2>
              <div className="mt-2 h-px w-full bg-white/20" />
            </div>

            <SchoolCards
              school={schools}
              isLoading={isLoading} // ← toggles daisyUI skeletons
              skeletonCount={5} // ← adjust how many placeholders you want
              onSchoolClick={(schoolNameOrId: any) => {
                handleSchoolClick(schoolNameOrId);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Home;
