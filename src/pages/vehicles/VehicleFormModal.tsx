import { useState, useEffect } from 'react';
import { Vehicle, VehicleType, GAUGE_OPTIONS } from '@/types';
import { useVehicleStore } from '@/store/useVehicleStore';
import Modal from '@/components/ui/Modal';

interface VehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editVehicle?: Vehicle | null;
}

export default function VehicleFormModal({ isOpen, onClose, editVehicle }: VehicleFormModalProps) {
  const { addVehicle, updateVehicle } = useVehicleStore();
  const [formData, setFormData] = useState({
    type: 'locomotive' as VehicleType,
    model: '',
    roadNumber: '',
    gauge: 'HO',
    year: '',
    color: '',
    notes: '',
  });

  useEffect(() => {
    if (editVehicle) {
      setFormData({
        type: editVehicle.type,
        model: editVehicle.model,
        roadNumber: editVehicle.roadNumber,
        gauge: editVehicle.gauge,
        year: editVehicle.year?.toString() || '',
        color: editVehicle.color || '',
        notes: editVehicle.notes || '',
      });
    } else {
      setFormData({
        type: 'locomotive',
        model: '',
        roadNumber: '',
        gauge: 'HO',
        year: '',
        color: '',
        notes: '',
      });
    }
  }, [editVehicle, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.model.trim() || !formData.roadNumber.trim()) return;

    const vehicleData = {
      type: formData.type,
      model: formData.model.trim(),
      roadNumber: formData.roadNumber.trim(),
      gauge: formData.gauge,
      year: formData.year ? parseInt(formData.year) : undefined,
      color: formData.color.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    if (editVehicle) {
      updateVehicle(editVehicle.id, vehicleData);
    } else {
      addVehicle(vehicleData);
    }
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editVehicle ? '编辑车辆' : '添加车辆'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">车辆类型</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleChange('type', 'locomotive')}
                className={`flex-1 py-2 px-3 rounded-md border transition-all ${
                  formData.type === 'locomotive'
                    ? 'bg-copper-500/20 border-copper-500/50 text-copper-400'
                    : 'bg-rail-700/50 border-rail-600 text-rail-300 hover:border-rail-500'
                }`}
              >
                车头
              </button>
              <button
                type="button"
                onClick={() => handleChange('type', 'car')}
                className={`flex-1 py-2 px-3 rounded-md border transition-all ${
                  formData.type === 'car'
                    ? 'bg-copper-500/20 border-copper-500/50 text-copper-400'
                    : 'bg-rail-700/50 border-rail-600 text-rail-300 hover:border-rail-500'
                }`}
              >
                车厢
              </button>
            </div>
          </div>

          <div>
            <label className="label-text">轨距</label>
            <select
              value={formData.gauge}
              onChange={(e) => handleChange('gauge', e.target.value)}
              className="input-field"
            >
              {GAUGE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">型号 *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="input-field"
              placeholder="例如：SS9、25G"
              required
            />
          </div>
          <div>
            <label className="label-text">车号 *</label>
            <input
              type="text"
              value={formData.roadNumber}
              onChange={(e) => handleChange('roadNumber', e.target.value)}
              className="input-field"
              placeholder="例如：0001、12345"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">生产年份</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', e.target.value)}
              className="input-field"
              placeholder="可选"
            />
          </div>
          <div>
            <label className="label-text">涂装颜色</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={formData.color || '#4a698e'}
                onChange={(e) => handleChange('color', e.target.value)}
                className="w-10 h-10 rounded cursor-pointer border border-rail-600"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="input-field flex-1"
                placeholder="例如：#c0392b"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="label-text">备注</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="input-field min-h-[80px] resize-y"
            placeholder="记录车辆状态、来源、特殊说明等..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {editVehicle ? '保存修改' : '添加车辆'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
