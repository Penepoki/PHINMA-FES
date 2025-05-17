import { useState } from "react";
import { Pie } from "react-chartjs-2";
import {
	Chart as ChartJS,
	ArcElement,
	Tooltip,
	Legend,
	ChartOptions,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const pieData = {
	labels: ["Activity A", "Activity B", "Activity C"],
	datasets: [
		{
			label: "Teacher Activities",
			data: [12, 19, 3],
			backgroundColor: ["#36A2EB", "#FFCE56", "#FF6384"],
			borderWidth: 1,
		},
	],
};

const pieData2 = {
	labels: ["Engaged", "Distracted", "Group Work"],
	datasets: [
		{
			label: "Student Engagement",
			data: [20, 5, 10],
			backgroundColor: ["#4BC0C0", "#9966FF", "#FF9F40"],
			borderWidth: 1,
		},
	],
};

const pieOptions: ChartOptions<"pie"> = {
	responsive: true,
	plugins: {
		legend: {
			position: "bottom",
		},
	},
};

interface EvalProps {
	setActiveView: (view: string) => void;
}

function ToggleBox({ label }: { label: string }) {
	const [active, setActive] = useState(false);

	return (
		<button
			className={`min-w-[140px] rounded-xl px-6 py-3 text-center text-base font-semibold text-white transition-colors ${
				active ? "bg-green-600" : "bg-red-600"
			}`}
			onClick={() => setActive(!active)}
		>
			{label}
		</button>
	);
}

function Evaluation({ setActiveView }: EvalProps) {
	const [tableData] = useState([
		{
			course: "Renzo Cua",
			roomSubject: "403 SSP",
			yearSem: "2023 2nd Sem",
			department: "Computer Science",
		},
		{
			course: "Martin Espineda",
			roomSubject: "200 SIA",
			yearSem: "2022 1st Sem",
		},
		{
			course: "Chester Espineda",
			roomSubject: "190 MIA",
			yearSem: "2021 2nd Sem",
		},
		{
			course: "Chester Espineda",
			roomSubject: "190 MIA",
			yearSem: "2021 2nd Sem",
		},
		{
			course: "Chester Espineda",
			roomSubject: "190 MIA",
			yearSem: "2021 2nd Sem",
		},
		{
			course: "Chester Espineda",
			roomSubject: "190 MIA",
			yearSem: "2021 2nd Sem",
		},
	]);

	return (
		<div className="custom-container gap-y-6">
			<div className="breadcrumbs text-md text-white">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>Evaluation</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">
				Copus Evaluation Forms
			</h2>

			<div className="mt-4 flex w-full flex-row items-center justify-center gap-1 border-b-2 border-gray-600 px-4 py-5 text-black shadow-xl backdrop-blur-lg md:gap-6">
				<input
					type="text"
					className="input"
					placeholder="Professor"
					list="professor-list"
				/>
				<datalist id="professor-list">
					{tableData.map((row, index) => (
						<option key={index} value={row.course} />
					))}
				</datalist>

				<input
					type="text"
					className="input"
					placeholder="Room & Subject"
					list="room-subject-list"
				/>
				<datalist id="room-subject-list">
					{tableData.map((row, index) => (
						<option key={index} value={row.roomSubject} />
					))}
				</datalist>

				<input
					type="text"
					className="input"
					placeholder="Year & Semester"
					list="year-semester-list"
				/>
				<datalist id="year-semester-list">
					{tableData.map((row, index) => (
						<option key={index} value={row.yearSem} />
					))}
				</datalist>
			</div>

			<div className="w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
				<table className="table">
					<thead className="bg-[#1c402a]/50 text-xl font-bold text-white shadow-xl">
						<tr>
							<th>Course and Professor</th>
						</tr>
					</thead>
					<tbody className="text-lg text-white">
						{tableData.map((row, index) => {
							const modalId = `modal-${index}`;
							return (
								<tr key={index}>
									<td>
										<div className="collapse-arrow collapse rounded-md shadow-2xl backdrop-blur-lg">
											<input type="checkbox" />
											<div className="collapse-title bg-[#1c402a]/50 text-xl font-semibold">
												{row.course}
											</div>
											<div
												className="z-50 flex items-center justify-center gap-x-3 bg-[#1c402a]/50 py-3"
												onClick={(e) =>
													e.stopPropagation()
												} // Stop collapse toggle
											>
												{/* Copus 1 */}
												<label className="btn cursor-pointer text-black">
													<input
														name={`copus-${index}`}
														className="hidden"
														onClick={() =>
															(
																document.getElementById(
																	modalId,
																) as HTMLDialogElement
															)?.showModal()
														}
													/>
													Copus 1
												</label>

												{/* Copus 2 */}
												<label className="btn cursor-pointer bg-white text-black">
													<input
														name={`copus-${index}`}
														className="hidden"
														onClick={() =>
															console.log(
																"Copus 2 clicked",
															)
														}
													/>
													Copus 2
												</label>

												{/* Copus 3 */}
												<label className="btn cursor-pointer bg-white text-black">
													<input
														name={`copus-${index}`}
														className="hidden"
														onClick={() =>
															console.log(
																"Copus 3 clicked",
															)
														}
													/>
													Copus 3
												</label>
											</div>
											<div className="collapse-content flex bg-black/20 text-lg">
												<div className="flex h-full w-full flex-col justify-center">
													<div className="flex flex-row">
														<div className="avatar mt-3">
															<div className="h-24 w-24 rounded-full">
																<img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
															</div>
														</div>
														<div className="ml-6 flex w-full flex-col justify-center border-b-2 border-gray-300">
															<div>
																Department:{" "}
																<strong>
																	{
																		row.department
																	}
																</strong>
															</div>
															<div>
																Room and
																Subject:{" "}
																<strong>
																	{
																		row.roomSubject
																	}
																</strong>
															</div>
															<div>
																Year and
																Semester:{" "}
																<strong>
																	{
																		row.yearSem
																	}
																</strong>
															</div>
														</div>
													</div>
													<div className="mt-3">
														<table className="table w-full border-b-2 border-gray-300">
															<thead className="text-gray-300">
																<tr>
																	<th>
																		Evaluated
																		Subject
																	</th>
																	<th>
																		Schedule
																	</th>
																</tr>
															</thead>
															<tbody>
																<tr>
																	<td>
																		Introduction
																		to
																		Computing
																	</td>
																	<td>
																		7:30 AM
																		to
																		9:00PM
																		Teusday
																		& Friday
																		Room1
																	</td>
																</tr>
															</tbody>
														</table>
														<div className="mt-6 flex flex-col items-center justify-center gap-6 md:flex-row">
															{/* Pie Chart 1 + Table */}
															<div className="flex w-full flex-col items-center gap-4 md:w-1/4">
																<h3 className="text-xl font-semibold text-white">
																	Student
																	Doing
																</h3>
																<Pie
																	data={
																		pieData
																	}
																	options={
																		pieOptions
																	}
																/>
																<table className="table w-full border border-gray-600 text-center text-white">
																	<thead className="bg-[#1c402a]/80 text-white">
																		<tr>
																			<th className="py-2">
																				Student
																				Actions
																			</th>
																			<th className="py-2">
																				Tally
																			</th>
																		</tr>
																	</thead>
																	<tbody className="bg-black/30">
																		<tr>
																			<td>
																				Listening
																			</td>
																			<td>
																				12
																			</td>
																		</tr>
																		<tr>
																			<td>
																				Group
																				Work
																			</td>
																			<td>
																				7
																			</td>
																		</tr>
																		<tr>
																			<td>
																				Asking
																				Questions
																			</td>
																			<td>
																				5
																			</td>
																		</tr>
																	</tbody>
																</table>
															</div>

															{/* Pie Chart 2 + Table */}
															<div className="flex w-full flex-col items-center gap-4 md:w-1/4">
																<h3 className="text-xl font-semibold text-white">
																	Teacher
																	Doing
																</h3>
																<Pie
																	data={
																		pieData2
																	}
																	options={
																		pieOptions
																	}
																/>
																<table className="table w-full border border-gray-600 text-center text-white">
																	<thead className="bg-[#1c402a]/80 text-white">
																		<tr>
																			<th className="py-2">
																				Teacher
																				Actions
																			</th>
																			<th className="py-2">
																				Tally
																			</th>
																		</tr>
																	</thead>
																	<tbody className="bg-black/30">
																		<tr>
																			<td>
																				Lecturing
																			</td>
																			<td>
																				15
																			</td>
																		</tr>
																		<tr>
																			<td>
																				Demonstrating
																			</td>
																			<td>
																				8
																			</td>
																		</tr>
																		<tr>
																			<td>
																				Guiding
																			</td>
																			<td>
																				10
																			</td>
																		</tr>
																	</tbody>
																</table>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>

										{/* Modal for Copus 1 */}
										<dialog id={modalId} className="modal">
											<div className="modal-box w-11/12 max-w-5xl text-black">
												<h3 className="mb-4 text-xl font-bold">
													{row.course} - COPUS
													Evaluation
												</h3>

												{/* Basic Information */}
												<div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
													<input type="checkbox" />
													<div className="collapse-title text-lg font-semibold">
														Basic Information
													</div>
													<div className="collapse-content space-y-2">
														<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
															<input
																type="text"
																placeholder="Observer Name"
																className="input input-bordered w-full"
															/>
															<input
																type="date"
																placeholder="Observation Date"
																className="input input-bordered w-full"
															/>
															<input
																type="text"
																value={
																	row.course
																}
																readOnly
																className="input input-bordered w-full"
															/>

															<input
																type="text"
																placeholder="Room"
																className="input input-bordered w-full"
															/>
															<input
																type="text"
																placeholder="Semester"
																className="input input-bordered w-full"
															/>
															<input
																type="number"
																placeholder="Year"
																className="input input-bordered w-full"
															/>
														</div>
													</div>
												</div>

												{/* COPUS Matrix */}
												<div className="mb-4 rounded-lg border border-gray-300 p-4">
													<div className="mb-4 flex items-center justify-center gap-3">
														<button className="text-xl font-bold">
															&larr;
														</button>
														<h2 className="text-xl font-bold">
															Minute 2
														</h2>
														<button className="text-xl font-bold">
															&rarr;
														</button>
													</div>

													<div className="mb-6 text-center text-lg font-semibold text-gray-700">
														Students Doing
													</div>
													<div className="float-breathe mb-4 flex flex-wrap justify-center gap-2">
														{[
															"Listening",
															"Individual Thinking",
															"Group Activity",
															"Answer Questions",
															"Ask Questions",
															"Whole Class Discussion",
															"Student Presentations",
															"Test/Quiz",
															"Waiting",
															"Other",
														].map(
															(label, index) => (
																<ToggleBox
																	key={index}
																	label={
																		label
																	}
																/>
															),
														)}
													</div>

													<div className="mb-6 text-center text-lg font-semibold text-gray-700">
														Teacher Doing
													</div>
													<div className="float-breathe flex flex-wrap justify-center gap-2">
														{[
															"Lecture",
															"Real-time Writing",
															"Follow-up Questions",
															"Demonstrating",
															"Guiding",
															"Administrative Tasks",
															"Waiting",
															"Other",
														].map(
															(label, index) => (
																<ToggleBox
																	key={index}
																	label={
																		label
																	}
																/>
															),
														)}
													</div>
												</div>

												{/* Additional Information */}
												<div className="collapse-arrow collapse mb-4 border-1 border-gray-300">
													<input type="checkbox" />
													<div className="collapse-title text-lg font-semibold">
														Additional Information
													</div>
													<div className="collapse-content">
														<textarea
															className="textarea textarea-bordered min-h-[100px] w-full"
															placeholder="Enter any additional comments or observations here..."
														></textarea>
													</div>
												</div>

												{/* Actions */}
												<div className="modal-action">
													<form method="dialog">
														<button
															type="submit"
															className="btn bg-[#1c402a] text-white"
														>
															Save
														</button>
														<button
															type="submit"
															className="btn btn-cancel"
														>
															Close
														</button>
													</form>
												</div>
											</div>
										</dialog>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Evaluation;
