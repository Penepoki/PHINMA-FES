import { useEffect, useState } from "react";
import api from "../../../utils/api";

interface ResourceGroupProps {
  setActiveView: (view: string) => void;
}

function ResourceGroup({ setActiveView }: ResourceGroupProps) {

  const [programs, setPrograms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [programsRes, subjectsRes, roomsRes, schedulesRes] = await Promise.all([
          api.get("/program/programs"),
          api.get("/subject/subjects"),
          api.get("/room/rooms"),
          api.get("/schedule/schedules"),
        ]);

        console.log("Courses:", programsRes.data);
        console.log("Subjects:", subjectsRes.data);
        console.log("Rooms:", roomsRes.data);
        console.log("Schedules:", schedulesRes.data);

        setPrograms(programsRes.data);
        setSubjects(subjectsRes.data);
        setRooms(roomsRes.data);
        setSchedules(schedulesRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchAllData();
  }, []);

  return (
    <div className="custom-container">
      {/* Breadcrumbs */}
      <div className="breadcrumbs">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>Resource Group</li>
        </ul>
      </div>
      <h2 className="mt-4 text-3xl font-bold text-white">
        Resource Group Overview
      </h2>
      <div className="z-10 flex h-full w-full flex-col items-center justify-center gap-6 p-0 md:flex-row md:p-6">
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Courses</h2>
          <span className="text-xl text-gray-300">
            Number of current programs:
          </span>
          <span className="text-8xl">{programs.length}</span>
        </div>
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Subjects</h2>
          <span className="text-xl text-gray-300">
            Number of current subjects:
          </span>
          <span className="text-8xl">{subjects.length}</span>
        </div>
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Rooms</h2>
          <span className="text-xl text-gray-300">
            Number of current rooms:
          </span>
          <span className="text-8xl">{rooms.length}</span>
        </div>
        <div className="rg-container md:gap-y-6 md:p-6">
          <h2 className="mb-4 text-4xl font-bold">Schedules</h2>
          <span className="text-xl text-gray-300">
            Number of current schedules:
          </span>
          <span className="text-8xl">{schedules.length}</span>
        </div>
      </div>
    </div>
  );
}

export default ResourceGroup;
