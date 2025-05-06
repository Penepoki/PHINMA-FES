import axios, { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { LockClosedIcon } from "@heroicons/react/24/solid";
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false); // State for tracking API call status

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

      // Utility function to validate email format
    const isValidEmail = (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple regex for email validation
      return emailRegex.test(email);
    };



  const handleLogin = async () => {
  setLoading(true); // Set loading to true when the API call starts
  try {
    const response = await axios.post("http://127.0.0.1:8000/api/login/", {
      username: identifier,
      password,
    });

    setLoading(false); // Set loading to false when the call finishes

    if (response.data.token) {
      const userRole = response.data.roles[0];
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userRole", userRole);

      switch (userRole) {
        case "Dean":
          navigate("/Dashboard/dean");
          break;
        case "Faculty":
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
    setLoading(false); // Make sure to reset loading even if there’s an error
    console.error("Login failed:", error);
    setError("An error occurred during login. Please try again.");
  }
};

  const handleSignUp = async () => {
  // Validate email
  if (!isValidEmail(email)) {
    setError("Invalid email format");
    return;
  }

  // Validate password strength
  if (!isStrongPassword(password)) {
    setError("Password must be at least 8 characters long, include 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.");
    return;
  }

  try {
    const response = await axios.post("http://127.0.0.1:8000/api/signup/", {
      first_name,
      last_name,
      username,
      password,
      email,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } else {
      setError("Something went wrong: " + response.data.error);
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

  const handleResetPassword = async () => {
  if (!isValidEmail(email)) {
    setError("Invalid email format"); // Ensure the email is valid
    return;
  }

  try {
    setLoading(true); // Show the loading indicator
    const response = await axios.post("http://127.0.0.1:8000/api/forgot-password/", {
      email,
    });

    setLoading(false); // Hide loading indicator
    if (response.data.message === "OTP sent successfully") {
      setIsOtpSent(true); // OTP sent toggle
      setError(""); // Clear errors
    } else {
      setError(response.data.message || "Failed to send OTP.");
    }
  } catch (err) {
    setLoading(false);
    //Changes here
    console.error(err);
    setError("Error sending OTP. Please try again.");
  }
};

  // Utility function to check password strength
const isStrongPassword = (password: string): boolean => {
  // Example: Minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};


  /*const handleOtpChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };*/

  /*const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };*/

  /*const handleResendOtp = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/forgot-password/",
        {
          email,
        }
      );
      if (response.data[0] === "OTP sent successfully") {
        setError("");
        alert("OTP resent!");
      } else {
        setError(response.data[0]);
      }
    } catch (error) {
      setError("Failed to resend OTP");
    }
  };*/

      const handleVerifyOtp = async () => {
      const otpValue = otp.join(""); // Combine the OTP array into a single string
      if (otpValue.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        return;
      }

      try {
        setLoading(true);
        const response = await axios.post("http://127.0.0.1:8000/api/verify-otp/", {
          email,       // Email of the user
          input_code: otpValue,  // Combined OTP input
        });
        setLoading(false);
        if (response.data.message === "OTP sent successfully") {
          setIsOtpVerified(true); // Update the state
          setError("");           // Clear errors
        } else {
          setError(response.data.message || "Invalid OTP. Please try again.");
        }
      } catch (err) {
        setLoading(false);
        console.error("Error verifying OTP:", err)
      }
    };

  const handleSetNewPassword = async () => {
  if (newPassword !== confirmPassword) {
    setError("Passwords do not match. Please try again.");
    return;
  }

  if (!isStrongPassword(newPassword)) {
    setError(
      "Password must be at least 8 characters long and include a mix of letters, numbers, and special characters."
    );
    return;
  }

  try {
    setLoading(true);
    const response = await axios.post("http://127.0.0.1:8000/api/reset-password/", {
      email,
      otp: otp.join(""), // Include the OTP for verification
      new_password: newPassword,
    });

    setLoading(false);
    if (response.data.message === "Password updated successfully") {
      setError("");
      setIsOtpSent(false);
      setIsOtpVerified(false);
      setNewPassword(""); // Reset the form
      setConfirmPassword("");
      alert("Password reset successfully! Please log in.");
    } else {
      setError(response.data.message || "Failed to reset password.");
    }
  } catch (err) {
    setLoading(false);
    //Changes here
    console.error("Error Verify Otp Function:", err);
    setError("Error resetting password. Please try again.");
  }
};

  return (
    <div className="card card-border bg-white w-[90%] max-w-[28rem] shadow-2xl mx-auto lg:mr-40 opacity-95 hover:opacity-100 transition-opacity duration-300 ease-in-out z-50">
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
            <div className="relative floating-label">
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

            <div className="relative floating-label">
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

            <div className="flex justify-between items-center">
              <label className="cursor-pointer flex items-center">
                <input type="checkbox" className="checkbox mr-2" />
                <span>Remember me</span>
              </label>
              <a
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Forgot Password?
              </a>
            </div>

            <div className="card-actions justify-center">
              <button
                onClick={handleLogin}
                className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
              >
                Log In
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
              <button onClick={() => setIsOtpSent(true)}>Force OTP View</button>
            </div>
          </>
        ) : isForgotPassword ? (
                          <>
                            {/* Forgot Password View */}
                            {isOtpVerified ? (
          <div>
            {/* New Password Form */}
            <h2>Set New Password</h2>
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button onClick={handleSetNewPassword} disabled={loading}>
              Update Password
            </button>
          </div>
          ) : isOtpSent ? (
            <div className="flex justify-center gap-2 my-4">
              {/* OTP Verification Form */}
              <h2>Verify OTP</h2>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  value={digit}
                  maxLength={1}
                  ref={(ref) => {
                    otpRefs.current[index] = ref; // Assign the element ref properly
                  }}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d$/.test(value) || value === "") {
                      const newOtp = [...otp];
                      newOtp[index] = value;
                      setOtp(newOtp);

                      // Focus on the next input
                      if (value !== "" && index < otpRefs.current.length - 1) {
                        otpRefs.current[index + 1]?.focus();
                      }
                    }
                  }}
                />
              ))}
              <button onClick={handleVerifyOtp} disabled={loading}>
                Verify OTP
              </button>
            </div>
          ) : (
            <div>
              {/* Email Input Form */}
              <h2>Forgot Password</h2>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button onClick={handleResetPassword} disabled={loading}>
                Send OTP
              </button>
            </div>
          )}
                {isOtpSent && isOtpVerified && (
                  <>
                    {/* New Password Input */}
                    <div className="relative floating-label mt-4">
                      <span>New Password</span>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          placeholder="Enter new password"
                          className="input w-full pr-10"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                          <LockClosedIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="relative floating-label">
                      <span>Confirm New Password</span>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          placeholder="Confirm new password"
                          className="input w-full pr-10"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                          <LockClosedIcon className="h-5 w-5" />
                        </div>
                      </div>
                    </div>

                    <div className="card-actions justify-center mt-4">
                      <button
                        onClick={handleSetNewPassword} // Correctly calling the relevant function
                        className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
                      >
                        Submit New Password
                      </button>
                    </div>
                  </>
                )}

            <div className="text-center mt-4">
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

            {error && <p className="text-red-500 text-center">{error}</p>}
          </>
        ) : (
          <>
            {/* Sign Up View */}
            <div className="flex gap-4">
              <div className="flex-1 relative floating-label">
                <span>First Name</span>
                <input
                  type="text"
                  required
                  placeholder="First Name"
                  className="input w-full"
                  value={first_name}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="flex-1 relative floating-label">
                <span>Last Name</span>
                <input
                  type="text"
                  required
                  placeholder="Last Name"
                  className="input w-full"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="relative floating-label">
              <span>Email</span>
              <input
                type="email"
                required
                placeholder="Email"
                className="input w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative floating-label">
              <span>Username</span>
              <input
                type="text"
                required
                placeholder="Username"
                className="input w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative floating-label">
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

            <div className="relative floating-label">
              <span>Confirm Password</span>
              <input
                type="password"
                required
                placeholder="Confirm Password"
                className="input w-full"
              />
            </div>

            <div className="card-actions justify-center">
              <button
                onClick={handleSignUp}
                className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
              >
                Sign Up
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
