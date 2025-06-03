import { useEffect, useState } from "react";
import CopusMatrix from "../../../Components/Evaluation Components/Copus Matrix";
import PieChartWithTable from "../../../Components/Evaluation Components/Piechart with Table";
import api from "../../../utils/api";
import { ActivityData } from "../../../Components/Evaluation Components/Copus Matrix";

interface Evaluation {
  id: number;
  schedule: number;
  observation_date: string;
  evaluation_type: string;
  additional_comments?: string;
}

interface Schedule {
  id: number;
  name: string;
  program: number;
  instructor: number;
  subject: string;
  room: string;
  semester: string;
  year: string;
}

interface Program {
  id: number;
  name: string;
  code: string;
}

interface ProgramProfessor {
  id: number;
  program: number;
  professor: number;
  professor_details: Professor;
}

interface Professor {
  id: number;
  first_name: string;
  last_name: string;
  department?: string;
}

interface EvalProps {
  setActiveView: (view: string) => void;
}

function Evaluation({ setActiveView }: EvalProps) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [programProfessors, setProgramProfessors] = useState<ProgramProfessor[]>([]);
  // Store tallies per evaluation
  const [evaluationTallies, setEvaluationTallies] = useState<{
    [evaluationId: number]: {
      studentTallies: Record<string, ActivityData>;
      teacherTallies: Record<string, ActivityData>;
    };
  }>({});
  const [modalOpen, setModalOpen] = useState<string | null>(null); // modal id for open modal
  const [selectedProfessor, setSelectedProfessor] = useState<Professor | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [evalRes, schedRes, progRes, progProfRes] = await Promise.all([
          api.get("/evaluation/evaluations/"),
          api.get("/schedule/schedules/"),
          api.get("/program/programs/"),
          api.get("/program-professor/program-professors/"),
        ]);
        setEvaluations(evalRes.data);
        setSchedules(schedRes.data);
        setPrograms(progRes.data);
        setProgramProfessors(progProfRes.data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Group by professor
  const professors = Array.from(
    new Map(
      programProfessors.map(pp => [pp.professor, pp.professor_details])
    ).values()
  );

  // For each professor, get their schedules and evaluations
  const getProfessorSchedules = (prof: Professor) =>
    schedules.filter(s => s.instructor === prof.id);
  const getProfessorEvaluations = (prof: Professor) => {
    const profSchedules = getProfessorSchedules(prof).map(s => s.id);
    return evaluations.filter(e => profSchedules.includes(e.schedule));
  };

  const firstName = localStorage.getItem("firstName") || "User";

  if (loading) return <div>Loading...</div>;

  return (
    <div className="custom-container gap-y-6">
      <div className="breadcrumbs text-md text-white">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>Evaluation</li>
        </ul>
      </div>
      <h2 className="mt-4 text-3xl font-bold text-white">
        Copus Evaluation Forms
      </h2>
      <div className="flex w-full flex-col gap-8">
        {professors.map((prof, pIdx) => {
          const profSchedules = getProfessorSchedules(prof);
          const profEvaluations = getProfessorEvaluations(prof);
          return (
            <div key={prof.id} className="mb-8 rounded-lg border border-gray-300 bg-white/10 p-4 shadow-xl">
              <div className="flex flex-row items-center gap-4">
                <div className="avatar mt-3">
                  <div className="h-24 w-24 rounded-full">
                    <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-bold text-white">{prof.first_name} {prof.last_name}</div>
                  <div className="text-md text-gray-200">Department: <strong>{prof.department || "N/A"}</strong></div>
                </div>
                <button
                  className="ml-auto rounded-lg bg-[#1c402a] px-5 py-2 text-white shadow-xl transition-transform hover:scale-105"
                  onClick={() => {
                    setModalOpen(`create-copus-${prof.id}`);
                    setSelectedProfessor(prof);
                    setSelectedSchedule(null);
                    setSelectedEvaluation(null);
                  }}
                >
                  Create New Copus
                </button>
                {/* Modal for creating new Copus for this professor */}
                {modalOpen === `create-copus-${prof.id}` && (
                  <dialog open className="modal">
                    <div className="modal-box w-11/12 max-w-5xl">
                      <h3 className="mb-4 text-center text-2xl font-bold">New Copus for {prof.first_name} {prof.last_name}</h3>
                      <form method="dialog" className="flex flex-col gap-6">
                        {/* Schedule Dropdown */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <label className="text-left text-lg font-bold md:w-1/4">Schedule:</label>
                          <select
                            value={selectedSchedule?.id || ''}
                            onChange={e => {
                              const sched = profSchedules.find(s => s.id === Number(e.target.value));
                              setSelectedSchedule(sched || null);
                            }}
                            className="input input-bordered w-full"
                            required
                          >
                            <option value="">Select schedule</option>
                            {profSchedules.map(s => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        {/* Date */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <label className="text-left text-lg font-bold md:w-1/4">Observation Date:</label>
                          <input type="date" className="input input-bordered w-full" required />
                        </div>
                        {/* Evaluation Type */}
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                          <label className="text-left text-lg font-bold md:w-1/4">Evaluation Type:</label>
                          <input type="text" className="input input-bordered w-full" required />
                        </div>
                        <div className="modal-action">
                          <button type="submit" className="btn btn-success text-white">Submit</button>
                          <button type="button" className="btn btn-cancel" onClick={() => setModalOpen(null)}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  </dialog>
                )}
              </div>
              {/* List of evaluations for this professor */}
              <div className="mt-4 w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
                <table className="table">
                  <thead className="bg-[#1c402a]/50 text-xl font-bold text-white shadow-xl">
                    <tr>
                      <th>Schedule</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-lg text-white">
                    {profEvaluations.length === 0 && (
                      <tr><td colSpan={4} className="text-center">No evaluations yet.</td></tr>
                    )}
                    {profEvaluations.map((e, idx) => {
                      const schedule = schedules.find(s => s.id === e.schedule);
                      return (
                        <tr key={e.id}>
                          <td>{schedule?.name || "N/A"}</td>
                          <td>{e.observation_date}</td>
                          <td>{e.evaluation_type}</td>
                          <td>
                            <button
                              className="btn btn-xs btn-info mr-2"
                              onClick={() => {
                                setModalOpen(`copus-${e.id}`);
                                setSelectedEvaluation(e);
                                setSelectedProfessor(prof);
                                setSelectedSchedule(schedule || null);
                              }}
                            >
                              View/Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Modal for viewing/editing CopusMatrix for this evaluation */}
              {profEvaluations.map(e => (
                modalOpen === `copus-${e.id}` && (
                  <dialog key={e.id} open className="modal">
                    <div className="modal-box w-11/12 max-w-5xl text-black">
                      <h3 className="mb-4 text-xl font-bold">{prof.first_name} {prof.last_name} - COPUS Evaluation</h3>
                      {/* Basic Information */}
                      <div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
                        <input type="checkbox" />
                        <div className="collapse-title text-lg font-semibold">Basic Information</div>
                        <div className="collapse-content space-y-2">
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <input type="text" value={prof.first_name + ' ' + prof.last_name} className="input input-bordered w-full" readOnly />
                            <input type="date" value={e.observation_date} className="input input-bordered w-full" readOnly />
                            <input type="text" value={schedule?.name || ''} readOnly className="input input-bordered w-full" />
                            <input type="text" value={schedule?.room || ''} readOnly className="input input-bordered w-full" />
                            <input type="text" value={schedule?.semester || ''} readOnly className="input input-bordered w-full" />
                            <input type="text" value={schedule?.year || ''} readOnly className="input input-bordered w-full" />
                          </div>
                        </div>
                      </div>
                      {/* COPUS Matrix */}
                      <CopusMatrix
                        onTalliesUpdate={(student, teacher) => {
                          setEvaluationTallies(prev => ({
                            ...prev,
                            [e.id]: {
                              studentTallies: student,
                              teacherTallies: teacher,
                            },
                          }));
                        }}
                        evaluationId={e.id}
                      />
                      {/* COPUS Summary Chart */}
                      <div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
                        <PieChartWithTable
                          studentTallies={evaluationTallies[e.id]?.studentTallies || {}}
                          teacherTallies={evaluationTallies[e.id]?.teacherTallies || {}}
                        />
                      </div>
                      {/* Additional Information */}
                      <div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
                        <input type="checkbox" />
                        <div className="collapse-title text-lg font-semibold">Additional Information</div>
                        <div className="collapse-content">
                          <textarea
                            className="textarea textarea-bordered min-h-[100px] w-full"
                            placeholder="Enter any additional comments or observations here..."
                            defaultValue={e.additional_comments || ''}
                            readOnly
                          ></textarea>
                        </div>
                      </div>
                      {/* Actions */}
                      <div className="modal-action">
                        <form method="dialog">
                          <button type="submit" className="btn bg-[#1c402a] text-white">Close</button>
                        </form>
                      </div>
                    </div>
                  </dialog>
                )
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Evaluation;
