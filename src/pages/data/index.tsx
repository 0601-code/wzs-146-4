import { useState, useRef } from 'react';
import {
  Download,
  Upload,
  Trash2,
  Database,
  Train,
  Layers,
  Clock,
  Map,
  AlertTriangle,
  Check,
} from 'lucide-react';
import {
  downloadExportData,
  importDataFromFile,
  applyImportData,
  clearAllData,
  getDataStats,
} from '@/utils/importExport';
import PageHeader from '@/components/ui/PageHeader';
import Modal from '@/components/ui/Modal';

export default function DataPage() {
  const [stats, setStats] = useState(getDataStats());
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [importData, setImportData] = useState<any>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshStats = () => {
    setStats(getDataStats());
  };

  const handleExport = () => {
    downloadExportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await importDataFromFile(file);
      setImportData(data);
      setShowImportConfirm(true);
    } catch (err) {
      alert('导入失败：' + (err as Error).message);
    }

    e.target.value = '';
  };

  const handleConfirmImport = () => {
    if (!importData) return;
    applyImportData(importData, importMode === 'merge');
    setImportSuccess(true);
    setTimeout(() => {
      setShowImportConfirm(false);
      setImportSuccess(false);
      setImportData(null);
      refreshStats();
      window.dispatchEvent(new Event('railway-data-refreshed'));
      window.location.reload();
    }, 1500);
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    refreshStats();
    window.dispatchEvent(new Event('railway-data-refreshed'));
    window.location.reload();
  };

  const statItems = [
    { label: '车辆', value: stats.vehicles, icon: Train, color: 'text-copper-400' },
    { label: '编组', value: stats.consists, icon: Layers, color: 'text-signal-green' },
    { label: '运行记录', value: stats.runLogs, icon: Clock, color: 'text-signal-yellow' },
    { label: '轨道图', value: stats.trackMaps, icon: Map, color: 'text-rail-300' },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <PageHeader
        title="数据管理"
        description="管理你的本地数据，支持导入导出备份"
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statItems.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="card p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-rail-700/50 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-sm text-rail-400">{item.label}</p>
                  <p className="text-xl font-bold text-rail-100">{item.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="w-12 h-12 rounded-xl bg-signal-green/10 flex items-center justify-center mb-4">
            <Download className="w-6 h-6 text-signal-green" />
          </div>
          <h3 className="text-lg font-semibold text-rail-100 mb-2">
            导出数据
          </h3>
          <p className="text-sm text-rail-400 mb-4">
            将所有数据导出为 JSON 文件，用于备份或迁移到其他设备。
          </p>
          <button onClick={handleExport} className="btn-secondary w-full flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            导出 JSON
          </button>
        </div>

        <div className="card p-6">
          <div className="w-12 h-12 rounded-xl bg-copper-500/10 flex items-center justify-center mb-4">
            <Upload className="w-6 h-6 text-copper-400" />
          </div>
          <h3 className="text-lg font-semibold text-rail-100 mb-2">
            导入数据
          </h3>
          <p className="text-sm text-rail-400 mb-4">
            从 JSON 文件导入数据，可以选择替换或合并现有数据。
          </p>
          <button onClick={handleImportClick} className="btn-primary w-full flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" />
            选择文件
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="card p-6 border-signal-red/30">
          <div className="w-12 h-12 rounded-xl bg-signal-red/10 flex items-center justify-center mb-4">
            <Trash2 className="w-6 h-6 text-signal-red" />
          </div>
          <h3 className="text-lg font-semibold text-rail-100 mb-2">
            清空数据
          </h3>
          <p className="text-sm text-rail-400 mb-4">
            永久删除所有本地存储的数据，此操作不可撤销。
          </p>
          <button
            onClick={() => setShowClearConfirm(true)}
            className="btn-danger w-full flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            清空所有数据
          </button>
        </div>
      </div>

      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold text-rail-100 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-copper-400" />
          关于数据存储
        </h3>
        <div className="text-sm text-rail-400 space-y-2">
          <p>• 所有数据保存在浏览器的 LocalStorage 中</p>
          <p>• 清除浏览器数据会导致数据丢失，请定期导出备份</p>
          <p>• 数据仅保存在当前设备，不会上传到任何服务器</p>
          <p>• 建议定期导出数据文件作为备份</p>
          <p>• 支持在不同设备间通过导入导出同步数据</p>
        </div>
      </div>

      <Modal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="确认清空数据"
        size="sm"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-signal-red/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-signal-red" />
          </div>
          <p className="text-rail-200 mb-2 font-medium">
            确定要清空所有数据吗？
          </p>
          <p className="text-sm text-signal-red/80 mb-6">
            此操作将永久删除所有车辆、编组、运行记录和轨道图数据，且无法恢复。
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button onClick={handleClearData} className="btn-danger">
              确认清空
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showImportConfirm}
        onClose={() => {
          setShowImportConfirm(false);
          setImportData(null);
        }}
        title="导入数据确认"
        size="md"
      >
        {importSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-signal-green/10 flex items-center justify-center animate-pulse">
              <Check className="w-8 h-8 text-signal-green" />
            </div>
            <p className="text-rail-100 font-medium">导入成功！</p>
            <p className="text-sm text-rail-400 mt-1">页面即将刷新...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-rail-300">
              检测到以下数据将要导入：
            </p>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '车辆', value: importData?.vehicles?.length || 0 },
                { label: '编组', value: importData?.consists?.length || 0 },
                { label: '运行记录', value: importData?.runLogs?.length || 0 },
                { label: '轨道图', value: importData?.trackMaps?.length || 0 },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-rail-900/50 rounded-md p-3 text-center"
                >
                  <p className="text-2xl font-bold text-copper-400">
                    {item.value}
                  </p>
                  <p className="text-xs text-rail-500">{item.label}</p>
                </div>
              ))}
            </div>

            <div>
              <label className="label-text">导入方式</label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 rounded-md border border-rail-700 cursor-pointer hover:border-rail-600 transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-1 accent-copper-500"
                  />
                  <div>
                    <p className="font-medium text-rail-200">替换现有数据</p>
                    <p className="text-xs text-rail-500">
                      删除所有现有数据，然后导入新数据
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 rounded-md border border-rail-700 cursor-pointer hover:border-rail-600 transition-colors">
                  <input
                    type="radio"
                    name="importMode"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mt-1 accent-copper-500"
                  />
                  <div>
                    <p className="font-medium text-rail-200">合并到现有数据</p>
                    <p className="text-xs text-rail-500">
                      保留现有数据，将导入的数据追加到后面
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setShowImportConfirm(false);
                  setImportData(null);
                }}
                className="btn-secondary"
              >
                取消
              </button>
              <button onClick={handleConfirmImport} className="btn-primary">
                确认导入
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
