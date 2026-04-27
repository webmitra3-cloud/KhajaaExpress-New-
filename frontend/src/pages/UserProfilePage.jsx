import { useEffect, useMemo, useState } from "react";
import FormInput from "../components/common/FormInput";
import ImageUploadField from "../components/common/ImageUploadField";
import { useAuth } from "../hooks/useAuth";

const UserProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatarUrl: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        avatarUrl: user.avatarUrl || "",
        password: "",
      });
    }
  }, [user]);

  const initials = useMemo(() => {
    const source = form.name || user?.name || "KhajaExpress";

    return source
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }, [form.name, user?.name]);

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      await updateProfile(form);
      setMessage("Profile updated successfully.");
      setForm((current) => ({ ...current, password: "" }));
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to update profile");
    }
  };

  return (
    <div className="user-panel-stack">
      <section className="card user-panel-hero user-panel-hero-profile">
        <div className="user-profile-hero-pro">
          <div className="profile-avatar-frame profile-avatar-frame-pro">
            {form.avatarUrl ? <img src={form.avatarUrl} alt={form.name || "User avatar"} /> : <span>{initials}</span>}
          </div>
          <div>
            <span className="section-kicker">Profile</span>
            <h1>{form.name || "My Profile"}</h1>
            <p className="muted-text">Update your account details and delivery info.</p>
          </div>
          <div className="user-profile-meta-pro">
            <div className="user-profile-meta-card">
              <small>Email</small>
              <strong>{user?.email || "Not available"}</strong>
            </div>
            <div className="user-profile-meta-card">
              <small>Phone</small>
              <strong>{form.phone || "Add phone"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="card user-profile-card-pro">
        {message ? <p className="success-text auth-message">{message}</p> : null}
        {error ? <p className="error-text auth-message">{error}</p> : null}

        <form className="form-grid user-profile-form-pro" onSubmit={handleSubmit}>
          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
          <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Email</span>
            <input value={user?.email || ""} readOnly />
          </div>
          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <span>Address</span>
            <textarea name="address" value={form.address} onChange={handleChange} rows={4} placeholder="Delivery address" />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <ImageUploadField
              label="Profile Image"
              value={form.avatarUrl}
              onChange={(imageUrl) => setForm((current) => ({ ...current, avatarUrl: imageUrl }))}
              helperText="Upload a local profile image."
            />
          </div>
          <FormInput label="New Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Leave blank to keep current password" />
          <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
            <button type="submit" className="button">
              Save Changes
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default UserProfilePage;