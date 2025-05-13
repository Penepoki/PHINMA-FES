import React, { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import ProfilePic from "../../assets/Dashboard Page Assets/Renzo_Picture no background.png";

interface ProfileProps {
	setActiveView: (view: string) => void;
}

function Profile({ setActiveView }: ProfileProps) {
	const [profileData, setProfileData] = useState({
		name: "John Doe",
		email: "johndoe@example.com",
		location: "San Francisco, CA",
		phone: "+1 234 567 890",
		joined: "January 2021",
	});

	const [passwords, setPasswords] = useState({
		current: "",
		new: "",
		confirm: "",
	});

	const [showPassword, setShowPassword] = useState({
		current: false,
		new: false,
		confirm: false,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setProfileData((prevData) => ({
			...prevData,
			[name]: value,
		}));
	};

	const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setPasswords((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		if (passwords.new && passwords.new !== passwords.confirm) {
			alert("New passwords do not match!");
			return;
		}
		// TODO: Integrate with backend for saving profile and password
		alert("Profile and password changes saved!");
	};

	return (
		<div className="custom-container">
			<div className="breadcrumbs text-white">
				<ul>
					<li>
						<a onClick={() => setActiveView("home")}>Home</a>
					</li>
					<li>
						<a>Profile View</a>
					</li>
				</ul>
			</div>
			<div className="profile-page z-10 flex h-full w-full flex-col items-center justify-center gap-6 p-4 md:flex-row md:p-8">
				{/* Profile Card Section */}
				<div className="flex h-1/2 w-full flex-col items-center justify-center rounded-xl p-6 text-white shadow-2xl backdrop-blur-lg md:h-full md:w-1/2">
					<div className="avatar">
						<div className="ring-primary ring-offset-base-100 w-20 rounded-full ring ring-offset-2 md:w-32">
							<img src={ProfilePic} alt="User Avatar" />
						</div>
					</div>
					<h2 className="mt-4 text-2xl font-bold">
						{profileData.name}
					</h2>
					<p className="text-gray-300">Dean View</p>
					<input
						type="file"
						className="file-input file-input-md file-input-primary file-input-ghost mt-4 file:text-white"
					/>
				</div>

				{/* Profile Details Section */}
				<div className="mb-10 h-full w-full overflow-x-clip overflow-y-auto rounded-xl p-6 text-white shadow-2xl backdrop-blur-lg md:w-1/2">
					<h3 className="mb-4 text-2xl font-bold">
						Profile Information
					</h3>
					<form onSubmit={handleSave} className="space-y-4 text-lg">
						<div>
							<label className="mb-1 block text-sm">Email</label>
							<input
								name="email"
								value={profileData.email}
								onChange={handleChange}
								type="email"
								className="input input-bordered w-full text-black"
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm">
								Location
							</label>
							<input
								name="location"
								value={profileData.location}
								onChange={handleChange}
								type="text"
								className="input input-bordered w-full text-black"
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm">Phone</label>
							<input
								name="phone"
								value={profileData.phone}
								onChange={handleChange}
								type="tel"
								className="input input-bordered w-full text-black"
							/>
						</div>
						<div>
							<label className="mb-1 block text-sm">Joined</label>
							<input
								value={profileData.joined}
								type="text"
								disabled
								className="input input-bordered w-full cursor-not-allowed bg-gray-100 text-gray-500"
							/>
						</div>

						<hr className="my-4 border-gray-500" />

						<h4 className="text-xl font-semibold">
							Change Password
						</h4>
						{["current", "new", "confirm"].map((field) => (
							<div key={field} className="relative">
								<label className="mb-1 block text-sm capitalize">
									{field === "confirm"
										? "Confirm New Password"
										: `${field} Password`}
								</label>
								<input
									type={
										showPassword[
											field as keyof typeof showPassword
										]
											? "text"
											: "password"
									}
									name={field}
									value={
										passwords[
											field as keyof typeof passwords
										]
									}
									onChange={handlePasswordChange}
									className="input input-bordered w-full pr-10 text-black"
								/>
								<button
									type="button"
									onClick={() =>
										setShowPassword((prev) => ({
											...prev,
											[field]:
												!prev[
													field as keyof typeof prev
												],
										}))
									}
									className="absolute top-9 right-3 -translate-y-1/2 transform text-gray-500"
								>
									{showPassword[
										field as keyof typeof showPassword
									] ? (
										<EyeSlashIcon className="h-5 w-5" />
									) : (
										<EyeIcon className="h-5 w-5" />
									)}
								</button>
							</div>
						))}

						<button
							type="submit"
							className="btn btn-primary mt-4 w-full text-white md:w-auto"
						>
							Save Changes
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}

export default Profile;
