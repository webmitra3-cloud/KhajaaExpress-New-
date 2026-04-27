import { useEffect, useState } from "react";
import api from "../../api/client";
import FormInput from "../../components/common/FormInput";
import ImageUploadField from "../../components/common/ImageUploadField";

const VendorProfilePage = () => {
  const [form, setForm] = useState({
    restaurantName: "",
    description: "",
    address: "",
    phone: "",
    logoUrl: "",
    coverImageUrl: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/vendor/profile");
        setForm({
          restaurantName: data.restaurantName || "",
          description: data.description || "",
          address: data.address || "",
          phone: data.phone || "",
          logoUrl: data.logoUrl || "",
          coverImageUrl: data.coverImageUrl || "",
        });
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleImageChange = (field, imageUrl) => {
    setForm((current) => ({
      ...current,
      [field]: imageUrl,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const { data } = await api.patch("/vendor/profile", form);
      setMessage(data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile");
    }
  };

  return (
    <div className="card form-card">
      <div className="page-header">
        <div>
          <h1>Vendor Profile</h1>
          <p className="muted-text">Update restaurant details displayed to users.</p>
        </div>
      </div>

      {message ? <p className="success-text">{message}</p> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <FormInput label="Restaurant Name" name="restaurantName" value={form.restaurantName} onChange={handleChange} required />
        <FormInput label="Address" name="address" value={form.address} onChange={handleChange} required />
        <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
        <div className="form-field" style={{ gridColumn: "1 / -1" }}>
          <span>Description</span>
          <textarea name="description" value={form.description} onChange={handleChange} rows={4} />
        </div>
        <ImageUploadField
          label="Restaurant Logo"
          value={form.logoUrl}
          onChange={(imageUrl) => handleImageChange("logoUrl", imageUrl)}
          helperText="Upload a local logo image."
        />
        <ImageUploadField
          label="Cover Image"
          value={form.coverImageUrl}
          onChange={(imageUrl) => handleImageChange("coverImageUrl", imageUrl)}
          helperText="Upload a local cover image."
        />
        <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="button">
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorProfilePage;
