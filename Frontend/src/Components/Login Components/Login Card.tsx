import axios,{ AxiosError } from 'axios'
import { useState } from "react";
import { useNavigate } from "react-router";

// Added constants and Axios, useState from username to error added.
// handleLogin function response to API, Local address used
// Edited username and password form
function LoginCard() {
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error,  setError] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: identifier,
        password,
      });
        if (response.data.token){
          const userRole = response.data.roles[0]


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
          
        }

        else{
          setError(" If-Else Something went wrong");
        }
        }  catch (error){
              console.error("Login failed:", error);
              setError("Handle Error");
          }
  };

  const handleSignUp = async () => {
    // Add logic for sign-up (e.g., make API request to register the user)
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/signup/",{
      first_name,
      last_name,
      username,
      password,
      email,
      });
      
      if (response.data.token){
        localStorage.setItem("token", response.data.token); 
        navigate("/dashboard");
      }
      else
        {
        setError(" If-Else Something went wrong"+(response.data.error));
        }
      }catch (err) {
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
    // Add logic for resetting password (e.g., send password reset link via email)
    try{
        const response = await axios.post("http://127.0.0.1:8000/api/reset-password/", {
        email,
    });
        if(response.data.success){    
            alert("Password reset link has been sent to your email.");
            navigate("/login"); // Redirect back to login page after sending reset link
        }
        else{
            setError("If-Else Something went wrong");
        }
    }catch (error){
        console.error("Password reset failed:", error);
        setError("Password reset request failed");
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

        {/* Form Fields */}
        {!isSignUp && !isForgotPassword ? (
          <>
            {/* Username */}
            <div className="relative floating-label">
              <span>Username or Email</span>
              <input
                type="text"
                required
                placeholder="Username or Email"
                className="input w-full validator"
                value={identifier}
                //pattern="(?=.*@phinmaed.com).{30,}"
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <p className="validator-hint">Must be a phinmaed email.</p>
            </div>

            {/* Password */}
            <div className="relative floating-label">
              <span>Password</span>
              <input
                type="password"
                required
                placeholder="Password"
                className="input w-full validator"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                //pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              />
              <p className="validator-hint">
                Incorrect username, password, or the account does not exist.
              </p>
            </div>

            {/* Checkbox */}
            <div className="flex justify-between items-center">
              <label className="cursor-pointer flex items-center">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary text-white mr-2"
                />
                <span className="label-text">Remember me</span>
              </label>
              <a
                onClick={() => setIsForgotPassword(true)}
                className="text-sm text-primary hover:underline cursor-pointer"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button */}
            <div className="card-actions justify-center">
              <button
                onClick={handleLogin}
                className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
              >
                Log In
                {error  && <p   className="text-red-500">{error}</p>}
              </button>
            </div>

            {/* Sign Up Link */}
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
            {/* Email for Password Reset */}
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

            {/* Reset Password Button */}
            <div className="card-actions justify-center">
              <button
                onClick={handleResetPassword}
                className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
              >
                Reset Password
              </button>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
              <button
                onClick={() => setIsForgotPassword(false)}
                className="text-primary hover:underline"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex gap-4">
                {/* First Name */}
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

                {/* Last Name */}
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

            {/* Email */}
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

            {/* Username */}
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

            {/* Password */}
            <div className="relative floating-label">
              <span>Password</span>
              <input
                type="password"
                required
                placeholder="Password"
                className="input w-full"
                //pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* Confirm Password */}
            <div className="relative floating-label">
              <span>Confirm Password</span>
              <input
                type="password"
                required
                placeholder="Confirm Password"
                className="input w-full"
              />
            </div>

            {/* Sign Up Button */}
            <div className="card-actions justify-center">
              <button
                onClick={handleSignUp}
                className="btn bg-gradient-to-r from-[#1b2e3e] to-[#1c402a] w-full h-13 text-xl text-white"
              >
                Sign Up
              </button>
            </div>

            {/* Back to Login Link */}
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
