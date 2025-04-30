import axios, { AxiosError } from "axios";
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
      const response = await axios.post(
        "http://127.0.0.1:8000/api/reset-password/",
        {
          email,
        }
      );

      if (response.data[0] === "OTP sent successfully") {
        setIsOtpSent(true);
        setError("");
      } else {
        setError(response.data[0]);
      }
    } catch (error) {
      console.error("Password reset failed:", error);
      setError("Password reset request failed");
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

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
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
        "http://127.0.0.1:8000/api/reset-password/",
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
  };

  const verifyOtp = () => {
    const enteredOtp = otp.join("");
    console.log("Verifying OTP:", enteredOtp);
    // TODO: Send `enteredOtp` to backend for verification
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
            {!isOtpSent && (
              <>
                <div className="relative floating-label">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    className="input w-full"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="card-actions justify-center">
                  <button
                    onClick={handleResetPassword}
                    className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
                  >
                    Send OTP
                  </button>
                </div>
              </>
            )}

            {isOtpSent && (
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
                  <button
                    onClick={verifyOtp}
                    className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
                  >
                    Verify OTP
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
