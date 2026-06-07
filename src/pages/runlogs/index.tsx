import { useState } from 'react';
import { Plus, Clock, Calendar, BarChart3 } from 'lucide-react';
import { useRunLogStore } from '@/store/useRunLogStore';
import { RunLog } from '@/types';
import { formatDuration } from '@/utils';
import PageHeader from '@/components/ui/PageHeader';
import RunLogCard from './RunLogCard';
import RunLogFormModal from './RunLogFormModal';
import DeleteConfirmModal from './DeleteConfirmModal';
import dayjs from 'dayjs';

export default function RunLogsPage() {
  const { runLogs, getTotalDuration } = useRunLogStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<RunLog | null>(null);
  const [deleteLog, setDeleteLog] = useState<RunLog | null>(null);

  const handleAdd = () => {
    setEditingLog(null);
    setIsFormOpen(true);
  };

  const handleEdit = (log: RunLog) => {
    setEditingLog(log);
    setIsFormOpen(true);
  };

  const handleDelete = (log: RunLog) => {
    setDeleteLog(log);
  };

  const totalDuration = getTotalDuration();
  const thisMonthLogs = runLogs.filter((log) =>
    dayjs(log.date).isSame(dayjs(), 'month')
  );
  const thisMonthDuration = thisMonthLogs.reduce(
    (total, log) => total + log.durationMinutes,
    0
  );

  const logsByDate = runLogs.reduce((groups, log) => {
    const date = dayjs(log.date).format('YYYY-MM-DD');
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(log);
    return groups;
  }, {} as Record<string, RunLog[]>);

  const sortedDates = Object.keys(logsByDate).sort((a, b) =>
    dayjs(b).valueOf() - dayjs(a).valueOf()
  );

  return (
    <div className="p-6">
      <PageHeader
        title="运行日志"
        description="记录每次跑车的详细信息"
        action={
          <button onClick={handleAdd} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加记录
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-copper-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-copper-400" />
            </div>
            <div>
              <p className="text-sm text-rail-400">总运行次数</p>
              <p className="text-2xl font-bold text-rail-100">{runLogs.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-signal-green/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-signal-green" />
            </div>
            <div>
              <p className="text-sm text-rail-400">累计时长</p>
              <p className="text-2xl font-bold text-rail-100">
                {formatDuration(totalDuration)}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-signal-yellow/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-signal-yellow" />
            </div>
            <div>
              <p className="text-sm text-rail-400">本月时长</p>
              <p className="text-2xl font-bold text-rail-100">
                {formatDuration(thisMonthDuration)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {runLogs.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">🚂</div>
          <h3 className="text-lg font-medium text-rail-200 mb-2">
            还没有运行记录
          </h3>
          <p className="text-rail-400 mb-4">
            记录每次跑车的线路、时长和问题
          </p>
          <button onClick={handleAdd} className="btn-primary">
            添加第一条记录
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-rail-400 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {dayjs(date).format('YYYY年MM月DD日 dddd')}
                <span className="text-xs text-rail-500">
                  ({logsByDate[date].length} 条记录)
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {logsByDate[date].map((log) => (
                  <RunLogCard
                    key={log.id}
                    log={log}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <RunLogFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editLog={editingLog}
      />

      <DeleteConfirmModal
        isOpen={!!deleteLog}
        onClose={() => setDeleteLog(null)}
        log={deleteLog}
      />
    </div>
  );
}
