import { useEffect, useState } from "react";
import api from "../../../utils/api";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";

interface ResourceGroupProps {
  setActiveView: (view: string) => void;
}

function ResourceGroup({ setActiveView }: ResourceGroupProps) {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [programsRes, subjectsRes, roomsRes, schedulesRes] = await Promise.all([
          api.get("/program/programs"),
          api.get("/subject/subjects"),
          api.get("/room/rooms"),
          api.get("/schedule/schedules"),
        ]);

        setPrograms(programsRes.data);
        setSubjects(subjectsRes.data);
        setRooms(roomsRes.data);
        setSchedules(schedulesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Simple spinner component
  const Spinner = () => (
    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
  );

  const renderCount = (count: number) => {
    if (isLoading) {
      return <Spinner />;
    }
    return <span>{count}</span>;
  };

  return (
    <div className="custom-container">
      {/* Breadcrumbs */}
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Profile View" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">
        Resource Group Overview
      </h2>
      <span className="font-thin text-[#888888] block mb-6">
        This is where you can access and organize your institution’s resources—programs, subjects, rooms, sections, and schedules—so that evaluation and classroom management run smoothly.
      </span>
      <div className="z-10 flex h-full w-full flex-col items-center justify-center gap-6 p-0 md:flex-row md:p-6">
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Courses</h2>
          <span className="text-xl text-gray-300">
            Number of current programs:
          </span>
          <span className="text-8xl text-white">
            {renderCount(programs.length)}
          </span>
        </div>
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Subjects</h2>
          <span className="text-xl text-gray-300">
            Number of current subjects:
          </span>
          <span className="text-8xl text-white">
            {renderCount(subjects.length)}
          </span>
        </div>
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Rooms</h2>
          <span className="text-xl text-gray-300">
            Number of current rooms:
          </span>
          <span className="text-8xl text-white">
            {renderCount(rooms.length)}
          </span>
        </div>
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Schedules</h2>
          <span className="text-xl text-gray-300">
            Number of current schedules:
          </span>
          <span className="text-8xl text-white">
            {renderCount(schedules.length)}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ResourceGroup;
