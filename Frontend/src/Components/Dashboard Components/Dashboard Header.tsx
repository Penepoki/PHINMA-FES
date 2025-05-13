import { useEffect, useState } from "react";

const DashboardHeader = () => {
	const [firstName, setFirstName] = useState("User");

	useEffect(() => {
		const fetchUserData = async () => {
			try {
				const token = localStorage.getItem("token");
				if (!token) return;

				const response = await fetch(
					"http://127.0.0.1:8000/api/user-dashboard/",
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Token ${token}`, // <- This is key
						},
					},
				);

				if (!response.ok) {
					throw new Error("Failed to fetch user");
				}

				const data = await response.json();
				const nameParts = data.name.split(" ");
				setFirstName(nameParts[1] || "User");
				localStorage.setItem("firstName", nameParts[1] || "User");
			} catch (error) {
				console.error("Error fetching user data:", error);
			}
		};

		fetchUserData();
	}, []);

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
				onClick={() => {
					localStorage.clear(); // optional: clear all user data
					alert("Logged out!");
					window.location.href = "/"; // or use navigate('/')
				}}
			>
				Logout
			</button>
		</header>
	);
};

export default DashboardHeader;
