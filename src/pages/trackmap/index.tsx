import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MousePointer2,
  Minus,
  GitBranch,
  AlertTriangle,
  Plus,
  Trash2,
  Settings,
  ChevronDown,
  Map,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import { useTrackMapStore, getIssueTypeLabel, getIssueTypeColor } from '@/store/useTrackMapStore';
import { IssueMarker, TrackElement } from '@/types';
import Modal from '@/components/ui/Modal';
import TrackCanvas, { TrackCanvasRef } from './TrackCanvas';
import IssueMarkerModal from './IssueMarkerModal';

type Tool = 'select' | 'straight' | 'curve' | 'switch' | 'issue';

const tools: { id: Tool; label: string; icon: LucideIcon }[] = [
  { id: 'select', label: '选择', icon: MousePointer2 },
  { id: 'straight', label: '直轨', icon: Minus },
  { id: 'curve', label: '弯道', icon: GitBranch },
  { id: 'switch', label: '道岔', icon: GitBranch },
  { id: 'issue', label: '问题点', icon: AlertTriangle },
];

export default function TrackMapPage() {
  const navigate = useNavigate();
  const {
    trackMaps,
    activeTrackMapId,
    addTrackMap,
    deleteTrackMap,
    setActiveTrackMap,
    addTrackElement,
    updateTrackElement,
    deleteTrackElement,
    getTrackElementsByMap,
    getIssueMarkersByMap,
    updateIssueMarker,
    deleteIssueMarker,
  } = useTrackMapStore();

  const canvasRef = useRef<TrackCanvasRef>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [newMapName, setNewMapName] = useState('');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [editingIssue, setEditingIssue] = useState<IssueMarker | null>(null);
  const [newIssuePosition, setNewIssuePosition] = useState<{ x: number; y: number } | null>(null);
  const [showMapList, setShowMapList] = useState(false);
  const [currentScale, setCurrentScale] = useState(1);

  const activeTrackMap = trackMaps.find((m) => m.id === activeTrackMapId);
  const currentTrackElements = activeTrackMapId ? getTrackElementsByMap(activeTrackMapId) : [];
  const currentIssueMarkers = activeTrackMapId ? getIssueMarkersByMap(activeTrackMapId) : [];

  const selectedTrackElement = currentTrackElements.find((e) => e.id === selectedElementId);
  const selectedIssue = currentIssueMarkers.find(
    (m) => `issue-${m.id}` === selectedElementId
  );

  useEffect(() => {
    if (trackMaps.length > 0 && !activeTrackMapId) {
      setActiveTrackMap(trackMaps[0].id);
    }
  }, [trackMaps, activeTrackMapId, setActiveTrackMap]);

  const handleCreateMap = () => {
    if (!newMapName.trim()) return;
    const id = addTrackMap({
      name: newMapName.trim(),
      width: 800,
      height: 600,
    });
    setActiveTrackMap(id);
    setNewMapName('');
    setIsMapModalOpen(false);
  };

  const handleAddTrackElement = (element: Omit<TrackElement, 'id'>) => {
    if (!activeTrackMapId) return;
    addTrackElement({ ...element, trackMapId: activeTrackMapId });
  };

  const handleUpdateTrackElement = (id: string, data: Partial<TrackElement>) => {
    updateTrackElement(id, data);
  };

  const handleDeleteElement = (id: string) => {
    if (id.startsWith('issue-')) {
      const issueId = id.replace('issue-', '');
      deleteIssueMarker(issueId);
    } else {
      deleteTrackElement(id);
    }
    setSelectedElementId(null);
  };

  const handleAddIssueMarker = (x: number, y: number) => {
    if (!activeTrackMapId) return;
    setNewIssuePosition({ x, y });
    setEditingIssue(null);
    setIsIssueModalOpen(true);
  };

  const handleSelectIssueMarker = (marker: IssueMarker) => {
    setEditingIssue(marker);
    setSelectedElementId(`issue-${marker.id}`);
  };

  const handleEditIssue = () => {
    if (selectedIssue) {
      setEditingIssue(selectedIssue);
      setIsIssueModalOpen(true);
    }
  };

  const handleZoomIn = () => {
    canvasRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    canvasRef.current?.zoomOut();
  };

  const handleZoomToFit = () => {
    canvasRef.current?.zoomToFit();
  };

  const handleResetZoom = () => {
    canvasRef.current?.resetZoom();
  };

  const scalePercent = Math.round(currentScale * 100);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="p-4 border-b border-rail-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-md hover:bg-rail-700/50 text-rail-400 hover:text-copper-400 transition-colors"
            title="返回"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-rail-700" />
          <h1 className="font-display text-xl font-bold text-copper-400 tracking-wide flex items-center gap-2">
            <Map className="w-5 h-5" />
            轨道图
          </h1>

          <div className="relative">
            <button
              onClick={() => setShowMapList(!showMapList)}
              className="btn-secondary flex items-center gap-2 min-w-[180px] justify-between"
            >
              <span className="truncate">
                {activeTrackMap?.name || '选择轨道图'}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showMapList && (
              <div className="absolute top-full left-0 mt-1 w-full card z-10 py-1">
                {trackMaps.length === 0 ? (
                  <p className="px-4 py-2 text-sm text-rail-500">暂无轨道图</p>
                ) : (
                  trackMaps.map((map) => (
                    <button
                      key={map.id}
                      onClick={() => {
                        setActiveTrackMap(map.id);
                        setShowMapList(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm hover:bg-rail-700/50 transition-colors ${
                        map.id === activeTrackMapId
                          ? 'text-copper-400'
                          : 'text-rail-300'
                      }`}
                    >
                      {map.name}
                    </button>
                  ))
                )}
                <div className="border-t border-rail-700/50 mt-1 pt-1">
                  <button
                    onClick={() => {
                      setIsMapModalOpen(true);
                      setShowMapList(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-copper-400 hover:bg-rail-700/50 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    新建轨道图
                  </button>
                </div>
              </div>
            )}
          </div>

          {activeTrackMap && (
            <button
              onClick={() => {
                if (confirm('确定删除这个轨道图吗？')) {
                  deleteTrackMap(activeTrackMap.id);
                }
              }}
              className="btn-danger flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              删除
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 card p-1">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(tool.id)}
                  className={`p-2 rounded-md transition-all flex flex-col items-center gap-1 min-w-[50px] ${
                    activeTool === tool.id
                      ? 'bg-copper-500/20 text-copper-400'
                      : 'text-rail-400 hover:text-rail-200 hover:bg-rail-700/50'
                  }`}
                  title={tool.label}
                >
                  <Icon className={`w-5 h-5 ${tool.id === 'curve' ? 'rotate-45' : ''}`} />
                  <span className="text-[10px]">{tool.label}</span>
                </button>
              );
            })}
          </div>

          <div className="w-px h-8 bg-rail-700" />

          <div className="flex items-center gap-1 card p-1">
            <button
              onClick={handleZoomOut}
              className="p-2 rounded-md text-rail-400 hover:text-rail-200 hover:bg-rail-700/50 transition-colors"
              title="缩小"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="px-2 text-sm text-rail-300 font-mono min-w-[52px] text-center">
              {scalePercent}%
            </div>
            <button
              onClick={handleZoomIn}
              className="p-2 rounded-md text-rail-400 hover:text-rail-200 hover:bg-rail-700/50 transition-colors"
              title="放大"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-rail-700 mx-1" />
            <button
              onClick={handleZoomToFit}
              className="p-2 rounded-md text-rail-400 hover:text-rail-200 hover:bg-rail-700/50 transition-colors"
              title="适应窗口"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-md text-rail-400 hover:text-rail-200 hover:bg-rail-700/50 transition-colors"
              title="100%"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-hidden bg-rail-900/50">
          {!activeTrackMap ? (
            <div className="h-full flex items-center justify-center">
              <div className="card p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rail-700/50 flex items-center justify-center">
                  <Map className="w-8 h-8 text-rail-500" />
                </div>
                <h3 className="text-lg font-medium text-rail-200 mb-2">
                  还没有轨道图
                </h3>
                <p className="text-rail-400 mb-4">
                  创建一个轨道图开始绘制你的线路
                </p>
                <button
                  onClick={() => setIsMapModalOpen(true)}
                  className="btn-primary"
                >
                  创建轨道图
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-full">
              <TrackCanvas
                ref={canvasRef}
                trackElements={currentTrackElements}
                issueMarkers={currentIssueMarkers}
                activeTool={activeTool}
                selectedElementId={selectedElementId}
                onAddTrackElement={handleAddTrackElement}
                onUpdateTrackElement={handleUpdateTrackElement}
                onDeleteElement={handleDeleteElement}
                onAddIssueMarker={handleAddIssueMarker}
                onUpdateIssueMarker={updateIssueMarker}
                onSelectIssueMarker={handleSelectIssueMarker}
                onSelectElement={setSelectedElementId}
                onScaleChange={setCurrentScale}
              />
            </div>
          )}
        </div>

        <div className="w-64 border-l border-rail-700/50 bg-rail-900/50 p-4 overflow-y-auto">
          <h3 className="font-medium text-rail-200 mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            属性
          </h3>

          {!selectedElementId && !selectedTrackElement && !selectedIssue ? (
            <p className="text-sm text-rail-500">
              选择一个元素查看属性
            </p>
          ) : null}

          {selectedTrackElement && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-rail-500">类型</label>
                <p className="text-sm text-rail-200">
                  {selectedTrackElement.type === 'straight'
                    ? '直轨'
                    : selectedTrackElement.type === 'curve'
                    ? '弯道'
                    : '道岔'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-rail-500">X</label>
                  <input
                    type="number"
                    value={Math.round(selectedTrackElement.x)}
                    onChange={(e) =>
                      handleUpdateTrackElement(selectedTrackElement.id, {
                        x: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field text-sm py-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-rail-500">Y</label>
                  <input
                    type="number"
                    value={Math.round(selectedTrackElement.y)}
                    onChange={(e) =>
                      handleUpdateTrackElement(selectedTrackElement.id, {
                        y: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field text-sm py-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-rail-500">旋转角度</label>
                <input
                  type="number"
                  value={selectedTrackElement.rotation}
                  onChange={(e) =>
                    handleUpdateTrackElement(selectedTrackElement.id, {
                      rotation: parseInt(e.target.value) || 0,
                    })
                  }
                  className="input-field text-sm py-1"
                />
              </div>
              {selectedTrackElement.type !== 'curve' && (
                <div>
                  <label className="text-xs text-rail-500">长度</label>
                  <input
                    type="number"
                    value={selectedTrackElement.length}
                    onChange={(e) =>
                      handleUpdateTrackElement(selectedTrackElement.id, {
                        length: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input-field text-sm py-1"
                  />
                </div>
              )}
              {selectedTrackElement.type === 'curve' && (
                <div>
                  <label className="text-xs text-rail-500">半径</label>
                  <input
                    type="number"
                    value={selectedTrackElement.radius || 60}
                    onChange={(e) =>
                      handleUpdateTrackElement(selectedTrackElement.id, {
                        radius: parseInt(e.target.value) || 60,
                      })
                    }
                    className="input-field text-sm py-1"
                  />
                </div>
              )}
              <button
                onClick={() => handleDeleteElement(selectedTrackElement.id)}
                className="btn-danger w-full text-sm"
              >
                删除元素
              </button>
            </div>
          )}

          {selectedIssue && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-rail-500">类型</label>
                <p
                  className="text-sm font-medium"
                  style={{ color: getIssueTypeColor(selectedIssue.type) }}
                >
                  {getIssueTypeLabel(selectedIssue.type)}
                </p>
              </div>
              <div>
                <label className="text-xs text-rail-500">描述</label>
                <p className="text-sm text-rail-300">
                  {selectedIssue.description || '无描述'}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleEditIssue} className="btn-secondary flex-1 text-sm">
                  编辑
                </button>
                <button
                  onClick={() => handleDeleteElement(`issue-${selectedIssue.id}`)}
                  className="btn-danger flex-1 text-sm"
                >
                  删除
                </button>
              </div>
            </div>
          )}

          <div className="border-t border-rail-700/50 my-4 pt-4">
            <h4 className="text-sm font-medium text-rail-300 mb-2">问题点列表</h4>
            {currentIssueMarkers.length === 0 ? (
              <p className="text-xs text-rail-500">暂无问题点</p>
            ) : (
              <div className="space-y-2">
                {currentIssueMarkers.map((marker) => (
                  <button
                    key={marker.id}
                    onClick={() => {
                      setSelectedElementId(`issue-${marker.id}`);
                      setEditingIssue(marker);
                    }}
                    className={`w-full p-2 rounded-md text-left text-sm transition-colors ${
                      selectedElementId === `issue-${marker.id}`
                        ? 'bg-rail-700/70'
                        : 'bg-rail-800/50 hover:bg-rail-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getIssueTypeColor(marker.type) }}
                      />
                      <span className="text-rail-200 text-xs">
                        {getIssueTypeLabel(marker.type)}
                      </span>
                    </div>
                    {marker.description && (
                      <p className="text-xs text-rail-500 mt-1 line-clamp-1">
                        {marker.description}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-rail-700/50 my-4 pt-4">
            <h4 className="text-sm font-medium text-rail-300 mb-2">操作提示</h4>
            <ul className="text-xs text-rail-500 space-y-1">
              <li>• 点击工具选择添加模式</li>
              <li>• 点击画布放置元素</li>
              <li>• 拖拽元素调整位置</li>
              <li>• 鼠标滚轮缩放视图</li>
              <li>• 按住空格键拖拽平移</li>
              <li>• 按 Delete 键删除选中项</li>
            </ul>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="新建轨道图"
        size="sm"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleCreateMap(); }} className="space-y-4">
          <div>
            <label className="label-text">轨道图名称</label>
            <input
              type="text"
              value={newMapName}
              onChange={(e) => setNewMapName(e.target.value)}
              className="input-field"
              placeholder="例如：室内主线路"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsMapModalOpen(false)}
              className="btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="btn-primary">
              创建
            </button>
          </div>
        </form>
      </Modal>

      <IssueMarkerModal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setEditingIssue(null);
          setNewIssuePosition(null);
        }}
        marker={editingIssue}
        defaultPosition={newIssuePosition || undefined}
        trackMapId={activeTrackMapId || ''}
      />
    </div>
  );
}
