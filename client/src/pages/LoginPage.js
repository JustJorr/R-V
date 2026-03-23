import { useState } from "react";
import { authService } from "../services/api";
import "../styles/Login.css";

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);
  const [registerName, setRegisterName] = useState("");
  const [registerRole, setRegisterRole] = useState("user");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      localStorage.setItem("user", JSON.stringify(response.data));
      onLogin(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.register(registerName, email, password, registerRole);
      alert("Registration successful! Please login.");
      setShowRegister(false);
      setRegisterName("");
      setEmail("");
      setPassword("");
      setRegisterRole("user");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoMode = () => {
    const demoUser = {
      _id: "507f1f77bcf86cd799439011", // Valid MongoDB ObjectId format
      name: "Demo Manager",
      email: "demo@example.com",
      role: "manager",
      averageRating: 4.5
    };
    localStorage.setItem("user", JSON.stringify(demoUser));
    onLogin(demoUser);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Worker Rating System</h1>

        {error && <div className="error-message">{error}</div>}

        {!showRegister ? (
          <form onSubmit={handleLogin}>
            <h2>Login</h2>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
            <p className="toggle-text">
              Don't have an account?{" "}
              <span onClick={() => setShowRegister(true)}>Register here</span>
            </p>

            <div className="demo-section">
              <hr />
              <p className="demo-text">Skip to Dashboard:</p>
              <button 
                type="button" 
                className="demo-button"
                onClick={handleDemoMode}
              >
                → Go to Manager Dashboard (Demo)
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <h2>Register</h2>
            <div className="form-group">
              <label>Full Name:</label>
              <input
                type="text"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="form-group">
              <label>Role:</label>
              <select
                value={registerRole}
                onChange={(e) => setRegisterRole(e.target.value)}
              >
                <option value="user">Worker</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
            <p className="toggle-text">
              Already have an account?{" "}
              <span onClick={() => setShowRegister(false)}>Login here</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
