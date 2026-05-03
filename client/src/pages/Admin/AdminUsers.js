import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "worker"
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getAllUsers();
      setUsers(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    await adminService.updateUserRole(id, role);
    fetchUsers();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await adminService.deleteUser(id);
    fetchUsers();
  };

  const handlePasswordReset = async (id) => {
    const newPass = prompt("Enter new password:");
    if (!newPass) return;
    await adminService.changePassword(id, newPass);
    alert("Password updated");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.createUser(form);
      setForm({ name: "", email: "", password: "", role: "worker" });
      fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const roleMatch = filterRole === "all" || u.role === filterRole;
      const searchMatch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      return roleMatch && searchMatch;
    });
  }, [users, searchTerm, filterRole]);

  const roleCounts = useMemo(() => ({
    all: users.length,
    worker: users.filter((u) => u.role === "worker").length,
    supervisor: users.filter((u) => u.role === "supervisor").length,
    admin: users.filter((u) => u.role === "admin").length
  }), [users]);

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>Add users, update roles, reset passwords, and remove accounts</p>
      </div>

      <div className="recent-section admin-section">
        <h2>Add New User</h2>
        <form className="admin-form-row" onSubmit={handleCreateUser}>
          <input
            className="search-input"
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <input
            className="search-input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="search-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <select
            className="sort-select"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
          >
            <option value="worker">Worker</option>
            <option value="supervisor">Supervisor</option>
            <option value="admin">Admin</option>
          </select>
          <button className="admin-btn primary" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>

      <div className="recent-section admin-section">
        <h2>User Directory</h2>

        <div className="details-toolbar">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-buttons">
            {[
              ["all", `All (${roleCounts.all})`],
              ["worker", `Workers (${roleCounts.worker})`],
              ["supervisor", `Supervisors (${roleCounts.supervisor})`],
              ["admin", `Admins (${roleCounts.admin})`]
            ].map(([key, label]) => (
              <button
                key={key}
                className={`filter-btn ${filterRole === key ? "active" : ""}`}
                onClick={() => setFilterRole(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading users...</div>
        ) : (
          <div className="table-responsive admin-table">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>

                    <td>
                      <select
                        className="sort-select"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="worker">Worker</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>

                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-btn" onClick={() => handlePasswordReset(u._id)}>
                          Password
                        </button>

                        <button className="admin-btn" onClick={() => handleDelete(u._id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;
