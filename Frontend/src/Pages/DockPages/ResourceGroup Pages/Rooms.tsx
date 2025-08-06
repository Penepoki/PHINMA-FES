import { useEffect, useState } from "react";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/16/solid";
import api from "../../../utils/api";
import DataTable, {
  Column,
} from "../../../Components/Evaluation Components/Data Table";

interface RoomsProps {
  setActiveView: (view: string) => void;
}

// Define the Room Type
interface Room {
  id: number;
  name: string;
  is_active: boolean;
}

function Rooms({ setActiveView }: RoomsProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  // Edit form state
  const [editRoomName, setEditRoomName] = useState("");
  const [currentEditingRoom, setCurrentEditingRoom] = useState<Room | null>(null);

  //Loading skeleton state
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await api.get("/room/rooms", {
        params: { name: searchTerm || undefined },
      });
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  };

  const createRoom = async () => {
    if (!newRoomName.trim()) return alert("Please enter a room name");
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");
    try {
      await api.post(
        "/room/rooms/",
        { name: newRoomName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewRoomName("");
      fetchRooms();
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  const updateRoom = async () => {
    if (!currentEditingRoom) return;

    if (!editRoomName.trim()) {
      alert("Please enter a room name.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.patch(
        `/room/rooms/${currentEditingRoom.id}/`,
        { name: editRoomName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Reset edit form and close modal
      resetEditForm();
      (document.getElementById("edit_room_modal") as HTMLDialogElement)?.close();
      fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
      alert("Error updating room. Please try again.");
    }
  };

  const resetEditForm = () => {
    setEditRoomName("");
    setCurrentEditingRoom(null);
  };

  const openEditDialog = (room: Room) => {
    setCurrentEditingRoom(room);
    setEditRoomName(room.name);
    (document.getElementById("edit_room_modal") as HTMLDialogElement)?.showModal();
  };

  const toggleRoomStatus = async (room: Room) => {
    try {
      await api.patch(`/room/rooms/${room.id}/`, {
        is_active: !room.is_active,
      });
      fetchRooms();
    } catch (error) {
      console.error("Error updating room:", error);
    }
  };

  const deleteRoom = async (roomId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("You are not authenticated. Please login.");

    try {
      await api.delete(`/room/rooms/${roomId}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      (document.getElementById("delete_room_modal") as HTMLDialogElement)?.close();
      fetchRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      alert("Error deleting room. Please try again.");
    }
  };

  const openDeleteDialog = (room: Room) => {
    setCurrentEditingRoom(room);
    (document.getElementById("delete_room_modal") as HTMLDialogElement)?.showModal();
  };

  // Actions column render function
  const roomActions = (room: Room) => (
    <div className="flex flex-col items-start gap-2">
      <button
        title="Edit"
        onClick={() => openEditDialog(room)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-blue-500 hover:underline"
      >
        <PencilSquareIcon className="h-4 w-4" />
        Edit
      </button>
      <button
        title="Delete"
        onClick={() => openDeleteDialog(room)}
        className="flex items-center gap-1 text-sm transition-colors duration-300 hover:text-red-500 hover:underline"
      >
        <TrashIcon className="h-4 w-4" />
        Delete
      </button>
    </div>
  );

  useEffect(() => {
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Define columns with proper accessors
  const roomColumns: Column<Room>[] = [
    {
      header: "Name",
      accessor: (room: Room) => room.name,
    },
    {
      header: "Status",
      accessor: (room: Room) => (
        <input
          onClick={() => toggleRoomStatus(room)}
          className="toggle"
          type="checkbox"
          checked={room.is_active}
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

        {/* Create Room Modal */}
        <dialog id="create_new_room" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">
              Create New Room
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRoom();
                (
                  document.getElementById(
                    "create_new_room",
                  ) as HTMLDialogElement
                )?.close();
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
                  value={newRoomName}
                  onChange={(e) =>
                    setNewRoomName(e.target.value)
                  }
                  placeholder="Enter room name"
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

        {/* Edit Room Modal */}
        <dialog id="edit_room_modal" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="mb-4 text-center text-2xl font-bold">
              Edit Room
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editRoomName.trim()) {
                  alert("Please enter a room name.");
                  return;
                }
                updateRoom();
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
                  value={editRoomName}
                  onChange={(e) =>
                    setEditRoomName(e.target.value)
                  }
                  placeholder="Enter room name"
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
                  Update
                </button>
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    resetEditForm();
                    (document.getElementById("edit_room_modal") as HTMLDialogElement)?.close();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>

        {/* Delete Room Modal */}
        <dialog id="delete_room_modal" className="modal">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="mb-4 text-center text-2xl font-bold">
              Delete Room
            </h3>
            <p className="mb-6 text-center">
              Are you sure you want to delete the room "{currentEditingRoom?.name}"?
              This action cannot be undone.
            </p>
            <div className="modal-action">
              <button
                onClick={() => {
                  if (currentEditingRoom) {
                    deleteRoom(currentEditingRoom.id);
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
                  setCurrentEditingRoom(null);
                  (document.getElementById("delete_room_modal") as HTMLDialogElement)?.close();
                }}
              >
                Cancel
              </button>
            </div>
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
      {/* Search and New Room button */}
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
          placeholder="Search by room name"
          className="input input-bordered w-full max-w-md"
        />
      </div>

      {/* DataTable */}
      <DataTable
        data={rooms}
        columns={roomColumns}
        getRowKey={(room) => room.id}
        actions={roomActions}
        selectable
        loading={loading}
      />
    </div>
  );
}

export default Rooms;
