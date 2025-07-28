import { useEffect, useState } from "react";

// Option type for comboboxes
interface Option {
  id: number | string;
  name: string;
}
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, {
	Column,
} from "../../../Components/Evaluation Components/Data Table";
import ComboboxTextField from "../../../Components/Resource Components/ComboboxTextField";
// Assuming you have your generic DataTable component exported

interface SectionsProps {
	setActiveView: (view: string) => void;
}

// Define the Section Type
interface Section {
	id: number;
	name: string;
	is_active: boolean;
}

function Sections({ setActiveView }: SectionsProps) {
	const [Sections, setSections] = useState<Section[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [newSectionName, setNewSectionName] = useState("");
	const [selectedStudent, setSelectedStudent] = useState<Option | null>(null);

	const fetchSections = async () => {
		setLoading(true);
		try {
			const response = await api.get("/section/sections", {
				params: { name: searchTerm || undefined },
			});
			setSections(response.data);
		} catch (error) {
			console.error("Error fetching Sections:", error);
		} finally {
			setLoading(false);
		}
	};

	const createSection = async () => {
		if (!newSectionName.trim()) return alert("Please enter a Section name");
		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");
		try {
			await api.post(
				"/section/sections/",
				{ name: newSectionName },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setNewSectionName("");
			fetchSections();
		} catch (error) {
			console.error("Error creating Section:", error);
		}
	};

	const toggleSectionstatus = async (Section: Section) => {
		try {
			await api.patch(`/section/sections/${Section.id}/`, {
				is_active: !Section.is_active,
			});
			fetchSections();
		} catch (error) {
			console.error("Error updating Section:", error);
		}
	};

	const deleteSection = async (SectionId: number) => {
		try {
			await api.delete(`/section/sections/${SectionId}/`);
			fetchSections();
		} catch (error) {
			console.error("Error deleting Section:", error);
		}
	};

	// Actions column render function
	const SectionActions = (Section: Section) => (
		<div className="flex flex-col items-start gap-2">
			<button
				title="Edit"
				onClick={() => alert("Edit feature not implemented yet")}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
			>
				<PencilSquareIcon className="h-4 w-4" />
				Edit
			</button>
			<button
				title="Delete"
				onClick={() => {
					if (window.confirm(`Delete Section "${Section.name}"?`))
						deleteSection(Section.id);
				}}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
			>
				<TrashIcon className="h-4 w-4" />
				Delete
			</button>
		</div>
	);

	useEffect(() => {
		fetchSections();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	// Define columns with proper accessors
	const SectionColumns: Column<Section>[] = [
		{
			header: "Name",
			accessor: (Section: Section) => Section.name,
		},
		{
			header: "Status",
			accessor: (Section: Section) => (
				<input
					onClick={() => toggleSectionstatus(Section)}
					className="toggle"
					type="checkbox"
					checked={Section.is_active}
				/>
			),
		},
	];

	return (
		<div className="custom-container gap-y-6">
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
					<li>Sections</li>
				</ul>
			</div>

			<h2 className="mt-4 text-3xl font-bold text-white">Sections</h2>

			<div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
				{/* New Section Button */}
				<button
					onClick={() =>
						(
							document.getElementById(
								"create_new_Section",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
				>
					New Section
				</button>

				<dialog id="create_new_Section" className="modal">
					<div className="modal-box w-11/12 max-w-3xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							Create New Section
						</h3>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								createSection();
								(
									document.getElementById(
										"create_new_Section",
									) as HTMLDialogElement
								)?.close();
							}}
							className="flex flex-col gap-6"
						>
							{/* Section Name */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Name:
								</label>
								<input
									type="text"
									value={newSectionName}
									onChange={(e) =>
										setNewSectionName(e.target.value)
									}
									placeholder="Enter Section name"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Section Selection (if needed) */}
							<ComboboxTextField
								label="Students"
								placeholder="Select Student Names"
								fetchUrl="/section/sections"
								value={selectedStudent}
								onChange={setSelectedStudent}
							/>

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
												"create_new_Section",
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
					{/* Import Sections Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_import_Section",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Import Section
					</button>

					<dialog id="modal_import_Section" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Import Section
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
													"modal_import_Section",
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

					{/* Export Sections Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_export_Sections",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Section
					</button>

					<dialog id="modal_export_Sections" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Section
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
										value="Section A"
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
													"modal_export_Sections",
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
			{/* Search and New Section button */}
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
					placeholder="Search by Section name"
					className="input input-bordered w-full max-w-md"
				/>
			</div>
			{/* New Section Modal */}
			<dialog id="create_new_Section" className="modal">
				<div className="modal-box w-11/12 max-w-3xl">
					<h3 className="mb-4 text-center text-2xl font-bold">
						Create New Section
					</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							createSection();
							(
								document.getElementById(
									"create_new_Section",
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
								value={newSectionName}
								onChange={(e) =>
									setNewSectionName(e.target.value)
								}
								placeholder="Enter Section name"
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
											"create_new_Section",
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
				data={Sections}
				columns={SectionColumns}
				getRowKey={(Section) => Section.id}
				actions={SectionActions}
				selectable
			/>
		</div>
	);
}

export default Sections;
