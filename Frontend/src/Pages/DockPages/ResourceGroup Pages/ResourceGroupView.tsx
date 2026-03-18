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
  const [sections, setSections] = useState([]);
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
          sectionsRes,
          roomsRes,
          schedulesRes,
          professorsRes
        ] = await Promise.all(
          [
            api.get("/program/programs"),
            api.get("/subject/subjects"),
            api.get("/section/sections"),
            api.get("/room/rooms"),
            api.get("/schedule/schedules"),
            api.get("/faculty/faculties"),
          ],
        );

        setPrograms(programsRes.data);
        setSubjects(subjectsRes.data);
        setSections(sectionsRes.data);
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
        breadcrumbs={[{ label: "Home", view: "home" }, { label: "Resource Group" }]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Resource Group Overview</h2>
      <div className="w-full border-b-2 border-gray-600 shadow-2xl">
        <span className="mx-6 my-6 block font-thin text-[#888888]">
          This is where you can access and organize your institution’s resources—programs, subjects,
          rooms, sections, schedules, and professors—so that evaluation and classroom management run
          smoothly.
        </span>
      </div>

      {/* ⬇️ Only this wrapper line is changed to fix mobile cut-off */}
      <div
        className="
          z-10 w-full p-6 gap-6
          grid grid-cols-1 md:grid-cols-3
          md:h-full md:content-center overflow-auto
        "
      >
        {/* Programs */}
        <div className="rg-container h-full flex flex-col items-center bg-[#1c402a]/40 md:gap-y-6 md:p-6">
          <BuildingLibraryIcon className="mb-2 h-12 w-12 text-blue-400" />
          <h2 className="mb-2 text-2xl font-bold">Programs</h2>
          <span className="text-xl text-gray-300 text-center">Number of current programs:</span>
          <span className="text-9xl text-white mt-auto">{renderCount(programs.length)}</span>
        </div>

        {/* Subjects */}
        <div className="rg-container h-full flex flex-col items-center bg-[#1c3c2f]/40 md:gap-y-6 md:p-6">
          <BookOpenIcon className="mb-2 h-12 w-12 text-purple-400" />
          <h2 className="mb-2 text-2xl font-bold">Subjects</h2>
          <span className="text-xl text-gray-300 text-center">Number of current subjects:</span>
          <span className="text-9xl text-white mt-auto">{renderCount(subjects.length)}</span>
        </div>

        {/* Rooms */}
        <div className="rg-container h-full flex flex-col items-center bg-[#1c3734]/40 md:gap-y-6 md:p-6">
          <BuildingOffice2Icon className="mb-2 h-12 w-12 text-pink-400" />
          <h2 className="mb-2 text-2xl font-bold">Rooms</h2>
          <span className="text-xl text-gray-300 text-center">Number of current rooms:</span>
          <span className="text-9xl text-white mt-auto">{renderCount(rooms.length)}</span>
        </div>

        {/* Sections */}
        <div className="rg-container h-full flex flex-col items-center bg-[#1b3239]/40 md:gap-y-6 md:p-6">
          <RectangleStackIcon className="mb-2 h-12 w-12 text-red-400" />
          <h2 className="mb-2 text-2xl font-bold">Sections</h2>
          <span className="text-xl text-gray-300 text-center">Number of current sections:</span>
          <span className="text-9xl text-white mt-auto">{renderCount(sections.length)}</span>
        </div>

        {/* Schedules */}
        <div className="rg-container h-full flex flex-col items-center bg-[#1b2e3e]/40 md:gap-y-6 md:p-6">
          <CalendarDaysIcon className="mb-2 h-12 w-12 text-emerald-400" />
          <h2 className="mb-2 text-2xl font-bold">Schedules</h2>
          <span className="text-xl text-gray-300 text-center">Number of current schedules:</span>
          <span className="text-9xl text-white mt-auto">{renderCount(schedules.length)}</span>
        </div>

        {/* Professors */}
        <div className="rg-container h-full flex flex-col items-center bg-[#1a2845]/40 md:gap-y-6 md:p-6">
          <UserGroupIcon className="mb-2 h-12 w-12 text-yellow-400" />
          <h2 className="mb-2 text-2xl font-bold">Professors</h2>
          <span className="text-xl text-gray-300 text-center">Number of current professors:</span>
          <span className="text-9xl text-white mt-auto">{renderCount(professors.length)}</span>
        </div>
      </div>
    </div>
  );
}

export default ResourceGroup;
