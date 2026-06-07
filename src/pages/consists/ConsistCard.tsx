import { Consist } from '@/types';
import { useVehicleStore } from '@/store/useVehicleStore';
import { Edit2, Trash2, Train } from 'lucide-react';

interface ConsistCardProps {
  consist: Consist;
  onEdit: (consist: Consist) => void;
  onDelete: (consist: Consist) => void;
}

export default function ConsistCard({ consist, onEdit, onDelete }: ConsistCardProps) {
  const { getVehicle } = useVehicleStore();

  const vehicles = consist.vehicleIds
    .map((id) => getVehicle(id))
    .filter(Boolean);

  const locomotiveCount = vehicles.filter((v) => v?.type === 'locomotive').length;
  const carCount = vehicles.filter((v) => v?.type === 'car').length;

  return (
    <div className="card-hover group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-rail-100">{consist.name}</h3>
            {consist.description && (
              <p className="text-sm text-rail-400 mt-0.5">{consist.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-locomotive">{locomotiveCount} 头</span>
            <span className="badge badge-car">{carCount} 节</span>
          </div>
        </div>

        <div className="flex items-center gap-1 py-3 overflow-x-auto">
          {vehicles.length === 0 ? (
            <p className="text-sm text-rail-500">暂无车辆</p>
          ) : (
            vehicles.map((vehicle, index) => (
              <div
                key={vehicle!.id}
                className="flex-shrink-0 flex flex-col items-center"
                title={`${vehicle!.model} - ${vehicle!.roadNumber}`}
              >
                <div
                  className="w-10 h-7 rounded flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: vehicle!.color || (vehicle!.type === 'locomotive' ? '#d4a574' : '#4a698e'),
                    color: vehicle!.type === 'locomotive' ? '#1a2a3a' : '#e4e9f0',
                  }}
                >
                  {vehicle!.type === 'locomotive' ? '🚂' : '🚃'}
                </div>
                <span className="text-[10px] text-rail-500 mt-1">
                  {index + 1}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-rail-700/50">
          <span className="text-xs text-rail-500">
            共 {vehicles.length} 辆车
          </span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(consist)}
              className="p-1.5 rounded-md hover:bg-rail-700/50 text-rail-400 hover:text-copper-400 transition-colors"
              title="编辑"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(consist)}
              className="p-1.5 rounded-md hover:bg-signal-red/10 text-rail-400 hover:text-signal-red transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
