import { useEffect, useState } from "react";
import { usersService } from "../../services/api";

function AdminUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await usersService.getAllUsers();
    setUsers(res.data);
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Users</h1>
        <p>Add / Remove Workers & Supervisors</p>
      </div>

      <div className="table-responsive">
        <table className="workers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminUsers;