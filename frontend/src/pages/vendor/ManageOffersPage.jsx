import { useEffect, useState } from "react";
import api from "../../api/client";
import EmptyState from "../../components/common/EmptyState";
import FormInput from "../../components/common/FormInput";
import ImageUploadField from "../../components/common/ImageUploadField";
import { formatCurrency } from "../../utils/formatters";

const defaultForm = {
  title: "",
  discountLabel: "",
  description: "",
  code: "",
  minimumOrder: "",
  validUntil: "",
  imageUrl: "",
  isActive: "true",
};

const formatOfferDate = (value) => {
  if (!value) {
    return "No expiry";
  }

  const date = new Date(value);

  if (Number.isNaN(date.valueOf())) {
    return "No expiry";
  }

  return date.toLocaleDateString();
};

const ManageOffersPage = () => {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchOffers = async () => {
    try {
      const { data } = await api.get("/vendor/offers");
      setOffers(data);
    } catch (fetchError) {
      console.error(fetchError);
      setError("Unable to load offers");
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId("");
  };

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleEdit = (offer) => {
    setMessage("");
    setError("");
    setEditingId(offer._id);
    setForm({
      title: offer.title || "",
      discountLabel: offer.discountLabel || "",
      description: offer.description || "",
      code: offer.code || "",
      minimumOrder: offer.minimumOrder || "",
      validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().slice(0, 10) : "",
      imageUrl: offer.imageUrl || "",
      isActive: String(offer.isActive !== false),
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    setError("");

    const payload = {
      ...form,
      minimumOrder: form.minimumOrder || 0,
      validUntil: form.validUntil || null,
      isActive: form.isActive === "true",
    };

    try {
      const { data } = editingId
        ? await api.patch(`/vendor/offers/${editingId}`, payload)
        : await api.post("/vendor/offers", payload);

      setMessage(data.message);
      resetForm();
      fetchOffers();
    } catch (submitError) {
      setError(submitError.response?.data?.message || "Unable to save offer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (offerId) => {
    try {
      const { data } = await api.delete(`/vendor/offers/${offerId}`);
      setMessage(data.message);
      if (editingId === offerId) {
        resetForm();
      }
      fetchOffers();
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || "Unable to delete offer");
    }
  };

  const handleToggleStatus = async (offer) => {
    try {
      const { data } = await api.patch(`/vendor/offers/${offer._id}`, {
        ...offer,
        isActive: !offer.isActive,
      });
      setMessage(data.message);
      fetchOffers();
    } catch (toggleError) {
      setError(toggleError.response?.data?.message || "Unable to update offer status");
    }
  };

  return (
    <div className="list-stack">
      <div className="page-header">
        <div>
          <h1>Manage Offers</h1>
          <p className="muted-text">Create polished customer-facing promotions that will appear on the public offers page.</p>
        </div>
      </div>

      <section className="card form-card">
        {message ? <p className="success-text">{message}</p> : null}
        {error ? <p className="error-text">{error}</p> : null}

        <form className="form-grid" onSubmit={handleSubmit}>
          <FormInput label="Offer Title" name="title" value={form.title} onChange={handleChange} placeholder="Lunch combo for first-time customers" required />
          <FormInput
            label="Discount Label"
            name="discountLabel"
            value={form.discountLabel}
            onChange={handleChange}
            placeholder="25% OFF"
            required
          />
          <FormInput label="Coupon Code" name="code" value={form.code} onChange={handleChange} placeholder="LUNCH25" />
          <FormInput
            label="Minimum Order"
            name="minimumOrder"
            type="number"
            min="0"
            step="1"
            value={form.minimumOrder}
            onChange={handleChange}
            placeholder="500"
          />
          <FormInput label="Valid Until" name="validUntil" type="date" value={form.validUntil} onChange={handleChange} />
          <FormInput
            label="Status"
            name="isActive"
            as="select"
            value={form.isActive}
            onChange={handleChange}
            options={[
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ]}
          />
          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Description</span>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe what the customer gets and why the offer is useful."
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <ImageUploadField
              label="Offer Banner"
              value={form.imageUrl}
              onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
              helperText="Upload a promo image to make the offer card feel premium on the public page."
            />
          </div>
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="button" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Update Offer" : "Create Offer"}
            </button>
            {editingId ? (
              <button type="button" className="button button-ghost" onClick={resetForm}>
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="card form-card">
        <div className="page-header">
          <div>
            <h3>Published Offers</h3>
            <p className="muted-text">These cards are what customers will see on the public offers page.</p>
          </div>
        </div>

        {offers.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {offers.map((offer, index) => (
              <article
                key={offer._id}
                className={`overflow-hidden rounded-[30px] border shadow-card ${
                  offer.isActive ? "border-saffron-200 bg-white" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div className={`relative p-6 ${index % 2 === 0 ? "bg-gradient-to-br from-[#fff7dc] via-white to-[#ffe6b6]" : "bg-gradient-to-br from-[#fff3ee] via-white to-[#ffe4c9]"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex rounded-full bg-charcoal-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                        {offer.discountLabel}
                      </span>
                      <h4 className="mt-4 text-2xl font-semibold tracking-tight text-charcoal-900">{offer.title}</h4>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] ${
                        offer.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {offer.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-slate-600">{offer.description || "No offer description added yet."}</p>

                  <div className="mt-5 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-white/90 px-3 py-2 shadow-sm">Min {formatCurrency(offer.minimumOrder || 0)}</span>
                    <span className="rounded-full bg-white/90 px-3 py-2 shadow-sm">{formatOfferDate(offer.validUntil)}</span>
                    {offer.code ? <span className="rounded-full bg-white/90 px-3 py-2 font-semibold shadow-sm">{offer.code}</span> : null}
                  </div>
                </div>

                {offer.imageUrl ? <img src={offer.imageUrl} alt={offer.title} className="h-44 w-full object-cover" /> : null}

                <div className="grid gap-3 p-5 sm:grid-cols-3">
                  <button type="button" className="button button-ghost inline-button" onClick={() => handleEdit(offer)}>
                    Edit
                  </button>
                  <button type="button" className="button button-ghost inline-button" onClick={() => handleToggleStatus(offer)}>
                    {offer.isActive ? "Pause" : "Activate"}
                  </button>
                  <button type="button" className="button button-secondary inline-button" onClick={() => handleDelete(offer._id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="No offers yet" description="Create your first public promotion to attract more customers." />
        )}
      </section>
    </div>
  );
};

export default ManageOffersPage;
