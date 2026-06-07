import { Vehicle } from '@/types';
import { Edit2, Trash2 } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, onEdit, onDelete }: VehicleCardProps) {
  const isLocomotive = vehicle.type === 'locomotive';

  return (
    <div className="card-hover group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-8 rounded-md flex items-center justify-center text-xs font-bold"
              style={{
                backgroundColor: vehicle.color || (isLocomotive ? '#d4a574' : '#4a698e'),
                color: isLocomotive ? '#1a2a3a' : '#e4e9f0',
              }}
            >
              {isLocomotive ? '🚂' : '🚃'}
            </div>
            <div>
              <h3 className="font-semibold text-rail-100">{vehicle.model}</h3>
              <p className="text-sm text-rail-400">{vehicle.roadNumber}</p>
            </div>
          </div>
          <span className={`badge ${isLocomotive ? 'badge-locomotive' : 'badge-car'}`}>
            {isLocomotive ? '车头' : '车厢'}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm text-rail-400 mb-3">
          <span>轨距: {vehicle.gauge}</span>
          {vehicle.year && <span>年份: {vehicle.year}</span>}
        </div>

        {vehicle.notes && (
          <p className="text-sm text-rail-400 line-clamp-2 mb-3">
            {vehicle.notes}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(vehicle)}
            className="p-2 rounded-md hover:bg-rail-700/50 text-rail-400 hover:text-copper-400 transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(vehicle)}
            className="p-2 rounded-md hover:bg-signal-red/10 text-rail-400 hover:text-signal-red transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
