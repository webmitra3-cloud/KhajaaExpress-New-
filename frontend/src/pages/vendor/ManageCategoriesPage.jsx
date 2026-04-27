import { useEffect, useState } from "react";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";

const ManageCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const fetchCategories = async () => {
    try {
      const { data } = await api.get("/vendor/categories");
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const { data } = await api.post("/vendor/categories", { name });
      setMessage(data.message);
      setName("");
      fetchCategories();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create category");
    }
  };

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Manage Categories</h1>
          <p className="muted-text">Categories are global and reusable across vendors.</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        {message ? <p className="success-text">{message}</p> : null}
        <div className="search-row">
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Add category name" required />
          <button type="submit" className="button">
            Save Category
          </button>
        </div>
      </form>

      <div className="card form-card">
        <h3>Available Categories</h3>
        {categories.length ? (
          <div className="grid-3" style={{ marginTop: "1rem" }}>
            {categories.map((category) => (
              <div key={category._id} className="message-box">
                <strong>{category.name}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No categories" description="Create the first category from this panel." />
        )}
      </div>
    </div>
  );
};

export default ManageCategoriesPage;
