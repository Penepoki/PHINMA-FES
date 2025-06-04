import { FunnelIcon } from "@heroicons/react/24/solid";
import StudentEvaluationRow from "../../../Components/Evaluation Components/Student Evaluation Row";

interface CreateStudentEvalProps {
	setActiveView: (view: string) => void;
}

function CreateStudentEvaluation({ setActiveView }: CreateStudentEvalProps) {
	const rows = [
		{
			name: "I understand the lessons with the help of activities provided by my teacher.",
			isActive: true,
		},
		{
			name: "I receive guidance from my teacher on how to complete the activities/tasks/modules.",
			isActive: true,
		},
		{
			name: "I feel comfortable asking questions and sharing ideas in our class.",
			isActive: false,
		},
	];

	return (
		<div className="custom-container gap-y-6">
			{/* Breadcrumbs */}
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
					<li>Create Student Evaluations</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">
				Create Student Evaluation
			</h2>
			{/* Create New Evaluation Button */}

			<div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl md:justify-end">
				<button
					onClick={() =>
						(
							document.getElementById(
								"create_student_eval",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="flex w-auto rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105"
				>
					Create New Student Evaluation
				</button>
				<dialog id="create_student_eval" className="modal">
					<div className="modal-box w-11/12 max-w-5xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							New Student Evaluation
						</h3>

						<form method="dialog" className="flex flex-col gap-6">
							{/* Schedule */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Schedule:
								</label>
								<input
									type="text"
									placeholder="Enter schedule"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Title */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Title:
								</label>
								<input
									type="text"
									placeholder="Enter title"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Description */}
							<div className="flex flex-col gap-2 md:flex-row md:items-start">
								<label className="pt-2 text-left text-lg font-bold md:w-1/4">
									Description:
								</label>
								<textarea
									placeholder="Enter description"
									className="textarea textarea-bordered w-full"
									required
								/>
							</div>

							{/* Questions */}
							<div className="flex flex-col gap-2 md:flex-row md:items-start">
								<label className="pt-2 text-left text-lg font-bold md:w-1/4">
									Questions:
								</label>
								<textarea
									placeholder="Enter questions separated by commas"
									className="textarea textarea-bordered w-full"
									required
								/>
							</div>

							{/* Type */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Type:
								</label>
								<input
									type="text"
									placeholder="Enter type (e.g., Midterm, Final)"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Action Buttons */}
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
										(
											document.getElementById(
												"create_student_eval",
											) as HTMLDialogElement
										)?.close()
									}
								>
									Cancel
								</button>
							</div>
						</form>
					</div>
				</dialog>
			</div>

			<dialog id="edit_student_eval" className="modal">
				<div className="modal-box w-11/12 max-w-5xl"></div>
			</dialog>

			{/* Search and Filter */}
			<div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
				<input
					type="text"
					className="input w-full max-w-md border border-gray-300"
					placeholder="Search"
				/>
				<div className="dropdown dropdown-end ml-2">
					<ul
						tabIndex={0}
						className="dropdown-content menu bg-base-100 rounded-box z-10 w-52 p-2 shadow-sm"
					>
						<li>
							<a href="#">Item 1</a>
						</li>
						<li>
							<a href="#">Item 2</a>
						</li>
					</ul>
				</div>
			</div>

			{/* Table Section */}
			<div className="w-full overflow-x-auto text-nowrap text-white shadow-xl backdrop-blur-lg">
				<table className="table">
					{/* head */}
					<thead className="bg-[#1c402a]/50 text-xl font-bold text-white shadow-xl">
						<tr>
							<th>
								<input
									type="checkbox"
									defaultChecked
									className="checkbox"
								/>
							</th>
							<th>Questions</th>
							<th></th>
							<th></th>
							<th>Is Active</th>
							<th></th>
						</tr>
					</thead>
					<tbody className="text-lg text-gray-300">
						{rows.map((row, index) => (
							<StudentEvaluationRow
								key={index}
								name={row.name}
								isActive={row.isActive}
								onToggle={() => {
									console.log(`${row.name} toggle clicked`);
								}}
								onEdit={() => {
									console.log(`Edit ${row.name}`);
								}}
							/>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default CreateStudentEvaluation;
