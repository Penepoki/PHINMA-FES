import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, {
	Column,
} from "../../../Components/Evaluation Components/Data Table";

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

	// Edit form state
	const [editProgramName, setEditProgramName] = useState("");
	const [currentEditingProgram, setCurrentEditingProgram] = useState<Program | null>(null);
	// Add these additional state variables to your existing state declarations
	const [availableProfessors, setAvailableProfessors] = useState<any[]>([]);
	const [selectedProfessorsForEdit, setSelectedProfessorsForEdit] = useState<number[]>([]);
	const [currentProgramProfessors, setCurrentProgramProfessors] = useState<ProgramProfessor[]>([]);

	// Add this function to fetch available professors
	const fetchAvailableProfessors = async () => {
		try {
			const response = await api.get("/program-professor/program-professors/");
			setAvailableProfessors(response.data);
		} catch (error) {
			console.error("Error fetching professors:", error);
		}
	};

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
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setNewProgramName("");
			// After creation, fetch programs again
			fetchProgramsandProgramProfessors();
		} catch (error) {
			console.error("Error creating program:", error);
		}
	};

	const updateProgram = async () => {
		if (!currentEditingProgram) return;

		if (!editProgramName.trim()) {
			alert("Please enter a program name.");
			return;
		}

		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");

		try {
			await api.patch(
				`/program/programs/${currentEditingProgram.id}/`,
				{
					name: editProgramName,
					professors: selectedProfessorsForEdit // Include professors in the update
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			// Reset edit form and close modal
			resetEditForm();
			(document.getElementById("edit_program_modal") as HTMLDialogElement)?.close();
			fetchProgramsandProgramProfessors();
		} catch (error) {
			console.error("Error updating program:", error);
			alert("Error updating program. Please try again.");
		}
	};

	// Update the resetEditForm function
	const resetEditForm = () => {
		setEditProgramName("");
		setCurrentEditingProgram(null);
		setSelectedProfessorsForEdit([]);
		setCurrentProgramProfessors([]);
		setAvailableProfessors([]);
	};


	// Update the openEditDialog function to include professor data
	const openEditDialog = (program: Program) => {
		setCurrentEditingProgram(program);
		setEditProgramName(program.name);

		// Get current professors for this program
		const currentProfs = programProfessors.filter(rel => rel.program === program.id);
		setCurrentProgramProfessors(currentProfs);
		setSelectedProfessorsForEdit(currentProfs.map(rel => rel.professor));

		// Fetch available professors
		fetchAvailableProfessors();

		(document.getElementById("edit_program_modal") as HTMLDialogElement)?.showModal();
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
			fetchProgramsandProgramProfessors();
		} catch (error: any) {
			console.error(
				"Error updating program status:",
				error.response?.data || error.message,
			);
			alert("Failed to update the program status. Please try again.");
		}
	};

	const deleteProgram = async (programId: number) => {
		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");

		try {
			await api.delete(`/program/programs/${programId}/`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			(document.getElementById("delete_program_modal") as HTMLDialogElement)?.close();
			fetchProgramsandProgramProfessors();
		} catch (error) {
			console.error("Error deleting program:", error);
			alert("Error deleting program. Please try again.");
		}
	};

	const openDeleteDialog = (program: Program) => {
		setCurrentEditingProgram(program);
		(document.getElementById("delete_program_modal") as HTMLDialogElement)?.showModal();
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
			<button
				title="Edit"
				onClick={() => openEditDialog(program)}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-green-500 hover:underline"
			>
				<PencilSquareIcon className="h-4 w-4" />
				Edit
			</button>
			<button
				title="Delete"
				onClick={() => openDeleteDialog(program)}
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

	// Add helper functions for professor management
	const addProfessorToProgram = (professorId: number) => {
		if (!selectedProfessorsForEdit.includes(professorId)) {
			setSelectedProfessorsForEdit([...selectedProfessorsForEdit, professorId]);
		}
	};

	const removeProfessorFromProgram = (professorId: number) => {
		setSelectedProfessorsForEdit(selectedProfessorsForEdit.filter(id => id !== professorId));
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

				{/* Create Program Modal */}
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

				// Replace your existing edit dialog with this enhanced version:
{/* Enhanced Edit Program Modal */}
<dialog id="edit_program_modal" className="modal">
	<div className="modal-box w-11/12 max-w-5xl max-h-[90vh] overflow-y-auto">
		<h3 className="mb-4 text-center text-2xl font-bold">
			Edit Program
		</h3>

		<form
			onSubmit={(e) => {
				e.preventDefault();
				if (!editProgramName.trim()) {
					alert("Please enter a program name.");
					return;
				}
				updateProgram();
			}}
			className="flex flex-col gap-6"
		>
			{/* Program Name */}
			<div className="flex flex-col gap-2 md:flex-row md:items-center">
				<label className="text-left text-lg font-bold md:w-1/4">
					Program Name:
				</label>
				<input
					type="text"
					value={editProgramName}
					onChange={(e) => setEditProgramName(e.target.value)}
					placeholder="Enter program name"
					className="input input-bordered w-full"
					required
					autoFocus
				/>
			</div>

			{/* Current Program Info Display */}
			{currentEditingProgram && (
				<div className="rounded-lg bg-gray-100 p-4">
					<h4 className="mb-2 font-semibold text-gray-700">Current Program Information:</h4>
					<div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2">
						<div>
							<span className="font-medium">ID:</span> {currentEditingProgram.id}
						</div>
						<div>
							<span className="font-medium">Status:</span>
							<span className={`ml-1 ${currentEditingProgram.is_active ? 'text-green-600' : 'text-red-600'}`}>
								{currentEditingProgram.is_active ? 'Active' : 'Inactive'}
							</span>
						</div>
						<div className="md:col-span-2">
							<span className="font-medium">Original Name:</span> {currentEditingProgram.name}
						</div>
					</div>
				</div>
			)}

			{/* Professor Management Section */}
			<div className="rounded-lg border-2 border-gray-200 p-4">
				<h4 className="mb-4 text-lg font-semibold text-gray-700">Manage Professors</h4>

				{/* Currently Assigned Professors */}
				<div className="mb-4">
					<h5 className="mb-2 font-medium text-gray-600">Currently Assigned Professors:</h5>
					{currentProgramProfessors.length > 0 ? (
						<div className="space-y-2">
							{currentProgramProfessors.map((rel) => (
								<div key={rel.professor} className="flex items-center justify-between rounded bg-blue-50 p-2">
									<span className="text-sm">
										{rel.professor_details?.full_name || `Professor ID: ${rel.professor}`}
									</span>
									<button
										type="button"
										onClick={() => removeProfessorFromProgram(rel.professor)}
										className="btn btn-sm btn-error text-white"
									>
										Remove
									</button>
								</div>
							))}
						</div>
					) : (
						<p className="text-sm text-gray-500">No professors currently assigned</p>
					)}
				</div>

				{/* Add New Professor */}
				<div>
					<h5 className="mb-2 font-medium text-gray-600">Add Professor:</h5>
					<div className="flex gap-2">
						<select
							className="select select-bordered flex-1"
							onChange={(e) => {
								const professorId = parseInt(e.target.value);
								if (professorId && !selectedProfessorsForEdit.includes(professorId)) {
									addProfessorToProgram(professorId);
									e.target.value = ""; // Reset selection
								}
							}}
						>
							<option value="">Select a professor to add</option>
							{availableProfessors
								.filter(prof => !selectedProfessorsForEdit.includes(prof.id))
								.map((professor) => (
									<option key={professor.id} value={professor.id}>
										{professor.full_name || `${professor.first_name} ${professor.last_name}`}
									</option>
								))
							}
						</select>
					</div>
				</div>

				{/* Newly Added Professors (not yet saved) */}
				{selectedProfessorsForEdit.length > currentProgramProfessors.length && (
					<div className="mt-4">
						<h5 className="mb-2 font-medium text-green-600">Professors to be Added:</h5>
						<div className="space-y-2">
							{selectedProfessorsForEdit
								.filter(profId => !currentProgramProfessors.some(rel => rel.professor === profId))
								.map((professorId) => {
									const professor = availableProfessors.find(p => p.id === professorId);
									return (
										<div key={professorId} className="flex items-center justify-between rounded bg-green-50 p-2">
											<span className="text-sm">
												{professor?.full_name || professor?.first_name + " " + professor?.last_name || `Professor ID: ${professorId}`}
											</span>
											<button
												type="button"
												onClick={() => removeProfessorFromProgram(professorId)}
												className="btn btn-sm btn-outline btn-error"
											>
												Remove
											</button>
										</div>
									);
								})
							}
						</div>
					</div>
				)}

						{/* Professors to be Removed */}
						{currentProgramProfessors.some(rel => !selectedProfessorsForEdit.includes(rel.professor)) && (
							<div className="mt-4">
								<h5 className="mb-2 font-medium text-red-600">Professors to be Removed:</h5>
								<div className="space-y-2">
									{currentProgramProfessors
										.filter(rel => !selectedProfessorsForEdit.includes(rel.professor))
										.map((rel) => (
											<div key={rel.professor} className="flex items-center justify-between rounded bg-red-50 p-2">
												<span className="text-sm">
													{rel.professor_details?.full_name || `Professor ID: ${rel.professor}`}
												</span>
												<button
													type="button"
													onClick={() => addProfessorToProgram(rel.professor)}
													className="btn btn-sm btn-outline btn-success"
												>
													Keep
												</button>
											</div>
										))
									}
								</div>
							</div>
						)}
					</div>

					{/* Action Buttons */}
					<div className="modal-action">
						<button
							type="submit"
							className="btn btn-success text-white"
							disabled={!editProgramName.trim()}
						>
							Update Program
						</button>
						<button
							type="button"
							className="btn btn-neutral"
							onClick={() => {
								resetEditForm();
								(document.getElementById("edit_program_modal") as HTMLDialogElement)?.close();
							}}
						>
							Cancel
						</button>
					</div>
				</form>
			</div>
			{/* Click outside to close */}
			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={() => {
					resetEditForm();
				}}>close</button>
			</form>
		</dialog>

				{/* Delete Program Modal */}
				<dialog id="delete_program_modal" className="modal">
					<div className="modal-box w-11/12 max-w-md">
						<h3 className="mb-4 text-center text-2xl font-bold">
							Delete Program
						</h3>
						<p className="mb-6 text-center">
							Are you sure you want to delete the program "{currentEditingProgram?.name}"?
							This action cannot be undone.
						</p>
						<div className="modal-action">
							<button
								onClick={() => {
									if (currentEditingProgram) {
										deleteProgram(currentEditingProgram.id);
									}
								}}
								className="btn btn-error text-white"
							>
								Delete
							</button>
							<button
								type="button"
								className="btn btn-cancel"
								onClick={() => {
									setCurrentEditingProgram(null);
									(document.getElementById("delete_program_modal") as HTMLDialogElement)?.close();
								}}
							>
								Cancel
							</button>
						</div>
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
					className="input input-bordered w-full max-w-md"
				/>
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
