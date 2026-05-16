import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, GripVertical } from 'lucide-react';
import api from '../../utils/api';

interface RequestItem {
  id: number;
  request_code: string;
  category: string;
  description: string;
  status: string;
  priority: string;
  location: string;
  resident: string;
  unit: string;
  technician: string;
  created_at: string;
  deadline?: string | null;
}

interface ColumnDef {
  key: string;
  label: string;
  headerBorder: string;
  headerBg: string;
  headerColor: string;
}

const COLUMNS: ColumnDef[] = [
  {
    key: 'pending',
    label: 'Pending',
    headerBorder: 'var(--st-pending)',
    headerBg: 'var(--st-pending-bg)',
    headerColor: 'var(--st-pending)',
  },
  {
    key: 'assigned',
    label: 'Assigned',
    headerBorder: 'var(--st-progress)',
    headerBg: 'var(--st-progress-bg)',
    headerColor: 'var(--st-progress)',
  },
  {
    key: 'in-progress',
    label: 'In Progress',
    headerBorder: 'var(--st-progress)',
    headerBg: 'var(--st-progress-bg)',
    headerColor: 'var(--st-progress)',
  },
  {
    key: 'completed',
    label: 'Completed',
    headerBorder: 'var(--st-done)',
    headerBg: 'var(--st-done-bg)',
    headerColor: 'var(--st-done)',
  },
];

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };
const EMERGENCY_CATEGORIES = ['Electrical', 'Plumbing'];

function sortByPriority(items: RequestItem[]) {
  return [...items].sort((a, b) => {
    const aEmergency = a.priority === 'high' && EMERGENCY_CATEGORIES.includes(a.category);
    const bEmergency = b.priority === 'high' && EMERGENCY_CATEGORIES.includes(b.category);
    if (aEmergency && !bEmergency) return -1;
    if (!aEmergency && bEmergency) return 1;
    return (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
  });
}

function getPriorityBorderColor(priority: string): string {
  switch (priority) {
    case 'high':   return 'var(--st-overdue)';
    case 'medium': return 'var(--st-pending)';
    case 'low':    return 'var(--st-progress)';
    default:       return 'var(--rule)';
  }
}

function getPriorityChipStyle(priority: string): React.CSSProperties {
  switch (priority) {
    case 'high':
      return { background: 'var(--st-overdue-bg)', color: 'var(--st-overdue)' };
    case 'medium':
      return { background: 'var(--st-pending-bg)', color: 'var(--st-pending)' };
    case 'low':
      return { background: 'var(--st-done-bg)', color: 'var(--st-done)' };
    default:
      return { background: 'var(--paper-2)', color: 'var(--ink-3)' };
  }
}

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<RequestItem | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/maintenance-requests/');
      setRequests(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const getColumnItems = (status: string) => {
    return sortByPriority(requests.filter(r => r.status === status));
  };

  const handleDragStart = (e: React.DragEvent, item: RequestItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colKey);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setDragOverCol(null);
    if (!draggedItem || draggedItem.status === targetStatus) {
      setDraggedItem(null);
      return;
    }

    try {
      await api.patch(`/maintenance-requests/${draggedItem.id}/manage/`, {
        status: targetStatus,
      });
      setRequests(prev =>
        prev.map(r => r.id === draggedItem.id ? { ...r, status: targetStatus } : r)
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
    setDraggedItem(null);
  };

  const isEmergency = (item: RequestItem) =>
    item.priority === 'high' && EMERGENCY_CATEGORIES.includes(item.category);

  return (
    <div
      className="kanban-page"
      style={{
        background: 'var(--paper)',
        minHeight: '100vh',
        padding: '32px 40px',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/officer')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '12px',
          color: 'var(--ink-3)',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: '24px',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
      >
        <ArrowLeft style={{ width: '16px', height: '16px' }} />
        Back to Dashboard
      </button>

      {/* Page header */}
      <div style={{ marginBottom: '24px' }}>
        <h1
          style={{
            fontSize: '22px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--ink)',
            marginBottom: '4px',
            margin: '0 0 4px 0',
          }}
        >
          Repair Queue Board
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--ink-3)', margin: 0 }}>
          Drag and drop cards to change status. Emergency items are auto-bumped to top.
        </p>
      </div>

      {loading ? (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: 'var(--ink-3)',
          }}
        >
          Loading board...
        </div>
      ) : (
        <div
          className="kanban-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            minHeight: 'calc(100vh - 200px)',
          }}
        >
          {COLUMNS.map(col => {
            const items = getColumnItems(col.key);
            const isOver = dragOverCol === col.key;

            return (
              <div
                key={col.key}
                style={{
                  background: isOver ? 'var(--accent-soft)' : 'var(--paper-2)',
                  borderRadius: '10px',
                  border: '1px solid var(--rule)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'background 0.15s',
                }}
                onDragOver={e => handleDragOver(e, col.key)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.key)}
              >
                {/* Top accent strip */}
                <div
                  style={{
                    height: '3px',
                    background: col.headerBorder,
                    flexShrink: 0,
                  }}
                />

                {/* Column header */}
                <div
                  style={{
                    padding: '12px 14px',
                    background: col.headerBg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--rule-soft)',
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: col.headerColor,
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      padding: '2px 7px',
                      borderRadius: '999px',
                      fontSize: '10px',
                      fontWeight: 600,
                      background: 'var(--paper-card)',
                      color: col.headerColor,
                      border: `1px solid ${col.headerBorder}`,
                    }}
                  >
                    {items.length}
                  </span>
                </div>

                {/* Card scroll area */}
                <div
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px',
                    gap: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {items.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: 'var(--ink-4)',
                        padding: '32px 0',
                      }}
                    >
                      No items
                    </div>
                  ) : (
                    items.map(item => {
                      const emergency = isEmergency(item);
                      const isDragging = draggedItem?.id === item.id;

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={e => handleDragStart(e, item)}
                          style={{
                            background: 'var(--paper-card)',
                            border: '1px solid var(--rule)',
                            borderLeft: `3px solid ${getPriorityBorderColor(item.priority)}`,
                            borderRadius: '6px',
                            padding: '10px 12px',
                            cursor: 'grab',
                            opacity: isDragging ? 0.5 : 1,
                            boxShadow: emergency
                              ? `0 0 0 2px var(--st-overdue)`
                              : undefined,
                            transition: 'box-shadow 0.15s',
                          }}
                          onMouseEnter={e => {
                            if (!emergency) {
                              (e.currentTarget as HTMLDivElement).style.boxShadow =
                                'var(--shadow-lift)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!emergency) {
                              (e.currentTarget as HTMLDivElement).style.boxShadow = '';
                            }
                          }}
                          onMouseDown={e => {
                            (e.currentTarget as HTMLDivElement).style.cursor = 'grabbing';
                          }}
                          onMouseUp={e => {
                            (e.currentTarget as HTMLDivElement).style.cursor = 'grab';
                          }}
                        >
                          {/* Top row: code + urgent badge */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              gap: '8px',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                minWidth: 0,
                              }}
                            >
                              <GripVertical
                                style={{
                                  width: '12px',
                                  height: '12px',
                                  color: 'var(--ink-4)',
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                style={{
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: 'var(--ink)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {item.request_code}
                              </span>
                            </div>

                            {emergency && (
                              <span
                                style={{
                                  background: 'var(--st-overdue-bg)',
                                  color: 'var(--st-overdue)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  flexShrink: 0,
                                }}
                              >
                                <AlertCircle style={{ width: '10px', height: '10px' }} />
                                URGENT
                              </span>
                            )}
                          </div>

                          {/* Resident line */}
                          <p
                            style={{
                              fontSize: '11px',
                              color: 'var(--ink-3)',
                              marginTop: '4px',
                              marginBottom: 0,
                            }}
                          >
                            {item.resident} &bull; Unit {item.unit}
                          </p>

                          {/* Category / description box */}
                          <div
                            style={{
                              marginTop: '8px',
                              background: 'var(--paper-2)',
                              borderRadius: '4px',
                              padding: '6px 8px',
                            }}
                          >
                            <p
                              style={{
                                fontSize: '10px',
                                fontWeight: 600,
                                color: 'var(--ink-2)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                                margin: '0 0 2px 0',
                              }}
                            >
                              {item.category}
                            </p>
                            <p
                              style={{
                                fontSize: '11px',
                                color: 'var(--ink-3)',
                                margin: 0,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }}
                            >
                              {item.description}
                            </p>
                          </div>

                          {/* Bottom row: priority chip + technician */}
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '8px',
                            }}
                          >
                            <span
                              style={{
                                display: 'inline-flex',
                                padding: '2px 7px',
                                borderRadius: '999px',
                                fontSize: '10px',
                                fontWeight: 500,
                                textTransform: 'capitalize',
                                flexShrink: 0,
                                ...getPriorityChipStyle(item.priority),
                              }}
                            >
                              {item.priority}
                            </span>
                            <span
                              style={{
                                fontSize: '11px',
                                color: 'var(--ink-4)',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '60%',
                                textAlign: 'right',
                              }}
                              title={item.technician !== '-' ? item.technician : 'Unassigned'}
                            >
                              {item.technician !== '-' ? item.technician : 'Unassigned'}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Responsive override via a style tag */}
      <style>{`
        @media (max-width: 768px) {
          .kanban-grid {
            grid-template-columns: 1fr !important;
          }
          .kanban-page {
            padding: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
