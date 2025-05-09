import { useState } from "react";
import SubjectCards from "../../../Components/Dashboard Components/Student Components/Subject Cards";
import SemesterCard from "../../../Components/Dashboard Components/HR Components/Semester Cards";
import DashboardHeader from "../../../Components/Dashboard Components/Dashboard Header";

function Home() {
  const [openModal, setOpenModal] =
    useState<string | null>(null);

  const subjects = [
    {
      name: "Mathematics",
      teacher: "Mr. Smith",
      questions: Array.from(
        { length: 10 },
        () =>
          `I understand the lessons with the help of activities provided by my teacher.`
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
      <DashboardHeader />

      {/* Content */}
      <div className="flex flex-col-reverse md:flex-row items-start justify-center w-auto h-auto overflow-y-auto mt-35 md:mr-103 gap-4 ml-3">
        {/* Subject List */}

        <SubjectCards
          subjects={subjects}
          onClick={(subjectName) =>
            setOpenModal(subjectName)
          }
          completedSubjects={
            completedSubjects
          }
        />

        {/* Progress Bar */}
        <div className="flex md:absolute flex-row md:flex-col justify-center items-center gap-6 w-full md:w-auto md:mt-26 md:right-20">
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
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="Strongly Agree"
                            className="radio"
                          />
                          Strongly Agree
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="Agree"
                            className="radio"
                          />
                          Agree
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="Neutral"
                            className="radio"
                          />
                          Neutral
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="Disagree"
                            className="radio"
                          />
                          Disagree
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value="Strongly Disagree"
                            className="radio"
                          />
                          Strongly
                          Disagree
                        </label>
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
