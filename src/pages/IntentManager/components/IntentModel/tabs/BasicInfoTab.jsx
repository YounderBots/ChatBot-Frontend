import React, { useState } from "react";

const BasicInfoTab = ({ intent }) => {
    const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [categories, setCategories] = useState([
        "General",
        "Account",
        "Payments",
        "Support",
    ]);
    const [isActive, setIsActive] = useState(
        intent?.status === "Inactive" ? false : true
    );
    const [nameError, setNameError] = useState("");

    const validateName = (name) => {
        const regex = /^[a-z0-9_]+$/;
        if (!name) {
            setNameError("Intent name is required");
            return false;
        }
        if (!regex.test(name)) {
            setNameError("Only lowercase letters, numbers, and underscores allowed");
            return false;
        }
        if (name.includes(" ")) {
            setNameError("No spaces allowed");
            return false;
        }
        setNameError("");
        return true;
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;

        if (value === "add-new") {
            setShowAddCategoryModal(true);
            setSelectedCategory("");
        } else {
            setSelectedCategory(value);
        }
    };

    const handleSaveNewCategory = () => {
        if (!newCategory.trim()) return;

        setCategories([...categories, newCategory]);
        setSelectedCategory(newCategory);
        setNewCategory("");
        setShowAddCategoryModal(false);
    };

    return (
        <>
            {/* -------- Modal -------- */}
            {showAddCategoryModal && (
                <div className="modal-backdrop show" style={{ opacity: 0.5, zIndex: 1055 }}></div>
            )}
            {showAddCategoryModal && (
                <div className="modal d-block" style={{ zIndex: 1060 }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-sm">
                        <div className="modal-content shadow-lg rounded-4">
                            <div className="modal-header border-bottom-0 pb-0">
                                <h5 className="modal-title fw-bold">Add New Category</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddCategoryModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="Enter category name"
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer border-top-0 pt-0">
                                <button className="btn btn-secondary btn-sm" onClick={() => setShowAddCategoryModal(false)}>Cancel</button>
                                <button className="btn btn-primary btn-sm" onClick={handleSaveNewCategory}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* -------- Form -------- */}
            <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Intent Name</label>
                <input
                    type="text"
                    className={`form-control ${nameError ? "is-invalid" : ""}`}
                    placeholder="e.g. check_balance"
                    defaultValue={intent?.name}
                    onChange={(e) => validateName(e.target.value)}
                />
                {nameError ? (
                    <div className="invalid-feedback">{nameError}</div>
                ) : (
                    <div className="form-text text-muted">Lowercase, no spaces</div>
                )}
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Display Name</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Check Balance"
                    defaultValue={intent?.displayName}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Description</label>
                <textarea
                    className="form-control"
                    rows="3"
                    defaultValue={intent?.description}
                />
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Category</label>
                <select
                    className="form-select"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                >
                    <option value="">Select a category</option>

                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}

                    <option value="add-new">+ Add New</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small text-secondary">Priority</label>
                <select className="form-select">
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label fw-bold small text-secondary mb-2">Status</label>
                <div className="d-flex align-items-center gap-3 p-2 bg-light rounded-3" style={{ width: 'fit-content' }}>
                    <span className={`small fw-bold ${!isActive ? "text-danger" : "text-muted"}`}>Inactive</span>
                    <div className="form-check form-switch m-0 d-flex align-items-center">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            role="switch"
                            style={{ width: '2.5em', height: '1.25em', cursor: 'pointer' }}
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                    </div>
                    <span className={`small fw-bold ${isActive ? "text-success" : "text-muted"}`}>Active</span>
                </div>
            </div>

        </>
    );
};

export default BasicInfoTab;
