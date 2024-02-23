import React, { FC, useCallback, useEffect, useMemo, useRef } from "react";
import { isMobile } from "react-device-detect";

type point = {
  id: number;
  x: number;
  y: number;
  degree: number;
};

const PRIMARY_COLOR = "rgb(68, 68, 68)";
const SECONDARY_COLOR = "rgba(68, 68, 68, 0.6)";
const TRANSPARENT_COLOR = "rgba(0, 0, 0, 0)";

// NOTE: It seems that the canvas cannot be displayed on mobile if the number of pixels (height x width) exceeds 16000.
const CANVAS_SIZE = {
  width: isMobile ? 4000 : 6000,
  height: isMobile ? 4000 : 5000,
};

export const Curve: FC = () => {
  const pointsRef = useRef<point[]>([]);

  const initPoint = useCallback(() => {
    pointsRef.current = [
      {
        id: 0,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        degree: Math.random() * 360,
      },
    ];
  }, []);

  const addPoint = useCallback(() => {
    const prevPoint = pointsRef.current[pointsRef.current.length - 1];
    const distance =
      Math.floor(Math.random() * 100) === 1
        ? Math.random() * 400
        : Math.random() * 20;
    const degree = Math.random() * 360;

    let x = prevPoint.x + Math.cos((degree * Math.PI) / 180) * distance;
    let y = prevPoint.y + Math.sin((degree * Math.PI) / 180) * distance;

    if (x < 0) x = 0;
    if (x > window.innerWidth) x = window.innerWidth;
    if (y < 0) y = 0;
    if (y > window.innerHeight) y = window.innerHeight;

    pointsRef.current.push({
      id: pointsRef.current.length,
      x,
      y,
      degree,
    });
  }, []);

  const clearFlagRef = useRef<boolean>(false);
  const clearRectHeightRef = useRef<number>(0);

  const eraseCanvas = useCallback(() => {
    const canvasCtx = canvasRef.current?.getContext("2d");
    const layerCtx = layerRef.current?.getContext("2d");
    if (!canvasCtx || !layerCtx) return;

    layerCtx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);
    canvasCtx.clearRect(0, 0, CANVAS_SIZE.width, clearRectHeightRef.current);

    // Draw a horizontal line
    canvasCtx.strokeStyle = SECONDARY_COLOR;
    canvasCtx.lineWidth = 0.2;
    canvasCtx.beginPath();
    canvasCtx.moveTo(0, clearRectHeightRef.current);
    canvasCtx.lineTo(CANVAS_SIZE.width, clearRectHeightRef.current);
    canvasCtx.stroke();

    clearRectHeightRef.current += 2;
    if (clearRectHeightRef.current > window.innerHeight + 10) {
      clearFlagRef.current = false;
    }
  }, []);

  const animationFrameIdRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRef = useRef<HTMLCanvasElement>(null);

  const drawing = useCallback(() => {
    const canvasCtx = canvasRef.current?.getContext("2d");
    const layerCtx = layerRef.current?.getContext("2d");
    if (!canvasCtx || !layerCtx) return;

    addPoint();
    if (pointsRef.current.length < 3) return;

    // Canvas
    // Draw a cubic Bezier curve
    const prevPrevPosition = pointsRef.current[pointsRef.current.length - 3];
    const prevPosition = pointsRef.current[pointsRef.current.length - 2];
    const position = pointsRef.current[pointsRef.current.length - 1];

    const startPoint = {
      x: (prevPosition.x - prevPrevPosition.x) / 2 + prevPrevPosition.x,
      y: (prevPosition.y - prevPrevPosition.y) / 2 + prevPrevPosition.y,
    };

    const endPoint = {
      x: (position.x - prevPosition.x) / 2 + prevPosition.x,
      y: (position.y - prevPosition.y) / 2 + prevPosition.y,
    };

    const distance = Math.sqrt(
      Math.pow(startPoint.x - endPoint.x, 2) +
        Math.pow(startPoint.y - endPoint.y, 2),
    );

    canvasCtx.strokeStyle = distance > 40 ? TRANSPARENT_COLOR : SECONDARY_COLOR;
    canvasCtx.lineWidth = Math.random() * 1.8;
    canvasCtx.lineCap = "round";
    canvasCtx.lineJoin = "round";
    canvasCtx.beginPath();
    canvasCtx.moveTo(startPoint.x, startPoint.y);
    canvasCtx.quadraticCurveTo(
      prevPosition.x,
      prevPosition.y,
      endPoint.x,
      endPoint.y,
    );
    canvasCtx.stroke();

    // Layer
    layerCtx.clearRect(0, 0, CANVAS_SIZE.width, CANVAS_SIZE.height);

    // Draw a point
    layerCtx.fillStyle = "rgba(255, 102, 0, 0.6)";
    layerCtx.beginPath();
    layerCtx.arc(position.x, position.y, 2.5, 0, Math.PI * 2, false);
    layerCtx.fill();

    // Display the coordinates of the point
    layerCtx.fillStyle = PRIMARY_COLOR;
    layerCtx.font = "9px Roboto medium, sans-serif";
    layerCtx.fillText(
      `${position.x.toFixed(2)}, ${position.y.toFixed(2)}`,
      position.x - 2,
      position.y - 5,
    );

    console.log(pointsRef.current.length);
    if (pointsRef.current.length > 50000) {
      clearFlagRef.current = true;
      clearRectHeightRef.current = 0;
      pointsRef.current = [];
    }
  }, [addPoint]);

  const render = useCallback(() => {
    if (clearFlagRef.current) {
      eraseCanvas();
    } else {
      if (pointsRef.current.length === 0) initPoint();
      drawing();
    }

    animationFrameIdRef.current = requestAnimationFrame(render);
  }, [drawing, eraseCanvas]);

  useEffect(() => {
    render();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [render]);

  return (
    <>
      <canvas
        ref={canvasRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
      />
      <canvas
        ref={layerRef}
        width={CANVAS_SIZE.width}
        height={CANVAS_SIZE.height}
        style={{ zIndex: 1 }}
      />
    </>
  );
};
