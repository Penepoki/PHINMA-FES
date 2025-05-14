import { FunnelIcon } from "@heroicons/react/24/solid";

interface SchedulesProps {
	setActiveView: (view: string) => void;
}

function Schedules({ setActiveView }: SchedulesProps) {
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
				{/* New Room Button */}
				<button
					onClick={() =>
						(
							document.getElementById(
								"modal_new_schedule",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
				>
					New Schedule
				</button>

				<dialog id="modal_new_schedule" className="modal">
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
								<label className="text-left text-lg font-bold md:w-1/4">
									Professor:
								</label>
								<input
									type="text"
									placeholder="Enter professor name"
									className="input input-bordered w-full"
									required
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

							{/* Room */}
							<div className="flex flex-col gap-2 md:flex-row md:items-center">
								<label className="text-left text-lg font-bold md:w-1/4">
									Room:
								</label>
								<input
									type="text"
									placeholder="Enter room"
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
												"modal_new_schedule",
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

					{/* Export Rooms Button */}
					<button
						onClick={() =>
							(
								document.getElementById(
									"modal_export_schedule",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Schedule
					</button>

					<dialog id="modal_export_schedule" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Schedule
							</h3>

							<form
								method="dialog"
								className="flex flex-col gap-6"
							>
								{/* Title */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Title:
									</label>
									<input
										type="text"
										value="Intro to Programming"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Course */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Course:
									</label>
									<input
										type="text"
										value="BSCS 101"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Instructor */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Instructor:
									</label>
									<input
										type="text"
										value="Prof. Jane Doe"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Room */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Room:
									</label>
									<input
										type="text"
										value="Room 204"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Start Time */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Start Time:
									</label>
									<input
										type="text"
										value="09:00 AM"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* End Time */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										End Time:
									</label>
									<input
										type="text"
										value="10:30 AM"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Day of the Week */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Day:
									</label>
									<input
										type="text"
										value="Monday"
										readOnly
										className="input input-bordered w-full cursor-not-allowed bg-gray-100"
									/>
								</div>

								{/* Status */}
								<div className="flex flex-col gap-2 md:flex-row md:items-center">
									<label className="text-left text-lg font-bold md:w-1/4">
										Status:
									</label>
									<input
										type="text"
										value="Active"
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
													"modal_export_schedule",
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
							<th>Is Active</th>
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

export default Schedules;
