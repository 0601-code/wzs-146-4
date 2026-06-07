import { useState, useEffect } from 'react';
import { IssueType, IssueMarker } from '@/types';
import { useTrackMapStore } from '@/store/useTrackMapStore';
import Modal from '@/components/ui/Modal';

interface IssueMarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  marker?: IssueMarker | null;
  defaultPosition?: { x: number; y: number };
  trackMapId: string;
}

const issueTypes: { value: IssueType; label: string; color: string }[] = [
  { value: 'stall', label: '卡顿', color: '#f39c12' },
  { value: 'derail', label: '脱轨', color: '#c0392b' },
  { value: 'other', label: '其他', color: '#4a698e' },
];

export default function IssueMarkerModal({
  isOpen,
  onClose,
  marker,
  defaultPosition,
  trackMapId,
}: IssueMarkerModalProps) {
  const { addIssueMarker, updateIssueMarker } = useTrackMapStore();
  const [type, setType] = useState<IssueType>('stall');
  const [description, setDescription] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (marker) {
      setType(marker.type);
      setDescription(marker.description);
      setPosition({ x: marker.x, y: marker.y });
    } else if (defaultPosition) {
      setPosition(defaultPosition);
      setType('stall');
      setDescription('');
    }
  }, [marker, defaultPosition, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackMapId) return;

    if (marker) {
      updateIssueMarker(marker.id, {
        type,
        description: description.trim(),
      });
    } else {
      addIssueMarker({
        trackMapId,
        x: position.x,
        y: position.y,
        type,
        description: description.trim(),
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={marker ? '编辑问题点' : '添加问题点'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label-text">问题类型</label>
          <div className="flex gap-2">
            {issueTypes.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                className={`flex-1 py-2 px-3 rounded-md border transition-all text-sm ${
                  type === t.value
                    ? 'border-opacity-100'
                    : 'bg-rail-700/50 border-rail-600 text-rail-300 hover:border-rail-500'
                }`}
                style={{
                  backgroundColor: type === t.value ? `${t.color}20` : undefined,
                  borderColor: type === t.value ? t.color : undefined,
                  color: type === t.value ? t.color : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label-text">位置</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-rail-500">X</label>
              <input
                type="number"
                value={Math.round(position.x)}
                onChange={(e) =>
                  setPosition((p) => ({ ...p, x: parseInt(e.target.value) || 0 }))
                }
                className="input-field"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-rail-500">Y</label>
              <input
                type="number"
                value={Math.round(position.y)}
                onChange={(e) =>
                  setPosition((p) => ({ ...p, y: parseInt(e.target.value) || 0 }))
                }
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label-text">描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field min-h-[80px] resize-y"
            placeholder="描述问题情况，如：3号道岔处容易脱轨..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {marker ? '保存修改' : '添加'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
