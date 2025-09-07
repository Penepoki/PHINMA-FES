import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect, useRef } from "react";
import api from "../../../utils/api";

interface RecentlyEvaluatedProps {
  setActiveView?: (view: string) => void;
  facultyId?: number | null;
}

interface FacultyData {
  evaluationNumber: number;
  name: string;
  image: string;
  studentData: number[];
  teacherData: number[];
}

const studentOptions = [
  "Listening",
  "Individual Thinking",
  "Group",
  "Answer Question",
  "Ask Question",
  "Whole Class Discussion",
  "Student Presentations",
  "Test/Quiz",
  "Waiting",
  "Other",
];

const teacherOptions = [
  "Lecture",
  "Realtime Writing",
  "Moving/Guiding",
  "Answer Questions",
  "Pose Question",
  "Follow-up Question",
  "1-on-1 discussion",
  "Demonstrative",
  "Administrative",
  "Waiting",
  "Other",
];

ChartJS.register(ArcElement, Tooltip, Legend);

/* -------------------------- Skeleton Components -------------------------- */
const FacultyCardSkeleton = () => {
  return (
    <>
      <p className="mb-2 text-lg text-center text-gray-300 sm:text-xl md:mb-6">
        Recently Evaluated Faculty:
      </p>

      <div
        className="tooltip tooltip-top flex w-full flex-col items-center justify-center"
        data-tip="Loading…"
      >
        <div
          className="float-breathe flex h-1/3 w-full flex-row items-center justify-center shadow-2xl sm:h-[30vh]"
          aria-busy="true"
        >
          {/* LEFT: Avatar + centered bars */}
          <div
            className="flex h-full w-full flex-col items-center justify-center rounded-l-xl p-5 backdrop-blur-lg backdrop-hue-rotate-100 md:w-1/3">
            <div className="avatar mb-3">
              <div className="rounded-full">
                <div className="skeleton h-52 w-52 rounded-full" />
              </div>
            </div>

            <div className="flex w-full max-w-[240px] flex-col items-center justify-center gap-2">
              <div className="skeleton h-8 w-3/4" />
            </div>
          </div>

          {/* MIDDLE (md+): Student Pie */}
          <div
            className="hidden h-full w-1/3 flex-col items-center justify-center p-5 text-white backdrop-blur-lg backdrop-hue-rotate-300 md:flex">
            <div className="skeleton mb-1 h-5 w-40" />
            <div className="skeleton aspect-square w-[min(90%,220px)] rounded-full" />
          </div>

          {/* RIGHT (md+): Teacher Pie */}
          <div
            className="hidden h-full w-1/3 flex-col items-center justify-center rounded-r-xl p-5 text-white backdrop-blur-lg backdrop-hue-rotate-400 md:flex">
            <div className="skeleton mb-1 h-5 w-40" />
            <div className="skeleton aspect-square w-[min(90%,220px)] rounded-full" />
          </div>
        </div>
      </div>
    </>
  );
};

/* ---------------------------- Chart Subcomponent ---------------------------- */
const FacultyPieChart = ({
  data,
  labels,
  title,
}: {
  data: number[];
  labels: string[];
  title: string;
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor: [
          "#4ade80",
          "#60a5fa",
          "#f87171",
          "#facc15",
          "#a78bfa",
          "#f472b6",
          "#38bdf8",
          "#fb923c",
          "#34d399",
          "#c084fc",
        ],
        hoverBackgroundColor: [
          "#22c55e",
          "#3b82f6",
          "#ef4444",
          "#eab308",
          "#8b5cf6",
          "#ec4899",
          "#0ea5e9",
          "#f97316",
          "#10b981",
          "#a855f7",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false as const, position: "top" as const },
      title: { display: true, text: title, font: { size: 14 } },
    },
  };

  return (
    <div className="relative h-full w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
};

/* --------------------------------- Main --------------------------------- */
const RecentlyEvaluatedFaculty: React.FC<RecentlyEvaluatedProps> = ({
  setActiveView,
  facultyId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [facultyData, setFacultyData] = useState<FacultyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const rotateTimer = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLatest = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/evaluation/evaluations/latest-with-tallies/?limit=3");
        const formatted = res.data.map((item: any) => ({
          evaluationNumber: item.evaluation_number,
          name: item.faculty_name,
          image: item.faculty_image || "https://via.placeholder.com/150",
          studentData: item.student_tallies,
          teacherData: item.teacher_tallies,
        }));
        if (isMounted) {
          setFacultyData(formatted);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error("Error fetching latest evaluations:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchLatest();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && facultyData.length > 0) {
      rotateTimer.current = window.setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % facultyData.length);
      }, 5000);
      return () => {
        if (rotateTimer.current) window.clearInterval(rotateTimer.current);
      };
    }
  }, [isLoading, facultyData.length]);

  if (isLoading) {
    return <FacultyCardSkeleton />;
  }

  if (facultyData.length === 0) {
    return (
      <>
        <p className="mb-2 text-lg text-gray-300 sm:text-xl md:mb-6">Recently Evaluated Faculty:</p>
        <div className="flex h-1/3 w-full items-center justify-center rounded-xl bg-black/20 p-6 sm:h-[30vh]">
          <span className="text-gray-400">No recent evaluations found.</span>
        </div>
      </>
    );
  }

  const currentFaculty = facultyData[currentIndex];

  return (
    <>
      <p className="mb-2 text-lg text-center text-gray-300 sm:text-xl md:mb-6">Recently Evaluated Faculty:</p>

      <div
        className="tooltip tooltip-top flex w-full flex-col items-center justify-center"
        data-tip="Click to view evaluation page"
      >
        <div
          onClick={() => setActiveView && setActiveView("evaluation")}
          className="float-breathe flex h-1/3 w-full cursor-pointer flex-row items-center justify-center shadow-2xl transition-transform hover:scale-[1.01] sm:h-[30vh]"
        >
          {/* LEFT: Avatar + name */}
          <div
            className="flex h-full w-full flex-col items-center justify-center rounded-l-xl p-5 backdrop-blur-lg backdrop-hue-rotate-100 md:w-1/3">
            <div className="avatar">
              <div className="w-52 rounded-full">
                <img src={currentFaculty.image} alt={currentFaculty.name} />
              </div>
            </div>
            <div className="text-center md:mt-4">
              <span className="text-3xl font-bold text-white">{currentFaculty.name}</span>
            </div>
          </div>

          {/* MIDDLE: Student Feedback (hidden on mobile) */}
          <div className="hidden h-full w-1/3 p-5 text-white backdrop-blur-lg backdrop-hue-rotate-300 md:block">
            <FacultyPieChart
              data={currentFaculty.studentData}
              labels={studentOptions}
              title="Student Feedback"
            />
          </div>

          {/* RIGHT: Teacher Feedback (hidden on mobile) */}
          <div
            className="hidden h-full w-1/3 rounded-r-xl p-5 text-white backdrop-blur-lg backdrop-hue-rotate-400 md:block">
            <FacultyPieChart
              data={currentFaculty.teacherData}
              labels={teacherOptions}
              title="Teacher Feedback"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default RecentlyEvaluatedFaculty;
