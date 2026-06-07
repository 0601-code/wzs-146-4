import { useState, useEffect } from 'react';
import { RunLog, POWER_LEVEL_OPTIONS } from '@/types';
import { useRunLogStore } from '@/store/useRunLogStore';
import { useConsistStore } from '@/store/useConsistStore';
import Modal from '@/components/ui/Modal';
import dayjs from 'dayjs';

interface RunLogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editLog?: RunLog | null;
}

export default function RunLogFormModal({ isOpen, onClose, editLog }: RunLogFormModalProps) {
  const { addRunLog, updateRunLog } = useRunLogStore();
  const { consists } = useConsistStore();

  const [formData, setFormData] = useState({
    consistId: '',
    date: dayjs().format('YYYY-MM-DD'),
    route: '',
    durationMinutes: 30,
    powerLevel: '中速',
    issues: '',
    cleaningNotes: '',
    notes: '',
  });

  useEffect(() => {
    if (editLog) {
      setFormData({
        consistId: editLog.consistId || '',
        date: dayjs(editLog.date).format('YYYY-MM-DD'),
        route: editLog.route,
        durationMinutes: editLog.durationMinutes,
        powerLevel: editLog.powerLevel,
        issues: editLog.issues || '',
        cleaningNotes: editLog.cleaningNotes || '',
        notes: editLog.notes || '',
      });
    } else {
      setFormData({
        consistId: consists[0]?.id || '',
        date: dayjs().format('YYYY-MM-DD'),
        route: '',
        durationMinutes: 30,
        powerLevel: '中速',
        issues: '',
        cleaningNotes: '',
        notes: '',
      });
    }
  }, [editLog, isOpen, consists]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route.trim()) return;

    const logData = {
      consistId: formData.consistId || undefined,
      date: formData.date,
      route: formData.route.trim(),
      durationMinutes: formData.durationMinutes,
      powerLevel: formData.powerLevel,
      issues: formData.issues.trim() || undefined,
      cleaningNotes: formData.cleaningNotes.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (editLog) {
      updateRunLog(editLog.id, logData);
    } else {
      addRunLog(logData);
    }
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editLog ? '编辑运行记录' : '添加运行记录'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">日期</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="label-text">运行时长（分钟）</label>
            <input
              type="number"
              min="1"
              value={formData.durationMinutes}
              onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value) || 0)}
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">使用编组</label>
            <select
              value={formData.consistId}
              onChange={(e) => handleChange('consistId', e.target.value)}
              className="input-field"
            >
              <option value="">-- 不选编组 --</option>
              {consists.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-text">电源档位</label>
            <select
              value={formData.powerLevel}
              onChange={(e) => handleChange('powerLevel', e.target.value)}
              className="input-field"
            >
              {POWER_LEVEL_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label-text">线路/区段 *</label>
          <input
            type="text"
            value={formData.route}
            onChange={(e) => handleChange('route', e.target.value)}
            className="input-field"
            placeholder="例如：内环完整一圈、A站到B站"
            required
          />
        </div>

        <div>
          <label className="label-text">故障/问题点</label>
          <textarea
            value={formData.issues}
            onChange={(e) => handleChange('issues', e.target.value)}
            className="input-field min-h-[60px] resize-y"
            placeholder="记录运行中遇到的问题，如脱轨、卡顿、异响等..."
          />
        </div>

        <div>
          <label className="label-text">清洁情况</label>
          <textarea
            value={formData.cleaningNotes}
            onChange={(e) => handleChange('cleaningNotes', e.target.value)}
            className="input-field min-h-[60px] resize-y"
            placeholder="记录车辆清洁、保养情况..."
          />
        </div>

        <div>
          <label className="label-text">备注</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field min-h-[60px] resize-y"
            placeholder="其他备注信息..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {editLog ? '保存修改' : '添加记录'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
