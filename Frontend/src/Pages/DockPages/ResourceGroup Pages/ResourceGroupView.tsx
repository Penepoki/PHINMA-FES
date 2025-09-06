import { useEffect, useState } from "react";
import api from "../../../utils/api";
import BreadAndLogout from "../../../Components/Bread and Logout.tsx";
import {
  BuildingLibraryIcon,
  BookOpenIcon,
  BuildingOffice2Icon,
  RectangleStackIcon,
  CalendarDaysIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

interface ResourceGroupProps {
  setActiveView: (view: string) => void;
}

function ResourceGroup({ setActiveView }: ResourceGroupProps) {
  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [professors, setProfessors] = useState([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const [
          programsRes,
          subjectsRes,
          roomsRes,
          schedulesRes,
          professorsRes,
        ] = await Promise.all([
          api.get("/program/programs"),
          api.get("/subject/subjects"),
          api.get("/room/rooms"),
          api.get("/schedule/schedules"),
          api.get("/faculty/faculties"), // assuming professors are under faculty endpoint
        ]);

        setPrograms(programsRes.data);
        setSubjects(subjectsRes.data);
        setRooms(roomsRes.data);
        setSchedules(schedulesRes.data);
        setProfessors(professorsRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Simple spinner
  const Spinner = () => (
    <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-white border-t-transparent"></div>
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
          { label: "Resource Group" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">
        Resource Group Overview
      </h2>
      <div className="border-b-2 border-gray-600 shadow-2xl w-full">
        <span className="font-thin text-[#888888] block my-6 mx-6">
          This is where you can access and organize your institution’s resources—programs, subjects, rooms, sections, schedules, and professors—so that evaluation and classroom management run smoothly.
        </span>
      </div>

      <div className="z-10 flex overflow-auto h-full w-full flex-col items-center justify-center gap-6 md:flex-row p-6">
        {/* Programs */}
        <div className="rg-container bg-[#1c402a]/40 flex flex-col items-center md:gap-y-6 md:p-6">
          <BuildingLibraryIcon className="h-12 w-12 text-blue-400 mb-2" />
          <h2 className="mb-2 text-2xl font-bold">Programs</h2>
          <span className="text-xl text-gray-300">Number of current programs:</span>
          <span className="text-9xl text-white">{renderCount(programs.length)}</span>
        </div>

        {/* Subjects */}
        <div className="rg-container bg-[#1c3c2f]/40 flex flex-col items-center md:gap-y-6 md:p-6">
          <BookOpenIcon className="h-12 w-12 text-purple-400 mb-2" />
          <h2 className="mb-2 text-2xl font-bold">Subjects</h2>
          <span className="text-xl text-gray-300">Number of current subjects:</span>
          <span className="text-9xl text-white">{renderCount(subjects.length)}</span>
        </div>

        {/* Rooms */}
        <div className="rg-container bg-[#1c3734]/40 flex flex-col items-center md:gap-y-6 md:p-6">
          <BuildingOffice2Icon className="h-12 w-12 text-pink-400 mb-2" />
          <h2 className="mb-2 text-2xl font-bold">Rooms</h2>
          <span className="text-xl text-gray-300">Number of current rooms:</span>
          <span className="text-9xl text-white">{renderCount(rooms.length)}</span>
        </div>

        {/* Sections */}
        <div className="rg-container bg-[#1b3239]/40 flex flex-col items-center md:gap-y-6 md:p-6">
          <RectangleStackIcon className="h-12 w-12 text-red-400 mb-2" />
          <h2 className="mb-2 text-2xl font-bold">Sections</h2>
          <span className="text-xl text-gray-300">Number of current sections:</span>
          <span className="text-9xl text-white">{renderCount(programs.length)}</span>
        </div>

        {/* Schedules */}
        <div className="rg-container bg-[#1b2e3e]/40 flex flex-col items-center md:gap-y-6 md:p-6">
          <CalendarDaysIcon className="h-12 w-12 text-emerald-400 mb-2" />
          <h2 className="mb-2 text-2xl font-bold">Schedules</h2>
          <span className="text-xl text-gray-300">Number of current schedules:</span>
          <span className="text-9xl text-white">{renderCount(schedules.length)}</span>
        </div>

        {/* Professors */}
        <div className="rg-container bg-[#1a2845]/40 flex flex-col items-center md:gap-y-6 md:p-6">
          <UserGroupIcon className="h-12 w-12 text-yellow-400 mb-2" />
          <h2 className="mb-2 text-2xl font-bold">Professors</h2>
          <span className="text-xl text-gray-300">Number of current professors:</span>
          <span className="text-9xl text-white">{renderCount(professors.length)}</span>
        </div>
      </div>
    </div>
  );
}

export default ResourceGroup;
