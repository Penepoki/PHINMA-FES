import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import api from "../../utils/api.ts";

const DashboardHeader = () => {
	const [firstName, setFirstName] = useState("User");
	const navigate = useNavigate();

	useEffect(() => {
	const fetchUserData = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) {
				console.error("No token found");
				return;
			}

			// If you’re not setting the token globally in api.ts, add it here
			const response = await api.get("/user-dashboard/", {
				headers: {
					Authorization: `Token ${token}`,
				},
			});

			setFirstName(response.data.first_name || "User");
		} catch (error: any) {
			if (error.response) {
				console.error(`Error: HTTP ${error.response.status}`);
				if (error.response.status === 401) navigate("/login");
			} else {
				console.error("Error fetching user data:", error.message);
			}
		}
	};

	fetchUserData();
	}, [navigate]);

	// Logout function
		const handleLogout = async () => {
		try {
			const token = localStorage.getItem("token");
			if (!token) throw new Error("No token found. User is already logged out!");

			// Make a POST request to your logout endpoint
			const response = await api.post("/logout/", null, {
				headers: {
					Authorization: `Token ${token}`,
				},
			});

			// If successful, clear storage and redirect
			localStorage.removeItem("token");
			localStorage.removeItem("firstName");
			alert("Logged out successfully!");
			navigate("/");
		} catch (error: any) {
			// Axios errors
			if (error.response) {
				console.error("Logout failed:", error.response.data);
				alert("Something went wrong when logging out.");
			} else {
				console.error("Error during logout:", error.message || error);
				alert("Error during logout.");
			}
		}
	};

	return (
		<header className="absolute top-0 z-1 flex h-[15%] w-full items-end justify-between border-b-2 border-gray-600 px-6 shadow-2xl backdrop-blur-lg">
			<div className="flex flex-col items-start gap-2 sm:flex-row sm:items-end sm:gap-6">
				<h1 className="text-5xl font-bold text-white md:text-7xl">
					Hi, {firstName}
				</h1>
				<p className="text-md text-gray-300">
					Welcome to the Home Page
				</p>
			</div>
			<button
				className="text-md text-gray-300 underline"
				onClick={handleLogout}
			>
				Logout
			</button>
		</header>
	);
};

export default DashboardHeader;
