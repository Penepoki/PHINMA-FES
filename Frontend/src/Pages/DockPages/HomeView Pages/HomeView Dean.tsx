import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";
import Clock from "../../../Components/Dashboard Components/Dean Components/Clock";
import RecentlyEvaluatedFaculty from "../../../Components/Dashboard Components/Dean Components/Recently Evaluated";
import api from "../../../utils/api.ts";
import {resolveFacultyId} from "../../../utils/facultyContext";

interface HomeProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

const Home: React.FC<any> = ({ activeView, setActiveView }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [collegeName, setCollegeName] = useState<string | null>(null);
  const [isTempDean, setIsTempDean] = useState(false);

  useEffect(() => {
    const init = async () => {
      const isTemp = localStorage.getItem('isTempFaculty') === 'true';
      setIsTempDean(isTemp);
      // Prefer explicit faculty from route -> then resolved (HR temp cache or own) -> fallback local storage
      if (location.state?.facultyId) {
        setFacultyId(location.state.facultyId);
      } else {
        const resolved = await resolveFacultyId();
        if (resolved) setFacultyId(resolved);
        else {
          const storedFacultyId = localStorage.getItem('facultyId');
          if (storedFacultyId) setFacultyId(Number(storedFacultyId));
        }
      }
      if (location.state?.collegeName) setCollegeName(location.state.collegeName);
    };
    init();
  }, [location.state]);

  const handleBackToHR = async () => {
    try {
      const token = localStorage.getItem('token');
      await api.post('/clear-faculty-context/', {}, { headers: { Authorization: `Token ${token}` } });
    } catch (e) {
      console.warn('Clear faculty context failed (continuing anyway):', e);
    } finally {
      localStorage.removeItem('isTempFaculty');
      localStorage.removeItem('facultyId');
      // Adjust this route if your HR dashboard path differs
      navigate('/Dashboard/hr');
    }
  };

  console.log("Active View:", activeView); // Debugging line

  const [yearData, setYearData] = useState([
    {year: "1st", ratio: "0/0"},
    {year: "2nd", ratio: "0/0"},
    {year: "3rd", ratio: "0/0"},
    {year: "4th", ratio: "0/0"},
  ]);

  useEffect(() => {
    const fetchYearCounts = async () => {
      try {
        const paramsBase: any = {};
        if (facultyId) paramsBase.faculty = facultyId;
        // Could add program/professor filters if available in state
        const levels = ["1", "2", "3", "4"];
        const responses = await Promise.all(
            levels.map((lvl) =>
                api.get(
                    "/studentevaluationresponse/studentevaluationresponse/year-completion-summary",
                    {params: {...paramsBase, year_level: lvl}}
                )
            )
        );

        const mapped = responses.map((res, idx) => {
          const completed = res.data?.completed ?? 0;
          const total = res.data?.total ?? 0;
          const label = ["1st", "2nd", "3rd", "4th"][idx];
          return {year: label, ratio: `${completed}/${total}`};
        });
        setYearData(mapped);
      } catch (e) {
        console.error("Failed to fetch year-level counts", e);
      }
    };

    fetchYearCounts();
  }, [facultyId]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const prevCard = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? yearData.length - 1 : prev - 1,
    );
  };

  const nextCard = () => {
    setCurrentIndex((prev) =>
      prev === yearData.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center">
      <DashboardHeader />

      {/* HR as Dean Banner */}
      {isTempDean && (
        <div
          className="mt-30 flex w-full flex-col items-center justify-center gap-2 py-2 text-center text-lg font-bold text-white"
        >
          <span>
            Viewing as Dean
            {collegeName
              ? ` of ${collegeName}`
              : facultyId
                ? ` (Faculty ID: ${facultyId})`
                : ""}
          </span>

          <button
            className="rounded bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 
               px-3 py-1 text-white hover:opacity-90 hover:scale-105 
               transition duration-300 ease-in-out"
            onClick={handleBackToHR}
            title="Return to HR dashboard and clear faculty context"
          >
            ← Back to HR Dashboard
          </button>
        </div>
      )}

      {/*Recently Evaluated*/}
      <div
        className={`flex-col justify-center items-center w-full ${isTempDean ? "mt-0" : "mt-25"}`}>
        <RecentlyEvaluatedFaculty setActiveView={setActiveView} facultyId={facultyId} />
      </div>

      <div className="mt-5 text-center">
        <Clock />
        {/* Desktop View (Grid) */}
        <div className="float-breathe hidden flex-row items-center justify-center gap-6 md:flex">
          {yearData.map(({ year, ratio }) => (
            <YearCard
              key={year}
              year={year}
              ratio={ratio}
              setActiveView={setActiveView}
            />
          ))}
        </div>

        {/* Mobile View (Carousel) */}
        <div className="flex items-center justify-center gap-4 md:hidden">
          <button
            onClick={prevCard}
            className="text-primary rounded-full bg-white p-2"
          >
            ◀
          </button>

          <YearCard
            year={yearData[currentIndex].year}
            ratio={yearData[currentIndex].ratio}
            setActiveView={setActiveView}
          />

          <button
            onClick={nextCard}
            className="text-primary rounded-full bg-white p-2"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
