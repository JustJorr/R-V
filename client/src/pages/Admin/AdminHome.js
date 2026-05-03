import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/api";

function AdminHome() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, usersRes] = await Promise.all([
          adminService.getDashboard(),
          adminService.getAllUsers()
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("Error fetching admin home data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);
  }, [users]);

  const thisMonthUsers = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return users.filter((u) => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    }).length;
  }, [users]);

  if (loading || !stats) return <div className="loading">Loading...</div>;

  return (
    <div className="page-content admin-page">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview and account administration</p>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{stats.totalUsers}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Supervisors</h3>
          <p className="stat-number">{stats.supervisors}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Workers</h3>
          <p className="stat-number">{stats.workers}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Admins</h3>
          <p className="stat-number">{stats.admins}</p>
        </div>

        <div className="admin-stat-card">
          <h3>Average Worker Rating</h3>
          <p className="stat-number">{Number(stats.avgRating || 0).toFixed(2)}</p>
        </div>

        <div className="admin-stat-card">
          <h3>New Users This Month</h3>
          <p className="stat-number">{thisMonthUsers}</p>
        </div>
      </div>

      <div className="recent-section admin-section">
        <h2>Recent Accounts</h2>
        {recentUsers.length === 0 ? (
          <div className="no-data">No users found.</div>
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
                {recentUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`admin-role admin-role-${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</td>
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

export default AdminHome;
