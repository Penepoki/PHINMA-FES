import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";
import RecentlyEvaluatedFaculty from "../../../Components/Dashboard Components/Dean Components/Recently Evaluated";
import Clock from "../../../Components/Dashboard Components/Dean Components/Clock";
import YearCard from "../../../Components/Dashboard Components/Dean Components/Year Card";
import api from "../../../utils/api";
import { resolveFacultyId } from "../../../utils/facultyContext";

interface HomeProps {
  activeView: string;
  setActiveView: (view: string) => void;
}

type YearDatum = { year: "1st" | "2nd" | "3rd" | "4th"; ratio: string };

const Home: React.FC<HomeProps> = ({ activeView, setActiveView }) => {
  const location = useLocation() as { state?: { collegeName?: string } };
  const navigate = useNavigate();

  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [collegeName, setCollegeName] = useState<string | null>(null);

  // Derived “Viewing as Dean” flag (backed by localStorage from your flow)
  const [isTempDean, setIsTempDean] = useState<boolean>(() => {
    return localStorage.getItem("isTempFaculty") === "true";
  });

  // --- Year cards state ---
  const [yearData, setYearData] = useState<YearDatum[]>([
    { year: "1st", ratio: "0/0" },
    { year: "2nd", ratio: "0/0" },
    { year: "3rd", ratio: "0/0" },
    { year: "4th", ratio: "0/0" },
  ]);
  const [isLoadingYears, setIsLoadingYears] = useState<boolean>(true);
  const [yearsError, setYearsError] = useState<string | null>(null);

  // --- Mobile carousel index ---
  const [currentIndex, setCurrentIndex] = useState(0);

  // Initialize faculty/collegeName on mount & when location.state changes
  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        const resolved = await resolveFacultyId();
        if (!isMounted) return;

        if (resolved) {
          setFacultyId(resolved);
        } else {
          const storedFacultyId = localStorage.getItem("facultyId");
          if (storedFacultyId) setFacultyId(Number(storedFacultyId));
        }

        if (location.state?.collegeName) {
          setCollegeName(location.state.collegeName);
        }
      } catch (e) {
        console.warn("Failed to resolve facultyId (continuing):", e);
      } finally {
        // Keep isTempDean synced (in case storage was changed elsewhere)
        setIsTempDean(localStorage.getItem("isTempFaculty") === "true");
      }
    };

    init();
    return () => {
      isMounted = false;
    };
  }, [location.state]);

  // Fetch year-level counts when facultyId is known
  useEffect(() => {
    // If you want to fetch even without a faculty filter, remove this early return.
    if (!facultyId) {
      // We’ll show skeletons until facultyId is available
      setIsLoadingYears(true);
      return;
    }

    let isMounted = true;
    const fetchYearCounts = async () => {
      setIsLoadingYears(true);
      setYearsError(null);

      try {
        const paramsBase: any = {};
        if (facultyId) paramsBase.faculty = facultyId;

        const levels = ["1", "2", "3", "4"];
        const responses = await Promise.all(
          levels.map((lvl) =>
            api.get(
              "/studentevaluationresponse/studentevaluationresponse/year-completion-summary",
              { params: { ...paramsBase, year_level: lvl } }
            )
          )
        );

        if (!isMounted) return;

        const mapped: YearDatum[] = responses.map((res, idx) => {
          const completed = res.data?.completed ?? 0;
          const total = res.data?.total ?? 0;
          const label = (["1st", "2nd", "3rd", "4th"][idx] as YearDatum["year"]);
          return { year: label, ratio: `${completed}/${total}` };
        });

        setYearData(mapped);
      } catch (e: any) {
        console.error("Failed to fetch year-level counts", e);
        setYearsError(
          e?.response?.data?.detail ||
          e?.message ||
          "Failed to load year completion summary."
        );
      } finally {
        if (isMounted) setIsLoadingYears(false);
      }
    };

    fetchYearCounts();
    return () => {
      isMounted = false;
    };
  }, [facultyId]);

  const handleBackToHR = async () => {
    try {
      const token = localStorage.getItem("token");
      await api.post(
        "/clear-faculty-context/",
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
    } catch (e) {
      console.warn("Clear faculty context failed (continuing anyway):", e);
    } finally {
      localStorage.removeItem("isTempFaculty");
      localStorage.removeItem("facultyId");
      navigate("/Dashboard/hr"); // adjust if your HR route differs
    }
  };

  // Carousel handlers
  const prevCard = () => {
    setCurrentIndex((prev) => (prev === 0 ? yearData.length - 1 : prev - 1));
  };
  const nextCard = () => {
    setCurrentIndex((prev) => (prev === yearData.length - 1 ? 0 : prev + 1));
  };

  console.log("Active View:", activeView); // Debugging line

  // Prebuild four placeholders to keep layout stable in loading state
  const loadingPlaceholders = useMemo<YearDatum[]>(
    () => [
      { year: "1st", ratio: "0/0" },
      { year: "2nd", ratio: "0/0" },
      { year: "3rd", ratio: "0/0" },
      { year: "4th", ratio: "0/0" },
    ],
    []
  );

  const cardsToRender = isLoadingYears ? loadingPlaceholders : yearData;

  return (
    <div className="home-page z-10 flex h-full w-full flex-col items-center justify-center">
      <DashboardHeader />

      {/* HR as Dean Banner */}
      {isTempDean && (
        <div className="mt-30 flex w-full flex-col items-center justify-center gap-2 py-2 text-center text-lg font-bold text-white">
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

      {/* Recently Evaluated */}
      <div
        className={`flex-col justify-center items-center w-full ${isTempDean ? "mt-0" : "mt-25"
          }`}
      >
        <RecentlyEvaluatedFaculty
          setActiveView={setActiveView}
          facultyId={facultyId ?? undefined}
        />
      </div>

      <div className="mt-5 text-center">
        <Clock />

        {/* Optional: inline error for year cards */}
        {yearsError && (
          <div className="mt-3 text-sm text-red-300">
            {yearsError}
          </div>
        )}

        {/* Desktop View (Grid) */}
        <div className="float-breathe hidden flex-row items-center justify-center gap-6 md:flex">
          {cardsToRender.map(({ year, ratio }) => (
            <YearCard
              key={year}
              year={year}
              ratio={ratio}
              setActiveView={setActiveView}
              isLoading={isLoadingYears}
            />
          ))}
        </div>

        {/* Mobile View (Carousel) */}
        <div className="flex items-center justify-center gap-4 md:hidden">
          <button
            onClick={prevCard}
            className="text-primary rounded-full bg-white p-2 disabled:opacity-50"
            disabled={isLoadingYears}
            aria-label="Previous"
          >
            ◀
          </button>

          <YearCard
            year={cardsToRender[currentIndex]?.year ?? "1st"}
            ratio={cardsToRender[currentIndex]?.ratio ?? "0/0"}
            setActiveView={setActiveView}
            isLoading={isLoadingYears}
          />

          <button
            onClick={nextCard}
            className="text-primary rounded-full bg-white p-2 disabled:opacity-50"
            disabled={isLoadingYears}
            aria-label="Next"
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
