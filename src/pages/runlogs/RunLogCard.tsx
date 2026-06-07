import { RunLog } from '@/types';
import { useConsistStore } from '@/store/useConsistStore';
import { formatDate, formatDuration } from '@/utils';
import { Edit2, Trash2, Clock, Zap, Route, AlertTriangle, Sparkles } from 'lucide-react';

interface RunLogCardProps {
  log: RunLog;
  onEdit: (log: RunLog) => void;
  onDelete: (log: RunLog) => void;
}

export default function RunLogCard({ log, onEdit, onDelete }: RunLogCardProps) {
  const { getConsist } = useConsistStore();
  const consist = log.consistId ? getConsist(log.consistId) : null;

  const hasIssues = !!log.issues?.trim();

  return (
    <div className="card-hover group">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-copper-500/10 flex flex-col items-center justify-center">
              <span className="text-xs text-copper-400 font-medium">
                {formatDate(log.date).split('/')[1]}
              </span>
              <span className="text-lg font-bold text-copper-300 -mt-1">
                {formatDate(log.date).split('/')[2]}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-rail-100">{log.route}</h3>
              {consist && (
                <p className="text-sm text-rail-400">{consist.name}</p>
              )}
            </div>
          </div>
          <span
            className={`badge ${
              hasIssues ? 'badge-danger' : 'badge-success'
            }`}
          >
            {hasIssues ? '有故障' : '正常'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-rail-500" />
            <span className="text-rail-300">{formatDuration(log.durationMinutes)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-rail-500" />
            <span className="text-rail-300">{log.powerLevel}</span>
          </div>
        </div>

        {log.issues && (
          <div className="mb-3 p-2 rounded-md bg-signal-red/10 border border-signal-red/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-signal-red flex-shrink-0 mt-0.5" />
              <p className="text-sm text-signal-red/80">{log.issues}</p>
            </div>
          </div>
        )}

        {log.cleaningNotes && (
          <div className="mb-3 p-2 rounded-md bg-signal-green/10 border border-signal-green/20">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-signal-green flex-shrink-0 mt-0.5" />
              <p className="text-sm text-signal-green/80">{log.cleaningNotes}</p>
            </div>
          </div>
        )}

        {log.notes && (
          <p className="text-sm text-rail-400 line-clamp-2 mb-3">
            {log.notes}
          </p>
        )}

        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 border-t border-rail-700/50">
          <button
            onClick={() => onEdit(log)}
            className="p-1.5 rounded-md hover:bg-rail-700/50 text-rail-400 hover:text-copper-400 transition-colors"
            title="编辑"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(log)}
            className="p-1.5 rounded-md hover:bg-signal-red/10 text-rail-400 hover:text-signal-red transition-colors"
            title="删除"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
