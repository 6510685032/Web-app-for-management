import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, GripVertical } from 'lucide-react';
import StatusBadge from '../shared/StatusBadge';
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

const COLUMNS = [
  { key: 'pending', label: 'Pending', color: 'border-yellow-400 bg-yellow-50' },
  { key: 'assigned', label: 'Assigned', color: 'border-purple-400 bg-purple-50' },
  { key: 'in-progress', label: 'In Progress', color: 'border-blue-400 bg-blue-50' },
  { key: 'completed', label: 'Completed', color: 'border-green-400 bg-green-50' },
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

export default function KanbanBoard() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<RequestItem | null>(null);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500 bg-red-50';
      case 'medium': return 'border-l-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const isEmergency = (item: RequestItem) =>
    item.priority === 'high' && EMERGENCY_CATEGORIES.includes(item.category);

  return (
    <div className="max-w-full mx-auto p-6">
      <button
        onClick={() => navigate('/officer')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Repair Queue Board</h1>
        <p className="text-blue-600">Drag and drop cards to change status. Emergency items are auto-bumped to top.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-blue-600 font-medium">Loading board...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 min-h-[70vh]">
          {COLUMNS.map(col => {
            const items = getColumnItems(col.key);
            return (
              <div
                key={col.key}
                className={`rounded-xl border-t-4 ${col.color} shadow-lg overflow-hidden flex flex-col`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="p-4 border-b border-blue-100">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-blue-900">{col.label}</h2>
                    <span className="px-2 py-0.5 bg-white text-blue-700 rounded-full text-xs font-medium shadow-sm">
                      {items.length}
                    </span>
                  </div>
                </div>

                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[65vh]">
                  {items.map(item => (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item)}
                      className={`bg-white border-l-4 ${getPriorityColor(item.priority)} rounded-lg p-3 shadow-sm hover:shadow-md cursor-grab active:cursor-grabbing transition-all ${
                        isEmergency(item) ? 'ring-2 ring-red-400 ring-offset-1' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex items-center gap-1 min-w-0">
                          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="font-medium text-blue-900 text-sm truncate">{item.request_code}</span>
                        </div>
                        {isEmergency(item) && (
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold animate-pulse flex-shrink-0">
                            <AlertCircle className="w-3 h-3" />
                            URGENT
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-blue-700 mb-1">{item.resident} • Unit {item.unit}</p>
                      <div className="bg-blue-50 p-2 rounded mb-2">
                        <p className="text-xs font-medium text-blue-900">{item.category}</p>
                        <p className="text-xs text-blue-600 line-clamp-2">{item.description}</p>
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2">
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium capitalize flex-shrink-0 ${
                          item.priority === 'high' ? 'bg-red-100 text-red-700' :
                          item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-xs text-blue-500 truncate" title={item.technician !== '-' ? item.technician : 'Unassigned'}>
                          {item.technician !== '-' ? item.technician : 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  ))}

                  {items.length === 0 && (
                    <div className="text-center py-8 text-blue-400 text-sm">
                      No items
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
