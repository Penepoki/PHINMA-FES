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
		<div className="custom-container gap-y-6">
			<div className="breadcrumbs">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>
						<a onClick={() => setActiveView("evaluation")}>
							Evaluation
						</a>
					</li>
					<li>Student Evaluations</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">
				Student Evaluation
			</h2>
			<div className="flex h-1/5 w-5/6 flex-col items-start justify-center rounded-xl p-5 text-white shadow-2xl backdrop-blur-lg backdrop-hue-rotate-300">
				<h6>Total Evaluation</h6>
				<span className="mt-2 text-6xl text-gray-300">0</span>{" "}
				{/* Increased font size and margin-top */}
			</div>
			<div className="flex h-1/5 w-5/6 flex-col items-start justify-center rounded-xl p-5 text-white shadow-2xl backdrop-blur-lg backdrop-hue-rotate-300">
				<h6>Completed</h6>
				<span className="mt-2 text-6xl text-gray-300">0</span>{" "}
				{/* Increased font size and margin-top */}
			</div>
			<div className="flex h-1/5 w-5/6 flex-col items-start justify-center rounded-xl p-5 text-white shadow-2xl backdrop-blur-lg backdrop-hue-rotate-300">
				<h6>Completion Rate</h6>
				<span className="mt-2 text-6xl text-gray-300">0% </span>{" "}
				{/* Increased font size and margin-top */}
			</div>
		</div>
	);
}

export default StudentEvaluation;
