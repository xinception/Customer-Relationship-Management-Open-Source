import React, { useState } from 'react';

const fieldOptions = [
  { value: 'email', label: 'Email' },
  { value: 'score', label: 'Score' },
  { value: 'lastSeen', label: 'Last Seen' },
  { value: 'tags', label: 'Tags' },
  { value: 'company', label: 'Company' },
  { value: 'status', label: 'Status' },
  { value: 'lifecycleStage', label: 'Lifecycle Stage' },
  { value: 'country', label: 'Country' },
  { value: 'totalEvents', label: 'Total Events' },
];

const operatorOptions = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
  { value: 'in', label: 'In' },
  { value: 'not_in', label: 'Not In' },
  { value: 'exists', label: 'Exists' },
];

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  conditionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.06)',
    flexWrap: 'wrap',
  },
  select: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer',
    minWidth: '140px',
  },
  input: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '13px',
    outline: 'none',
    flex: 1,
    minWidth: '120px',
  },
  removeBtn: {
    background: 'rgba(231,76,60,0.12)',
    border: 'none',
    borderRadius: '6px',
    color: '#e74c3c',
    fontSize: '16px',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.15s',
  },
  logicToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 0',
  },
  logicBtn: (active) => ({
    padding: '4px 14px',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.15s',
    background: active ? '#6c5ce7' : 'rgba(255,255,255,0.06)',
    color: active ? '#fff' : 'rgba(255,255,255,0.4)',
  }),
  logicBtnLeft: {
    borderRadius: '6px 0 0 6px',
  },
  logicBtnRight: {
    borderRadius: '0 6px 6px 0',
  },
  addBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'none',
    border: '2px dashed rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: 'rgba(255,255,255,0.4)',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    marginTop: '8px',
  },
};

const emptyRule = () => ({
  id: Date.now() + Math.random(),
  field: 'email',
  operator: 'equals',
  value: '',
});

const SegmentBuilder = ({ rules: initialRules, onChange }) => {
  const [rules, setRules] = useState(
    initialRules && initialRules.conditions
      ? initialRules.conditions
      : [emptyRule()]
  );
  const [logic, setLogic] = useState(
    initialRules?.logic || 'AND'
  );

  const emitChange = (newRules, newLogic) => {
    if (onChange) {
      onChange({ logic: newLogic, conditions: newRules });
    }
  };

  const updateRule = (id, key, value) => {
    const updated = rules.map((r) =>
      r.id === id ? { ...r, [key]: value } : r
    );
    setRules(updated);
    emitChange(updated, logic);
  };

  const addRule = () => {
    const updated = [...rules, emptyRule()];
    setRules(updated);
    emitChange(updated, logic);
  };

  const removeRule = (id) => {
    if (rules.length <= 1) return;
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    emitChange(updated, logic);
  };

  const toggleLogic = (val) => {
    setLogic(val);
    emitChange(rules, val);
  };

  return (
    <div style={styles.container}>
      {rules.map((rule, idx) => (
        <React.Fragment key={rule.id}>
          <div style={styles.conditionRow}>
            <select
              style={styles.select}
              value={rule.field}
              onChange={(e) => updateRule(rule.id, 'field', e.target.value)}
            >
              {fieldOptions.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              style={styles.select}
              value={rule.operator}
              onChange={(e) => updateRule(rule.id, 'operator', e.target.value)}
            >
              {operatorOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {rule.operator !== 'exists' && (
              <input
                style={styles.input}
                type="text"
                placeholder="Value..."
                value={rule.value}
                onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                onFocus={(e) => (e.target.style.borderColor = '#6c5ce7')}
                onBlur={(e) =>
                  (e.target.style.borderColor = 'rgba(255,255,255,0.1)')
                }
              />
            )}
            <button
              style={styles.removeBtn}
              onClick={() => removeRule(rule.id)}
              title="Remove condition"
              disabled={rules.length <= 1}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = 'rgba(231,76,60,0.25)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = 'rgba(231,76,60,0.12)')
              }
            >
              {'\u2715'}
            </button>
          </div>
          {idx < rules.length - 1 && (
            <div style={styles.logicToggle}>
              <button
                style={{
                  ...styles.logicBtn(logic === 'AND'),
                  ...styles.logicBtnLeft,
                }}
                onClick={() => toggleLogic('AND')}
              >
                AND
              </button>
              <button
                style={{
                  ...styles.logicBtn(logic === 'OR'),
                  ...styles.logicBtnRight,
                }}
                onClick={() => toggleLogic('OR')}
              >
                OR
              </button>
            </div>
          )}
        </React.Fragment>
      ))}
      <button
        style={styles.addBtn}
        onClick={addRule}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#6c5ce7';
          e.currentTarget.style.color = '#a29bfe';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.4)';
        }}
      >
        + Add Condition
      </button>
    </div>
  );
};

export default SegmentBuilder;
