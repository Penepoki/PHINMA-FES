import {
	EnvelopeIcon,
	UserIcon,
	LockClosedIcon,
} from "@heroicons/react/24/outline";
import api from "../../utils/api.ts";
import { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";

function LoginCard() {
	const [identifier, setIdentifier] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [first_name, setFirstName] = useState("");
	const [last_name, setLastName] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [isOtpSent, setIsOtpSent] = useState(false);
	const [isOtpVerified, setIsOtpVerified] = useState(false);
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);

	const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
	const navigate = useNavigate();

	const handleLogin = async () => {
		setIsLoading(true); // Start loading
		try {
			const response = await api.post("/login/", {
				username: identifier,
				password,
			}, { skipAuth: true });
			if (response.data.token) {
				const userRole = response.data.roles[0];
				localStorage.setItem("token", response.data.token);
				localStorage.setItem("userRole", userRole);

				switch (userRole) {
					case "Dean":
						navigate("/Dashboard/dean");
						break;
					case "HR":
						navigate("/Dashboard/hr");
						break;
					case "Student":
						navigate("/Dashboard/student");
						break;
					default:
						setError("Invalid user role");
				}
			} else {
				setError("Something went wrong.");
			}
		} catch (error) {
			console.error("Login failed:", error);
			setError("Handle Error");
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	const handleSignUp = async () => {
		setIsLoading(true); // Start loading
		try {
			if (password !== confirmSignupPassword) {
				setError("Passwords do not match");
				return;
			}
			const response = await api.post("/signup/", {
				first_name,
				last_name,
				username,
				password,
				email,
			});

			if (response.data.token) {
				localStorage.setItem("token", response.data.token);
				navigate("/dashboard/student");
			} else {
				setError("If-Else Something went wrong" + response.data.error);
			}
		} catch (err) {
			const error = err as AxiosError;
			if (error.response?.status === 400) {
				setError("Missing required fields");
			} else if (error.response?.status === 409) {
				setError("Username already exists");
			} else {
				setError("Unexpected error during sign-up");
			}
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	const handleResetPassword = async () => {
		setIsLoading(true); // Start loading
		try {
			await api.post("/forgot-password/", {
				email,
			});
			setIsOtpSent(true); // switch to OTP input view
		} catch (error) {
			console.error(error);
			setError("Failed to send OTP");
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	const handleNewPasswordSubmit = async () => {
		if (newPassword !== confirmPassword) {
			setError("Password does not match");
			return;
		}

		try {
			const response = await api.post("/set-new-password/", {
				email,
				new_password: newPassword,
			});

			if (response.data.message === "password reset successful") {
				setError("");
				alert("Password has been reset. You can now Log in.");
				setIsForgotPassword(false);
				setIsOtpSent(false);
				setIsOtpVerified(false);
				setOtp(["", "", "", "", "", ""]);
				setNewPassword("");
				setConfirmPassword("");
			} else {
				setError(response.data.message || "Else Error");
			}
		} catch (err) {
			const error = err as AxiosError;
			if (error.response?.status === 400) {
				setError("Missing required fields");
			} else if (error.response?.status === 409) {
				setError("Username already exists");
			} else {
				setError("Unexpected error during sign-up");
			}
		}
	};

	const handleOtpChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		index: number,
	) => {
		const value = e.target.value.replace(/\D/g, "").slice(0, 1);
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		if (value && index < 5) {
			otpRefs.current[index + 1]?.focus();
		}
	};

	const handleOtpKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>,
		index: number,
	) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			otpRefs.current[index - 1]?.focus();
		}
	};

	const handleResendOtp = async () => {
		try {
			const response = await api.post("/forgot-password/", {
				email,
			});
			if (response.data[0] === "OTP sent successfully") {
				setError("");
				alert("OTP resent!");
			} else {
				setError(response.data[0]);
			}
		} catch (err) {
			const error = err as AxiosError;
			if (error.response?.status === 400) {
				setError("Missing required fields");
			} else if (error.response?.status === 409) {
				setError("Username already exists");
			} else {
				setError("Unexpected error during sign-up");
			}
		}
	};

	const verifyOtp = async () => {
		const enteredOtp = otp.join("");
		console.log("Verifying OTP:", enteredOtp);
		setIsLoading(true); // Start loading

		try {
			const response = await api.post("/verify-otp/", {
				email,
				otp: enteredOtp,
			});
			if (response.data.message === "OTP verified") {
				setIsOtpVerified(true);
				setError("");
			} else {
				setError("Wrong OTP");
			}
		} catch (err) {
			const error = err as AxiosError;
			if (error.response?.status === 400) {
				setError("Missing required fields");
			} else if (error.response?.status === 409) {
				setError("Username does not exist");
			} else {
				setError("Unexpected error during OTP verification");
			}
		} finally {
			setIsLoading(false); // Stop loading
		}
	};

	const [confirmSignupPassword, setConfirmSignupPassword] = useState("");

	const [isLoading, setIsLoading] = useState(false);

	return (
		<div className="card card-border z-50 mx-auto w-[90%] max-w-[28rem] bg-white opacity-95 shadow-2xl transition-opacity duration-300 ease-in-out hover:opacity-100 lg:mr-40">
			<div className="card-body space-y-1 md:space-y-3">
				<h2 className="card-title text-center text-3xl font-bold">
					{isSignUp
						? "Create an Account"
						: isForgotPassword
							? "Reset Your Password"
							: "Faculty Evaluation System"}
				</h2>

				{!isSignUp && !isForgotPassword ? (
					<>
						{/* Login Fields */}
						<div className="floating-label relative">
							<span>Username or Email</span>
							<input
								type="text"
								required
								placeholder="Username or Email"
								className="input w-full"
								value={identifier}
								onChange={(e) => setIdentifier(e.target.value)}
							/>
						</div>

						<div className="floating-label relative">
							<span>Password</span>
							<input
								type="password"
								required
								placeholder="Password"
								className="input w-full"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						<div className="flex items-center justify-between">
							<label className="flex cursor-pointer items-center">
								<input
									type="checkbox"
									className="checkbox mr-2 bg-[#1c402a]"
								/>
								<span>Remember me</span>
							</label>
							<a
								onClick={() => setIsForgotPassword(true)}
								className="text-primary cursor-pointer text-sm hover:underline"
							>
								Forgot Password?
							</a>
						</div>

						<div className="card-actions justify-center">
							<button
								onClick={handleLogin}
								disabled={isLoading}
								className="btn h-13 w-full bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] text-xl text-white"
							>
								{isLoading ? "Logging In..." : "Login"}
							</button>
							{error && <p className="text-red-500">{error}</p>}
						</div>

						<div className="text-center">
							<span>Don't have an account? </span>
							<button
								onClick={() => setIsSignUp(true)}
								className="text-primary hover:underline"
							>
								Sign Up
							</button>
						</div>
					</>
				) : isForgotPassword ? (
					<>
						{/* Forgot Password View */}
						{!isOtpSent && (
							<>
								<div className="floating-label relative">
									<span>Email</span>
									<input
										type="email"
										required
										placeholder="Enter your registered email"
										className="input w-full"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
									/>
								</div>

								<div className="card-actions justify-center">
									<button
										onClick={handleResetPassword}
										disabled={isLoading}
										className="btn h-13 w-full bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] text-xl text-white"
									>
										{isLoading
											? "Sending OTP..."
											: "Send OTP"}
									</button>
								</div>
							</>
						)}

						{isOtpSent && !isOtpVerified && (
							<>
								<div className="my-4 flex justify-center gap-2">
									{otp.map((digit, index) => (
										<input
											key={index}
											ref={(el) => {
												otpRefs.current[index] = el;
											}}
											type="text"
											maxLength={1}
											className="input w-12 text-center text-xl"
											value={digit}
											onChange={(e) =>
												handleOtpChange(e, index)
											}
											onKeyDown={(e) =>
												handleOtpKeyDown(e, index)
											}
										/>
									))}
								</div>

								<div className="flex flex-col gap-2">
									<button
										onClick={verifyOtp}
										disabled={isLoading}
										className="btn h-13 w-full bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] text-xl text-white"
									>
										{isLoading
											? "Verifying OTP..."
											: "Verify OTP"}
									</button>
									<button
										onClick={handleResendOtp}
										className="btn btn-outline text-primary w-full text-sm"
									>
										Resend OTP
									</button>
								</div>
							</>
						)}

						{isOtpVerified && (
							<>
								<div className="floating-label relative mt-4">
									<span>New Password</span>
									<input
										type="password"
										required
										placeholder="Enter new password"
										className="input w-full"
										value={newPassword}
										onChange={(e) =>
											setNewPassword(e.target.value)
										}
									/>
								</div>
								<div className="floating-label relative">
									<span>Confirm New Password</span>
									<input
										type="password"
										required
										placeholder="Confirm new password"
										className="input w-full"
										value={confirmPassword}
										onChange={(e) =>
											setConfirmPassword(e.target.value)
										}
									/>
								</div>
								<div className="card-actions mt-4 justify-center">
									<button
										onClick={handleNewPasswordSubmit}
										className="btn h-13 w-full bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] text-xl text-white"
									>
										Submit New Password
									</button>
								</div>
							</>
						)}

						<div className="mt-4 text-center">
							<button
								onClick={() => {
									setIsForgotPassword(false);
									setIsOtpSent(false);
									setOtp(["", "", "", "", "", ""]);
								}}
								className="text-primary hover:underline"
							>
								Back to Login
							</button>
						</div>

						{error && (
							<p className="text-center text-red-500">{error}</p>
						)}
					</>
				) : (
					<>
						{/* Sign Up View */}
						<div className="flex gap-4">
							<div className="floating-label relative flex-1">
								<span>First Name</span>
								<input
									type="text"
									required
									placeholder="First Name"
									className="input w-full"
									value={first_name}
									onChange={(e) =>
										setFirstName(e.target.value)
									}
								/>
							</div>
							<div className="floating-label relative flex-1">
								<span>Last Name</span>
								<input
									type="text"
									required
									placeholder="Last Name"
									className="input w-full"
									value={last_name}
									onChange={(e) =>
										setLastName(e.target.value)
									}
								/>
							</div>
						</div>

						<div className="floating-label relative">
							<span>Email</span>
							<div className="relative">
								<input
									type="email"
									placeholder="Email"
									className="input w-full pr-10"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
								<div className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
									<EnvelopeIcon className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div className="floating-label relative">
							<span>Username</span>
							<div className="relative">
								<input
									type="text"
									placeholder="Username"
									className="input w-full pr-10"
									value={username}
									onChange={(e) =>
										setUsername(e.target.value)
									}
								/>
								<div className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
									<UserIcon className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div className="floating-label relative">
							<span>Password</span>
							<div className="relative">
								<input
									type="password"
									placeholder="Password"
									className="input w-full pr-10"
									value={password}
									onChange={(e) =>
										setPassword(e.target.value)
									}
								/>
								<div className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
									<LockClosedIcon className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div className="floating-label relative">
							<span>Confirm Password</span>
							<div className="relative">
								<input
									type="password"
									placeholder="Confirm Password"
									className="input w-full pr-10"
									value={confirmSignupPassword}
									onChange={(e) =>
										setConfirmSignupPassword(e.target.value)
									}
								/>
								<div className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-500">
									<LockClosedIcon className="h-5 w-5" />
								</div>
							</div>
						</div>

						<div className="card-actions justify-center">
							<button
								onClick={handleSignUp}
								disabled={isLoading}
								className="btn h-13 w-full bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] text-xl text-white"
							>
								{isLoading ? "Signing Up..." : "Sign Up"}
							</button>
						</div>

						<div className="text-center">
							<span>Already have an account? </span>
							<button
								onClick={() => setIsSignUp(false)}
								className="text-primary hover:underline"
							>
								Log In
							</button>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default LoginCard;
