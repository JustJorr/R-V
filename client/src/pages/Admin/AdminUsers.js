import { useEffect, useState } from "react";
import { adminService } from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await adminService.getAllUsers();
    setUsers(res.data);
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

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>Full control over system users</p>
      </div>

      <div className="table-responsive">
        <table className="workers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>

                <td>
                  <select
                    value={u.role}
                    onChange={(e) =>
                      handleRoleChange(u._id, e.target.value)
                    }
                  >
                    <option value="worker">Worker</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                <td>
                  <button onClick={() => handlePasswordReset(u._id)}>
                    🔑 Password
                  </button>

                  <button onClick={() => handleDelete(u._id)}>
                    🗑 Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;