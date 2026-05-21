import React, { useRef, useEffect, useCallback } from 'react';
import { WhiteboardElement, ToolType, Point, DrawingAction, UserCursor } from '../types';
import { generateId, drawElement, isPointNearElement } from '../utils/canvasUtils';

interface CanvasProps {
  elements: WhiteboardElement[];
  tool: ToolType;
  color: string;
  strokeWidth: number;
  roomId: string;
  userId: string;
  onSendAction: (action: DrawingAction) => void;
  onSendCursor: (cursor: UserCursor) => void;
  onElementsChange: (elements: WhiteboardElement[]) => void;
  username: string;
  userColor: string;
}

const Canvas: React.FC<CanvasProps> = ({
  elements, tool, color, strokeWidth, roomId, userId,
  onSendAction, onSendCursor, onElementsChange, username, userColor
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDrawingRef = useRef(false);
  const currentElementRef = useRef<WhiteboardElement | null>(null);
  const elementsRef = useRef(elements);
  const toolRef = useRef(tool);
  const colorRef = useRef(color);
  const strokeWidthRef = useRef(strokeWidth);
  const roomIdRef = useRef(roomId);
  const userIdRef = useRef(userId);
  const usernameRef = useRef(username);
  const userColorRef = useRef(userColor);
  const lastCursorSend = useRef(0);

  useEffect(() => { elementsRef.current = elements; }, [elements]);
  useEffect(() => { toolRef.current = tool; }, [tool]);
  useEffect(() => { colorRef.current = color; }, [color]);
  useEffect(() => { strokeWidthRef.current = strokeWidth; }, [strokeWidth]);
  useEffect(() => { roomIdRef.current = roomId; }, [roomId]);
  useEffect(() => { userIdRef.current = userId; }, [userId]);
  useEffect(() => { usernameRef.current = username; }, [username]);
  useEffect(() => { userColorRef.current = userColor; }, [userColor]);

  // Resize canvas to match container, using DPR for sharpness
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const newWidth = Math.floor(rect.width * dpr);
    const newHeight = Math.floor(rect.height * dpr);

    if (canvas.width !== newWidth || canvas.height !== newHeight) {
      canvas.width = newWidth;
      canvas.height = newHeight;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    }
    redrawAll();
  }, []);

  useEffect(() => {
    const timer = setTimeout(resizeCanvas, 0);
    window.addEventListener('resize', resizeCanvas);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [resizeCanvas]);

  // Get mouse position in CSS pixels (logical coordinates)
  const getCanvasPoint = useCallback((e: MouseEvent | TouchEvent): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('changedTouches' in e && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }
    // Return CSS pixel coordinates (NOT multiplied by DPR)
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale context so we can draw in CSS pixel coordinates
    ctx.save();
    ctx.scale(dpr, dpr);

    // Light dot grid (in CSS pixels)
    ctx.fillStyle = '#e5e7eb';
    for (let x = 0; x < canvas.width / dpr; x += 20) {
      for (let y = 0; y < canvas.height / dpr; y += 20) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    // Draw committed elements (coordinates are in CSS pixels)
    elementsRef.current.forEach(el => drawElement(ctx, el));

    // Draw in-progress element
    if (currentElementRef.current) {
      drawElement(ctx, currentElementRef.current);
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    redrawAll();
  }, [elements, redrawAll]);

  // ===== DIRECT DOM EVENT LISTENERS =====
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      const point = getCanvasPoint(e);
      const currentTool = toolRef.current;

      // DEBUG: red dot at click position (CSS pixels)
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const dpr = window.devicePixelRatio || 1;
        ctx.save();
        ctx.scale(dpr, dpr);
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      console.log('[CANVAS] mousedown', currentTool, point);

      if (currentTool === 'text') {
        const input = document.createElement('input');
        input.type = 'text';
        input.style.position = 'absolute';
        input.style.left = point.x + 'px';
        input.style.top = point.y + 'px';
        input.style.zIndex = '100';
        input.style.fontSize = (strokeWidthRef.current * 5 + 14) + 'px';
        input.style.color = colorRef.current;
        input.style.border = '2px solid #3b82f6';
        input.style.borderRadius = '4px';
        input.style.padding = '4px 8px';
        input.style.outline = 'none';
        input.style.background = 'white';
        input.style.minWidth = '120px';
        input.placeholder = 'Type & press Enter...';

        const container = containerRef.current;
        if (!container) return;
        container.appendChild(input);
        input.focus();

        const finish = () => {
          const text = input.value.trim();
          if (text) {
            const element: WhiteboardElement = {
              id: generateId(),
              type: 'text',
              x: point.x,
              y: point.y,
              strokeColor: colorRef.current,
              strokeWidth: strokeWidthRef.current,
              text,
              font: `${strokeWidthRef.current * 5 + 14}px sans-serif`,
              createdBy: userIdRef.current,
              timestamp: Date.now(),
            };
            const newElements = [...elementsRef.current, element];
            onElementsChange(newElements);
            onSendAction({ type: 'CREATE', roomId: roomIdRef.current, element });
          }
          input.remove();
        };

        input.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); finish(); }
          if (ev.key === 'Escape') { input.remove(); }
        });
        input.addEventListener('blur', finish);
        return;
      }

      if (currentTool === 'select') {
        for (let i = elementsRef.current.length - 1; i >= 0; i--) {
          if (isPointNearElement(point.x, point.y, elementsRef.current[i])) {
            console.log('[CANVAS] selected:', elementsRef.current[i].id);
            return;
          }
        }
        return;
      }

      if (currentTool === 'eraser') {
        for (let i = elementsRef.current.length - 1; i >= 0; i--) {
          if (isPointNearElement(point.x, point.y, elementsRef.current[i])) {
            const el = elementsRef.current[i];
            const updated = elementsRef.current.map((e, idx) =>
              idx === i ? { ...e, isDeleted: true } : e
            );
            onElementsChange(updated);
            onSendAction({ type: 'DELETE', roomId: roomIdRef.current, element: { ...el, isDeleted: true } });
            redrawAll();
            return;
          }
        }
        return;
      }

      // START DRAWING - coordinates in CSS pixels
      isDrawingRef.current = true;
      const newElement: WhiteboardElement = {
        id: generateId(),
        type: currentTool,
        strokeColor: colorRef.current,
        strokeWidth: strokeWidthRef.current,
        points: currentTool === 'pencil' ? [point] : [point, { ...point }],
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        createdBy: userIdRef.current,
        timestamp: Date.now(),
      };
      currentElementRef.current = newElement;
      console.log('[CANVAS] start drawing', newElement.id, currentTool);
    };

    const onMouseMove = (e: MouseEvent) => {
      const point = getCanvasPoint(e);
      const now = Date.now();

      if (now - lastCursorSend.current > 50) {
        onSendCursor({
          userId: userIdRef.current,
          username: usernameRef.current,
          color: userColorRef.current,
          x: point.x,
          y: point.y,
          roomId: roomIdRef.current,
          timestamp: now,
        });
        lastCursorSend.current = now;
      }

      if (!isDrawingRef.current || !currentElementRef.current) return;

      const el = currentElementRef.current;
      const currentTool = toolRef.current;
      let updated: WhiteboardElement;

      if (currentTool === 'pencil') {
        updated = { ...el, points: [...(el.points || []), point] };
      } else if (currentTool === 'line') {
        updated = { ...el, points: [el.points![0], point] };
      } else {
        const startX = el.x || 0;
        const startY = el.y || 0;
        updated = {
          ...el,
          width: point.x - startX,
          height: point.y - startY,
          points: [{ x: startX, y: startY }, { x: point.x, y: point.y }],
        };
      }
      currentElementRef.current = updated;
      redrawAll();
    };

    const onMouseUp = () => {
      if (!isDrawingRef.current || !currentElementRef.current) {
        isDrawingRef.current = false;
        return;
      }
      isDrawingRef.current = false;

      const el = currentElementRef.current;
      const currentTool = toolRef.current;

      if (currentTool === 'pencil' && (el.points?.length || 0) < 3) {
        currentElementRef.current = null;
        redrawAll();
        return;
      }

      const newElements = [...elementsRef.current, el];
      onElementsChange(newElements);
      onSendAction({ type: 'CREATE', roomId: roomIdRef.current, element: el });
      console.log('[CANVAS] committed', el.id, 'total:', newElements.length);
      currentElementRef.current = null;
      redrawAll();
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('mouseleave', onMouseUp);

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const fakeEvent = new MouseEvent('mousedown', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
        });
        canvas.dispatchEvent(fakeEvent);
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const fakeEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
        });
        canvas.dispatchEvent(fakeEvent);
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      const fakeEvent = new MouseEvent('mouseup', { bubbles: true });
      canvas.dispatchEvent(fakeEvent);
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: false });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('mouseleave', onMouseUp);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [getCanvasPoint, redrawAll, onElementsChange, onSendAction, onSendCursor]);

  return (
    <div ref={containerRef} className="absolute inset-0 bg-gray-50" style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair bg-white"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};

export default Canvas;
