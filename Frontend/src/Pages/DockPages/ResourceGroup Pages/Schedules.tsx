import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, {
	Column,
} from "../../../Components/Evaluation Components/Data Table";
import {ComboboxTextField} from "../../../Components/Resource Components/ComboTextField.tsx";
// Assuming you have your generic DataTable component exported

interface SchedulesProps {
	setActiveView: (view: string) => void;
}

// Define the Schedule Type
interface Schedule {
	id: number;
	name: string;
	is_active: boolean;
}

function Schedules({ setActiveView }: SchedulesProps) {
	const [schedules, setSchedules] = useState<Schedule[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [newScheduleName, setNewScheduleName] = useState("");
	const [selectedProfessor, setSelectedProfessor] = useState<Option | null>(null);

	const fetchSchedules = async () => {
		setLoading(true);
		try {
			const response = await api.get("/schedule/schedules", {
				params: { name: searchTerm || undefined },
			});
			setSchedules(response.data);
		} catch (error) {
			console.error("Error fetching schedules:", error);
		} finally {
			setLoading(false);
		}
	};

	const createSchedule = async () => {
		if (!newScheduleName.trim())
			return alert("Please enter a schedule name");
		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");
		try {
			await api.post(
				"/schedule/schedules/",
				{ name: newScheduleName },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setNewScheduleName("");
			fetchSchedules();
		} catch (error) {
			console.error("Error creating schedule:", error);
		}
	};

	const toggleScheduleStatus = async (schedule: Schedule) => {
		try {
			await api.patch(`/schedule/schedules/${schedule.id}/`, {
				is_active: !schedule.is_active,
			});
			fetchSchedules();
		} catch (error) {
			console.error("Error updating schedule:", error);
		}
	};

	const deleteSchedule = async (scheduleId: number) => {
		try {
			await api.delete(`/schedule/schedules/${scheduleId}/`);
			fetchSchedules();
		} catch (error) {
			console.error("Error deleting schedule:", error);
		}
	};

	// Actions column render function
	const scheduleActions = (schedule: Schedule) => (
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
					if (window.confirm(`Delete schedule "${schedule.name}"?`))
						deleteSchedule(schedule.id);
				}}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
			>
				<TrashIcon className="h-4 w-4" />
				Delete
			</button>
		</div>
	);

	useEffect(() => {
		fetchSchedules();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	// Define columns with proper accessors
	const scheduleColumns: Column<Schedule>[] = [
		{
			header: "Name",
			accessor: (schedule: Schedule) => schedule.name,
		},
		{
			header: "Status",
			accessor: (schedule: Schedule) => (
				<input
					onClick={() => toggleScheduleStatus(schedule)}
					className="toggle"
					type="checkbox"
					checked={schedule.is_active}
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
					<li>Schedules</li>
				</ul>
			</div>

			<h2 className="mt-4 text-3xl font-bold text-white">Schedules</h2>

			<div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
				{/* New Schedule Button */}
				<button
					onClick={() =>
						(
							document.getElementById(
								"create_new_schedule",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
				>
					New Schedule
				</button>

				<dialog id="create_new_schedule" className="modal">
					<div className="modal-box w-11/12 max-w-5xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							Create New Schedule
						</h3>

						<form method="dialog" className="flex flex-col gap-6">
							{/* Course */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Course:
								</label>
								<input
									type="text"
									placeholder="Enter course"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Professor */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<ComboboxTextField
								  label="Professor"
								  placeholder="Enter professor name"
								  fetchUrl="/users/professors"
								  value={selectedProfessor}
								  onChange={setSelectedProfessor}
								/>


							</div>

							{/* Subject */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Subject:
								</label>
								<input
									type="text"
									placeholder="Enter subject"
									className="input input-bordered w-full"
									required
								/>
							</div>

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

							{/* Time */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Time:
								</label>
								<input
									type="text"
									placeholder="Enter time (e.g., 9:00 AM - 10:30 AM)"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Semester */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Semester:
								</label>
								<input
									type="text"
									placeholder="Enter semester (e.g., 1st)"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Year */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Year:
								</label>
								<input
									type="text"
									placeholder="Enter year (e.g., 2024)"
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
												"create_new_schedule",
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
					{/* Import Schedules Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_import_schedule",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Import Schedule
					</button>

					<dialog id="modal_import_schedule" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Import Schedule
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
													"modal_import_schedule",
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

					{/* Export Schedules Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_export_schedules",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Schedule
					</button>

					<dialog id="modal_export_schedules" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Schedule
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
										value="Schedule A"
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
													"modal_export_schedules",
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
			{/* Search and New Schedule button */}
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
					placeholder="Search by schedule name"
					className="input input-bordered w-full max-w-md"
				/>
			</div>
			{/* New Schedule Modal */}
			<dialog id="create_new_schedule" className="modal">
				<div className="modal-box w-11/12 max-w-3xl">
					<h3 className="mb-4 text-center text-2xl font-bold">
						Create New Schedule
					</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							createSchedule();
							(
								document.getElementById(
									"create_new_schedule",
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
								value={newScheduleName}
								onChange={(e) =>
									setNewScheduleName(e.target.value)
								}
								placeholder="Enter schedule name"
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
											"create_new_schedule",
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
				data={schedules}
				columns={scheduleColumns}
				getRowKey={(schedule) => schedule.id}
				actions={scheduleActions}
				selectable
			/>
		</div>
	);
}

export default Schedules;
