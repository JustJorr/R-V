import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/api";
import "../../styles/Admin/AdminPages.css";

const ROLE_META = {
  admin:      { label: "Admin",      emoji: "🛡️" },
  supervisor: { label: "Supervisor", emoji: "🧑‍💼" },
  worker:     { label: "Worker",     emoji: "👷" },
};

const StatCard = ({ color, emoji, label, value }) => (
  <div className={`admin-stat-card ${color}`}>
    <span className="stat-emoji">{emoji}</span>
    <p className="stat-number">{value}</p>
    <h3>{label}</h3>
  </div>
);

function AdminHome() {
  const [stats, setStats]   = useState(null);
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsRes, usersRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getAllUsers(),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Error fetching admin home data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6),
    [users]
  );

  const thisMonthUsers = useMemo(() => {
    const now = new Date();
    return users.filter((u) => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      );
    }).length;
  }, [users]);

  if (loading) return <div className="admin-loading"><span>⏳</span> Loading dashboard…</div>;
  if (error)   return <div className="admin-error">{error}</div>;

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>System overview and account administration</p>
      </div>

      <div className="admin-stats-grid">
        <StatCard color="blue"   emoji="👥" label="Total Users"       value={stats.totalUsers} />
        <StatCard color="purple" emoji="🧑‍💼" label="Supervisors"       value={stats.supervisors} />
        <StatCard color="green"  emoji="👷" label="Workers"            value={stats.workers} />
        <StatCard color="red"    emoji="🛡️" label="Admins"             value={stats.admins} />
        <StatCard color="gold"   emoji="⭐" label="Avg Worker Rating"  value={Number(stats.avgRating || 0).toFixed(2)} />
        <StatCard color="cyan"   emoji="🆕" label="New This Month"     value={thisMonthUsers} />
      </div>

      <div className="admin-section">
        <h2 className="section-title">🆕 Recent Accounts</h2>

        {recentUsers.length === 0 ? (
          <div className="admin-empty">No users found.</div>
        ) : (
          <div className="table-responsive admin-table">
            <table className="workers-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => {
                  const meta = ROLE_META[u.role] ?? { label: u.role, emoji: "❓" };
                  return (
                    <tr key={u._id}>
                      <td className="td-name">{u.name}</td>
                      <td className="td-email">{u.email}</td>
                      <td>
                        <span className={`admin-role admin-role-${u.role}`}>
                          {meta.emoji} {meta.label}
                        </span>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminHome;