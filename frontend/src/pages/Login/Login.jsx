import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider } from "../../firebase/config";
import { signInWithPopup } from "firebase/auth";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://skillforge-99ct.onrender.com/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.status === 200) {
        const user = data.user;

        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", data.token);
        localStorage.setItem("userId", user.id);

        // check role
        if (user.role === "Admin") {
          alert("Login to Admin successfully!");
          navigate("/admin");
        } 
        else if (user.role === "Teacher") {
          alert("Login to Teacher successfully!");
          navigate("/teacher/dashboard");
        } 
        else {
          alert("Login successfully!");
          navigate("/"); 
        }
      } 
      else {
        alert(data.message);
      }
    } 
    catch (error) {
      console.error(error);
      alert("Server error");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      console.log("Google User:", googleUser);

      const idToken = await googleUser.getIdToken();

      const res = await fetch("https://skillforge-99ct.onrender.com/api/users/google-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.status === 200) {
        localStorage.setItem("user", JSON.stringify(data.user || googleUser));
        localStorage.setItem("userId", data.user?.id || googleUser.uid);
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        alert("Login with Google successfully!");
        navigate("/");
      } else {
        alert(data.message || "Failed to save user data");
      }
    } catch (error) {
      console.error("Error during Google login:", error);
      alert("Google login failed");
    }
  };




  return (
    <div className="login-container">
      <img
        src="./assets/backgroundLogin.png"
        alt="Background"
        className="background-image"
      />
      <div className="content-wrapper">
        <div className="signin-card">
          <div className="signin-header">
            <h1>Sign in</h1>
            <button className="google-btn" onClick={handleGoogleLogin}>
              <span>Sign in with Google</span>
              <svg width="20" height="20" viewBox="0 0 20 20">
                <path
                  d="M19.6 10.23c0-.82-.1-1.42-.25-2.05H10v3.72h5.5c-.15.96-.74 2.31-2.04 3.22v2.45h3.16c1.89-1.73 2.98-4.3 2.98-7.34z"
                  fill="#4285F4"
                />
                <path
                  d="M13.46 15.13c-.83.59-1.96 1-3.46 1-2.64 0-4.88-1.74-5.68-4.15H1.07v2.52C2.72 17.75 6.09 20 10 20c2.7 0 4.96-.89 6.62-2.42l-3.16-2.45z"
                  fill="#34A853"
                />
                <path
                  d="M3.99 10c0-.69.12-1.35.32-1.97V5.51H1.07A9.973 9.973 0 000 10c0 1.61.39 3.14 1.07 4.49l3.24-2.52c-.2-.62-.32-1.28-.32-1.97z"
                  fill="#FBBC05"
                />
                <path
                  d="M10 3.88c1.88 0 3.13.81 3.85 1.48l2.84-2.76C14.96.99 12.7 0 10 0 6.09 0 2.72 2.25 1.07 5.51l3.24 2.52C5.12 5.62 7.36 3.88 10 3.88z"
                  fill="#EA4335"
                />
              </svg>
            </button>
          </div>

          <div className="form-content">
            <div className="form-group">
              <label>Username or email address</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Omar@beyond.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <div className="password-header">
                <label>Password</label>
                <a href="#" className="forgot-link">
                  Forget password ?
                </a>
              </div>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="form-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button onClick={handleSubmit} className="signin-btn">
              Sign in
            </button>
          </div>

          <p className="signup-text">
            Don't have account ? <a href="/register">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
}
