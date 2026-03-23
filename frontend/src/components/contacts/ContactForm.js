import React, { useState, useEffect } from 'react';
import Button from '../common/Button';

const statusOptions = ['active', 'inactive', 'lead', 'customer', 'churned'];
const sourceOptions = ['website', 'referral', 'social', 'email', 'cold_outreach', 'event', 'other'];

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  required: {
    color: '#e74c3c',
    marginLeft: '2px',
  },
  input: (hasError) => ({
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${hasError ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  }),
  select: (hasError) => ({
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: `1px solid ${hasError ? '#e74c3c' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    width: '100%',
    boxSizing: 'border-box',
  }),
  error: {
    color: '#e74c3c',
    fontSize: '11px',
    marginTop: '2px',
  },
  tagsWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px',
  },
  tag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    background: 'rgba(108,92,231,0.15)',
    borderRadius: '20px',
    color: '#a29bfe',
    fontSize: '12px',
    fontWeight: 500,
  },
  tagRemove: {
    background: 'none',
    border: 'none',
    color: '#a29bfe',
    fontSize: '14px',
    cursor: 'pointer',
    padding: '0 2px',
    lineHeight: 1,
  },
  tagInput: {
    padding: '6px 10px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '12px',
    outline: 'none',
    width: '120px',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
};

const emptyContact = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  status: 'lead',
  source: 'website',
  tags: [],
};

const ContactForm = ({ contact, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState(emptyContact);
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({ ...emptyContact, ...contact });
    }
  }, [contact]);

  const validate = () => {
    const errs = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Invalid email format';
    }
    if (formData.phone && !/^[+\d\s()-]{7,20}$/.test(formData.phone)) {
      errs.phone = 'Invalid phone number';
    }
    return errs;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      handleChange('tags', [...formData.tags, tag]);
    }
    setTagInput('');
  };

  const removeTag = (tag) => {
    handleChange(
      'tags',
      formData.tags.filter((t) => t !== tag)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      if (onSubmit) await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = !!contact;

  return (
    <form style={styles.form} onSubmit={handleSubmit}>
      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            First Name<span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input(!!errors.firstName)}
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
            onFocus={(e) =>
              !errors.firstName &&
              (e.target.style.borderColor = '#6c5ce7')
            }
            onBlur={(e) =>
              !errors.firstName &&
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
          {errors.firstName && (
            <span style={styles.error}>{errors.firstName}</span>
          )}
        </div>
        <div style={styles.field}>
          <label style={styles.label}>
            Last Name<span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input(!!errors.lastName)}
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Doe"
            onFocus={(e) =>
              !errors.lastName &&
              (e.target.style.borderColor = '#6c5ce7')
            }
            onBlur={(e) =>
              !errors.lastName &&
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
          {errors.lastName && (
            <span style={styles.error}>{errors.lastName}</span>
          )}
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>
            Email<span style={styles.required}>*</span>
          </label>
          <input
            style={styles.input(!!errors.email)}
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            onFocus={(e) =>
              !errors.email &&
              (e.target.style.borderColor = '#6c5ce7')
            }
            onBlur={(e) =>
              !errors.email &&
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
          {errors.email && (
            <span style={styles.error}>{errors.email}</span>
          )}
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Phone</label>
          <input
            style={styles.input(!!errors.phone)}
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            onFocus={(e) =>
              !errors.phone &&
              (e.target.style.borderColor = '#6c5ce7')
            }
            onBlur={(e) =>
              !errors.phone &&
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
          {errors.phone && (
            <span style={styles.error}>{errors.phone}</span>
          )}
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Company</label>
          <input
            style={styles.input(false)}
            value={formData.company}
            onChange={(e) => handleChange('company', e.target.value)}
            placeholder="Acme Inc."
            onFocus={(e) => (e.target.style.borderColor = '#6c5ce7')}
            onBlur={(e) =>
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Job Title</label>
          <input
            style={styles.input(false)}
            value={formData.jobTitle}
            onChange={(e) => handleChange('jobTitle', e.target.value)}
            placeholder="Marketing Manager"
            onFocus={(e) => (e.target.style.borderColor = '#6c5ce7')}
            onBlur={(e) =>
              (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
            }
          />
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.field}>
          <label style={styles.label}>Status</label>
          <select
            style={styles.select(false)}
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.field}>
          <label style={styles.label}>Source</label>
          <select
            style={styles.select(false)}
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
          >
            {sourceOptions.map((s) => (
              <option key={s} value={s}>
                {s
                  .split('_')
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Tags</label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            style={styles.tagInput}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="Add tag..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <Button variant="ghost" size="sm" type="button" onClick={addTag}>
            + Add
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div style={styles.tagsWrap}>
            {formData.tags.map((tag) => (
              <span key={tag} style={styles.tag}>
                {tag}
                <button
                  type="button"
                  style={styles.tagRemove}
                  onClick={() => removeTag(tag)}
                >
                  {'\u2715'}
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={styles.actions}>
        {onCancel && (
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button variant="primary" type="submit" loading={submitting}>
          {isEdit ? 'Update Contact' : 'Create Contact'}
        </Button>
      </div>
    </form>
  );
};

export default ContactForm;
