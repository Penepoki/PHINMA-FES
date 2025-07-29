import React, { useEffect, useState } from "react";
import api from "../../../utils/api";
import DataTable, { Column } from "../../../Components/Evaluation Components/Data Table";
import ProgramCards from "../../../Components/Evaluation Components/ProgramCards.tsx";

// Simple skeleton loader components
const SkeletonBox = ({ width = '100%', height = 24, className = '' }) => (
  <div
    className={`bg-gray-300 animate-pulse rounded ${className}`}
    style={{ width, height, margin: '0.25rem 0' }}
  />
);

const SkeletonProgramCards = () => (
  <div className="w-full rounded-xl bg-black/20">
    <div className="flex flex-col items-center">
      <p className="mt-6 text-xl text-gray-300">Program List:</p>
      <div className="flex flex-wrap justify-center gap-6 px-6 py-6 md:mt-6 md:px-0">
        {[1,2,3,4].map((i) => (
          <div key={i} className="w-full sm:w-1/2 lg:w-1/4">
            <SkeletonBox height={96} />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const SkeletonTable = ({ rows = 4, cols = 2 }) => (
  <table className="w-full">
    <tbody>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} className="px-2 py-2"><SkeletonBox height={20} /></td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
interface StudentEvalProps {
  setActiveView: (view: string) => void;
}

interface Program {
  id: number;
  name: string;
}

interface Professor {
  id: number;
  full_name: string;
  first_name?: string;
  last_name?: string;
}

interface Schedule {
  id: number;
  name: string;
  // Add more fields as needed
}

interface Section {
  id: number;
  name: string;
  // Add more fields as needed
}

interface SFFData {
  // Define SFF data structure
  [key: string]: any;
}

function StudentEvaluation({ setActiveView }: StudentEvalProps) {
  // Step state
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Data state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [sffData, setSffData] = useState<SFFData | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentResponses, setStudentResponses] = useState<{ [userId: string]: any[] }>({});

  // Loading state
  const [loading, setLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);

  // Fetch programs for the faculty on mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const faculty_id = localStorage.getItem("faculty_id");
        if (!token) return;
        const params: any = {};
        if (faculty_id) params.faculty_id = faculty_id;
        const response = await api.get("/program/programs/", {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrograms(response.data);
      } catch (e) {
        setPrograms([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  // Fetch professors for selected program
  useEffect(() => {
    if (!selectedProgram) return;
    setSelectedProfessor(null);
    setSelectedSchedule(null);
    setSelectedSection(null);
    setSffData(null);
    const fetchProfessors = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/program-professor/program-professors/", {
          params: { program_id: selectedProgram.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessors(
          res.data.map((item: any) => ({
            id: item.professor,
            full_name: item.professor_details?.full_name || `Professor ID: ${item.professor}`,
            first_name: item.professor_details?.first_name,
            last_name: item.professor_details?.last_name,
          }))
        );
      } catch (e) {
        setProfessors([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessors();
  }, [selectedProgram]);

  // Fetch schedules for selected professor
  useEffect(() => {
    if (!selectedProfessor || !selectedProgram) return;
    setSelectedSchedule(null);
    setSelectedSection(null);
    setSffData(null);
    const fetchSchedules = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/schedule/schedules/", {
          params: { professor: selectedProfessor.id, program: selectedProgram.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSchedules(res.data);
      } catch (e) {
        setSchedules([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedules();
  }, [selectedProfessor, selectedProgram]);

  // Fetch sections for selected schedule
  useEffect(() => {
    if (!selectedSchedule) return;
    setSelectedSection(null);
    setSections([]);
    setSffData(null);
    const fetchSections = async () => {
      setSectionsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        // Adjust endpoint as needed
        const res = await api.get(`/schedule/schedules/${selectedSchedule.id}/sections/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSections(res.data);
      } catch (e) {
        setSections([]);
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, [selectedSchedule]);

  // Fetch SFF data for selected section
  useEffect(() => {
    if (!selectedSection) return;
    setSffData(null);
    const fetchSFF = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        // Adjust endpoint as needed
        const res = await api.get(`/studentevaluation/studentevaluation/by-section/${selectedSection.id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSffData(res.data);
      } catch (e) {
        setSffData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSFF();
  }, [selectedSection]);

  // Fetch students for selected section
  useEffect(() => {
    if (!selectedSection) return;
    setStudents([]);
    setStudentResponses({});
    setStudentsLoading(true);
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get(`/section/sections/${selectedSection.id}/students/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
      } catch (e) {
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSection]);

  // Fetch responses for each student for the current evaluation
  useEffect(() => {
    if (!students.length || !sffData?.id) return;
    const fetchResponses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const responsesMap: { [userId: string]: any[] } = {};
      await Promise.all(
        students.map(async (student) => {
          try {
            const res = await api.get(
              `/studentevaluation/studentevaluation/${sffData.id}/responses/?user=${student.id}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            responsesMap[student.id] = res.data;
          } catch {
            responsesMap[student.id] = [];
          }
        })
      );
      setStudentResponses(responsesMap);
    };
    fetchResponses();
  }, [students, sffData]);

  // Columns for DataTable
  const professorColumns: Column<Professor>[] = [
    { header: "Name", accessor: (prof) => prof.full_name },
  ];
  const scheduleColumns: Column<Schedule>[] = [
    { header: "Schedule Name", accessor: (s) => s.name },
  ];
  const sectionColumns: Column<Section>[] = [
    { header: "Section Name", accessor: (sec) => sec.name },
  ];
  const studentColumns: Column<any>[] = [
    { header: "Student Name", accessor: (stu) => `${stu.first_name} ${stu.last_name}` },
    { header: "Email", accessor: (stu) => stu.email },
    { header: "Responses", accessor: (stu) => (
        <ul>
          {(studentResponses[stu.id] || []).map((resp, idx) => (
            <li key={idx}>
              Q{resp.student_eval_question}: {resp.answer}
            </li>
          ))}
        </ul>
      )
    }
  ];

  // UI rendering
  return (
    <div className="custom-container gap-y-6">
      <div className="breadcrumbs">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>
            <a onClick={() => setActiveView("evaluation")}>Evaluation</a>
          </li>
          <li>Student Evaluations</li>
        </ul>
      </div>
      <h2 className="mt-4 text-3xl font-bold text-white">Student Evaluation</h2>

      {/* Step 1: Program Tiles */}
      {!selectedProgram && (
        loading ? <SkeletonProgramCards /> : <ProgramCards programs={programs} onClick={setSelectedProgram} />
      )}

      {/* Step 2: Professors Table */}
      {selectedProgram && !selectedProfessor && (
        <>
          <button className="btn btn-neutral mb-4" onClick={() => setSelectedProgram(null)}>
            Back to Programs
          </button>
          <h3 className="text-2xl font-semibold text-white mb-4">Professors for {selectedProgram.name}</h3>
          {loading ? (
            <SkeletonTable rows={4} cols={2} />
          ) : (
            <DataTable
              data={professors}
              columns={professorColumns}
              getRowKey={(prof) => prof.id}
              actions={(prof) => (
                <button className="btn btn-sm btn-primary" onClick={() => setSelectedProfessor(prof)}>
                  View Schedules
                </button>
              )}
            />
          )}
        </>
      )}

      {/* Step 3: Schedules Table */}
      {selectedProgram && selectedProfessor && !selectedSchedule && (
        <>
          <button className="btn btn-neutral mb-4" onClick={() => setSelectedProfessor(null)}>
            Back to Professors
          </button>
          <h3 className="text-2xl font-semibold text-white mb-4">Schedules for {selectedProfessor.full_name}</h3>
          {loading ? (
            <SkeletonTable rows={4} cols={2} />
          ) : (
            <DataTable
              data={schedules}
              columns={scheduleColumns}
              getRowKey={(s) => s.id}
              actions={(s) => (
                <button className="btn btn-sm btn-primary" onClick={() => setSelectedSchedule(s)}>
                  View Sections
                </button>
              )}
            />
          )}
        </>
      )}

      {/* Step 4: Sections Table */}
      {selectedProgram && selectedProfessor && selectedSchedule && !selectedSection && (
        <>
          <button className="btn btn-neutral mb-4" onClick={() => setSelectedSchedule(null)}>
            Back to Schedules
          </button>
          <h3 className="text-2xl font-semibold text-white mb-4">Sections for {selectedSchedule.name}</h3>
          {sectionsLoading ? (
            <SkeletonTable rows={4} cols={1} />
          ) : (
            <DataTable
              data={sections}
              columns={sectionColumns}
              getRowKey={(sec) => sec.id}
              actions={(sec) => (
                <button className="btn btn-sm btn-primary" onClick={() => setSelectedSection(sec)}>
                  View SFF
                </button>
              )}
            />
          )}
        </>
      )}

      {/* Step 5: SFF Data */}
      {selectedProgram && selectedProfessor && selectedSchedule && selectedSection && (
        <>
          <button className="btn btn-neutral mb-4" onClick={() => setSelectedSection(null)}>
            Back to Sections
          </button>
          <h3 className="text-2xl font-semibold text-white mb-4">SFF Data for {selectedSection.name}</h3>
          <div className="bg-white text-black rounded-lg p-6 shadow-xl">
            {loading ? (
              <>
                <SkeletonBox height={24} width="60%" />
                <SkeletonBox height={16} width="90%" />
                <SkeletonBox height={16} width="80%" />
                <SkeletonBox height={16} width="70%" />
              </>
            ) : sffData ? (
              <pre className="whitespace-pre-wrap">{JSON.stringify(sffData, null, 2)}</pre>
            ) : (
              <p>No SFF data found.</p>
            )}
          </div>

          {/* Step 6: Students and their responses */}
          <h3 className="text-2xl font-semibold text-white mb-4 mt-8">Student Responses for {selectedSection.name}</h3>
          {studentsLoading ? (
            <SkeletonTable rows={4} cols={3} />
          ) : (
            <DataTable
              data={students}
              columns={studentColumns}
              getRowKey={(stu) => stu.id}
            />
          )}
        </>
      )}
    </div>
  );
}

export default StudentEvaluation;
