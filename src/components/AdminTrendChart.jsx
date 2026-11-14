import { useMemo, useState } from "react";
import { formatMoney } from "./CartItem";

/*
  Line chart used by the admin Dashboard and the Sales Report.
  trend = { labels[], revenue[], previousRevenue[] }   unit = "hour" | "day" | "month"
  Solid line = this period, dashed line = the previous period of the same length.
*/

// Short money for chart axes and legends: ₹4.2L, ₹75k
export const compact = (value) => {
  const n = Number(value) || 0;
  const trim = (x) => String(Math.round(x * 10) / 10);
  if (n >= 1e7) return `${trim(n / 1e7)}Cr`;
  if (n >= 1e5) return `${trim(n / 1e5)}L`;
  if (n >= 1e3) return `${trim(n / 1e3)}k`;
  return String(Math.round(n));
};

// A "nice" top value for the chart axis, split into 4 steps
const niceScale = (max) => {
  if (!max || max <= 0) return { top: 100, step: 25 };
  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const unit = [1, 2, 2.5, 5, 10].find((u) => u * pow >= rough) * pow;
  return { top: unit * 4, step: unit };
};

// Smooth line through the points without overshooting (monotone cubic)
const smoothPath = (pts) => {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`;

  const n = pts.length;
  const dx = [];
  const slope = [];
  for (let i = 0; i < n - 1; i += 1) {
    dx.push(pts[i + 1].x - pts[i].x);
    slope.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }

  const tangent = [slope[0]];
  for (let i = 1; i < n - 1; i += 1) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  }
  tangent.push(slope[n - 2]);

  for (let i = 0; i < n - 1; i += 1) {
    if (slope[i] === 0) {
      tangent[i] = 0;
      tangent[i + 1] = 0;
      continue;
    }
    const a = tangent[i] / slope[i];
    const b = tangent[i + 1] / slope[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      tangent[i] = (3 * a * slope[i]) / h;
      tangent[i + 1] = (3 * b * slope[i]) / h;
    }
  }

  let d = `M${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < n - 1; i += 1) {
    const c1x = pts[i].x + dx[i] / 3;
    const c1y = pts[i].y + (tangent[i] * dx[i]) / 3;
    const c2x = pts[i + 1].x - dx[i] / 3;
    const c2y = pts[i + 1].y - (tangent[i + 1] * dx[i]) / 3;
    d += ` C${c1x},${c1y} ${c2x},${c2y} ${pts[i + 1].x},${pts[i + 1].y}`;
  }
  return d;
};

/* ---------------- Sales over time (SVG line + area) ---------------- */
const W = 640;
const H = 270;
const PAD = { left: 46, right: 14, top: 14, bottom: 30 };

function TrendChart({ trend, unit }) {
  const [hover, setHover] = useState(null);

  const chart = useMemo(() => {
    const { labels = [], revenue = [], previousRevenue = [] } = trend || {};
    const max = Math.max(0, ...revenue, ...previousRevenue);
    const { top, step } = niceScale(max);

    const innerW = W - PAD.left - PAD.right;
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i) =>
      PAD.left + (labels.length <= 1 ? innerW / 2 : (i / (labels.length - 1)) * innerW);
    const y = (v) => PAD.top + innerH - (Math.max(0, v) / top) * innerH; // refunds can push a bucket below 0: draw it at 0

    const pts = revenue.map((v, i) => ({ x: x(i), y: y(v) }));
    const prevPts = previousRevenue.map((v, i) => ({ x: x(i), y: y(v) }));
    const line = smoothPath(pts);
    const area = pts.length
      ? `${line} L${pts[pts.length - 1].x},${y(0)} L${pts[0].x},${y(0)} Z`
      : "";

    const ticks = [];
    for (let v = 0; v <= top + 1; v += step) ticks.push({ v, y: y(v) });

    // show at most ~8 labels on the bottom axis
    const every = Math.max(1, Math.ceil(labels.length / 8));

    return { labels, revenue, pts, line, area, ticks, every, prev: smoothPath(prevPts), y0: y(0) };
  }, [trend]);

  const hasSales = chart.revenue.some((v) => v > 0);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    let nearest = 0;
    chart.pts.forEach((p, i) => {
      if (Math.abs(p.x - px) < Math.abs(chart.pts[nearest].x - px)) nearest = i;
    });
    setHover(nearest);
  };

  const hp = hover !== null ? chart.pts[hover] : null;
  const tipLeft = hp && hp.x > W - 150;

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label="Sales over time"
        onMouseMove={handleMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="salesArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ff5722" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#ff5722" stopOpacity="0" />
          </linearGradient>
        </defs>

        {chart.ticks.map((t) => (
          <g key={t.v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={t.y} y2={t.y} stroke="#eeeeee" strokeWidth="1" />
            <text x={PAD.left - 8} y={t.y + 3} textAnchor="end" fontSize="10" fill="#9ca3af">
              {compact(t.v)}
            </text>
          </g>
        ))}

        {chart.labels.map((label, i) =>
          i % chart.every === 0 ? (
            <text key={i} x={chart.pts[i].x} y={H - 8} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {label}
            </text>
          ) : null
        )}

        {hasSales && <path d={chart.area} fill="url(#salesArea)" />}
        {chart.prev && (
          <path d={chart.prev} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="5 4" />
        )}
        <path d={chart.line} fill="none" stroke="#ff5722" strokeWidth="2.5" strokeLinecap="round" />

        {chart.pts.length <= 31 &&
          chart.pts.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={hover === i ? 4.5 : 2.5} fill="#fff" stroke="#ff5722" strokeWidth="2" />
          ))}

        {hp && (
          <g pointerEvents="none">
            <line x1={hp.x} x2={hp.x} y1={PAD.top} y2={chart.y0} stroke="#ff5722" strokeOpacity="0.25" />
            <g transform={`translate(${tipLeft ? hp.x - 138 : hp.x + 10}, ${Math.max(PAD.top, hp.y - 22)})`}>
              <rect width="128" height="40" rx="6" fill="#111" opacity="0.92" />
              <text x="10" y="16" fontSize="10" fill="#d1d5db">
                {chart.labels[hover]}
              </text>
              <text x="10" y="31" fontSize="12" fontWeight="700" fill="#fff">
                {formatMoney(chart.revenue[hover])}
              </text>
            </g>
          </g>
        )}
      </svg>

      <div className="mt-1 flex items-center gap-5 text-[11px] text-gray-500">
        <span className="flex items-center gap-2">
          <span className="h-[3px] w-5 rounded bg-[#ff5722]" /> This period
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0 w-5 border-t-2 border-dashed border-gray-400" /> Previous period
        </span>
        <span className="ml-auto text-gray-400">
          {unit === "hour" ? "By hour" : unit === "day" ? "By day" : "By month"}
        </span>
      </div>

      {!hasSales && (
        <p className="mt-2 text-center text-xs text-gray-400">No sales in this period yet.</p>
      )}
    </div>
  );
}


export default TrendChart;
