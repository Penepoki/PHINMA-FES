import React, { useEffect, useRef, useState } from "react";
import BreadAndLogout from "../../../Components/Bread and Logout";
import DataTable from "../../../Components/Evaluation Components/Data Table";
import ProgramCards from "../../../Components/Evaluation Components/ProgramCards";
import ResponsesChartsTable from "../../../Components/Evaluation Components/ResponsesChartsTable";
import SffDataDisplay from "../../../Components/Evaluation Components/SffDataDisplay";
import api from "../../../utils/api";
import { resolveFacultyId } from "../../../utils/facultyContext";

/* ---------------------------
   Minimal Skeletons (daisyUI)
----------------------------*/
// Simple box skeleton using daisyUI only (no gradient)
const SkeletonBox = ({
  width = "100%",
  height = 24,
  className = "",
}: {
  width?: number | string;
  height?: number | string;
  className?: string;
}) => <div className={`skeleton ${className}`} style={{width, height}}/>;

// 6 green rectangles for Program List
const ProgramListSkeleton = () => (
  <div className="w-full rounded-xl bg-black/20 p-6">
      <div className="mb-4 text-xl text-white">Program List:</div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-28 rounded-2xl"/>
      ))}
    </div>
  </div>
);

// Faculty Response Charts skeleton: title + 2 chart panels
const FacultyChartsSkeleton = () => (
    <div className="w-full flex-col items-center justify-center">
        <div
            className="flex h-12 py-8 px-4 items-center bg-gradient-to-r from-[#1c402a] to-[#1b2e3e] text-xl font-bold text-white">
      Faculty Response Charts
    </div>
        <div className="rounded-b-xl bg-black/20 p-3">
            <div className="skeleton h-8 w-full"/>
    </div>
  </div>
);

/* ---------------------------
   Types
----------------------------*/
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
}

interface Section {
  id: number;
  name: string;
}

type Column<T> = {
  header: string;
  accessor: (row: T) => React.ReactNode;
};

/* ---------------------------
   Component
----------------------------*/
function StudentEvaluation({ setActiveView }: StudentEvalProps) {
  // Top-level IDs / state that other sections use
  const [facultyId, setFacultyId] = useState<number | null>(null);

  // Step selection state
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // Data state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [filterSemester, setFilterSemester] = useState<string>("");
  const [filterYear, setFilterYear] = useState<string>("");
  const [sections, setSections] = useState<Section[]>([]);
  const [sffData, setSffData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [studentResponses, setStudentResponses] = useState<Record<string, any[]>>({});
  const [studentDialogResponses, setStudentDialogResponses] = useState<any[]>([]);

  // Loading flags
  const [programsLoading, setProgramsLoading] = useState(false);
  const [professorsLoading, setProfessorsLoading] = useState(false);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [sffLoading, setSffLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);

  // Dialog state/refs
  const [viewingStudent, setViewingStudent] = useState<any | null>(null);
  const studentDialogRef = useRef<HTMLDialogElement>(null);

  /* ---------------------------
     Init: Faculty ID (once)
  ----------------------------*/
  useEffect(() => {
    (async () => {
      const id = await resolveFacultyId();
      setFacultyId(id ?? null);
    })();
  }, []);

  /* ---------------------------
     Fetch: Programs (on mount)
  ----------------------------*/
  useEffect(() => {
    const fetchPrograms = async () => {
      setProgramsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const id = await resolveFacultyId();
        if (!token) return;
        const params: any = {};
        if (id) params.faculty_id = id;

        const response = await api.get("/program/programs/", {
          params,
          headers: { Authorization: `Bearer ${token}` },
        });
        setPrograms(response.data || []);
      } catch {
        setPrograms([]);
      } finally {
        setProgramsLoading(false);
      }
    };
    fetchPrograms();
  }, []);

  /* ---------------------------
     Fetch: Professors (on program)
  ----------------------------*/
  useEffect(() => {
    if (!selectedProgram) return;
    setSelectedProfessor(null);
    setSelectedSchedule(null);
    setSelectedSection(null);
    setSffData(null);

    const fetchProfessors = async () => {
      setProfessorsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/program-professor/program-professors/", {
          params: { program_id: selectedProgram.id },
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfessors(
          (res.data || []).map((item: any) => ({
            id: item.professor,
            full_name: item.professor_details?.full_name || `Professor ID: ${item.professor}`,
            first_name: item.professor_details?.first_name,
            last_name: item.professor_details?.last_name,
          })),
        );
      } catch {
        setProfessors([]);
      } finally {
        setProfessorsLoading(false);
      }
    };
    fetchProfessors();
  }, [selectedProgram]);

  /* ---------------------------
     Fetch: Schedules (on professor+program)
  ----------------------------*/
  useEffect(() => {
    if (!selectedProfessor || !selectedProgram) return;
    setSelectedSchedule(null);
    setSelectedSection(null);
    setSffData(null);

    const fetchSchedules = async () => {
      setSchedulesLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get("/schedule/schedules/", {
          params: {
            professor: selectedProfessor.id,
            program: selectedProgram.id,
            semester: filterSemester || undefined,
            year: filterYear || undefined,
          },
          headers: { Authorization: `Bearer ${token}` },
        });
        setSchedules(res.data || []);
      } catch {
        setSchedules([]);
      } finally {
        setSchedulesLoading(false);
      }
    };
    fetchSchedules();
  }, [selectedProfessor, selectedProgram, filterSemester, filterYear]);

  /* ---------------------------
     Fetch: Sections (on schedule)
  ----------------------------*/
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
        const res = await api.get(`/schedule/schedules/${selectedSchedule.id}/sections/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSections(res.data || []);
      } catch {
        setSections([]);
      } finally {
        setSectionsLoading(false);
      }
    };
    fetchSections();
  }, [selectedSchedule]);

  /* ---------------------------
     Fetch: SFF (on section)
  ----------------------------*/
  useEffect(() => {
    if (!selectedSection || !selectedSchedule) return;
    setSffData(null);

    const fetchSFF = async () => {
      setSffLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get(
          `/studentevaluation/studentevaluation/all-by-schedule/${selectedSchedule.id}/`,
            {headers: {Authorization: `Bearer ${token}`}},
        );
        setSffData(res.data || null);
      } catch {
        setSffData(null);
      } finally {
        setSffLoading(false);
      }
    };
    fetchSFF();
  }, [selectedSection, selectedSchedule]);

  /* ---------------------------
     Fetch: Students (on section)
  ----------------------------*/
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
        setStudents(res.data || []);
      } catch {
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSection]);

  /* ---------------------------
     Fetch: Responses (preview per student)
  ----------------------------*/
  useEffect(() => {
    if (!students.length || !sffData?.id) return;

    const fetchResponses = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const responsesMap: Record<string, any[]> = {};
      await Promise.all(
        students.map(async (student) => {
          try {
            const res = await api.get(
              `/studentevaluation/studentevaluation/${sffData.id}/responses/?user=${student.id}`,
                {headers: {Authorization: `Bearer ${token}`}},
            );
            responsesMap[String(student.id)] = res.data || [];
          } catch {
            responsesMap[String(student.id)] = [];
          }
        }),
      );
      setStudentResponses(responsesMap);
    };
    fetchResponses();
  }, [students, sffData]);

  /* ---------------------------
     Fetch: Responses for dialog
  ----------------------------*/
  useEffect(() => {
    const fetchStudentDialogResponses = async () => {
        const evaluationId =
            Array.isArray(sffData) && sffData.length > 0 ? sffData[0].id : (sffData as any)?.id;
      if (!viewingStudent || !evaluationId) return;
      setStudentLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await api.get(
          `/studentevaluationresponse/studentevaluationresponse/by-evaluation-and-user?student_evaluation=${evaluationId}&user=${viewingStudent.id}`,
            {headers: {Authorization: `Bearer ${token}`}},
        );
        setStudentDialogResponses(res.data || []);
      } catch {
        setStudentDialogResponses([]);
      } finally {
        setStudentLoading(false);
      }
    };
    fetchStudentDialogResponses();
  }, [viewingStudent, sffData]);

  /* ---------------------------
     Columns
  ----------------------------*/
    const professorColumns: Column<Professor>[] = [
        {header: "Name", accessor: (prof) => prof.full_name},
    ];
    const scheduleColumns: Column<Schedule>[] = [
        {header: "Schedule Name", accessor: (s) => s.name},
    ];
    const sectionColumns: Column<Section>[] = [
        {header: "Section Name", accessor: (sec) => sec.name},
    ];
  const studentColumns: Column<any>[] = [
    { header: "Student Name", accessor: (stu) => `${stu.first_name} ${stu.last_name}` },
    { header: "Email", accessor: (stu) => stu.email },
  ];

  /* ---------------------------
     UI
  ----------------------------*/
  return (
      <div className="custom-container h-screen gap-y-6 overflow-y-auto">
      <BreadAndLogout
        setActiveView={setActiveView}
        breadcrumbs={[
          { label: "Home", view: "home" },
          { label: "Evaluation", view: "evaluation" },
          { label: "Student Evaluation View" },
        ]}
      />

      <h2 className="mt-4 text-3xl font-bold text-white">Student Evaluations</h2>
      <span className="mx-6 mb-2 block font-thin text-[#888888]">
        This is where you can track student evaluation submissions, see participation rates, and
        analyze recurring themes in real time.
      </span>

      {/* Step 1: Program Tiles + (optional) Faculty summary */}
      {!selectedProgram && (
        <>
          {/* Faculty summary charts */}
          {facultyId !== null &&
            (programsLoading ? (
              <FacultyChartsSkeleton />
            ) : programs.length > 0 ? (
              <ResponsesChartsTable
                evaluationId={programs[0]?.id /* TODO: replace with the correct eval ID */}
                filterType="faculty"
                filterId={facultyId}
              />
            ) : null)}

            {/* Filters for year/semester */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Semester filter */}
                <div className="flex items-center gap-2">
                    <label className="text-white">Semester:</label>
                    <select
                        className="input input-bordered w-40"
                        value={filterSemester}
                        onChange={(e) => setFilterSemester(e.target.value)}
                    >
                        <option value="">All</option>
                        <option value="First">First</option>
                        <option value="Second">Second</option>
                        <option value="Summer">Summer</option>
                    </select>
                </div>

                {/* Year filter */}
                <div className="flex items-center gap-2">
                    <label className="text-white">Year:</label>
                    <input
                        type="number"
                        min={2000}
                        max={2100}
                        className="input input-bordered w-40"
                        value={filterYear}
                        onChange={(e) => setFilterYear(e.target.value)}
                        placeholder="YYYY"
                    />
                </div>
            </div>
            {/* Programs: either skeletons or actual cards */}
            {programsLoading ? (
                <ProgramListSkeleton/>
            ) : (
                <ProgramCards
                    programs={programs}
                    onClick={(program) => {
                        setSelectedProgram(program);
                    }}
                />
            )}
        </>
      )}


      {/* Step 2: Professors Table */}
      {selectedProgram && !selectedProfessor && (
        <>
          <ResponsesChartsTable
            evaluationId={selectedProgram.id /* TODO: replace with correct program eval ID */}
            filterType="program"
            filterId={selectedProgram.id}
          />
            <button
                className="btn btn-primary mb-4 text-white"
                onClick={() => setSelectedProgram(null)}
            >
            Back to Programs
          </button>
            <h3 className="mb-4 text-2xl font-semibold text-white">
                Professors for {selectedProgram.name}
            </h3>

          <DataTable
            data={professors}
            columns={professorColumns}
            getRowKey={(prof) => prof.id}
            loading={professorsLoading}
            actions={(prof) => (
              <button
                className="btn btn-md btn-primary text-white"
                onClick={() => setSelectedProfessor(prof)}
              >
                View Schedules
              </button>
            )}
          />
        </>
      )}

      {/* Step 3: Schedules Table */}
      {selectedProgram && selectedProfessor && !selectedSchedule && (
        <>
          <ResponsesChartsTable
            evaluationId={selectedProfessor.id /* TODO: replace with correct professor eval ID */}
            filterType="professor"
            filterId={selectedProfessor.id}
          />
            <button
                className="btn btn-primary mb-4 text-white"
                onClick={() => setSelectedProfessor(null)}
            >
            Back to Professors
          </button>
          <h3 className="mb-4 text-2xl font-semibold text-white">
            Schedules for {selectedProfessor.full_name}
          </h3>

          <DataTable
            data={schedules}
            columns={scheduleColumns}
            getRowKey={(s) => s.id}
            loading={schedulesLoading}
            actions={(s) => (
                <button
                    className="btn btn-md btn-primary text-white"
                    onClick={() => setSelectedSchedule(s)}
                >
                View Sections
              </button>
            )}
          />
        </>
      )}

      {/* Step 4: Sections Table */}
      {selectedProgram && selectedProfessor && selectedSchedule && !selectedSection && (
        <>
            <button
                className="btn btn-primary mb-4 text-white"
                onClick={() => setSelectedSchedule(null)}
            >
            Back to Schedules
          </button>
            <h3 className="mb-4 text-2xl font-semibold text-white">
                Sections for {selectedSchedule.name}
            </h3>

          <DataTable
            data={sections}
            columns={sectionColumns}
            getRowKey={(sec) => sec.id}
            loading={sectionsLoading}
            actions={(sec) => (
                <button
                    className="btn btn-md btn-primary text-white"
                    onClick={() => setSelectedSection(sec)}
                >
                View SFF
              </button>
            )}
          />
        </>
      )}

      {/* Step 5: SFF + Students Table */}
      {selectedProgram && selectedProfessor && selectedSchedule && selectedSection && (
        <>
            <button
                className="btn btn-primary mb-4 text-white"
                onClick={() => setSelectedSection(null)}
            >
            Back to Sections
          </button>
          <h3 className="mb-4 text-2xl font-semibold text-white">
            SFF Data for {selectedSection.name}
          </h3>

          {/* Section-wide charts */}
          {sffLoading ? (
            <FacultyChartsSkeleton />
          ) : (
            sffData && (
              <React.Suspense fallback={<FacultyChartsSkeleton />}>
                <ResponsesChartsTable
                  evaluationId={
                    Array.isArray(sffData) ? (sffData[0]?.id as number) : (sffData as any)?.id
                  }
                  filterType="section"
                  filterId={selectedSection.id}
                />
              </React.Suspense>
            )
          )}

          <h3 className="mt-8 mb-4 text-2xl font-semibold text-white">
            Student Responses for {selectedSection.name}
          </h3>

          <DataTable
            data={students}
            columns={studentColumns}
            getRowKey={(stu) => stu.id}
            loading={studentsLoading}
            actions={(stu) => (
              <button
                className="btn btn-md btn-primary text-white"
                onClick={() => {
                  setViewingStudent(stu);
                  studentDialogRef.current?.showModal();
                }}
              >
                View Responses
              </button>
            )}
          />

          {/* Student Responses Dialog */}
          <dialog
            ref={studentDialogRef}
            className="modal"
            onClose={() => {
              setViewingStudent(null);
              setStudentDialogResponses([]);
            }}
          >
            <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
              <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => {
                  studentDialogRef.current?.close();
                  setViewingStudent(null);
                  setStudentDialogResponses([]);
                }}
              >
                &times;
              </button>

              {viewingStudent && (
                <>
                  <h4 className="mb-4 text-xl font-bold">
                    Responses for {viewingStudent.first_name} {viewingStudent.last_name}
                  </h4>

                    <h5 className="mb-2 text-lg font-semibold">
                        SFF Data for {selectedSection.name}
                    </h5>
                  {sffLoading ? <FacultyChartsSkeleton /> : <SffDataDisplay sffData={sffData} />}

                  <h5 className="mt-4 mb-2 text-lg font-semibold">Student Answers</h5>
                  {studentLoading ? (
                    <>
                      <SkeletonBox height={22} width="80%" />
                      <SkeletonBox height={22} width="70%" />
                      <SkeletonBox height={22} width="65%" />
                    </>
                  ) : studentDialogResponses && studentDialogResponses.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {studentDialogResponses.map((resp, idx) => (
                        <li key={idx} className="mb-2">
                          <strong>Q{resp.student_eval_question}:</strong> {resp.answer}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No responses found for this student.</p>
                  )}
                </>
              )}
            </div>
          </dialog>
        </>
      )}
    </div>
  );
}

export default StudentEvaluation;
