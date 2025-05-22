import { useEffect, useState } from "react";
import { useNavigate } from "react-router";


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

				const response = await fetch(
					"http://127.0.0.1:8000/api/user-dashboard/",
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Token ${token}`, // <- Ensure your token is valid
						},
					}
				);

				// Verify if the call is successful and handle the response data
				if (response.ok) {
					const data = await response.json();

					// Safely set "firstName" if it exists in the response
					setFirstName(data.first_name || "User"); // Default to "User" if undefined
				} else {
					console.error(`Error fetching user data: HTTP ${response.status}`);
					// Optional: Handle logout in case of unauthorized (401)
					if (response.status === 401) navigate("/login");
				}
			} catch (error) {
				console.error("Error fetching user data:", error.message);
			}
		};

		fetchUserData();
	}, [navigate]);



	// Logout function
	const handleLogout = async () => {
		try {
			const token = localStorage.getItem("token"); // Get saved token from localStorage
			if (!token) throw new Error("No token found. User is already logged out!");

			// Make a logout API call
			const response = await fetch("http://127.0.0.1:8000/api/logout/", {
				method: "POST", // Make sure the method aligns with your backend (POST instead of GET)
				headers: {
					"Content-Type": "application/json",
					Authorization: `Token ${token}`, // Send the token for authentication
				},
			});

			if (response.ok) {
				// Clear the token from localStorage
				localStorage.removeItem("token");
				localStorage.removeItem("firstName"); // Clear other saved user-related data if any
				alert("Logged out successfully!");
				navigate("/"); // Redirect user to login page
			} else {
				const errorData = await response.json();
				console.error("Logout failed:", errorData.error || "Unknown error");
				alert("Something went wrong when logging out.");
			}
		} catch (error) {
			console.error("Error during logout:", error);
			alert("Error during logout.");
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
