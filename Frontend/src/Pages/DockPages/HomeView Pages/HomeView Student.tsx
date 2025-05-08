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
      questions: [
        "I understand the lessons with the help of activities provided by my teacher.",
        "I receive guidance from my teacher on how to complete the activities/tasks/modules.",
        "I feel comfortable asking questions and sharing ideas in our class.",
        "I participate in class because my teacher asks interesting and challenging questions.",
        "I receive feedback from my teacher on how to improve my work, both in class and during consultation hours.",
        "I have been able to apply the lessons from this class to real-life situations",
      ],
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
      <header className="flex z-1 w-full h-[15%] px-6 border-gray-600 border-b-2 shadow-2xl absolute top-0 justify-between items-end backdrop-blur-lg">
        {/* Left Section - Greeting */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 sm:gap-6">
          <h1 className="text-5xl w-auto md:w-auto md:text-6xl font-bold text-white">
            Hi, Renzo
          </h1>
          <p className="text-md text-gray-300">
            Welcome to the Home Page
          </p>
        </div>

        {/* Right Section - Logout Button */}

        <button
          className="underline text-gray-300 text-md"
          onClick={() => {
            // Your logout logic here
            alert("Logged out!");
          }}
        >
          Logout
        </button>
      </header>

      {/* Content */}
      <div className="flex flex-col-reverse md:flex-row items-start justify-center w-auto h-auto overflow-y-auto mt-35 mb-20 md:mr-100 gap-4">
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
        <div className="flex md:absolute flex-row md:flex-col justify-center items-center gap-6 w-full md:w-auto md:mt-16 md:right-25">
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
                className="modal-box w-[90%] md:w-[45%] max-w-5xl h-[80%] text-black flex flex-col"
              >
                {/* Sticky Header */}
                <div className="bg-[#1c402a] z-10 sticky top-0 px-6 py-3 border-6 border-[#173523] flex items-start justify-between rounded-tl-xl rounded-tr-xl text-white">
                  <div className="text-left">
                    <h3 className="font-bold text-2xl">
                      {subject.name}
                    </h3>
                    <p className="text-md text-gray-400">
                      Teacher:{" "}
                      <strong>
                        {
                          subject.teacher
                        }
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-error text-white h-9 mt-2"
                    onClick={() =>
                      setOpenModal(null)
                    }
                  >
                    Cancel
                  </button>
                </div>

                {/* Scrollable Questions */}
                <form
                  method="dialog"
                  className="flex-1 overflow-y-auto px-6 mb-6 shadow-[inset_0_30px_20px_-20px_rgba(0,0,0,0.35)]"
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
                  <div className="flex flex-col gap-12">
                    {subject.questions.map(
                      (
                        question,
                        index
                      ) => (
                        <div
                          key={index}
                          className="flex flex-col md:items-start gap-2"
                        >
                          <label className="w-full text-lg font-semibold pt-2">
                            {question}
                          </label>
                          {[
                            "Strongly Agree",
                            "Agree",
                            "Neutral",
                            "Disagree",
                          ].map(
                            (
                              val,
                              i
                            ) => (
                              <label
                                key={i}
                                className="flex items-center gap-2"
                              >
                                <input
                                  type="radio"
                                  name={`question-${index}`}
                                  value={
                                    val
                                  }
                                  className="radio"
                                />
                                {
                                  [
                                    "Almost Always (Halos Palagi)",
                                    "Often (Madalas)",
                                    "Sometimes (Paminsan-minsan)",
                                    "Rarely (Madalang)",
                                  ][i]
                                }
                              </label>
                            )
                          )}
                        </div>
                      )
                    )}
                  </div>

                  {/* Sticky Footer */}
                  <div className="modal-action bottom-0 border-t-6 border-[#1c402a] bg-white pt-3">
                    <button
                      type="submit"
                      className="btn btn-success text-white"
                    >
                      Submit
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
