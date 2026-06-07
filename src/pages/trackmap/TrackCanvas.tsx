import { useRef, useEffect, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react';
import { Stage, Layer, Rect, Line, Circle, Text, Group, Arc } from 'react-konva';
import Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { TrackElement, IssueMarker, TrackElementType, TrackEndpoint, TrackConnection } from '@/types';
import { getIssueTypeColor, getIssueTypeLabel } from '@/store/useTrackMapStore';
import { getElementEndpoints, getAllEndpoints, findNearestEndpoint, snapEndpointToTarget, distance } from '@/utils/topology';

type Tool = 'select' | 'straight' | 'curve' | 'switch' | 'issue';

interface TrackCanvasProps {
  trackElements: TrackElement[];
  trackConnections: TrackConnection[];
  issueMarkers: IssueMarker[];
  activeTool: Tool;
  selectedElementId: string | null;
  showEndpoints: boolean;
  onAddTrackElement: (element: Omit<TrackElement, 'id'>) => void;
  onUpdateTrackElement: (id: string, data: Partial<TrackElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddIssueMarker: (x: number, y: number) => void;
  onUpdateIssueMarker: (id: string, data: Partial<IssueMarker>) => void;
  onSelectIssueMarker: (marker: IssueMarker) => void;
  onSelectElement: (id: string | null) => void;
  onScaleChange?: (scale: number) => void;
  onRecalculateConnections?: () => void;
  onFocusEndpoint?: (endpoint: TrackEndpoint) => void;
}

export interface TrackCanvasRef {
  resetZoom: () => void;
  zoomToFit: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  getScale: () => number;
}

const TRACK_WIDTH = 8;
const TRACK_COLOR = '#6b86a8';
const TRACK_RAIL_COLOR = '#9db0c8';
const MIN_SCALE = 0.1;
const MAX_SCALE = 5;
const SCALE_STEP = 1.1;

interface TrackSegmentProps {
  element: TrackElement;
  isSelected: boolean;
  showEndpoints: boolean;
  allEndpoints: TrackEndpoint[];
  onSelect: () => void;
  onDragEnd: (id: string, x: number, y: number, rotation: number) => void;
  onDragMove?: (id: string, x: number, y: number) => void;
  onEndpointClick?: (endpoint: TrackEndpoint) => void;
}

function TrackSegment({
  element,
  isSelected,
  showEndpoints,
  allEndpoints,
  onSelect,
  onDragEnd,
  onDragMove,
  onEndpointClick,
}: TrackSegmentProps) {
  const { type, x, y, rotation, length, radius } = element;
  const endpoints = useMemo(() => getElementEndpoints(element), [element]);

  const handleDragMove = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const target = e.target;
      const group = target.getParent();
      if (!group) return;
      onDragMove?.(element.id, group.x(), group.y());
    },
    [element.id, onDragMove]
  );

  const handleDragEnd = useCallback(
    (e: KonvaEventObject<DragEvent>) => {
      const target = e.target;
      const group = target.getParent();
      if (!group) return;

      const finalX = group.x();
      const finalY = group.y();

      const tempElement = { ...element, x: finalX, y: finalY };
      const tempEndpoints = getElementEndpoints(tempElement);

      let bestSnap: { target: TrackEndpoint; endpointIndex: number; dist: number } | null = null;

      for (let i = 0; i < tempEndpoints.length; i++) {
        const ep = tempEndpoints[i];
        const nearest = findNearestEndpoint(ep.x, ep.y, allEndpoints, element.id);
        if (nearest && (!bestSnap || nearest.distance < bestSnap.dist)) {
          bestSnap = { target: nearest.endpoint, endpointIndex: i, dist: nearest.distance };
        }
      }

      if (bestSnap) {
        const snapped = snapEndpointToTarget(
          tempElement,
          bestSnap.endpointIndex,
          bestSnap.target.x,
          bestSnap.target.y,
          bestSnap.target.angle
        );
        onDragEnd(element.id, snapped.x, snapped.y, snapped.rotation);
      } else {
        onDragEnd(element.id, finalX, finalY, element.rotation);
      }
    },
    [element, allEndpoints, onDragEnd]
  );

  const renderTrackBody = () => {
    if (type === 'straight') {
      return (
        <>
          <Line
            points={[0, 0, length, 0]}
            stroke={isSelected ? '#d4a574' : TRACK_COLOR}
            strokeWidth={TRACK_WIDTH}
            lineCap="round"
          />
          <Line points={[0, -3, length, -3]} stroke={isSelected ? '#e6caa5' : TRACK_RAIL_COLOR} strokeWidth={1} />
          <Line points={[0, 3, length, 3]} stroke={isSelected ? '#e6caa5' : TRACK_RAIL_COLOR} strokeWidth={1} />
          {isSelected && (
            <Rect x={-4} y={-8} width={length + 8} height={16} stroke="#d4a574" strokeWidth={1} dash={[4, 4]} opacity={0.5} />
          )}
        </>
      );
    }

    if (type === 'curve') {
      const r = radius || 60;
      const trackHalf = TRACK_WIDTH / 2;
      return (
        <>
          <Arc x={0} y={-r} innerRadius={r - trackHalf} outerRadius={r + trackHalf} angle={90} fill={isSelected ? '#d4a574' : TRACK_COLOR} rotation={90} />
          <Arc x={0} y={-r} innerRadius={r - 3} outerRadius={r - 3} angle={90} stroke={isSelected ? '#e6caa5' : TRACK_RAIL_COLOR} strokeWidth={1} rotation={90} />
          <Arc x={0} y={-r} innerRadius={r + 3} outerRadius={r + 3} angle={90} stroke={isSelected ? '#e6caa5' : TRACK_RAIL_COLOR} strokeWidth={1} rotation={90} />
          {isSelected && (
            <Arc x={0} y={-r} innerRadius={r - trackHalf - 4} outerRadius={r + trackHalf + 4} angle={90} stroke="#d4a574" strokeWidth={1} dash={[4, 4]} opacity={0.5} rotation={90} />
          )}
        </>
      );
    }

    if (type === 'switch') {
      return (
        <>
          <Line points={[0, 0, length, 0]} stroke={isSelected ? '#d4a574' : TRACK_COLOR} strokeWidth={TRACK_WIDTH} lineCap="round" />
          <Line points={[length * 0.4, 0, length, -15]} stroke={isSelected ? '#d4a574' : TRACK_COLOR} strokeWidth={TRACK_WIDTH - 1} lineCap="round" />
          <Circle x={length * 0.4} y={0} radius={5} fill={isSelected ? '#d4a574' : '#f39c12'} />
        </>
      );
    }

    return null;
  };

  return (
    <Group
      x={x}
      y={y}
      rotation={rotation}
      draggable
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onClick={(e) => {
        e.cancelBubble = true;
        onSelect();
      }}
    >
      {renderTrackBody()}

      {showEndpoints && endpoints.map((ep, idx) => {
        const localX = ep.x - x;
        const localY = ep.y - y;
        const rotRad = (rotation * Math.PI) / 180;
        const cos = Math.cos(-rotRad);
        const sin = Math.sin(-rotRad);
        const relX = localX * cos - localY * sin;
        const relY = localX * sin + localY * cos;

        return (
          <Circle
            key={`ep-${idx}`}
            x={relX}
            y={relY}
            radius={4}
            fill="#4ade80"
            stroke="#fff"
            strokeWidth={1.5}
            onClick={(e) => {
              e.cancelBubble = true;
              onEndpointClick?.(ep);
            }}
            style={{ cursor: 'pointer' }}
          />
        );
      })}
    </Group>
  );
}

function IssueMarkerNode({
  marker,
  isSelected,
  onClick,
  onDragEnd,
}: {
  marker: IssueMarker;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const color = getIssueTypeColor(marker.type);
  const label = getIssueTypeLabel(marker.type);

  return (
    <Group
      x={marker.x}
      y={marker.y}
      draggable
      onDragEnd={(e) => onDragEnd(e.target.x(), e.target.y())}
      onClick={(e) => {
        e.cancelBubble = true;
        onClick();
      }}
    >
      {isSelected && (
        <Circle radius={18} stroke={color} strokeWidth={2} dash={[4, 4]} opacity={0.6} />
      )}
      <Circle radius={12} fill={color} opacity={0.2} />
      <Circle radius={8} fill={color} />
      <Text
        text="!"
        fontSize={12}
        fontStyle="bold"
        fill="#fff"
        x={-3}
        y={-6}
      />
      {isSelected && marker.description && (
        <Group y={20}>
          <Rect
            x={-60}
            y={0}
            width={120}
            height={30}
            fill="#1a2a3a"
            stroke={color}
            strokeWidth={1}
            cornerRadius={4}
          />
          <Text
            text={label}
            fontSize={10}
            fill={color}
            x={-55}
            y={5}
            width={110}
            align="center"
          />
        </Group>
      )}
    </Group>
  );
}

const TrackCanvas = forwardRef<TrackCanvasRef, TrackCanvasProps>(function TrackCanvas(
  {
    trackElements,
    trackConnections,
    issueMarkers,
    activeTool,
    selectedElementId,
    showEndpoints,
    onAddTrackElement,
    onUpdateTrackElement,
    onDeleteElement,
    onAddIssueMarker,
    onUpdateIssueMarker,
    onSelectIssueMarker,
    onSelectElement,
    onScaleChange,
    onRecalculateConnections,
    onFocusEndpoint,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 });
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0, offsetX: 0, offsetY: 0 });
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number } | null>(null);
  const [snapTarget, setSnapTarget] = useState<TrackEndpoint | null>(null);
  const [draggingElementId, setDraggingElementId] = useState<string | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [isExtending, setIsExtending] = useState(false);
  const [extendingFrom, setExtendingFrom] = useState<TrackEndpoint | null>(null);
  const [extendingPreview, setExtendingPreview] = useState<TrackElement | null>(null);

  const allEndpoints = useMemo(() => getAllEndpoints(trackElements), [trackElements]);

  const unconnectedEndpoints = useMemo(() => {
    const connectedIds = new Set<string>();
    trackConnections.forEach((c) => {
      connectedIds.add(c.endpointAId);
      connectedIds.add(c.endpointBId);
    });
    return allEndpoints.filter((ep) => !connectedIds.has(ep.id));
  }, [allEndpoints, trackConnections]);

  const screenToLogic = useCallback(
    (screenX: number, screenY: number) => {
      return {
        x: (screenX - offset.x) / scale,
        y: (screenY - offset.y) / scale,
      };
    },
    [scale, offset]
  );

  const getLogicPointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return null;
    const pos = stage.getPointerPosition();
    if (!pos) return null;
    return screenToLogic(pos.x, pos.y);
  }, [screenToLogic]);

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault();

      const stage = stageRef.current;
      if (!stage) return;

      const pointerPos = stage.getPointerPosition();
      if (!pointerPos) return;

      const oldScale = scale;
      const delta = e.evt.deltaY > 0 ? 1 / SCALE_STEP : SCALE_STEP;
      let newScale = oldScale * delta;

      if (newScale < MIN_SCALE) newScale = MIN_SCALE;
      if (newScale > MAX_SCALE) newScale = MAX_SCALE;

      if (newScale === oldScale) return;

      const mousePointTo = {
        x: (pointerPos.x - offset.x) / oldScale,
        y: (pointerPos.y - offset.y) / oldScale,
      };

      const newOffset = {
        x: pointerPos.x - mousePointTo.x * newScale,
        y: pointerPos.y - mousePointTo.y * newScale,
      };

      setScale(newScale);
      setOffset(newOffset);
      onScaleChange?.(newScale);
    },
    [scale, offset, onScaleChange]
  );

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isSpacePressed || e.evt.button === 1) {
        e.evt.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.evt.clientX,
          y: e.evt.clientY,
          offsetX: offset.x,
          offsetY: offset.y,
        });
      }
    },
    [isSpacePressed, offset]
  );

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isPanning) {
        const dx = e.evt.clientX - panStart.x;
        const dy = e.evt.clientY - panStart.y;
        setOffset({
          x: panStart.offsetX + dx,
          y: panStart.offsetY + dy,
        });
        return;
      }

      const logicPos = getLogicPointerPosition();
      if (logicPos) {
        setPreviewPos(logicPos);
      }
    },
    [isPanning, panStart, getLogicPointerPosition]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleStageClick = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (isPanning) return;

      if (activeTool === 'select') {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
          onSelectElement(null);
        }
        return;
      }

      const logicPos = getLogicPointerPosition();
      if (!logicPos) return;

      if (activeTool === 'issue') {
        onAddIssueMarker(logicPos.x, logicPos.y);
        return;
      }

      if (['straight', 'curve', 'switch'].includes(activeTool)) {
        onAddTrackElement({
          trackMapId: '',
          type: activeTool as TrackElementType,
          x: logicPos.x,
          y: logicPos.y,
          rotation: 0,
          length: activeTool === 'curve' ? 0 : 100,
          radius: activeTool === 'curve' ? 60 : undefined,
        });
      }
    },
    [activeTool, isPanning, getLogicPointerPosition, onAddTrackElement, onAddIssueMarker, onSelectElement]
  );

  const handleTrackDragMove = useCallback(
    (id: string, x: number, y: number) => {
      setDraggingElementId(id);
      setDragPos({ x, y });

      const element = trackElements.find((e) => e.id === id);
      if (!element) return;

      const tempElement = { ...element, x, y };
      const tempEndpoints = getElementEndpoints(tempElement);

      let nearest: { endpoint: TrackEndpoint; distance: number } | null = null;
      for (const ep of tempEndpoints) {
        const found = findNearestEndpoint(ep.x, ep.y, allEndpoints, id);
        if (found && (!nearest || found.distance < nearest.distance)) {
          nearest = found;
        }
      }
      setSnapTarget(nearest?.endpoint || null);
    },
    [trackElements, allEndpoints]
  );

  const handleTrackDragEnd = useCallback(
    (id: string, x: number, y: number, rotation: number) => {
      onUpdateTrackElement(id, { x, y, rotation });
      setDraggingElementId(null);
      setDragPos(null);
      setSnapTarget(null);
      setTimeout(() => onRecalculateConnections?.(), 0);
    },
    [onUpdateTrackElement, onRecalculateConnections]
  );

  const handleMarkerDragEnd = useCallback(
    (id: string, x: number, y: number) => {
      onUpdateIssueMarker(id, { x, y });
    },
    [onUpdateIssueMarker]
  );

  const handleEndpointMouseDown = useCallback(
    (endpoint: TrackEndpoint, e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;

      if (activeTool === 'select') {
        onFocusEndpoint?.(endpoint);
        return;
      }

      if (['straight', 'curve', 'switch'].includes(activeTool)) {
        e.evt.preventDefault();
        setIsExtending(true);
        setExtendingFrom(endpoint);

        const newElement: TrackElement = {
          id: 'preview',
          trackMapId: '',
          type: activeTool as TrackElementType,
          x: endpoint.x,
          y: endpoint.y,
          rotation: endpoint.angle + 180,
          length: activeTool === 'curve' ? 0 : 100,
          radius: activeTool === 'curve' ? 60 : undefined,
        };
        setExtendingPreview(newElement);
      }
    },
    [activeTool, onFocusEndpoint]
  );

  const handleEndpointClick = useCallback(
    (endpoint: TrackEndpoint) => {
      if (['straight', 'curve', 'switch'].includes(activeTool)) {
        const newElement: Omit<TrackElement, 'id'> = {
          trackMapId: '',
          type: activeTool as TrackElementType,
          x: endpoint.x,
          y: endpoint.y,
          rotation: endpoint.angle + 180,
          length: activeTool === 'curve' ? 0 : 100,
          radius: activeTool === 'curve' ? 60 : undefined,
        };
        onAddTrackElement(newElement);
        setTimeout(() => onRecalculateConnections?.(), 0);
      } else {
        onFocusEndpoint?.(endpoint);
      }
    },
    [activeTool, onAddTrackElement, onRecalculateConnections, onFocusEndpoint]
  );

  const resetZoom = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    onScaleChange?.(1);
  }, [onScaleChange]);

  const zoomToFit = useCallback(() => {
    if (trackElements.length === 0 && issueMarkers.length === 0) {
      resetZoom();
      return;
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    trackElements.forEach((el) => {
      const w = el.length || 100;
      const h = (el.radius || 60) * 2;
      const size = Math.max(w, h);
      minX = Math.min(minX, el.x - size / 2);
      minY = Math.min(minY, el.y - size / 2);
      maxX = Math.max(maxX, el.x + size / 2);
      maxY = Math.max(maxY, el.y + size / 2);
    });

    issueMarkers.forEach((m) => {
      minX = Math.min(minX, m.x - 20);
      minY = Math.min(minY, m.y - 20);
      maxX = Math.max(maxX, m.x + 20);
      maxY = Math.max(maxY, m.y + 20);
    });

    const padding = 50;
    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const scaleX = stageSize.width / contentWidth;
    const scaleY = stageSize.height / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 3);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const newOffset = {
      x: stageSize.width / 2 - centerX * newScale,
      y: stageSize.height / 2 - centerY * newScale,
    };

    setScale(newScale);
    setOffset(newOffset);
    onScaleChange?.(newScale);
  }, [trackElements, issueMarkers, stageSize, resetZoom, onScaleChange]);

  const zoomIn = useCallback(() => {
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const oldScale = scale;
    let newScale = oldScale * SCALE_STEP;
    if (newScale > MAX_SCALE) newScale = MAX_SCALE;
    if (newScale === oldScale) return;

    const logicCenter = {
      x: (centerX - offset.x) / oldScale,
      y: (centerY - offset.y) / oldScale,
    };

    const newOffset = {
      x: centerX - logicCenter.x * newScale,
      y: centerY - logicCenter.y * newScale,
    };

    setScale(newScale);
    setOffset(newOffset);
    onScaleChange?.(newScale);
  }, [scale, offset, stageSize, onScaleChange]);

  const zoomOut = useCallback(() => {
    const centerX = stageSize.width / 2;
    const centerY = stageSize.height / 2;
    const oldScale = scale;
    let newScale = oldScale / SCALE_STEP;
    if (newScale < MIN_SCALE) newScale = MIN_SCALE;
    if (newScale === oldScale) return;

    const logicCenter = {
      x: (centerX - offset.x) / oldScale,
      y: (centerY - offset.y) / oldScale,
    };

    const newOffset = {
      x: centerX - logicCenter.x * newScale,
      y: centerY - logicCenter.y * newScale,
    };

    setScale(newScale);
    setOffset(newOffset);
    onScaleChange?.(newScale);
  }, [scale, offset, stageSize, onScaleChange]);

  useImperativeHandle(
    ref,
    () => ({
      resetZoom,
      zoomToFit,
      zoomIn,
      zoomOut,
      getScale: () => scale,
    }),
    [resetZoom, zoomToFit, zoomIn, zoomOut, scale]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (!isInputElement && e.code === 'Space') {
        e.preventDefault();
        setIsSpacePressed(true);
      }

      if (!isInputElement && (e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        onDeleteElement(selectedElementId);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElementId, onDeleteElement]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setStageSize({ width, height });
        }
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  const gridSize = 50;
  const gridWidth = Math.ceil(stageSize.width / scale) + gridSize * 2;
  const gridHeight = Math.ceil(stageSize.height / scale) + gridSize * 2;
  const gridStartX = Math.floor(-offset.x / scale / gridSize) * gridSize - gridSize;
  const gridStartY = Math.floor(-offset.y / scale / gridSize) * gridSize - gridSize;

  const cursor = isPanning
    ? 'grabbing'
    : isSpacePressed
    ? 'grab'
    : activeTool === 'select'
    ? 'default'
    : 'crosshair';

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        onClick={handleStageClick}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          cursor,
          backgroundColor: '#0f1a26',
        }}
      >
        <Layer>
          <Group x={offset.x} y={offset.y} scaleX={scale} scaleY={scale}>
            {Array.from({ length: Math.ceil(gridWidth / gridSize) + 1 }).map((_, i) => (
              <Line
                key={`v-${i}`}
                points={[gridStartX + i * gridSize, gridStartY, gridStartX + i * gridSize, gridStartY + gridHeight]}
                stroke="#1a2a3a"
                strokeWidth={1 / scale}
              />
            ))}
            {Array.from({ length: Math.ceil(gridHeight / gridSize) + 1 }).map((_, i) => (
              <Line
                key={`h-${i}`}
                points={[gridStartX, gridStartY + i * gridSize, gridStartX + gridWidth, gridStartY + i * gridSize]}
                stroke="#1a2a3a"
                strokeWidth={1 / scale}
              />
            ))}

            {trackElements.map((element) => (
              <TrackSegment
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                showEndpoints={showEndpoints}
                allEndpoints={allEndpoints}
                onSelect={() => onSelectElement(element.id)}
                onDragMove={handleTrackDragMove}
                onDragEnd={handleTrackDragEnd}
                onEndpointClick={handleEndpointClick}
              />
            ))}

            {showEndpoints && unconnectedEndpoints.map((ep) => (
              <Circle
                key={`break-${ep.id}`}
                x={ep.x}
                y={ep.y}
                radius={6}
                fill="#ef4444"
                stroke="#fff"
                strokeWidth={2}
                listening={false}
              />
            ))}

            {snapTarget && (
              <Circle
                x={snapTarget.x}
                y={snapTarget.y}
                radius={10}
                fill="none"
                stroke="#4ade80"
                strokeWidth={2}
                dash={[4, 4]}
                listening={false}
              />
            )}

            {snapTarget && dragPos && (
              <Line
                points={[dragPos.x, dragPos.y, snapTarget.x, snapTarget.y]}
                stroke="#4ade80"
                strokeWidth={1}
                dash={[4, 4]}
                opacity={0.8}
                listening={false}
              />
            )}

            {trackConnections.map((conn) => {
              const epA = allEndpoints.find((e) => e.id === conn.endpointAId);
              const epB = allEndpoints.find((e) => e.id === conn.endpointBId);
              if (!epA || !epB) return null;
              const midX = (epA.x + epB.x) / 2;
              const midY = (epA.y + epB.y) / 2;
              return (
                <Circle
                  key={`conn-${conn.id}`}
                  x={midX}
                  y={midY}
                  radius={3}
                  fill="#4ade80"
                  opacity={0.6}
                  listening={false}
                />
              );
            })}

            {issueMarkers.map((marker) => (
              <IssueMarkerNode
                key={marker.id}
                marker={marker}
                isSelected={selectedElementId === `issue-${marker.id}`}
                onClick={() => {
                  onSelectElement(`issue-${marker.id}`);
                  onSelectIssueMarker(marker);
                }}
                onDragEnd={(x, y) => handleMarkerDragEnd(marker.id, x, y)}
              />
            ))}

            {previewPos && activeTool !== 'select' && activeTool !== 'issue' && (
              <Group x={previewPos.x} y={previewPos.y} opacity={0.5}>
                {activeTool === 'straight' && (
                  <Line points={[0, 0, 100, 0]} stroke="#d4a574" strokeWidth={TRACK_WIDTH} />
                )}
                {activeTool === 'curve' && (
                  <Arc
                    x={0}
                    y={-60}
                    innerRadius={60 - TRACK_WIDTH / 2}
                    outerRadius={60 + TRACK_WIDTH / 2}
                    angle={90}
                    fill="#d4a574"
                    rotation={90}
                  />
                )}
                {activeTool === 'switch' && (
                  <>
                    <Line points={[0, 0, 100, 0]} stroke="#d4a574" strokeWidth={TRACK_WIDTH} />
                    <Line points={[40, 0, 100, -15]} stroke="#d4a574" strokeWidth={TRACK_WIDTH - 1} />
                  </>
                )}
              </Group>
            )}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
});

export default TrackCanvas;
