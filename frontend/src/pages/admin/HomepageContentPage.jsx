import { useEffect, useState } from "react";
import api from "../../api/client";
import FormInput from "../../components/common/FormInput";
import ImageUploadField from "../../components/common/ImageUploadField";
import StatusBadge from "../../components/common/StatusBadge";

const initialForm = {
  badge: "KhajaExpress Picks",
  title: "",
  subtitle: "",
  imageUrl: "",
  ctaText: "Explore Restaurants",
  ctaLink: "/restaurants",
  sortOrder: 1,
  isActive: "true",
};

const HomepageContentPage = () => {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchSlides = async () => {
    try {
      const { data } = await api.get("/admin/home-slides");
      setSlides(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
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
    setForm(initialForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive === "true",
    };

    try {
      if (editingId) {
        const { data } = await api.patch(`/admin/home-slides/${editingId}`, payload);
        setMessage(data.message);
      } else {
        const { data } = await api.post("/admin/home-slides", payload);
        setMessage(data.message);
      }

      resetForm();
      fetchSlides();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to save homepage slide");
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide._id);
    setForm({
      badge: slide.badge || "KhajaExpress Picks",
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      imageUrl: slide.imageUrl || "",
      ctaText: slide.ctaText || "Explore Restaurants",
      ctaLink: slide.ctaLink || "/restaurants",
      sortOrder: slide.sortOrder || 0,
      isActive: String(slide.isActive),
    });
  };

  const handleDelete = async (slideId) => {
    const shouldDelete = window.confirm("Delete this homepage slide?");

    if (!shouldDelete) {
      return;
    }

    try {
      const { data } = await api.delete(`/admin/home-slides/${slideId}`);
      setMessage(data.message);
      fetchSlides();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete homepage slide");
    }
  };

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Homepage Carousel</h1>
          <p className="muted-text">Upload local hero images, set titles, and manage the homepage carousel from admin.</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={handleSubmit}>
        {message ? <p className="success-text">{message}</p> : null}
        <div className="form-grid">
          <FormInput label="Badge" name="badge" value={form.badge} onChange={handleChange} />
          <FormInput label="Title" name="title" value={form.title} onChange={handleChange} required />
          <FormInput label="CTA Text" name="ctaText" value={form.ctaText} onChange={handleChange} />
          <FormInput label="CTA Link" name="ctaLink" value={form.ctaLink} onChange={handleChange} />
          <FormInput label="Sort Order" name="sortOrder" type="number" value={form.sortOrder} onChange={handleChange} />
          <FormInput
            label="Active Status"
            name="isActive"
            value={form.isActive}
            onChange={handleChange}
            as="select"
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
          />
          <ImageUploadField
            label="Slide Image"
            value={form.imageUrl}
            onChange={handleImageChange}
            helperText="Upload a local banner image for the homepage carousel."
          />
          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Subtitle</span>
            <textarea name="subtitle" value={form.subtitle} onChange={handleChange} rows={4} />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="button">
            {editingId ? "Update Slide" : "Add Slide"}
          </button>
          <button type="button" className="button button-ghost" onClick={resetForm}>
            Clear
          </button>
        </div>
      </form>

      <div className="page-header">
        <div>
          <h2>Current Slides</h2>
          <p className="muted-text">Slides now use locally uploaded images instead of image links.</p>
        </div>
      </div>

      {loading ? <p className="muted-text">Loading slides...</p> : null}

      <div className="admin-slide-grid">
        {slides.map((slide) => (
          <div key={slide._id} className="card admin-slide-card">
            <img src={slide.imageUrl} alt={slide.title} className="slide-preview-image" />
            <div className="admin-slide-body">
              <div className="card-heading-row">
                <h3>{slide.title}</h3>
                <StatusBadge value={slide.isActive ? "Active" : "Inactive"} />
              </div>
              <p className="muted-text">{slide.badge}</p>
              <p>{slide.subtitle}</p>
              <div className="summary-row">
                <span>Order: {slide.sortOrder}</span>
                <span>{slide.ctaText}</span>
              </div>
              <div className="admin-slide-actions">
                <button type="button" className="button button-ghost" onClick={() => handleEdit(slide)}>
                  Edit
                </button>
                <button type="button" className="button button-secondary" onClick={() => handleDelete(slide._id)}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomepageContentPage;
