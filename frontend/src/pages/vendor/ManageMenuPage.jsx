import { useEffect, useState } from "react";
import api from "../../api/client";
import DataTable from "../../components/common/DataTable";
import FormInput from "../../components/common/FormInput";
import ImageUploadField from "../../components/common/ImageUploadField";
import StatusBadge from "../../components/common/StatusBadge";
import { formatCurrency } from "../../utils/formatters";

const initialForm = {
  name: "",
  category: "",
  price: "",
  description: "",
  imageUrl: "",
  isAvailable: "true",
};

const ManageMenuPage = () => {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      const [foodResponse, categoryResponse] = await Promise.all([
        api.get("/vendor/foods"),
        api.get("/vendor/categories"),
      ]);

      setFoods(foodResponse.data);
      setCategories(categoryResponse.data);
      setForm((current) => ({
        ...current,
        category: current.category || categoryResponse.data[0]?._id || "",
      }));
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (imageUrl) => {
    setForm((current) => ({
      ...current,
      imageUrl,
    }));
  };

  const resetForm = () => {
    setEditingId("");
    setForm({
      ...initialForm,
      category: categories[0]?._id || "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      isAvailable: form.isAvailable === "true",
    };

    try {
      if (editingId) {
        await api.patch(`/vendor/foods/${editingId}`, payload);
        setMessage("Food item updated successfully.");
      } else {
        await api.post("/vendor/foods", payload);
        setMessage("Food item created successfully.");
      }

      resetForm();
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save food item");
    }
  };

  const startEdit = (food) => {
    setEditingId(food._id);
    setForm({
      name: food.name,
      category: food.category?._id,
      price: food.price,
      description: food.description,
      imageUrl: food.imageUrl,
      isAvailable: String(food.isAvailable),
    });
  };

  const handleDelete = async (foodId) => {
    try {
      await api.delete(`/vendor/foods/${foodId}`);
      setMessage("Food item deleted successfully.");
      fetchData();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete food item");
    }
  };

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Manage Menu</h1>
          <p className="muted-text">Add, edit, or remove simple menu items for your restaurant.</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        {message ? <p className="success-text">{message}</p> : null}
        <div className="form-grid">
          <FormInput label="Food Name" name="name" value={form.name} onChange={handleChange} required />
          <FormInput
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            as="select"
            options={categories.map((category) => ({ label: category.name, value: category._id }))}
            required
          />
          <FormInput label="Price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} required />
          <FormInput
            label="Availability"
            name="isAvailable"
            value={form.isAvailable}
            onChange={handleChange}
            as="select"
            options={[
              { label: "Available", value: "true" },
              { label: "Unavailable", value: "false" },
            ]}
          />
          <ImageUploadField
            label="Food Image"
            value={form.imageUrl}
            onChange={handleImageChange}
            helperText="Upload a local image for this menu item."
          />
          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Description</span>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="button">
            {editingId ? "Update Food" : "Add Food"}
          </button>
          <button type="button" className="button button-ghost" onClick={resetForm}>
            Clear
          </button>
        </div>
      </form>

      <DataTable
        columns={[
          { header: "Food", render: (row) => row.name },
          { header: "Category", render: (row) => row.category?.name || "-" },
          { header: "Price", render: (row) => formatCurrency(row.price) },
          { header: "Status", render: (row) => <StatusBadge value={row.isAvailable ? "Available" : "Unavailable"} /> },
          {
            header: "Actions",
            render: (row) => (
              <div className="action-row">
                <button type="button" className="button button-ghost" onClick={() => startEdit(row)}>
                  Edit
                </button>
                <button type="button" className="button button-secondary" onClick={() => handleDelete(row._id)}>
                  Delete
                </button>
              </div>
            ),
          },
        ]}
        rows={foods}
      />
    </div>
  );
};

export default ManageMenuPage;
