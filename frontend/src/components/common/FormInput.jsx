const FormInput = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  as = "input",
  options = [],
  required = false,
  min,
  step,
}) => {
  return (
    <label className="form-field">
      <span>{label}</span>
      {as === "textarea" ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          rows={4}
        />
      ) : as === "select" ? (
        <select name={name} value={value} onChange={onChange} required={required}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
        />
      )}
    </label>
  );
};

export default FormInput;
