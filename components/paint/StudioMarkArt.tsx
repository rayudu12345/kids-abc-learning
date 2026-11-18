import React from "react";
import { Circle, Ellipse, G, Line, Polyline, Rect } from "react-native-svg";
import { StudioMark, studioBox } from "../../studioLogic";
export default function StudioMarkArt({
  mark,
  background,
}: {
  mark: StudioMark;
  background: string;
}) {
  const color = mark.tool === "eraser" ? background : mark.color;
  const first = mark.points[0],
    last = mark.points.at(-1)!;
  const box = studioBox(mark.points),
    fill = mark.filled ? (mark.fillColor ?? color) : "none";
  return (
    <G>
      {mark.tool === "rectangle" ? (
        <Rect {...box} stroke={color} strokeWidth={mark.size} fill={fill} />
      ) : mark.tool === "oval" ? (
        <Ellipse
          cx={box.x + box.width / 2}
          cy={box.y + box.height / 2}
          rx={box.width / 2}
          ry={box.height / 2}
          stroke={color}
          strokeWidth={mark.size}
          fill={fill}
        />
      ) : mark.points.length === 1 ||
        (mark.tool === "line" && first.x === last.x && first.y === last.y) ? (
        <Circle cx={first.x} cy={first.y} r={mark.size / 2} fill={color} />
      ) : mark.tool === "line" ? (
        <Line
          x1={first.x}
          y1={first.y}
          x2={last.x}
          y2={last.y}
          stroke={color}
          strokeWidth={mark.size}
          strokeLinecap="round"
        />
      ) : (
        <Polyline
          points={mark.points.map((point) => `${point.x},${point.y}`).join(" ")}
          fill="none"
          stroke={color}
          strokeWidth={mark.size}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </G>
  );
}
