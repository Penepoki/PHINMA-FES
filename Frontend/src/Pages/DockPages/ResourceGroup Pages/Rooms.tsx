import { FunnelIcon } from "@heroicons/react/24/solid";

interface RoomsProps {
  setActiveView: (view: string) => void;
}

function Rooms({ setActiveView }: RoomsProps) {
  return (
    <div className="custom-container gap-y-6">
      <div className="breadcrumbs">
        <ul>
          <li>
            <a onClick={() => setActiveView("home")}>Home</a>
          </li>
          <li>
            <a onClick={() => setActiveView("resourceGroup")}>Resource Group</a>
          </li>
          <li>Rooms</li>
        </ul>
      </div>
      <h2 className="text-3xl font-bold mt-4 text-white ">Rooms</h2>

      <div className="flex flex-col sm:flex-row w-full justify-center sm:justify-between gap-3 sm:gap-5 items-stretch pb-2 px-4 border-b-gray-600 border-b-2 shadow-xl">
        {/* New Room Button */}
        <button
          onClick={() =>
            (
              document.getElementById("create_new_room") as HTMLDialogElement
            )?.showModal()
          }
          className="bg-[#1c402a] shadow-xl text-white w-full sm:w-auto rounded-lg py-2 px-5 hover:scale-105 transition-transform whitespace-nowrap"
        >
          New Room
        </button>

        <dialog id="create_new_room" className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="font-bold text-2xl mb-4 text-center">
              Create New Room
            </h3>

            <form method="dialog" className="flex flex-col gap-6">
              {/* Course Name */}
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <label className="md:w-1/6 text-lg font-bold text-left">
                  Name:
                </label>
                <input
                  type="text"
                  placeholder="Enter course name"
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
                  className="btn"
                  onClick={() =>
                    (
                      document.getElementById(
                        "create_new_room"
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
                  "modal_import_rooms"
                ) as HTMLDialogElement
              )?.showModal()
            }
            className="bg-[#1b2e3e] shadow-xl text-white w-full rounded-lg py-2 px-5 hover:scale-105 transition-transform whitespace-nowrap"
          >
            Import Rooms
          </button>

          <dialog id="modal_import_rooms" className="modal">
            <div className="modal-box w-11/12 max-w-5xl">
              <h3 className="font-bold text-lg">Import Rooms</h3>
              <p className="py-4">This is the modal for importing rooms.</p>
              <div className="modal-action">
                <form method="dialog">
                  <button type="submit" className="btn">
                    Close
                  </button>
                </form>
              </div>
            </div>
          </dialog>

          {/* Export Rooms Button */}
          <button
            onClick={() =>
              (
                document.getElementById(
                  "modal_export_rooms"
                ) as HTMLDialogElement
              )?.showModal()
            }
            className="bg-[#d4c351] shadow-xl text-white w-full rounded-lg py-2 px-5 hover:scale-105 transition-transform whitespace-nowrap"
          >
            Export Rooms
          </button>

          <dialog id="modal_export_rooms" className="modal">
            <div className="modal-box w-11/12 max-w-5xl">
              <h3 className="font-bold text-lg">Export Rooms</h3>
              <p className="py-4">This is the modal for exporting rooms.</p>
              <div className="modal-action">
                <form method="dialog">
                  <button type="submit" className="btn">
                    Close
                  </button>
                </form>
              </div>
            </div>
          </dialog>
        </div>
      </div>
      <div className="flex w-full justify-center items-start pb-2 px-4 border-b-gray-600 border-b-2 shadow-xl">
        <input
          type="text"
          className="input w-full max-w-md border border-gray-300 rounded-lg"
          placeholder="Search"
        />
        <div className="dropdown dropdown-end ml-2">
          <div
            tabIndex={0}
            role="button"
            className="btn shadow-xl bg-[#1c402a] border-0 text-white"
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

      <div className="overflow-x-auto w-full text-white backdrop-blur-lg shadow-xl">
        <table className="table">
          {/* head */}
          <thead className="text-white text-xl font-bold bg-[#1c402a]/50 shadow-xl">
            <tr>
              <th>
                <input type="checkbox" defaultChecked className="checkbox" />
              </th>
              <th>Title</th>
              <th></th>
              <th></th>
              <th>Publish</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="text-gray-300 text-lg">
            {/* row 1 */}
            <tr className="hover:bg-[#1b2e3e]/50">
              <td>
                <input type="checkbox" defaultChecked className="checkbox" />
              </td>
              <td>Renzo Cua</td>
              <td></td>
              <td></td>
              <td>
                <input type="checkbox" defaultChecked className="toggle" />
              </td>
              <td>Edit</td>
            </tr>
            {/* row 2 */}
            <tr className="hover:bg-[#1b2e3e]/50">
              <td>
                <input type="checkbox" defaultChecked className="checkbox" />
              </td>
              <td>Martin Espineda</td>
              <td></td>
              <td></td>
              <td>
                <input type="checkbox" defaultChecked className="toggle" />
              </td>
              <td>Edit</td>
            </tr>
            {/* row 3 */}
            <tr className="hover:bg-[#1b2e3e]/50">
              <td>
                <input type="checkbox" defaultChecked className="checkbox" />
              </td>
              <td>Chester Espineda</td>
              <td></td>
              <td></td>
              <td>
                <input type="checkbox" defaultChecked className="toggle" />
              </td>
              <td>Edit</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Rooms;
