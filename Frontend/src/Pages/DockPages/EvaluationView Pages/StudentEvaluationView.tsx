interface StudentEvalProps {
  setActiveView: (view: string) => void;
}

// Tandaan mo to!

// const isaAkongFunc = ({name, age} : {name: string, age: number}): number => {
//   console.log("Hello", name);
//   return age;
// }

function StudentEvaluation({ setActiveView }: StudentEvalProps) {
  return (
    <div className="custom-container">
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
      <div className="flex flex-col items-start justify-center w-5/6 h-1/5 p-5 backdrop-blur-lg backdrop-hue-rotate-300 rounded-xl shadow-2xl text-white">
        <h6>Total Evaluation</h6>
        <p className="text-gray-300 text-4xl mt-2">0</p>{" "}
        {/* Increased font size and margin-top */}
      </div>
      <div className="flex flex-col items-start justify-center w-5/6 h-1/5 p-5 backdrop-blur-lg backdrop-hue-rotate-300 rounded-xl shadow-2xl text-white">
        <h6>Completed</h6>
        <p className="text-gray-300 text-4xl mt-2">0</p>{" "}
        {/* Increased font size and margin-top */}
      </div>
      <div className="flex flex-col items-start justify-center w-5/6 h-1/5 p-5 backdrop-blur-lg backdrop-hue-rotate-300 rounded-xl shadow-2xl text-white">
        <h6>Completion Rate</h6>
        <p className="text-gray-300 text-4xl mt-2">0% </p>{" "}
        {/* Increased font size and margin-top */}
      </div>
    </div>
  );
}

export default StudentEvaluation;
