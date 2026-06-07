import { useState, useEffect } from 'react';
import { Consist, Vehicle } from '@/types';
import { useConsistStore } from '@/store/useConsistStore';
import { useVehicleStore } from '@/store/useVehicleStore';
import Modal from '@/components/ui/Modal';
import { Plus, Trash2, GripVertical, Train } from 'lucide-react';

interface ConsistEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  editConsist?: Consist | null;
}

export default function ConsistEditorModal({
  isOpen,
  onClose,
  editConsist,
}: ConsistEditorModalProps) {
  const { addConsist, updateConsist } = useConsistStore();
  const { vehicles, getVehicle } = useVehicleStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);

  useEffect(() => {
    if (editConsist) {
      setName(editConsist.name);
      setDescription(editConsist.description || '');
      setSelectedVehicleIds([...editConsist.vehicleIds]);
    } else {
      setName('');
      setDescription('');
      setSelectedVehicleIds([]);
    }
  }, [editConsist, isOpen]);

  const availableVehicles = vehicles.filter(
    (v) => !selectedVehicleIds.includes(v.id)
  );

  const handleAddVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) => [...prev, vehicleId]);
  };

  const handleRemoveVehicle = (vehicleId: string) => {
    setSelectedVehicleIds((prev) => prev.filter((id) => id !== vehicleId));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setSelectedVehicleIds((prev) => {
      const newIds = [...prev];
      [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
      return newIds;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedVehicleIds.length - 1) return;
    setSelectedVehicleIds((prev) => {
      const newIds = [...prev];
      [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
      return newIds;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const consistData = {
      name: name.trim(),
      description: description.trim() || undefined,
      vehicleIds: selectedVehicleIds,
    };

    if (editConsist) {
      updateConsist(editConsist.id, consistData);
    } else {
      addConsist(consistData);
    }
    onClose();
  };

  const VehicleItem = ({ vehicle, inConsist = false, index = 0 }: { vehicle: Vehicle; inConsist?: boolean; index?: number }) => (
    <div
      className={`flex items-center gap-3 p-3 rounded-md border transition-all ${
        inConsist
          ? 'bg-rail-700/30 border-copper-500/30'
          : 'bg-rail-800/50 border-rail-700/50 hover:border-rail-600'
      }`}
    >
      {inConsist && (
        <GripVertical className="w-4 h-4 text-rail-500 cursor-move flex-shrink-0" />
      )}
      <div
        className="w-10 h-7 rounded flex items-center justify-center text-xs flex-shrink-0"
        style={{
          backgroundColor: vehicle.color || (vehicle.type === 'locomotive' ? '#d4a574' : '#4a698e'),
          color: vehicle.type === 'locomotive' ? '#1a2a3a' : '#e4e9f0',
        }}
      >
        {vehicle.type === 'locomotive' ? '🚂' : '🚃'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-rail-100 text-sm truncate">{vehicle.model}</p>
        <p className="text-xs text-rail-400 truncate">{vehicle.roadNumber}</p>
      </div>
      {inConsist ? (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => handleMoveUp(index)}
            disabled={index === 0}
            className="p-1 text-rail-400 hover:text-rail-200 disabled:opacity-30"
          >
            ↑
          </button>
          <button
            onClick={() => handleMoveDown(index)}
            disabled={index === selectedVehicleIds.length - 1}
            className="p-1 text-rail-400 hover:text-rail-200 disabled:opacity-30"
          >
            ↓
          </button>
          <button
            onClick={() => handleRemoveVehicle(vehicle.id)}
            className="p-1 text-rail-400 hover:text-signal-red"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => handleAddVehicle(vehicle.id)}
          className="p-1 text-copper-400 hover:text-copper-300"
        >
          <Plus className="w-4 h-4" />
        </button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editConsist ? '编辑编组' : '新建编组'}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text">编组名称 *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="例如：客运列车 1 号"
              required
            />
          </div>
          <div>
            <label className="label-text">描述</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="可选"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text flex items-center gap-2">
              <Train className="w-4 h-4" />
              可用车辆 ({availableVehicles.length})
            </label>
            <div className="card p-2 space-y-2 max-h-80 overflow-y-auto">
              {availableVehicles.length === 0 ? (
                <p className="text-center text-rail-500 py-8 text-sm">
                  没有可用车辆
                </p>
              ) : (
                availableVehicles.map((vehicle) => (
                  <VehicleItem key={vehicle.id} vehicle={vehicle} />
                ))
              )}
            </div>
          </div>

          <div>
            <label className="label-text flex items-center justify-between">
              <span>当前编组 ({selectedVehicleIds.length})</span>
              <span className="text-xs text-rail-500">
                顺序：从前到后
              </span>
            </label>
            <div className="card p-2 space-y-2 max-h-80 overflow-y-auto min-h-[200px]">
              {selectedVehicleIds.length === 0 ? (
                <p className="text-center text-rail-500 py-8 text-sm">
                  点击左侧车辆添加到编组
                </p>
              ) : (
                selectedVehicleIds.map((id, index) => {
                  const vehicle = getVehicle(id);
                  if (!vehicle) return null;
                  return (
                    <VehicleItem
                      key={id}
                      vehicle={vehicle}
                      inConsist
                      index={index}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" className="btn-primary">
            {editConsist ? '保存修改' : '创建编组'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
