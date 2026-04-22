import { useState } from "react";
import { authService } from "../services/api";
import "../styles/Login.css";

function LoginPage({ onLogin }) {
  const [isActive, setIsActive] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);
    try {
      const response = await authService.login(loginEmail, loginPassword);
      localStorage.setItem("worker", JSON.stringify(response.data));
      onLogin(response.data);
    } catch (err) {
      setLoginError(err.response?.data?.message || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError("");
    setRegLoading(true);
    try {
      await authService.register(regName, regEmail, regPassword, "worker");
      alert("Registration successful! Please login.");
      setIsActive(false);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
    } catch (err) {
      setRegError(err.response?.data?.message || "Registration failed");
    } finally {
      setRegLoading(false);
    }
  };

  const handleDemoMode = () => {
    const demoUser = {
      _id: "507f1f77bcf86cd799439011",
      name: "Demo Supervisor",
      email: "demo@example.com",
      role: "supervisor",
      averageRating: 4.5,
    };
    localStorage.setItem("worker", JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  const handleAdminDemo = () => {
    const demoAdmin = {
      _id: "507f1f77bcf86cd799439012",
      name: "Demo Admin",
      email: "admin@example.com",
      role: "admin",
      averageRating: 0,
    };
    localStorage.setItem("worker", JSON.stringify(demoAdmin));
    onLogin(demoAdmin);
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isActive ? "right-panel-active" : ""}`}>

        {/* ── SIGN UP FORM ── */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleRegister}>
            <div className="logo-wrap">
              <img src="/PGE_Logo.png" alt="PGE Logo" className="form-logo" />
            </div>
            <h1>Create Account</h1>
            <span>Register as a worker</span>
            {regError && <p className="form-error">{regError}</p>}
            <input
              type="text"
              placeholder="Full Name"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              required
              tabIndex={isActive ? 0 : -1}
            />
            <input
              type="email"
              placeholder="Email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
              tabIndex={isActive ? 0 : -1}
            />
            <input
              type="password"
              placeholder="Password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              required
              tabIndex={isActive ? 0 : -1}
            />
            <button type="submit" disabled={regLoading} tabIndex={isActive ? 0 : -1}>
              {regLoading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* ── SIGN IN FORM ── */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <div className="logo-wrap">
              <img src="/PGE_Logo.png" alt="PGE Logo" className="form-logo" />
            </div>
            <h1>Sign In</h1>
            <span>Worker Rating System</span>
            {loginError && <p className="form-error">{loginError}</p>}
            <input
              type="email"
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
              tabIndex={isActive ? -1 : 0}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
              tabIndex={isActive ? -1 : 0}
            />
            <button type="submit" disabled={loginLoading} tabIndex={isActive ? -1 : 0}>
              {loginLoading ? "Signing In..." : "Sign In"}
            </button>

            <div className="demo-section">
              <span className="demo-label">— Quick Access —</span>
              <button
                type="button"
                className="demo-btn"
                onClick={handleDemoMode}
                tabIndex={isActive ? -1 : 0}
              >
                Supervisor Demo
              </button>
              <button
                type="button"
                className="demo-btn"
                onClick={handleAdminDemo}
                tabIndex={isActive ? -1 : 0}
              >
                Admin Demo
              </button>
            </div>
          </form>
        </div>

        {/* ── SLIDING OVERLAY ── */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Already have an account? Sign in with your credentials.</p>
              <button className="ghost" onClick={() => setIsActive(false)}>
                Sign In
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hello, Worker!</h1>
              <p>Don't have an account yet? Register and join the team.</p>
              <button className="ghost" onClick={() => setIsActive(true)}>
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoginPage;