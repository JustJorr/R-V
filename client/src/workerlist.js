import axios from "axios";
import { useEffect, useState } from "react";

function WorkerList() {
  const [workers, setWorkers] = useState([]);
  const [name, setName] = useState("");
  const [rating, setRating] = useState("");
  const [loading, setLoading] = useState(false);

  
  const fetchWorkers = () => {
    axios.get("http://localhost:5000/api/workers")
      .then(res => {
        console.log("API response:", res.data);
        setWorkers(res.data);
      })
      .catch(err => console.error("API error:", err));
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleAddWorker = async (e) => {
    e.preventDefault();
    
    if (!name || !rating) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/workers", {
        name,
        rating: parseFloat(rating)
      });
      setName("");
      setRating("");
      fetchWorkers(); // Refresh the list
      alert("Worker added successfully!");
    } catch (err) {
      console.error("Error adding worker:", err);
      alert("Error adding worker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Add Worker Form */}
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ccc" }}>
        <h2>Add New Worker</h2>
        <form onSubmit={handleAddWorker}>
          <div style={{ marginBottom: "10px" }}>
            <label>Name: </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter worker name"
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Rating: </label>
            <input
              type="number"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              placeholder="Enter rating (0-5)"
              step="0.1"
              min="0"
              max="5"
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Adding..." : "Add Worker"}
          </button>
        </form>
      </div>

      {/* Workers List */}
      <div>
        <h2>Workers List</h2>
        {workers.length === 0 ? (
          <p>No workers found. Add one above!</p>
        ) : (
          <ul>
            {workers.map((w) => (
              <li key={w._id}>
                {w.name} - Rating: {w.rating}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default WorkerList;