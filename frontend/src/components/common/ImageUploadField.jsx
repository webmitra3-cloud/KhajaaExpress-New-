import { ImagePlus, UploadCloud, X } from "lucide-react";
import { useId, useState } from "react";
import { uploadImage } from "../../utils/uploadImage";

const ImageUploadField = ({ label, value, onChange, helperText }) => {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploading(true);
    setError("");

    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
    } catch (uploadError) {
      setError(uploadError.response?.data?.message || uploadError.message || "Image upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-charcoal-900">{label}</span>
        {uploading ? <span className="text-xs font-medium text-saffron-600">Uploading...</span> : null}
      </div>

      <label
        htmlFor={inputId}
        className="flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-saffron-200 bg-cream-50 px-4 py-5 text-center transition hover:border-saffron-300 hover:bg-saffron-100/40"
      >
        <input id={inputId} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-saffron-600 shadow-sm">
          {uploading ? <UploadCloud className="h-5 w-5" /> : <ImagePlus className="h-5 w-5" />}
        </span>
        <span className="mt-4 text-sm font-medium text-charcoal-900">
          {uploading ? "Uploading image..." : "Choose image from your computer"}
        </span>
        <span className="mt-1 text-xs text-slate-500">PNG, JPG, or WEBP</span>
      </label>

      {helperText ? <p className="text-xs leading-6 text-slate-500">{helperText}</p> : null}
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-[24px] border border-saffron-100 bg-white shadow-sm">
          <img src={value} alt={label} className="h-40 w-full object-cover" />
          <div className="flex items-center justify-between gap-3 p-4">
            <p className="text-sm font-medium text-charcoal-900">Image selected</p>
            <button
              type="button"
              onClick={() => onChange("")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:text-red-600"
            >
              <X className="h-4 w-4" />
              Remove
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ImageUploadField;