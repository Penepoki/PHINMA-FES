import { useState } from "react";
import SubjectCards from "../../../Components/Dashboard Components/Student Components/Subject Cards";
import SemesterCard from "../../../Components/Dashboard Components/HR Components/Semester Cards";

function Home() {
  const [openModal, setOpenModal] =
    useState<string | null>(null);

  const subjects = [
    {
      name: "Mathematics",
      teacher: "Mr. Smith",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Mathematics Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Biology",
      teacher: "Ms. Johnson",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Biology Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    {
      name: "Chemistry",
      teacher: "Dr. Allen",
      questions: Array.from(
        { length: 10 },
        (_, i) =>
          `Chemistry Question ${i + 1}`
      ),
      image: null,
    },
    // Add more subjects as needed...
  ];

  const totalSubjects = subjects.length;
  const [
    completedSubjects,
    setCompletedSubjects,
  ] = useState<Set<string>>(new Set());
  const ratio = `${completedSubjects.size}/${totalSubjects}`;

  const semesterData = [
    {
      semester: "1st",
      ratio: ratio,
    },
    {
      semester: "2nd",
      ratio: ratio,
    },
  ];

  return (
    <div className="home-page flex flex-col justify-center items-center w-full h-full gap-y-6 z-10">
      {/* Header */}
      <header className="flex z-1 w-full h-[15%] pl-12 border-gray-600 border-b-2 shadow-2xl absolute top-0 justify-start items-end backdrop-blur-lg gap-6">
        <h1 className="text-5xl font-bold text-white sm:text-6xl">
          Hi, Renzo
        </h1>
        <p className="text-lg text-gray-300 sm:text-xl">
          Welcome to the Home Page
        </p>
      </header>

      {/* Content */}
      <div className="flex flex-row items-start justify-center w-auto h-auto overflow-y-auto mt-35 mb-20 md:mr-100 gap-4">
        {/* Subject List */}
        <div className="flex flex-col items-center">
          <p className="text-gray-300 text-lg">
            Subject List:
          </p>
          <SubjectCards
            subjects={subjects}
            onClick={(subjectName) =>
              setOpenModal(subjectName)
            }
            completedSubjects={
              completedSubjects
            }
          />
        </div>

        {/* Progress Bar */}
        <div
          className="
            hidden absolute flex-col
            justify-center items-center gap-6
            md:flex
            mt-16
            right-25
          "
        >
          {semesterData.map(
            ({ semester, ratio }) => (
              <SemesterCard
                key={semester}
                semester={semester}
                ratio={ratio}
              />
            )
          )}
        </div>
      </div>

      {/* Modals for Each Subject */}
      {openModal && (
        <div
          className="modal modal-open"
          id="subject_modal"
        >
          {subjects.map((subject) =>
            openModal ===
            subject.name ? (
              <div
                key={subject.name}
                className="modal-box w-11/12 max-w-5xl h-[80%] text-left text-black"
              >
                <h3 className="font-bold text-2xl mb-2 text-center text-black">
                  {subject.name}
                </h3>
                <p className="text-md mb-4 text-center">
                  Teacher:{" "}
                  <strong>
                    {subject.teacher}
                  </strong>
                </p>

                <form
                  method="dialog"
                  className="flex flex-col gap-12 overflow-y-auto overflow-x-clip h-[85%]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setCompletedSubjects(
                      (prev) => {
                        const updated =
                          new Set(prev);
                        updated.add(
                          subject.name
                        );
                        return updated;
                      }
                    );

                    setOpenModal(null);
                    alert(
                      `${subject.name} submitted successfully!`
                    );
                  }}
                >
                  {subject.questions.map(
                    (
                      question,
                      index
                    ) => (
                      <div
                        key={index}
                        className="flex flex-col md:flex-row md:items-start gap-2"
                      >
                        <label className="md:w-1/3 text-lg font-semibold pt-2">
                          {question}
                        </label>
                        <input
                          type="text"
                          placeholder="Your answer"
                          className="input input-bordered w-full"
                          required
                        />
                      </div>
                    )
                  )}

                  <div className="modal-action">
                    <button
                      type="submit"
                      className="btn btn-success text-white"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancel"
                      onClick={() =>
                        setOpenModal(
                          null
                        )
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
