import { Point, WhiteboardElement } from '../types';

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

export function getDistance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

export function isPointNearElement(x: number, y: number, element: WhiteboardElement, threshold: number = 5): boolean {
  if (element.isDeleted) return false;

  switch (element.type) {
    case 'pencil':
    case 'eraser': {
      if (!element.points || element.points.length === 0) return false;
      for (const point of element.points) {
        if (getDistance({ x, y }, point) < threshold + (element.strokeWidth || 2)) {
          return true;
        }
      }
      return false;
    }
    case 'rectangle': {
      if (element.x === undefined || element.y === undefined || element.width === undefined || element.height === undefined) return false;
      return x >= element.x - threshold && x <= element.x + element.width + threshold &&
             y >= element.y - threshold && y <= element.y + element.height + threshold;
    }
    case 'circle': {
      if (element.x === undefined || element.y === undefined || element.width === undefined || element.height === undefined) return false;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const radiusX = element.width / 2;
      const radiusY = element.height / 2;
      const normalizedDist = Math.pow(x - centerX, 2) / Math.pow(radiusX, 2) + Math.pow(y - centerY, 2) / Math.pow(radiusY, 2);
      return normalizedDist <= 1.2;
    }
    case 'line': {
      if (!element.points || element.points.length < 2) return false;
      const p1 = element.points[0];
      const p2 = element.points[1];
      const dist = pointToLineDistance(x, y, p1.x, p1.y, p2.x, p2.y);
      return dist < threshold + (element.strokeWidth || 2);
    }
    case 'text': {
      if (element.x === undefined || element.y === undefined) return false;
      return Math.abs(x - element.x) < 100 && Math.abs(y - element.y) < 30;
    }
    default:
      return false;
  }
}

function pointToLineDistance(px: number, py: number, x1: number, y1: number, x2: number, y2: number): number {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;
  let xx, yy;
  if (param < 0) {
    xx = x1; yy = y1;
  } else if (param > 1) {
    xx = x2; yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }
  const dx = px - xx;
  const dy = py - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export function drawElement(ctx: CanvasRenderingContext2D, element: WhiteboardElement): void {
  if (element.isDeleted) return;

  ctx.globalAlpha = element.opacity ?? 1;
  ctx.strokeStyle = element.strokeColor;
  ctx.fillStyle = element.strokeColor;
  ctx.lineWidth = element.strokeWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (element.type) {
    case 'pencil':
    case 'eraser': {
      if (!element.points || element.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      for (let i = 1; i < element.points.length; i++) {
        ctx.lineTo(element.points[i].x, element.points[i].y);
      }
      ctx.stroke();
      break;
    }
    case 'rectangle': {
      if (element.x === undefined || element.y === undefined || element.width === undefined || element.height === undefined) return;
      ctx.strokeRect(element.x, element.y, element.width, element.height);
      break;
    }
    case 'circle': {
      if (element.x === undefined || element.y === undefined || element.width === undefined || element.height === undefined) return;
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const radiusX = Math.abs(element.width / 2);
      const radiusY = Math.abs(element.height / 2);
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
      ctx.stroke();
      break;
    }
    case 'line': {
      if (!element.points || element.points.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(element.points[0].x, element.points[0].y);
      ctx.lineTo(element.points[1].x, element.points[1].y);
      ctx.stroke();
      break;
    }
    case 'text': {
      if (element.x === undefined || element.y === undefined || !element.text) return;
      ctx.font = element.font || '20px sans-serif';
      ctx.fillText(element.text, element.x, element.y);
      break;
    }
  }

  ctx.globalAlpha = 1;
}
