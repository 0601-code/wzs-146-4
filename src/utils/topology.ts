import { TrackElement, TrackEndpoint, TrackConnection } from '@/types';
import { generateId } from './index';

const SNAP_DISTANCE = 10;
const ANGLE_THRESHOLD = 15;

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function normalizeAngle(angle: number): number {
  let a = angle % 360;
  if (a < 0) a += 360;
  return a;
}

function anglesOpposite(angle1: number, angle2: number): boolean {
  const diff = Math.abs(normalizeAngle(angle1) - normalizeAngle(angle2 + 180));
  return diff <= ANGLE_THRESHOLD || diff >= 360 - ANGLE_THRESHOLD;
}

export function getElementEndpoints(element: TrackElement): TrackEndpoint[] {
  const { type, x, y, rotation, length, radius } = element;
  const rotRad = degToRad(rotation);
  const cos = Math.cos(rotRad);
  const sin = Math.sin(rotRad);

  const endpoints: TrackEndpoint[] = [];

  if (type === 'straight') {
    const startX = x;
    const startY = y;
    const endX = x + length * cos;
    const endY = y + length * sin;

    endpoints.push({
      id: `${element.id}-0`,
      elementId: element.id,
      endpointIndex: 0,
      x: startX,
      y: startY,
      angle: normalizeAngle(rotation + 180),
    });

    endpoints.push({
      id: `${element.id}-1`,
      elementId: element.id,
      endpointIndex: 1,
      x: endX,
      y: endY,
      angle: normalizeAngle(rotation),
    });
  } else if (type === 'curve') {
    const r = radius || 60;
    const startAngle = rotation;
    const endAngle = rotation + 90;

    const startX = x + r * Math.cos(degToRad(startAngle - 90));
    const startY = y + r * Math.sin(degToRad(startAngle - 90));

    const endX = x + r * Math.cos(degToRad(endAngle - 90));
    const endY = y + r * Math.sin(degToRad(endAngle - 90));

    endpoints.push({
      id: `${element.id}-0`,
      elementId: element.id,
      endpointIndex: 0,
      x: startX,
      y: startY,
      angle: normalizeAngle(startAngle),
    });

    endpoints.push({
      id: `${element.id}-1`,
      elementId: element.id,
      endpointIndex: 1,
      x: endX,
      y: endY,
      angle: normalizeAngle(endAngle),
    });
  } else if (type === 'switch') {
    const mainEndX = x + length * cos;
    const mainEndY = y + length * sin;

    const branchStartT = 0.4;
    const branchStartX = x + length * branchStartT * cos;
    const branchStartY = y + length * branchStartT * sin;
    const branchEndX = x + length * cos - 15 * sin;
    const branchEndY = y + length * sin + 15 * cos;

    const branchAngle = radToDeg(Math.atan2(branchEndY - branchStartY, branchEndX - branchStartX));

    endpoints.push({
      id: `${element.id}-0`,
      elementId: element.id,
      endpointIndex: 0,
      x: x,
      y: y,
      angle: normalizeAngle(rotation + 180),
    });

    endpoints.push({
      id: `${element.id}-1`,
      elementId: element.id,
      endpointIndex: 1,
      x: mainEndX,
      y: mainEndY,
      angle: normalizeAngle(rotation),
    });

    endpoints.push({
      id: `${element.id}-2`,
      elementId: element.id,
      endpointIndex: 2,
      x: branchEndX,
      y: branchEndY,
      angle: normalizeAngle(branchAngle),
    });
  }

  return endpoints;
}

export function getAllEndpoints(elements: TrackElement[]): TrackEndpoint[] {
  return elements.flatMap((el) => getElementEndpoints(el));
}

export function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function findConnections(
  elements: TrackElement[],
  snapDistance: number = SNAP_DISTANCE
): TrackConnection[] {
  const endpoints = getAllEndpoints(elements);
  const connections: TrackConnection[] = [];
  const usedEndpoints = new Set<string>();

  for (let i = 0; i < endpoints.length; i++) {
    const epA = endpoints[i];
    if (usedEndpoints.has(epA.id)) continue;

    let bestMatch: { endpoint: TrackEndpoint; dist: number } | null = null;

    for (let j = i + 1; j < endpoints.length; j++) {
      const epB = endpoints[j];
      if (epA.elementId === epB.elementId) continue;
      if (usedEndpoints.has(epB.id)) continue;

      const dist = distance(epA, epB);

      if (dist <= snapDistance && anglesOpposite(epA.angle, epB.angle)) {
        if (!bestMatch || dist < bestMatch.dist) {
          bestMatch = { endpoint: epB, dist };
        }
      }
    }

    if (bestMatch) {
      connections.push({
        id: generateId(),
        trackMapId: elements.find((e) => e.id === epA.elementId)?.trackMapId || '',
        endpointAId: epA.id,
        endpointBId: bestMatch.endpoint.id,
        elementAId: epA.elementId,
        elementBId: bestMatch.endpoint.elementId,
      });
      usedEndpoints.add(epA.id);
      usedEndpoints.add(bestMatch.endpoint.id);
    }
  }

  return connections;
}

export function findUnconnectedEndpoints(
  elements: TrackElement[],
  connections: TrackConnection[]
): TrackEndpoint[] {
  const allEndpoints = getAllEndpoints(elements);
  const connectedEndpointIds = new Set<string>();

  connections.forEach((conn) => {
    connectedEndpointIds.add(conn.endpointAId);
    connectedEndpointIds.add(conn.endpointBId);
  });

  return allEndpoints.filter((ep) => !connectedEndpointIds.has(ep.id));
}

export interface ConnectedComponent {
  id: string;
  elementIds: string[];
  endpointCount: number;
  isClosedLoop: boolean;
}

export function findConnectedComponents(
  elements: TrackElement[],
  connections: TrackConnection[]
): ConnectedComponent[] {
  const adjacencyMap = new Map<string, Set<string>>();

  elements.forEach((el) => {
    adjacencyMap.set(el.id, new Set());
  });

  connections.forEach((conn) => {
    const setA = adjacencyMap.get(conn.elementAId);
    const setB = adjacencyMap.get(conn.elementBId);
    if (setA) setA.add(conn.elementBId);
    if (setB) setB.add(conn.elementAId);
  });

  const visited = new Set<string>();
  const components: ConnectedComponent[] = [];

  elements.forEach((el) => {
    if (visited.has(el.id)) return;

    const componentElementIds: string[] = [];
    const queue: string[] = [el.id];
    visited.add(el.id);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      componentElementIds.push(currentId);

      const neighbors = adjacencyMap.get(currentId);
      if (neighbors) {
        neighbors.forEach((neighborId) => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        });
      }
    }

    const componentElements = elements.filter((e) => componentElementIds.includes(e.id));
    const unconnectedEps = findUnconnectedEndpoints(componentElements, connections);

    components.push({
      id: `comp-${components.length}`,
      elementIds: componentElementIds,
      endpointCount: unconnectedEps.length,
      isClosedLoop: unconnectedEps.length === 0 && componentElementIds.length > 1,
    });
  });

  return components;
}

export interface TopologyCheckResult {
  totalElements: number;
  connectedCount: number;
  isolatedCount: number;
  breakpoints: TrackEndpoint[];
  components: ConnectedComponent[];
  closedLoops: ConnectedComponent[];
}

export function checkTopology(
  elements: TrackElement[],
  connections: TrackConnection[]
): TopologyCheckResult {
  const components = findConnectedComponents(elements, connections);
  const breakpoints = findUnconnectedEndpoints(elements, connections);

  const connectedComponents = components.filter((c) => c.elementIds.length > 1);
  const isolatedCount = components.filter((c) => c.elementIds.length === 1).length;
  const closedLoops = components.filter((c) => c.isClosedLoop);

  return {
    totalElements: elements.length,
    connectedCount: connectedComponents.reduce((sum, c) => sum + c.elementIds.length, 0),
    isolatedCount,
    breakpoints,
    components,
    closedLoops,
  };
}

export function snapEndpointToTarget(
  element: TrackElement,
  endpointIndex: number,
  targetX: number,
  targetY: number,
  targetAngle: number
): TrackElement {
  const endpoints = getElementEndpoints(element);
  const endpoint = endpoints[endpointIndex];
  if (!endpoint) return element;

  const dx = targetX - endpoint.x;
  const dy = targetY - endpoint.y;

  const angleDiff = normalizeAngle(targetAngle + 180 - endpoint.angle);
  const newRotation = element.rotation + angleDiff;

  return {
    ...element,
    x: element.x + dx,
    y: element.y + dy,
    rotation: normalizeAngle(newRotation),
  };
}

export function findNearestEndpoint(
  x: number,
  y: number,
  endpoints: TrackEndpoint[],
  excludeElementId?: string,
  maxDistance: number = SNAP_DISTANCE
): { endpoint: TrackEndpoint; distance: number } | null {
  let nearest: { endpoint: TrackEndpoint; distance: number } | null = null;

  for (const ep of endpoints) {
    if (excludeElementId && ep.elementId === excludeElementId) continue;

    const dist = distance({ x, y }, ep);
    if (dist <= maxDistance && (!nearest || dist < nearest.distance)) {
      nearest = { endpoint: ep, distance: dist };
    }
  }

  return nearest;
}
