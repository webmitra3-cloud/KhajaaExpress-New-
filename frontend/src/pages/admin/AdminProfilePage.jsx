import { useEffect, useState } from "react";
import FormInput from "../../components/common/FormInput";
import { useAuth } from "../../hooks/useAuth";

const AdminProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    avatarUrl: "",
    password: "",
  });
  const [message, setMessage] = useState("");

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

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await updateProfile(form);
      setMessage("Admin profile updated successfully.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update admin profile");
    }
  };

  return (
    <div className="card form-card">
      <div className="page-header">
        <div>
          <h1>Admin Profile</h1>
          <p className="muted-text">Basic admin account details stored in the shared user model.</p>
        </div>
      </div>

      {message ? <p className="success-text">{message}</p> : null}

      <form className="form-grid" onSubmit={handleSubmit}>
        <FormInput label="Name" name="name" value={form.name} onChange={handleChange} required />
        <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} />
        <FormInput label="Address" name="address" value={form.address} onChange={handleChange} />
        <FormInput label="Avatar URL" name="avatarUrl" value={form.avatarUrl} onChange={handleChange} />
        <FormInput label="New Password" name="password" type="password" value={form.password} onChange={handleChange} />
        <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
          <button type="submit" className="button">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminProfilePage;
