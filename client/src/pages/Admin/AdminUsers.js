import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/api";
import { useNavigate } from "react-router-dom";
import "../../styles/Admin/AdminPages.css";

const ROLES = [
  { value: "worker",     label: "Worker",     emoji: "ðŸ‘·" },
  { value: "supervisor", label: "Supervisor", emoji: "ðŸ§‘â€ðŸ’¼" },
  { value: "admin",      label: "Admin",      emoji: "ðŸ›¡ï¸" },
];

const FILTER_TABS = [
  { key: "all",        label: "All",         emoji: "ðŸ“Š" },
  { key: "worker",     label: "Workers",     emoji: "ðŸ‘·" },
  { key: "supervisor", label: "Supervisors", emoji: "ðŸ§‘â€ðŸ’¼" },
  { key: "admin",      label: "Admins",      emoji: "ðŸ›¡ï¸" },
];

const EMPTY_FORM = { name: "", email: "", password: "", role: "worker" };

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [searchTerm, setSearch]   = useState("");
  const [filterRole, setFilter]   = useState("all");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);

  useEffect(() => { fetchUsers(); }, []);

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
    if (!window.confirm("âš ï¸ Are you sure you want to delete this user?")) return;
    await adminService.deleteUser(id);
    fetchUsers();
  };

  const handlePasswordReset = async (id) => {
    const newPass = prompt("ðŸ”‘ Enter new password for this user:");
    if (!newPass) return;
    await adminService.changePassword(id, newPass);
    alert("âœ… Password updated successfully.");
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await adminService.createUser(form);
      setForm(EMPTY_FORM);
      fetchUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const setField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const filteredUsers = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return users.filter((u) => {
      const roleMatch   = filterRole === "all" || u.role === filterRole;
      const searchMatch = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return roleMatch && searchMatch;
    });
  }, [users, searchTerm, filterRole]);

  const roleCounts = useMemo(() => ({
    all:        users.length,
    worker:     users.filter((u) => u.role === "worker").length,
    supervisor: users.filter((u) => u.role === "supervisor").length,
    admin:      users.filter((u) => u.role === "admin").length,
  }), [users]);

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>ðŸ‘¥ Manage Users</h1>
        <p>Full control over accounts, roles, and access</p>
      </div>

      {/* CREATE USER */}
      <div className="admin-section admin-card">
        <h2 className="section-title">âž• Add New User</h2>
        <form className="admin-form-row" onSubmit={handleCreateUser}>
          <input
            className="admin-input"
            placeholder="Full name"
            value={form.name}
            onChange={setField("name")}
            required
          />
          <input
            className="admin-input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={setField("email")}
            required
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={setField("password")}
            required
          />
          <select className="admin-select" value={form.role} onChange={setField("role")}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.emoji} {r.label}
              </option>
            ))}
          </select>
          <button className="admin-btn primary" type="submit" disabled={submitting}>
            {submitting ? "â³ Creatingâ€¦" : "âž• Create User"}
          </button>
        </form>
      </div>

      {/* USER TABLE */}
      <div className="admin-section admin-card">
        <h2 className="section-title">ðŸ“‹ User Directory</h2>

        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="ðŸ” Search by name or emailâ€¦"
            value={searchTerm}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input admin-search"
          />
          <div className="filter-tabs">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`filter-tab ${filterRole === tab.key ? "active" : ""}`}
                onClick={() => setFilter(tab.key)}
              >
                {tab.emoji} {tab.label}
                <span className="tab-count">{roleCounts[tab.key]}</span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><span>â³</span> Loading usersâ€¦</div>
        ) : filteredUsers.length === 0 ? (
          <div className="admin-empty">No users match your current filters.</div>
        ) : (
          <div className="table-responsive admin-table">
            <table className="workers-table admin-users-table">
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
                    <td
                      data-label="Name"
                      className="td-name clickable"
                      onClick={() => navigate(`/worker/${u._id}`)}
                      title="View profile details"
                      style={{ cursor: "pointer" }}
                    >
                      {u.name}
                    </td>
                    <td className="td-email" data-label="Email">{u.email}</td>
                    <td data-label="Role">
                      <select
                        className="admin-select admin-select-inline"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.emoji} {r.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td data-label="Created">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    <td data-label="Actions">`r`n                      <div className="admin-table-actions">
                        <button
                          className="admin-btn warning"
                          onClick={() => handlePasswordReset(u._id)}
                          title="Reset password"
                        >
                          ðŸ”‘
                        </button>
                        <button
                          className="admin-btn danger"
                          onClick={() => handleDelete(u._id)}
                          title="Delete user"
                        >
                          ðŸ—‘ï¸
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


