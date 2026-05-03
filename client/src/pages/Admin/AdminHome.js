import { useState } from "react";
import { toFormData } from "axios";

const catergory = [
  {key: "pekerjaanArea ",short:"PA", label:"Pekerjaan area yang dilakukan"},
  {key: "tugasDiselesaikan ",short:"TD", label:"Tugas yang diselesaikan"},
  {key: "pekerjaanArea ",short:"PA", label:"Pekerjaan area yang dilakukan"},
  {key: "pekerjaanArea ",short:"PA", label:"Pekerjaan area yang dilakukan"},
  {key: "pekerjaanArea ",short:"PA", label:"Pekerjaan area yang dilakukan"},
  {key: "pekerjaanArea ",short:"PA", label:"Pekerjaan area yang dilakukan"},
  {key: "pekerjaanArea ",short:"PA", label:"Pekerjaan area yang dilakukan"},
]


function AdminHome() {
  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>System overview & management</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <h3>Total Users</h3>
          <p className="stat-number">--</p>
        </div>

        <div className="stat-card success">
          <h3>Supervisors</h3>
          <p className="stat-number">--</p>
        </div>

        <div className="stat-card warning">
          <h3>Workers</h3>
          <p className="stat-number">--</p>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;