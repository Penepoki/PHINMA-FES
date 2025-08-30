import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";
import Clock from "../../../Components/Dashboard Components/Dean Components/Clock";
import RecentlyEvaluatedFaculty from "../../../Components/Dashboard Components/Dean Components/Recently Evaluated";
import api from "../../../utils/api.ts";

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
    const isTemp = localStorage.getItem('isTempFaculty') === 'true';
    const storedFacultyId = localStorage.getItem('facultyId');
    setIsTempDean(isTemp);
    if (isTemp && storedFacultyId) setFacultyId(Number(storedFacultyId));
    if (location.state?.facultyId) setFacultyId(location.state.facultyId);
    if (location.state?.collegeName) setCollegeName(location.state.collegeName);
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

  const yearData = [
    {
      year: "1st",
      ratio: "16/32",
    },
    {
      year: "2nd",
      ratio: "34/72",
    },
    {
      year: "3rd",
      ratio: "52/52",
    },
    {
      year: "4th",
      ratio: "11/12",
    },
  ];

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
          className="mt-40 flex w-full items-center justify-center bg-gradient-to-r from-[#1c402a]/40 to-[#1b2e3e]/40 py-2 text-center text-lg gap-4 font-bold text-white">
          <span>
            Viewing as Dean{collegeName ? ` of ${collegeName}` : facultyId ? ` (Faculty ID: ${facultyId})` : ''}
          </span>
          <button
            className="rounded bg-yellow-800 px-3 py-1 text-white hover:opacity-90"
            onClick={handleBackToHR}
            title="Return to HR dashboard and clear faculty context"
          >
            ← Back to HR Dashboard
          </button>
        </div>
      )}

      {/*Recently Evaluated*/}
      <div
        className={`flex-col justify-center items-center w-full ${isTempDean ? "mt-0" : "mt-35"}`}>
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
