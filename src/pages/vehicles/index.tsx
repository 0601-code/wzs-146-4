import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useVehicleStore } from '@/store/useVehicleStore';
import { Vehicle, VehicleType } from '@/types';
import PageHeader from '@/components/ui/PageHeader';
import VehicleCard from './VehicleCard';
import VehicleFormModal from './VehicleFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function VehiclesPage() {
  const { vehicles, searchVehicles } = useVehicleStore();
  const [filterType, setFilterType] = useState<VehicleType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<Vehicle | null>(null);

  const filteredVehicles = searchVehicles(searchQuery).filter((v) => {
    if (filterType === 'all') return true;
    return v.type === filterType;
  });

  const handleAdd = () => {
    setEditingVehicle(null);
    setIsFormOpen(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  const handleDelete = (vehicle: Vehicle) => {
    setDeleteVehicle(vehicle);
  };

  const locomotiveCount = vehicles.filter((v) => v.type === 'locomotive').length;
  const carCount = vehicles.filter((v) => v.type === 'car').length;

  return (
    <div className="p-6">
      <PageHeader
        title="车辆档案"
        description="管理你的车头和车厢收藏"
        action={
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加车辆
          </button>
        }
      />

      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-1">
          {[
            { key: 'all', label: `全部 (${vehicles.length})` },
            { key: 'locomotive', label: `车头 (${locomotiveCount})` },
            { key: 'car', label: `车厢 (${carCount})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key as VehicleType | 'all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filterType === tab.key
                  ? 'bg-copper-500/20 text-copper-400 border border-copper-500/30'
                  : 'text-rail-400 hover:text-rail-200 hover:bg-rail-700/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 max-w-xs ml-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rail-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索型号或车号..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {filteredVehicles.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🚂</div>
          <h3 className="text-lg font-medium text-rail-200 mb-2">
            {searchQuery ? '没有找到匹配的车辆' : '还没有添加车辆'}
          </h3>
          <p className="text-rail-400 mb-4">
            {searchQuery ? '试试其他关键词' : '点击上方按钮添加你的第一辆车'}
          </p>
          {!searchQuery && (
            <button onClick={handleAdd} className="btn-primary">
              添加第一辆车
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredVehicles.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <VehicleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editVehicle={editingVehicle}
      />

      <DeleteConfirmModal
        isOpen={!!deleteVehicle}
        onClose={() => setDeleteVehicle(null)}
        vehicle={deleteVehicle}
      />
    </div>
  );
}
