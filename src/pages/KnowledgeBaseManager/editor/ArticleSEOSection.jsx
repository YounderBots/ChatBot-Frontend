import { useRef } from "react";

const MAX_META = 160;

const ArticleSEOSection = ({
  form,
  setForm,
  errors = {},
  onPreview,
  onDelete,
}) => {
  const fileInputRef = useRef(null);

  /* ---------------- IMAGE UPLOAD ---------------- */

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        featuredImage: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((prev) => ({
      ...prev,
      featuredImage: "",
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ---------------- RENDER ---------------- */

  return (
    <section className="seo-section">
      <h4>SEO & Settings</h4>

      {/* META DESCRIPTION */}
      <div className="seo-block">
        <label>Meta Description</label>
        <textarea
          rows={3}
          maxLength={MAX_META}
          placeholder="Meta description (max 160 characters)"
          value={form.metaDescription}
          onChange={(e) =>
            setForm({ ...form, metaDescription: e.target.value })
          }
        />
        <div className="seo-meta">
          <span>
            {form.metaDescription.length}/{MAX_META}
          </span>
          {errors.meta && (
            <span className="error">{errors.meta}</span>
          )}
        </div>
      </div>

      {/* FEATURED IMAGE */}
      <div className="seo-block">
        <label>Featured Image</label>

        <div className="image-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            hidden
          />

          <div
            className="image-upload-box"
            onClick={() => fileInputRef.current?.click()}
          >
            {form.featuredImage ? (
              <img src={form.featuredImage} alt="Preview" />
            ) : (
              <>
                <strong>Upload featured image</strong>
                <span>Recommended: 1200 × 630 px</span>
              </>
            )}
          </div>

          {form.featuredImage && (
            <button
              type="button"
              className="link-btn danger"
              onClick={removeImage}
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      {/* STATUS / SETTINGS */}
      <div className="seo-grid">
        <div>
          <label>Status</label>
          <select
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value })
            }
          >
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        <div className="checkbox">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) =>
              setForm({ ...form, featured: e.target.checked })
            }
          />
          <span>Featured Article</span>
        </div>

        <div>
          <label>Publish Date</label>
          <input
            type="date"
            value={form.publishDate}
            onChange={(e) =>
              setForm({ ...form, publishDate: e.target.value })
            }
          />
          <small>Schedule future publish</small>
        </div>
      </div>

      {/* SECONDARY ACTIONS */}
      <div className="seo-actions">
        <button
          type="button"
          className="btn ghost"
          onClick={onPreview}
        >
          Preview
        </button>

        <button
          type="button"
          className="btn danger"
          onClick={onDelete}
        >
          Delete Article
        </button>
      </div>
    </section>
  );
};

export default ArticleSEOSection;
