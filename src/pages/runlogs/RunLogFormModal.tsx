import { useState, useEffect, useMemo } from 'react';
import { RunLog, POWER_LEVEL_OPTIONS } from '@/types';
import { useRunLogStore } from '@/store/useRunLogStore';
import { useConsistStore } from '@/store/useConsistStore';
import { useTrackMapStore } from '@/store/useTrackMapStore';
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
  const { trackMaps, trackSections } = useTrackMapStore();

  const [formData, setFormData] = useState({
    consistId: '',
    date: dayjs().format('YYYY-MM-DD'),
    route: '',
    sectionIds: [] as string[],
    durationMinutes: 30,
    powerLevel: '中速',
    issues: '',
    cleaningNotes: '',
    notes: '',
  });

  const allSections = useMemo(() => {
    return trackSections.map((s) => {
      const map = trackMaps.find((m) => m.id === s.trackMapId);
      return { ...s, mapName: map?.name || '未知轨道图' };
    });
  }, [trackSections, trackMaps]);

  useEffect(() => {
    if (editLog) {
      setFormData({
        consistId: editLog.consistId || '',
        date: dayjs(editLog.date).format('YYYY-MM-DD'),
        route: editLog.route,
        sectionIds: editLog.sectionIds || [],
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
        sectionIds: [],
        durationMinutes: 30,
        powerLevel: '中速',
        issues: '',
        cleaningNotes: '',
        notes: '',
      });
    }
  }, [editLog, isOpen, consists]);

  const handleToggleSection = (sectionId: string) => {
    setFormData((prev) => {
      if (prev.sectionIds.includes(sectionId)) {
        return { ...prev, sectionIds: prev.sectionIds.filter((id) => id !== sectionId) };
      } else {
        return { ...prev, sectionIds: [...prev.sectionIds, sectionId] };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.route.trim()) return;

    const selectedSectionNames = allSections
      .filter((s) => formData.sectionIds.includes(s.id))
      .map((s) => s.name);

    const logData = {
      consistId: formData.consistId || undefined,
      date: formData.date,
      route: formData.route.trim(),
      sectionIds: formData.sectionIds.length > 0 ? formData.sectionIds : undefined,
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

        {allSections.length > 0 && (
          <div>
            <label className="label-text">经过的区段</label>
            <div className="card p-2 max-h-40 overflow-y-auto space-y-1">
              {allSections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-rail-700/30 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={formData.sectionIds.includes(section.id)}
                    onChange={() => handleToggleSection(section.id)}
                    className="rounded border-rail-600 bg-rail-800 text-copper-500 focus:ring-copper-500"
                  />
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: section.color || '#d4a574' }}
                  />
                  <span className="text-rail-200 text-sm flex-1 truncate">
                    {section.name}
                  </span>
                  <span className="text-rail-500 text-xs">
                    {section.mapName}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

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
