import { Vehicle } from '@/types';
import { useVehicleStore } from '@/store/useVehicleStore';
import Modal from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export default function DeleteConfirmModal({ isOpen, onClose, vehicle }: DeleteConfirmModalProps) {
  const { deleteVehicle } = useVehicleStore();

  const handleConfirm = () => {
    if (vehicle) {
      deleteVehicle(vehicle.id);
      onClose();
    }
  };

  if (!vehicle) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="确认删除" size="sm">
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-signal-red/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-signal-red" />
        </div>
        <p className="text-rail-200 mb-2">
          确定要删除这辆车吗？
        </p>
        <p className="text-sm text-rail-400 mb-6">
          {vehicle.model} - {vehicle.roadNumber}
        </p>
        <p className="text-xs text-rail-500 mb-6">
          此操作不可撤销，相关编组中的引用将保留 ID 但可能显示异常。
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button onClick={handleConfirm} className="btn-danger">
            确认删除
          </button>
        </div>
      </div>
    </Modal>
  );
}
