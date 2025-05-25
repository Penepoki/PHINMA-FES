import { FunnelIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useEffect } from "react";
import api from "../../../utils/api";

interface RoomsProps {
	setActiveView: (view: string) => void;
}

// Define the Room Type
interface Room {
	id: number;
	name: string;
	is_active: boolean;
}

function Rooms({ setActiveView}: RoomsProps) {
	const [rooms, setRooms] = useState<Room[]>([]); //The Rooms/Data from the backend
	const [loading, setLoading] = useState<boolean>(true);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [newRoomName, setNewRoomName] = useState<string>("");

	const fetchRooms = async () => {
		setLoading(true);
		try {
			// Add filtering by name when the searchTerm is set
			const response = await api.get("/room/rooms", {
				params: {name: searchTerm }
			});
			setRooms(response.data); // Data catch to backend
		} catch (error) {
			console.error("Error fetching rooms:", error);
		} finally {
			setLoading(false);
		}
	};
	// Create a new Room
	const createRoom = async () => {
		if (!newRoomName) return alert("Please enter a room name");
		const token = localStorage.getItem("token");
		if (!token) return alert("You are not authenticated. Please login.");
		try {
		await api.post(
			"/room/rooms/",
			{ name: newRoomName },
			{
				headers: {
					Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
				},
			}
		);

			setNewRoomName("");
			fetchRooms(); //Refresh rooms list after new data input
		} catch (error) {
			console.error("Error creating room:", error);
		}
	};

	// is_active toggle
	const toggleRoomStatus = async (room: Room) => {
		try {
			await api.patch(`/room/rooms/${room.id}/`, { is_active: !room.is_active });
			fetchRooms(); // Refresh rooms list after updating
	} catch (error) {
			console.error("Error updating room:", error);
		}
	};

	// Delete a room
	const deleteRoom = async (roomId: number) => {
		try {
			await api.delete('/room/rooms/${roomId}/');
			fetchRooms(); // Refresh after deleting
		} catch (error) {
			console.error("Error deleting room:", error);
		}
	};

	// Fetch data
	useEffect(() => {
		fetchRooms();
	}, [searchTerm]);


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
					<li>Rooms</li>
				</ul>
			</div>
			<h2 className="mt-4 text-3xl font-bold text-white">Rooms</h2>

			<div className="flex w-full flex-col items-stretch justify-center gap-3 border-b-2 border-b-gray-600 px-4 pb-2 shadow-xl sm:flex-row sm:justify-between sm:gap-5">
				{/* New Room Button */}
				<button
					onClick={() =>
						(
							document.getElementById(
								"create_new_room",
							) as HTMLDialogElement
						)?.showModal()
					}
					className="w-full rounded-lg bg-[#1c402a] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
				>
					New Room
				</button>

							<dialog id="create_new_room" className="modal">
				<div className="modal-box w-11/12 max-w-3xl">
					<h3 className="mb-4 text-center text-2xl font-bold">
						Create New Room
					</h3>

					<form
						onSubmit={(e) => {
							e.preventDefault(); // Prevent default form behavior
							createRoom(); // Call createRoom function
							(document.getElementById("create_new_room") as HTMLDialogElement)?.close(); // Close the modal
						}}
						className="flex flex-col gap-6"
					>
						{/* Room Name */}
						<div className="flex flex-col gap-2 md:flex-row md:items-center">
							<label className="text-left text-lg font-bold md:w-1/6">
								Name:
							</label>
							<input
								type="text"
								value={newRoomName} // Bind value to state
								onChange={(e) => setNewRoomName(e.target.value)} // Update value on change
								placeholder="Enter room name"
								className="input input-bordered w-full"
								required
							/>
						</div>

						{/* Action Buttons */}
						<div className="modal-action">
							<button type="submit" className="btn btn-success text-white">
								Submit
							</button>
							<button
								type="button"
								className="btn btn-cancel"
								onClick={() =>
									(
										document.getElementById(
											"create_new_room",
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
									"modal_import_room",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#1b2e3e] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Import Room
					</button>

					<dialog id="modal_import_room" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Import Room
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
													"modal_import_room",
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
									"modal_export_rooms",
								) as HTMLDialogElement
							)?.showModal()
						}
						className="w-full rounded-lg bg-[#d4c351] px-5 py-2 whitespace-nowrap text-white shadow-xl transition-transform hover:scale-105 sm:w-auto"
					>
						Export Room
					</button>

					<dialog id="modal_export_rooms" className="modal">
						<div className="modal-box w-11/12 max-w-3xl">
							<h3 className="mb-4 text-center text-2xl font-bold">
								Export Room
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
				<label htmlFor="search" className="text-lg text-white font-bold">
						Search:
					</label>
					<input
						id="search"
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)} // Trigger new search
						placeholder="Search by room name"
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

			<div className="w-full overflow-x-auto text-white shadow-xl backdrop-blur-lg">
				<table className="table">
					{/* head */}
					<thead className="bg-[#1c402a]/50 text-xl font-bold text-white shadow-xl">
						<tr>
					<th className="text-left px-4 py-2">ID</th>
					<th className="text-left px-4 py-2">Name</th>
					<th className="text-center px-4 py-2">Status</th>
					<th className="text-center px-4 py-2">Actions</th>
				</tr>
			</thead>
			<tbody>
				{rooms.map((room) => (
					<tr key={room.id}>
						<td className="border px-4 py-2">{room.id}</td>
						<td className="border px-4 py-2">{room.name}</td>
						<td className="border px-4 py-2 text-center">
							{room.is_active ? "Active" : "Inactive"}
						</td>
						<td className="border px-4 py-2 text-center">
							{/* Toggle Status Button */}
							<button
								onClick={() => toggleRoomStatus(room)}
								className="btn btn-sm"
							>
								{room.is_active ? "Deactivate" : "Activate"}
							</button>

							{/* Delete Button */}
							<button
								onClick={() =>
									window.confirm(
										"Are you sure you want to delete this room?"
									) && deleteRoom(room.id)
								}
								className="btn btn-sm btn-error"
							>
								Delete
							</button>
						</td>
					</tr>
					))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default Rooms;
