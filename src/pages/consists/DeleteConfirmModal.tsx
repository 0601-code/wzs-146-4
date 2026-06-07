import { Consist } from '@/types';
import { useConsistStore } from '@/store/useConsistStore';
import Modal from '@/components/ui/Modal';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  consist: Consist | null;
}

export default function DeleteConfirmModal({ isOpen, onClose, consist }: DeleteConfirmModalProps) {
  const { deleteConsist } = useConsistStore();

  const handleConfirm = () => {
    if (consist) {
      deleteConsist(consist.id);
      onClose();
    }
  };

  if (!consist) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="确认删除" size="sm">
      <div className="text-center py-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-signal-red/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-signal-red" />
        </div>
        <p className="text-rail-200 mb-2">
          确定要删除这个编组吗？
        </p>
        <p className="text-sm text-rail-400 mb-6">
          {consist.name}
        </p>
        <p className="text-xs text-rail-500 mb-6">
          此操作不可撤销，但车辆档案不会被删除。
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
