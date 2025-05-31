import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, {
	Column,
} from "../../../Components/Evaluation Components/Data Table";
import { FunnelIcon } from "@heroicons/react/16/solid";
// Assuming you have your generic DataTable component exported

interface ProgramProps {
	setActiveView: (view: string) => void;
}

// Define the Program Type
interface Program {
	id: number;
	name: string;
	is_active: boolean;
	professor_names: string[];
}

function Programs({ setActiveView }: ProgramProps) {
	const [programs, setPrograms] = useState<Program[]>([]);
	const [programProfessors, setProgramProfessors] = useState<
		ProgramProfessor[]
	>([]);
	const [selectedProgram, setSelectedProgram] = useState<Program | null>(
		null,
	);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [newProgramName, setNewProgramName] = useState("");

	// Code below adds junc table progprof
	const fetchProgramsandProgramProfessors = async () => {
		setLoading(true);
		try {
			//Step 1: Fetch programs
			const programResponse = await api.get("/program/programs", {
				params: { name: searchTerm || undefined },
			});
			console.log("Fetched programs:", programResponse.data);
			setPrograms(programResponse.data);

			// Fetch ProgramProfessor relationships
			const professorResponse = await api.get(
				"/program-professor/program-professors/",
			);
			setProgramProfessors(professorResponse.data);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleRowClick = (program: Program) => {
		setSelectedProgram(program);
		const modal = document.getElementById(
			"program_details_modal",
		) as HTMLDialogElement;
		modal?.showModal();
	};

	const createProgram = async () => {
		if (!newProgramName.trim()) return;
		alert("Successfully created program:");
		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");

		try {
			await api.post(
				"/program/programs/",
				{ name: newProgramName },
				{
					headers: { Authorization: "Bearer ${token}" },
				},
			);
			setNewProgramName("");
			// After creation, fetch programs again
			fetchProgramsandProgramProfessors();
		} catch (error) {
			console.error("Error creating program:", error);
		}
	};

	const toggleProgramStatus = async (program: Program) => {
		if (!program.id) {
			alert("Program ID is missing!");
			return;
		}

		try {
			// Toggle the is_active state and send it with the request
			await api.patch(`/program/programs/${program.id}/`, {
				is_active: !program.is_active, // Send the toggled state
			});
			alert(`Program status updated to ${!program.is_active ? "Active" : "Inactive"}`);
		} catch (error: any) {
			console.error("Error updating program status:", error.response?.data || error.message);
			alert("Failed to update the program status. Please try again.");
			}
	};


	const deleteProgram = async (programId: number) => {
		try {
			await api.delete(`/program/programs/${programId}/`);
			fetchProgramsandProgramProfessors();
		} catch (error) {
			console.error("Error deleting program:", error);
		}
	};
	// Actions column render function
	const programActions = (program: Program) => (
		<div className="flex flex-col items-start gap-2">
			<button
				title="View"
				onClick={() => handleRowClick(program)}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
			>
				<PencilSquareIcon className="h-4 w-4" />
				View
			</button>
			<dialog id="program_details_modal" className="modal">
				<div className="modal-box w-11/12 max-w-3xl">
					<div>
						<h3 className="mb-4 text-center text-2xl font-bold text-black">
							{selectedProgram?.name}
						</h3>
						<table className="w-full overflow-y-auto">
							<thead className="text-lg font-semibold text-black">
								<tr>
									<th className="hidden">Program ID</th>
									<th>Professor Name</th>
									<th>Assigned Date</th>
								</tr>
							</thead>
							<tbody className="text-md text-gray-600">
								{programProfessors
									.filter(
										(rel) =>
											rel.program === selectedProgram?.id,
									)
									.map((rel) => (
										<tr
											key={`${rel.program}-${rel.professor}`}
										>
											<td className="hidden">
												{rel.program}
											</td>
											<td>
												{rel.professor_details
													?.full_name || "Unknown"}
											</td>
											<td>
												{new Date(
													rel.assigned_at,
												).toLocaleDateString()}
											</td>
										</tr>
									))}
							</tbody>
						</table>
						<div className="modal-action">
							<button
								type="submit"
								className="btn btn-success text-white"
							>
								Done
							</button>
							<button
								type="button"
								className="btn btn-cancel"
								onClick={() =>
									(
										document.getElementById(
											"program_details_modal",
										) as HTMLDialogElement
									)?.close()
								}
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			</dialog>
			<button
				title="Delete"
				onClick={() => {
					if (window.confirm(`Delete program "${program.name}"?`))
						deleteProgram(program.id);
				}}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
			>
				<TrashIcon className="h-4 w-4" />
				Delete
			</button>
		</div>
	);

	useEffect(() => {
		fetchProgramsandProgramProfessors();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	// Define columns with proper accessors
	const programColumns: Column<Program>[] = [
		{
			header: "Name",
			accessor: "name",
		},
		{
			header: "Status",
			accessor: (program: Program) => (
				<input
					onClick={() => toggleProgramStatus(program)} // Ensure program is correctly passed
					className="toggle"
					type="checkbox"
					checked={program.is_active}
				/>
			),
		},
	];

	type ProgramProfessor = {
		program: number; // Program ID
		professor: number; // Professor ID
		professor_details?: {
			first_name: string;
			last_name: string;
			full_name: string;
		};
		assigned_at: string; // Example additional data
	};

	const programProfessorColumns: Column<ProgramProfessor>[] = [
		{
			header: "Program ID",
			accessor: "program", // Use "program" directly as it's part of ProgramProfessor
		},
		{
			header: "Professor ID",
			accessor: "professor", // Use "professor" directly as it's part of ProgramProfessor
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
						<a onClick={() => setActiveView("resourceGroup")}>
							Resource Group
						</a>
					</li>
					<li>Programs</li>
				</ul>
			</div>

			<h2 className="mt-4 text-3xl font-bold text-white">Programs</h2>

			<div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
				{/* New Program Button */}
				<button
					onClick={() =>
						(
							document.getElementById(
								"create_new_program",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
				>
					New Program
				</button>

				<dialog id="create_new_program" className="modal">
					<div className="modal-box w-11/12 max-w-3xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							Create New Program
						</h3>

						<form
							onSubmit={(e) => {
								e.preventDefault(); // Prevent default form behavior
								createProgram(); // Call createProgram function
								(
									document.getElementById(
										"create_new_program",
									) as HTMLDialogElement
								)?.close(); // Close the modal
							}}
							className="flex flex-col gap-6"
						>
							{/* Program Name */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/6">
									Name:
								</label>
								<input
									type="text"
									value={newProgramName} // Bind value to state
									onChange={(e) =>
										setNewProgramName(e.target.value)
									} // Update value on change
									placeholder="Enter program name"
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
												"create_new_program",
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

				<div className="flex flex-row justify-center">
					{/* Import Programs Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_import_program",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Import Program
					</button>

					<dialog id="modal_import_program" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Import Program
							</h3>

							<form
								method="dialog"
								className="flex flex-col gap-6"
							>
								{/* CSV Upload */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/6">
										File:
									</label>
									<input
										type="file"
										accept=".csv"
										className="file-input file-input-bordered w-full"
										required
									/>
								</div>

								{/* Action Buttons */}
								<div className="modal-action">
									<button
										type="submit"
										className="btn btn-success text-white"
									>
										Upload
									</button>
									<button
										type="button"
										className="btn btn-cancel"
										onClick={() =>
											(
												document.getElementById(
													"modal_import_program",
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

					{/* Export Programs Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_export_programs",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Program
					</button>

					<dialog id="modal_export_programs" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Program
							</h3>

							<form
								method="dialog"
								className="flex flex-col gap-6"
							>
								{/* Name Field */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/6">
										Name:
									</label>
									<input
										type="text"
										value="Program A"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Action Buttons */}
								<div className="modal-action">
									<button
										type="submit"
										className="btn btn-success text-white"
									>
										Export
									</button>
									<button
										type="button"
										className="btn btn-cancel"
										onClick={() =>
											(
												document.getElementById(
													"modal_export_programs",
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
			</div>
			{/* Search and New Program button */}
			<div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
				<label
					htmlFor="search"
					className="text-lg font-bold text-white"
				></label>
				<input
					id="search"
					type="text"
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)} // Trigger new search
					placeholder="Search by program name"
					className="input input-bordered w-full max-w-xs"
				/>
				<div className="dropdown dropdown-end ml-2">
					<div
						tabIndex={0}
						role="button"
						className="btn border-0 bg-[#1c402a] text-white shadow-xl"
					>
						<FunnelIcon className="h-5 w-5" />
					</div>
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
			{/* New Program Modal */}
			<dialog id="create_new_program" className="modal">
				<div className="modal-box w-11/12 max-w-3xl">
					<h3 className="mb-4 text-center text-2xl font-bold">
						Create New Program
					</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							createProgram();
							(
								document.getElementById(
									"create_new_program",
								) as HTMLDialogElement
							)?.close();
						}}
						className="flex flex-col gap-6"
					>
						<div className="flex flex-col gap-2 md:flex-row md:items-center">
							<label className="text-left text-lg font-bold md:w-1/6">
								Name:
							</label>
							<input
								type="text"
								value={newProgramName}
								onChange={(e) =>
									setNewProgramName(e.target.value)
								}
								placeholder="Enter program name"
								className="input input-bordered w-full"
								required
							/>
						</div>
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
											"create_new_program",
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

			{/* DataTable */}
			<DataTable
				data={programs}
				columns={programColumns}
				getRowKey={(program) => program.id}
				actions={programActions}
			/>
		</div>
	);
}
export default Programs;
