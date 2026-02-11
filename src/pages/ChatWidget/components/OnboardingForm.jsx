import { User } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const OnboardingForm = ({ onSubmit, initialData }) => {
    const [formData, setFormData] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format';
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length) {
            setErrors(validationErrors);
            return;
        }
        onSubmit(formData);
    };


    /* ---------- RETURNING USER ---------- */
    if (initialData) {
        return (
            <div className="onboarding-card text-center">
                <div className="onboarding-icon">
                    <User size={28} />
                </div>

                <h5 className="mt-3 mb-1">Welcome back</h5>
                <p className="text-muted mb-4">{initialData.name}</p>
                <button
                    className="btn btn-primary w-100 mb-2"
                    onClick={() => onSubmit(initialData)}
                >
                    Continue conversation
                </button>

                <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => onSubmit({ name: 'Guest', email: '' })}
                >
                    Start new chat as Guest
                </button>
            </div>
        );
    }

    /* ---------- NEW USER ---------- */
    return (
        <div className="onboarding-card">
            <div className="text-center mb-4">
                <h5 className="mt-3 mb-1">Let’s get started</h5>
                <p className="text-muted small">
                    Tell us a little about yourself
                </p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
                <div className="form-group mb-3">
                    <label className="form-label small">Name</label>
                    <input
                        type="text"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            if (errors.name) setErrors({ ...errors, name: '' });
                        }}
                    />
                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                </div>

                <div className="form-group mb-4">
                    <label className="form-label small">Email</label>
                    <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="name@example.com"
                        value={formData.email}
                        onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                </div>
                <div className='d-flex align-items-center justify-content-center gap-2'>

                    <button type="submit" className="btn btn-primary startConvoButton  ">
                        Start conversation
                    </button>

                    <button
                        type="button"
                        className="btn btn-dark text-white  startConvoButton"
                        onClick={() => onSubmit({ name: 'Guest', email: '' })}
                    >
                        Continue as guest
                    </button>
                </div>
            </form>
        </div>
    );
};

export default OnboardingForm