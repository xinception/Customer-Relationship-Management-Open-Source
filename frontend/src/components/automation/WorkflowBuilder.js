import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const stepTypes = [
  { type: 'send_email', label: 'Send Email', icon: '\u{1F4E7}', color: '#74b9ff' },
  { type: 'wait', label: 'Wait', icon: '\u23F3', color: '#ffa502' },
  { type: 'condition', label: 'Condition (If/Else)', icon: '\u{1F500}', color: '#a29bfe' },
  { type: 'update_contact', label: 'Update Contact', icon: '\u{1F464}', color: '#2ed573' },
  { type: 'add_tag', label: 'Add Tag', icon: '\u{1F3F7}\uFE0F', color: '#fd79a8' },
  { type: 'webhook', label: 'Webhook', icon: '\u{1F310}', color: '#e17055' },
];

const stepTypeMap = Object.fromEntries(stepTypes.map((s) => [s.type, s]));

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0',
    padding: '20px 0',
  },
  stepCard: {
    background: '#1e1e36',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.08)',
    padding: '16px 20px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    cursor: 'pointer',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  stepIcon: (color) => ({
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: `${color}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
  }),
  stepContent: {
    flex: 1,
    minWidth: 0,
  },
  stepName: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
  },
  stepConfig: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '12px',
    margin: '2px 0 0 0',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  stepNumber: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
  },
  connector: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
    padding: '4px 0',
  },
  connectorLine: {
    width: '2px',
    height: '24px',
    background: 'rgba(108,92,231,0.3)',
  },
  addBetweenBtn: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    border: '2px solid rgba(108,92,231,0.3)',
    background: '#16213e',
    color: '#6c5ce7',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    zIndex: 1,
  },
  addEndBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'none',
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    width: '100%',
    maxWidth: '400px',
    marginTop: '8px',
  },
  typeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  typeOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '13px',
    fontWeight: 500,
  },
  editForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  formLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  },
  formInput: {
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '8px',
  },
  deleteBtn: {
    marginRight: 'auto',
  },
};

function getConfigSummary(step) {
  if (!step.config) return 'Not configured';
  const entries = Object.entries(step.config).filter(
    ([, v]) => v !== '' && v != null
  );
  if (entries.length === 0) return 'Not configured';
  return entries
    .slice(0, 2)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' | ');
}

const WorkflowBuilder = ({ steps: initialSteps = [], onUpdate }) => {
  const [steps, setSteps] = useState(initialSteps);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [insertIndex, setInsertIndex] = useState(null);
  const [editingStep, setEditingStep] = useState(null);
  const [editForm, setEditForm] = useState({});

  const emit = (updated) => {
    setSteps(updated);
    if (onUpdate) onUpdate(updated);
  };

  const openAddModal = (index) => {
    setInsertIndex(index);
    setShowTypeModal(true);
  };

  const addStep = (typeKey) => {
    const info = stepTypeMap[typeKey];
    const newStep = {
      id: Date.now() + Math.random(),
      type: typeKey,
      name: info.label,
      config: {},
    };
    const updated = [...steps];
    updated.splice(insertIndex, 0, newStep);
    emit(updated);
    setShowTypeModal(false);
  };

  const openEditModal = (step) => {
    setEditingStep(step);
    setEditForm({ name: step.name, ...step.config });
  };

  const saveEdit = () => {
    const { name, ...config } = editForm;
    const updated = steps.map((s) =>
      s.id === editingStep.id ? { ...s, name: name || s.name, config } : s
    );
    emit(updated);
    setEditingStep(null);
  };

  const deleteStep = (id) => {
    emit(steps.filter((s) => s.id !== id));
    setEditingStep(null);
  };

  return (
    <div style={styles.container}>
      {steps.map((step, idx) => {
        const info = stepTypeMap[step.type] || stepTypes[0];
        return (
          <React.Fragment key={step.id}>
            {idx > 0 && (
              <div style={styles.connector}>
                <div style={styles.connectorLine} />
                <button
                  style={styles.addBetweenBtn}
                  title="Add step here"
                  onClick={() => openAddModal(idx)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#6c5ce7';
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = '#6c5ce7';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#16213e';
                    e.currentTarget.style.color = '#6c5ce7';
                    e.currentTarget.style.borderColor = 'rgba(108,92,231,0.3)';
                  }}
                >
                  +
                </button>
                <div style={styles.connectorLine} />
              </div>
            )}
            <div
              style={styles.stepCard}
              onClick={() => openEditModal(step)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = info.color;
                e.currentTarget.style.boxShadow = `0 0 20px ${info.color}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <span style={styles.stepNumber}>{idx + 1}</span>
              <div style={styles.stepIcon(info.color)}>{info.icon}</div>
              <div style={styles.stepContent}>
                <p style={styles.stepName}>{step.name}</p>
                <p style={styles.stepConfig}>{getConfigSummary(step)}</p>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {steps.length > 0 && (
        <div style={styles.connector}>
          <div style={styles.connectorLine} />
        </div>
      )}

      <button
        style={styles.addEndBtn}
        onClick={() => openAddModal(steps.length)}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#6c5ce7';
          e.currentTarget.style.color = '#a29bfe';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        + Add Step
      </button>

      {/* Step Type Selection Modal */}
      <Modal
        isOpen={showTypeModal}
        onClose={() => setShowTypeModal(false)}
        title="Select Step Type"
        size="md"
      >
        <div style={styles.typeGrid}>
          {stepTypes.map((st) => (
            <div
              key={st.type}
              style={styles.typeOption}
              onClick={() => addStep(st.type)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = st.color;
                e.currentTarget.style.background = `${st.color}10`;
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
              }}
            >
              <span style={{ fontSize: '20px' }}>{st.icon}</span>
              {st.label}
            </div>
          ))}
        </div>
      </Modal>

      {/* Edit Step Modal */}
      <Modal
        isOpen={!!editingStep}
        onClose={() => setEditingStep(null)}
        title={`Edit: ${editingStep?.name || 'Step'}`}
        size="sm"
      >
        <div style={styles.editForm}>
          <div>
            <div style={styles.formLabel}>Step Name</div>
            <input
              style={styles.formInput}
              value={editForm.name || ''}
              onChange={(e) =>
                setEditForm((f) => ({ ...f, name: e.target.value }))
              }
              onFocus={(e) => (e.target.style.borderColor = '#6c5ce7')}
              onBlur={(e) =>
                (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
              }
            />
          </div>

          {editingStep?.type === 'send_email' && (
            <>
              <div>
                <div style={styles.formLabel}>Email Template</div>
                <input
                  style={styles.formInput}
                  placeholder="Template name or ID"
                  value={editForm.template || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, template: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={styles.formLabel}>Subject Line</div>
                <input
                  style={styles.formInput}
                  placeholder="Email subject"
                  value={editForm.subject || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, subject: e.target.value }))
                  }
                />
              </div>
            </>
          )}

          {editingStep?.type === 'wait' && (
            <div>
              <div style={styles.formLabel}>Wait Duration</div>
              <input
                style={styles.formInput}
                placeholder="e.g. 2 days, 4 hours"
                value={editForm.duration || ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, duration: e.target.value }))
                }
              />
            </div>
          )}

          {editingStep?.type === 'condition' && (
            <>
              <div>
                <div style={styles.formLabel}>Condition Field</div>
                <input
                  style={styles.formInput}
                  placeholder="e.g. score, status"
                  value={editForm.field || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, field: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={styles.formLabel}>Condition Value</div>
                <input
                  style={styles.formInput}
                  placeholder="e.g. > 50, active"
                  value={editForm.conditionValue || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      conditionValue: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          )}

          {editingStep?.type === 'update_contact' && (
            <>
              <div>
                <div style={styles.formLabel}>Field to Update</div>
                <input
                  style={styles.formInput}
                  placeholder="e.g. status, score"
                  value={editForm.field || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, field: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={styles.formLabel}>New Value</div>
                <input
                  style={styles.formInput}
                  placeholder="Value"
                  value={editForm.newValue || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, newValue: e.target.value }))
                  }
                />
              </div>
            </>
          )}

          {editingStep?.type === 'add_tag' && (
            <div>
              <div style={styles.formLabel}>Tag Name</div>
              <input
                style={styles.formInput}
                placeholder="Enter tag name"
                value={editForm.tag || ''}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, tag: e.target.value }))
                }
              />
            </div>
          )}

          {editingStep?.type === 'webhook' && (
            <>
              <div>
                <div style={styles.formLabel}>Webhook URL</div>
                <input
                  style={styles.formInput}
                  placeholder="https://..."
                  value={editForm.url || ''}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, url: e.target.value }))
                  }
                />
              </div>
              <div>
                <div style={styles.formLabel}>HTTP Method</div>
                <select
                  style={styles.formInput}
                  value={editForm.method || 'POST'}
                  onChange={(e) =>
                    setEditForm((f) => ({ ...f, method: e.target.value }))
                  }
                >
                  <option value="POST">POST</option>
                  <option value="GET">GET</option>
                  <option value="PUT">PUT</option>
                </select>
              </div>
            </>
          )}

          <div style={styles.formActions}>
            <Button
              variant="danger"
              size="sm"
              style={styles.deleteBtn}
              onClick={() => deleteStep(editingStep?.id)}
            >
              Delete Step
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditingStep(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={saveEdit}>
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkflowBuilder;
