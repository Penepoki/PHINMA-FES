import { FunnelIcon } from "@heroicons/react/24/solid";

interface CoursesProps {
	setActiveView: (view: string) => void;
}

function Courses({ setActiveView }: CoursesProps) {
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
				{/* New Room Button */}
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

						<form method="dialog" className="flex flex-col gap-6">
							{/* Course Name */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/6">
									Name:
								</label>
								<input
									type="text"
									placeholder="Enter course name"
									className="input input-bordered w-full"
									required
								/>
							</div>

							{/* Course Code */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/6">
									Code:
								</label>
								<input
									type="text"
									placeholder="Enter course code"
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
					{/* Import Rooms Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_import_rooms",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Import Course
					</button>

					<dialog id="modal_import_rooms" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Import Rooms
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
													"modal_import_rooms",
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

					{/* Export Rooms Button.*/}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_export_rooms",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Course
					</button>

					<dialog id="modal_export_rooms" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Rooms
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
										value="Room A"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Code Field */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/6">
										Code:
									</label>
									<input
										type="text"
										value="RM-A101"
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
													"modal_export_rooms",
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
			<div className="flex w-full items-start justify-center border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl">
				<input
					type="text"
					className="input w-full max-w-md rounded-lg border border-gray-300"
					placeholder="Search"
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

			<div className="w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
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
							<th>Title</th>
							<th></th>
							<th></th>
							<th>Publish</th>
							<th></th>
						</tr>
					</thead>
					<tbody className="text-lg text-gray-300">
						{/* row 1 */}
						<tr className="hover:bg-[#1b2e3e]/50">
							<td>
								<input
									type="checkbox"
									defaultChecked
									className="checkbox"
								/>
							</td>
							<td>Renzo Cua</td>
							<td></td>
							<td></td>
							<td>
								<input
									type="checkbox"
									defaultChecked
									className="toggle"
								/>
							</td>
							<td>Edit</td>
						</tr>
						{/* row 2 */}
						<tr className="hover:bg-[#1b2e3e]/50">
							<td>
								<input
									type="checkbox"
									defaultChecked
									className="checkbox"
								/>
							</td>
							<td>Martin Espineda</td>
							<td></td>
							<td></td>
							<td>
								<input
									type="checkbox"
									defaultChecked
									className="toggle"
								/>
							</td>
							<td>Edit</td>
						</tr>
						{/* row 3 */}
						<tr className="hover:bg-[#1b2e3e]/50">
							<td>
								<input
									type="checkbox"
									defaultChecked
									className="checkbox"
								/>
							</td>
							<td>Chester Espineda</td>
							<td></td>
							<td></td>
							<td>
								<input
									type="checkbox"
									defaultChecked
									className="toggle"
								/>
							</td>
							<td>Edit</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Courses;
