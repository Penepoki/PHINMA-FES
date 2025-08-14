import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { useState, useEffect } from "react";
import api from "../../../utils/api"; // adjust the path if needed

interface RecentlyEvaluatedProps {
  setActiveView?: (view: string) => void;
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
      legend: { display: false, position: "top" as const },
      title: { display: true, text: title, font: { size: 14 } },
    },
  };

  return (
    <div className="relative h-full w-full">
      <Pie data={chartData} options={options} />
    </div>
  );
};

ChartJS.register(ArcElement, Tooltip, Legend);

const RecentlyEvaluatedFaculty: React.FC<RecentlyEvaluatedProps> = ({
  setActiveView,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [facultyData, setFacultyData] = useState<FacultyData[]>([]);

  // Fetch data from backend
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get(
          "/evaluation/evaluations/latest-with-tallies/?limit=3"
        );
        const formatted = res.data.map((item: any) => ({
          evaluationNumber: item.evaluation_number,
          name: item.faculty_name,
          image: item.faculty_image || "https://via.placeholder.com/150",
          studentData: item.student_tallies,
          teacherData: item.teacher_tallies,
        }));
        setFacultyData(formatted);
      } catch (err) {
        console.error("Error fetching latest evaluations:", err);
      }
    };

    fetchLatest();
  }, []);

  // Cycle through faculty data
  useEffect(() => {
    if (facultyData.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % facultyData.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [facultyData.length]);

  if (facultyData.length === 0) {
    return <p className="text-gray-400">Loading latest evaluations...</p>;
  }

  const currentFaculty = facultyData[currentIndex];

  return (
    <>
      <p className="mt-35 mb-2 text-lg text-gray-300 sm:text-xl md:mb-6">
        Recently Evaluated Faculty:
      </p>
      <div
        className="tooltip tooltip-top flex w-full flex-col items-center justify-center"
        data-tip="Click to view evaluation page"
      >
        <div
          onClick={() => setActiveView && setActiveView("evaluation")}
          className="float-breathe flex h-1/3 w-full flex-row items-center justify-center shadow-2xl hover:scale-101 sm:h-[30vh]"
        >
          {/* Faculty Info */}
          <div className="flex h-full w-full md:w-1/3 flex-col items-center justify-center rounded-l-xl p-5 backdrop-blur-lg backdrop-hue-rotate-100">
            <div className="avatar">
              <div className="w-24 rounded-full">
                <img src={currentFaculty.image} alt={currentFaculty.name} />
              </div>
            </div>
            <div className="text-center md:mt-4">
              <span className="text-3xl font-bold text-white">
                {currentFaculty.name}
              </span>
            </div>
          </div>

          {/* Student Feedback */}
          <div className="hidden md:block h-full w-1/3 p-5 text-white backdrop-blur-lg backdrop-hue-rotate-300">
            <FacultyPieChart
              data={currentFaculty.studentData}
              labels={studentOptions}
              title="Student Feedback"
            />
          </div>

          {/* Teacher Feedback */}
          <div className="hidden md:block h-full w-1/3 rounded-r-xl p-5 text-white backdrop-blur-lg backdrop-hue-rotate-400">
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
