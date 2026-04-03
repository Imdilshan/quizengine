import React, { useRef, useState } from "react";

export default function TopicGraph({ topics, onTopicClick }) {
  const svgRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const topicMap = new Map(topics.map((t) => [t._id, t]));

  const edges = [];
  topics.forEach((topic) => {
    (topic.prerequisites || []).forEach((prereq) => {
      const fromTopic = topicMap.get(prereq._id || prereq);
      if (fromTopic) edges.push({ from: fromTopic, to: topic });
    });
  });

  const onMouseDown = (e) => {
    if (e.target.closest(".topic-node")) return;
    setDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const onMouseUp = () => setDragging(false);
  const NODE_W = 180;
  const NODE_H = 80;
  const ARROW_SIZE = 8;

  const getEdgePoints = (from, to) => {
    const fx = from.position.x + NODE_W / 2;
    const fy = from.position.y + NODE_H / 2;
    const tx = to.position.x + NODE_W / 2;
    const ty = to.position.y + NODE_H / 2;

    const dx = tx - fx;
    const dy = ty - fy;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const ex = tx - (dx / len) * (NODE_W / 2 + 6);
    const ey = ty - (dy / len) * (NODE_H / 2 + 6);

    return { x1: fx, y1: fy, x2: ex, y2: ey };
  };

  const minX = Math.min(...topics.map((t) => t.position.x)) - 40;
  const minY = Math.min(...topics.map((t) => t.position.y)) - 40;
  const maxX = Math.max(...topics.map((t) => t.position.x)) + NODE_W + 40;
  const maxY = Math.max(...topics.map((t) => t.position.y)) + NODE_H + 40;

  return (
    <div style={{ position: "relative", userSelect: "none" }}>
      <p style={{ color: "var(--text-3)", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
        Drag to pan • Click a node to start quiz
      </p>

      <svg
        ref={svgRef}
        width="100%"
        style={{
          height: Math.max(400, maxY - minY),
          cursor: dragging ? "grabbing" : "grab",
          display: "block",
          borderRadius: "var(--radius-sm)",
        }}
        viewBox={`${minX} ${minY} ${maxX - minX} ${maxY - minY}`}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        <defs>
          <marker id="arrow" markerWidth={ARROW_SIZE} markerHeight={ARROW_SIZE} refX={ARROW_SIZE - 1} refY={ARROW_SIZE / 2} orient="auto">
            <path d={`M0,0 L0,${ARROW_SIZE} L${ARROW_SIZE},${ARROW_SIZE / 2} z`} fill="var(--border-2)" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y})`}>
          {edges.map(({ from, to }, i) => {
            const { x1, y1, x2, y2 } = getEdgePoints(from, to);
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="var(--border-2)"
                strokeWidth={1.5}
                markerEnd="url(#arrow)"
              />
            );
          })}

          {topics.map((topic) => {
            const { _id, name, icon, color, unlocked, completed, position } = topic;

            return (
              <g
                key={_id}
                className="topic-node"
                transform={`translate(${position.x}, ${position.y})`}
                style={{ cursor: "pointer" }}
                onClick={() => onTopicClick(topic)}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill="var(--bg-2)"
                  stroke="var(--border-2)"
                />
                <text x={12} y={40} fontSize={20}>
                  {icon}
                </text>

                <foreignObject x={40} y={10} width={120} height={60}>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--text)",
                      lineHeight: "1.2",
                      wordBreak: "break-word",
                    }}
                  >
                    {name}
                    <div style={{ fontSize: "10px", opacity: 0.6, marginTop: 4 }}>
                      Click to start
                    </div>
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}