import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, {
	Column,
} from "../../../Components/Evaluation Components/Data Table";
import { FunnelIcon } from "@heroicons/react/16/solid";
// Assuming you have your generic DataTable component exported

interface CoursesProps {
	setActiveView: (view: string) => void;
}

// Define the Course Type
interface Course {
	id: number;
	name: string;
	is_active: boolean;
}

function Courses({ setActiveView }: CoursesProps) {
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [newCourseName, setNewCourseName] = useState("");

	const fetchCourses = async () => {
		setLoading(true);
		try {
			const response = await api.get("/course/courses", {
				params: { name: searchTerm || undefined },
			});
			setCourses(response.data);
		} catch (error) {
			console.error("Error fetching courses:", error);
		} finally {
			setLoading(false);
		}
	};

	const createCourse = async () => {
		if (!newCourseName.trim()) return alert("Please enter a course name");
		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");
		try {
			await api.post(
				"/course/courses/",
				{ name: newCourseName },
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			setNewCourseName("");
			fetchCourses();
		} catch (error) {
			console.error("Error creating course:", error);
		}
	};

	const toggleCourseStatus = async (course: Course) => {
		try {
			await api.patch(`/course/courses/${course.id}/`, {
				is_active: !course.is_active,
			});
			fetchCourses();
		} catch (error) {
			console.error("Error updating course:", error);
		}
	};

	const deleteCourse = async (courseId: number) => {
		try {
			await api.delete(`/course/courses/${courseId}/`);
			fetchCourses();
		} catch (error) {
			console.error("Error deleting course:", error);
		}
	};

	// Actions column render function
	const courseActions = (course: Course) => (
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
					if (window.confirm(`Delete course "${course.name}"?`))
						deleteCourse(course.id);
				}}
				className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
			>
				<TrashIcon className="h-4 w-4" />
				Delete
			</button>
		</div>
	);

	useEffect(() => {
		fetchCourses();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchTerm]);

	// Define columns with proper accessors
	const courseColumns: Column<Course>[] = [
		{
			header: "Name",
			accessor: (course: Course) => course.name,
		},
		{
			header: "Status",
			accessor: (course: Course) => (
				<input
					onClick={() => toggleCourseStatus(course)}
					className="toggle"
					type="checkbox"
					checked={course.is_active}
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
					<li>Courses</li>
				</ul>
			</div>

			<h2 className="mt-4 text-3xl font-bold text-white">Courses</h2>

			<div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
				{/* New Course Button */}
				<button
					onClick={() =>
						(
							document.getElementById(
								"create_new_course",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
				>
					New Course
				</button>

				<dialog id="create_new_course" className="modal">
					<div className="modal-box w-11/12 max-w-3xl">
						<h3 className="mb-4 text-center text-2xl font-bold">
							Create New Course
						</h3>

						<form
							onSubmit={(e) => {
								e.preventDefault(); // Prevent default form behavior
								createCourse(); // Call createCourse function
								(
									document.getElementById(
										"create_new_course",
									) as HTMLDialogElement
								)?.close(); // Close the modal
							}}
							className="flex flex-col gap-6"
						>
							{/* Course Name */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/6">
									Name:
								</label>
								<input
									type="text"
									value={newCourseName} // Bind value to state
									onChange={(e) =>
										setNewCourseName(e.target.value)
									} // Update value on change
									placeholder="Enter course name"
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
												"create_new_course",
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
					{/* Import Courses Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_import_course",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Import Course
					</button>

					<dialog id="modal_import_course" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Import Course
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
													"modal_import_course",
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

					{/* Export Courses Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_export_courses",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Course
					</button>

					<dialog id="modal_export_courses" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Course
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
										value="Course A"
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
													"modal_export_courses",
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
			{/* Search and New Course button */}
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
					placeholder="Search by course name"
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
			{/* New Course Modal */}
			<dialog id="create_new_course" className="modal">
				<div className="modal-box w-11/12 max-w-3xl">
					<h3 className="mb-4 text-center text-2xl font-bold">
						Create New Course
					</h3>
					<form
						onSubmit={(e) => {
							e.preventDefault();
							createCourse();
							(
								document.getElementById(
									"create_new_course",
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
								value={newCourseName}
								onChange={(e) =>
									setNewCourseName(e.target.value)
								}
								placeholder="Enter course name"
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
											"create_new_course",
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
				data={courses}
				columns={courseColumns}
				getRowKey={(course) => course.id}
				actions={courseActions}
				selectable
			/>
		</div>
	);
}

export default Courses;
