import { useEffect, useState } from "react";

const MAX_TITLE = 200;
const MAX_TAGS = 10;

const slugify = (text = "") =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ArticleInfoSection = ({
  form,
  setForm,
  errors = {},
  categories = [],
  setCategories = () => {},
  allTags = [],
}) => {
  const [tagInput, setTagInput] = useState("");
  const [showCatInput, setShowCatInput] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  /* ---------------- AUTO SLUG ---------------- */
  useEffect(() => {
    if (form?.title && !form.slugTouched) {
      setForm((prev) => ({
        ...prev,
        slug: slugify(prev.title),
      }));
    }
  }, [form?.title, form?.slugTouched, setForm]);

  /* ---------------- TAGS ---------------- */

  const addTag = (tag) => {
    if (
      !tag ||
      form.tags.includes(tag) ||
      form.tags.length >= MAX_TAGS
    )
      return;

    setForm((prev) => ({
      ...prev,
      tags: [...prev.tags, tag],
    }));
    setTagInput("");
  };

  const removeTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  /* ---------------- CATEGORY ---------------- */

  const createCategory = () => {
    if (!newCategory.trim()) return;

    if (!categories.includes(newCategory)) {
      setCategories((prev) => [...prev, newCategory]);
    }

    setForm((prev) => ({
      ...prev,
      category: newCategory,
    }));

    setNewCategory("");
    setShowCatInput(false);
  };

  /* ---------------- RENDER ---------------- */

  return (
    <section className="article-info-section">
      <h4>Article Info</h4>

      <div className="article-info-grid">
        {/* TITLE */}
        <div className="field">
          <input
            placeholder="Article title"
            value={form.title}
            maxLength={MAX_TITLE}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
          <div className="field-meta">
            <small>
              {form.title.length}/{MAX_TITLE}
            </small>
            {errors.title && (
              <small className="error">{errors.title}</small>
            )}
          </div>
        </div>

        {/* SLUG */}
        <div className="field">
          <input
            placeholder="URL Slug"
            value={form.slug}
            onChange={(e) =>
              setForm({
                ...form,
                slug: e.target.value,
                slugTouched: true,
              })
            }
          />
          <small className="slug-preview">
            Preview: yoursite.com/help/
            {form.slug || "your-slug"}
          </small>
          {errors.slug && (
            <small className="error">{errors.slug}</small>
          )}
        </div>

        {/* CATEGORY */}
        <div className="field">
          <select
            value={form.category}
            onChange={(e) =>
              e.target.value === "__new__"
                ? setShowCatInput(true)
                : setForm({ ...form, category: e.target.value })
            }
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            <option value="__new__">+ Create new category</option>
          </select>

          {showCatInput && (
            <div className="inline-create">
              <input
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <button type="button" onClick={createCategory}>
                Add
              </button>
              <button
                type="button"
                className="link-btn"
                onClick={() => setShowCatInput(false)}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* TAGS */}
        <div className="field tag-field">
          <div className="tag-input-wrapper">
            {form.tags.map((t) => (
              <span key={t} className="tag-chip">
                {t}
                <button type="button" onClick={() => removeTag(t)}>
                  ×
                </button>
              </span>
            ))}

            <input
              placeholder="Add tag"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  addTag(tagInput.trim());
                }
              }}
            />
          </div>

          {tagInput && (
            <div className="tag-suggestions">
              {allTags
                .filter(
                  (t) =>
                    t.toLowerCase().includes(tagInput.toLowerCase()) &&
                    !form.tags.includes(t)
                )
                .slice(0, 5)
                .map((t) => (
                  <div key={t} onClick={() => addTag(t)}>
                    {t}
                  </div>
                ))}
            </div>
          )}

          <small>
            {form.tags.length}/{MAX_TAGS} tags
          </small>
        </div>
      </div>
    </section>
  );
};

export default ArticleInfoSection;
