import axios, { AxiosError } from "axios";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

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
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: identifier,
        password,
      });
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
      console.error("Login failed:", error);
      setError("Handle Error");
    }
  };

  const handleSignUp = async () => {
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
    }
  };

  const handleResetPassword = async () => {
      try {
        // example: send request to your API to send OTP
        await axios.post("http://127.0.0.1:8000/api/forgot-password/", { email });
        setIsOtpSent(true); // switch to OTP input view
      } catch (error) {
        console.error(error);
        setError("Could not find Email");
      }
    };



  const handleNewPasswordSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError("Password does not match")
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/set-new-password/", {
        email,
        new_password: newPassword,
      });

      if (response.data.message === "password reset successful") {
        setError("");
        alert("Password has been reset. You can now Log in.");
        setIsForgotPassword(false);
        setIsOtpSent(false)
        setIsOtpVerified(false);
        setOtp(["","","","","",""]);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(response.data.message || "Else Error");
      }

    }   catch (err) {
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
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
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

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/verify-otp/",{
        email,
        otp: enteredOtp
        })
        if (response.data.message === "OTP verified successfully") {
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
          setError("Username already exists");
        } else {
          setError("Unexpected error during sign-up");
        }
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

        {/* LOGIN */}
        {!isSignUp && !isForgotPassword && (
          <>
            <div className="relative floating-label">
              <span>Username or Email</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username or Email"
                  className="input w-full pr-10"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <UserIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="relative floating-label">
              <span>Password</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="input w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
              </div>
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
        )}

        {/* FORGOT PASSWORD */}
        {isForgotPassword && !isOtpVerified && (
          <>
            {!isOtpSent ? (
              <div className="relative floating-label">
                <span>Email</span>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your registered email"
                    className="input w-full pr-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                    <EnvelopeIcon className="h-5 w-5" />
                  </div>
                </div>
              </>
            )}

            {isOtpSent && !isOtpVerified && (
              <>
                <div className="flex justify-center gap-2 my-4">
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
                      onChange={(e) => handleOtpChange(e, index)}
                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    />
                  ))}
                </div>

            <div className="flex flex-col gap-2">
              {!isOtpSent ? (
                <button
                  onClick={handleResetPassword}
                  className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full text-white"
                >
                  Send OTP
                </button>
              ) : (
                <>
                  <button
                    onClick={verifyOtp}
                    className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full text-white"
                  >
                    Verify OTP
                  </button>
                  <button
                    onClick={handleResendOtp}
                    className="btn btn-outline text-primary w-full text-sm"
                  >
                    Resend OTP
                  </button>
                </>
              )}
            </div>

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
        )}

        {/* NEW PASSWORD PAGE */}
        {isForgotPassword && isOtpVerified && (
          <>
            <div className="relative floating-label">
              <span>New Password</span>
              <div className="relative">
                <input
                  type="password"
                  className="input w-full pr-10"
                  placeholder="New Password"
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
                  className="input w-full pr-10"
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="card-actions justify-center">
              <button className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white">
                Set New Password
              </button>
            </div>

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
          </>
        )}

        {/* SIGN UP */}
        {isSignUp && (
          <>
            <div className="flex gap-4">
              <div className="flex-1 relative floating-label">
                <span>First Name</span>
                <input
                  type="text"
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
                  placeholder="Last Name"
                  className="input w-full"
                  value={last_name}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>

            <div className="relative floating-label">
              <span>Email</span>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  className="input w-full pr-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <EnvelopeIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="relative floating-label">
              <span>Username</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Username"
                  className="input w-full pr-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <UserIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="relative floating-label">
              <span>Password</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Password"
                  className="input w-full pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
              </div>
            </div>

            <div className="relative floating-label">
              <span>Confirm Password</span>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="input w-full pr-10"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  <LockClosedIcon className="h-5 w-5" />
                </div>
              </div>
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
