'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Circle, Line, Arrow, Transformer } from 'react-konva';
import { Button, Space } from 'antd';
import { BgColorsOutlined, HighlightOutlined } from '@ant-design/icons';
import { gsap } from 'gsap';

const TOOL_TYPES = {
  SELECT: 'select',
  RECT: 'rect',
  CIRCLE: 'circle',
  LINE: 'line',
  ARROW: 'arrow',
  DRAW: 'draw',
};

export default function CanvasAppV2() {
  const stageRef = useRef(null);
  const menuRef = useRef(null);
  const trRef = useRef(null);

  const [dim, setDim] = useState({ w: 0, h: 0 });
  const [tool, setTool] = useState(TOOL_TYPES.SELECT);
  const [shapes, setShapes] = useState([]);
  const [currentShapeId, setCurrentShapeId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [color, setColor] = useState('#ff0000');
  const [bgColor, setBgColor] = useState('#ffffff');

  const [menuPos, setMenuPos] = useState({ x: 20, y: 20 });
  const [draggingMenu, setDraggingMenu] = useState(false);
  const [menuOffset, setMenuOffset] = useState({ x: 0, y: 0 });

  // Canvas full screen
  useEffect(() => {
    const handleResize = () => setDim({ w: window.innerWidth, h: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Menu opacity animation
  useEffect(() => {
    if (!menuRef.current) return;
    gsap.set(menuRef.current, { opacity: 0.7 });
  }, []);

  // Transformer attach
  useEffect(() => {
    if (trRef.current && selectedId) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedId}`);
      if (selectedNode) trRef.current.nodes([selectedNode]);
      else trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    } else if (trRef.current) {
      trRef.current.nodes([]);
      trRef.current.getLayer().batchDraw();
    }
  }, [selectedId, shapes]);

  // Drawing logic
  const handleMouseDown = (e) => {
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();

    if (tool === TOOL_TYPES.SELECT) {
      const clickedOnEmpty = e.target === stage;
      if (clickedOnEmpty) setSelectedId(null);
      return;
    }

    const shape = {
      id: Date.now().toString(),
      type: tool,
      points: [pos.x, pos.y],
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0,
      color,
    };
    setShapes([...shapes, shape]);
    setCurrentShapeId(shape.id);
  };

  const handleMouseMove = (e) => {
    if (!currentShapeId) return;
    const pos = e.target.getStage().getPointerPosition();
    setShapes((prev) =>
      prev.map((s) => {
        if (s.id !== currentShapeId) return s;
        const dx = pos.x - s.x;
        const dy = pos.y - s.y;
        if (s.type === TOOL_TYPES.RECT || s.type === TOOL_TYPES.CIRCLE)
          return { ...s, width: dx, height: dy };
        else if (s.type === TOOL_TYPES.LINE || s.type === TOOL_TYPES.DRAW)
          return { ...s, points: [...s.points, pos.x, pos.y] };
        else if (s.type === TOOL_TYPES.ARROW)
          return { ...s, points: [s.x, s.y, pos.x, pos.y] };
        return s;
      })
    );
  };

  const handleMouseUp = () => setCurrentShapeId(null);

  const handleShapeClick = (id) => {
    setTool(TOOL_TYPES.SELECT);
    setSelectedId(id);
  };

  // Draggable menu logic
  const handleMenuMouseDown = (e) => {
    setDraggingMenu(true);
    setMenuOffset({ x: e.clientX - menuPos.x, y: e.clientY - menuPos.y });
  };

  const handleMenuMouseMove = (e) => {
    if (!draggingMenu) return;
    setMenuPos({ x: e.clientX - menuOffset.x, y: e.clientY - menuOffset.y });
  };

  const handleMenuMouseUp = () => setDraggingMenu(false);

  return (
    <div
      style={{ width: '100vw', height: '100vh' }}
      onMouseMove={handleMenuMouseMove}
      onMouseUp={handleMenuMouseUp}
    >
      {/* Draggable Menu */}
      <div
        ref={menuRef}
        style={{
          position: 'absolute',
          top: menuPos.y,
          left: menuPos.x,
          zIndex: 100,
          padding: 12,
          borderRadius: 10,
          background: 'rgba(255,255,255,0.8)',
          cursor: 'move',
        }}
        onMouseDown={handleMenuMouseDown}
        onMouseEnter={(e) => gsap.to(e.currentTarget, { opacity: 1, duration: 0.3 })}
        onMouseLeave={(e) => gsap.to(e.currentTarget, { opacity: 0.8, duration: 0.3 })}
      >
        <Space direction="vertical">
          <Space wrap>
            <Button onClick={() => setTool(TOOL_TYPES.SELECT)}>Select</Button>
            <Button onClick={() => setTool(TOOL_TYPES.RECT)}>Rectangle</Button>
            <Button onClick={() => setTool(TOOL_TYPES.CIRCLE)}>Circle</Button>
            <Button onClick={() => setTool(TOOL_TYPES.LINE)}>Line</Button>
            <Button onClick={() => setTool(TOOL_TYPES.ARROW)}>Arrow</Button>
            <Button onClick={() => setTool(TOOL_TYPES.DRAW)}>Draw</Button>
          </Space>
          <Space wrap>
            <Button
              icon={<HighlightOutlined />}
              onClick={() => {
                const newColor = prompt('Enter shape color (hex)') || '#ff0000';
                setColor(newColor);
              }}
            >
              Shape Color
            </Button>
            <Button
              icon={<BgColorsOutlined />}
              onClick={() => {
                const newColor = prompt('Enter background color (hex)') || '#ffffff';
                setBgColor(newColor);
              }}
            >
              Background
            </Button>
          </Space>
        </Space>
      </div>

      {/* Canvas */}
      <Stage
        width={dim.w}
        height={dim.h}
        ref={stageRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <Layer>
          <Rect x={0} y={0} width={dim.w} height={dim.h} fill={bgColor} />
          {shapes.map((s) => {
            const commonProps = {
              key: s.id,
              id: s.id,
              draggable: true,
              onClick: () => handleShapeClick(s.id),
            };
            if (s.type === TOOL_TYPES.RECT) return <Rect {...commonProps} x={s.x} y={s.y} width={s.width} height={s.height} fill={s.color} />;
            if (s.type === TOOL_TYPES.CIRCLE)
              return (
                <Circle
                  {...commonProps}
                  x={s.x + s.width / 2}
                  y={s.y + s.height / 2}
                  radius={Math.sqrt((s.width ** 2 + s.height ** 2) / 2)}
                  fill={s.color}
                />
              );
            if (s.type === TOOL_TYPES.LINE || s.type === TOOL_TYPES.DRAW)
              return <Line {...commonProps} points={s.points} stroke={s.color} strokeWidth={2} lineCap="round" lineJoin="round" tension={0.5} />;
            if (s.type === TOOL_TYPES.ARROW)
              return <Arrow {...commonProps} points={s.points} stroke={s.color} strokeWidth={3} pointerLength={10} pointerWidth={10} />;
            return null;
          })}
          <Transformer ref={trRef} />
        </Layer>
      </Stage>
    </div>
  );
}
