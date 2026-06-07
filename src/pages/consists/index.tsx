import { useState } from 'react';
import { Plus, Layers } from 'lucide-react';
import { useConsistStore } from '@/store/useConsistStore';
import { Consist } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import ConsistCard from './ConsistCard';
import ConsistEditorModal from './ConsistEditorModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function ConsistsPage() {
  const { consists } = useConsistStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingConsist, setEditingConsist] = useState<Consist | null>(null);
  const [deleteConsist, setDeleteConsist] = useState<Consist | null>(null);

  const handleAdd = () => {
    setEditingConsist(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (consist: Consist) => {
    setEditingConsist(consist);
    setIsEditorOpen(true);
  };

  const handleDelete = (consist: Consist) => {
    setDeleteConsist(consist);
  };

  return (
    <div className="p-6">
      <PageHeader
        title="编组方案"
        description="管理你的列车编组组合"
        action={
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建编组
          </button>
        }
      />

      {consists.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-copper-500/10 flex items-center justify-center">
            <Layers className="w-8 h-8 text-copper-400" />
          </div>
          <h3 className="text-lg font-medium text-rail-200 mb-2">
            还没有编组方案
          </h3>
          <p className="text-rail-400 mb-4">
            创建编组方案，保存常用的列车组合
          </p>
          <button onClick={handleAdd} className="btn-primary">
            创建第一个编组
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {consists.map((consist) => (
            <ConsistCard
              key={consist.id}
              consist={consist}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ConsistEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        editConsist={editingConsist}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConsist}
        onClose={() => setDeleteConsist(null)}
        consist={deleteConsist}
      />
    </div>
  );
}
