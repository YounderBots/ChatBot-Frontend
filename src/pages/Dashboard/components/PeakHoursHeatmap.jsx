<<<<<<< HEAD
const PeakHoursHeatmap = () => {
  return <div>Peak Hours Heatmap</div>;
=======
import React, { useMemo } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const hours = Array.from({ length: 24 }, (_, i) => i); // FIXED

const CELL_SIZE = 24;
const GAP = 3;

const getColor = (count, max) => {
  if (count === 0) return "var(--cvq-blue-100)";

  const intensity = count / max;

  if (intensity > 0.75) return "var(--cvq-blue-900)";
  if (intensity > 0.5) return "var(--cvq-blue-500)";
  if (intensity > 0.25) return "var(--cvq-blue-300)";
  return "var(--cvq-blue-200)";
};

const PeakHoursHeatmap = ({ data = [] }) => {

  /* ---------- Build lookup table once ---------- */
  const { heatmapMap, maxCount } = useMemo(() => {
    const map = new Map();
    let max = 0;

    data.forEach(({ day, hour, count }) => {
      map.set(`${day}-${hour}`, count);
      if (count > max) max = count;
    });

    return { heatmapMap: map, maxCount: max || 1 };
  }, [data]);

  const getCount = (day, hour) =>
    heatmapMap.get(`${day}-${hour}`) || 0;

  return (
    <>
      <h6 className="fw-semibold mb-3">Peak Hours Heatmap</h6>

      <div className="d-flex justify-content-center" style={{ overflowX: "auto" }}>
        <div  style={{ minWidth: 900 }}>

          {/* X Axis */}
          <div className="d-flex mb-2" style={{ marginLeft: 50 }}>
            {hours.map((hour) => (
              <div
                key={hour}
                style={{
                  width: CELL_SIZE,
                  marginRight: GAP,
                  fontSize: 10,
                  color: "#6c757d",
                  textAlign: "center",
                }}
              >
                {hour}
              </div>
            ))}
          </div>

          {/* Rows */}
          {days.map((day) => (
            <div key={day} className="d-flex align-items-center mb-1">
              {/* Y label */}
              <div
                style={{
                  width: 45,
                  fontSize: 11,
                  color: "#6c757d",
                }}
              >
                {day}
              </div>

              {hours.map((hour) => {
                const count = getCount(day, hour);

                return (
                  <div
                    key={`${day}-${hour}`}
                    title={`${day} • ${hour}:00 — ${count}`}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      marginRight: GAP,
                      borderRadius: 4,
                      backgroundColor: getColor(count, maxCount),
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="d-flex align-items-center mt-3 small text-muted">
        <span className="me-2">Less</span>

        {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              marginRight: 4,
              backgroundColor: getColor(v * maxCount, maxCount),
            }}
          />
        ))}

        <span className="ms-2">More</span>
      </div>
    </>
  );
>>>>>>> 812061a6c99e8d95675ad2d031e3c7a4dc62c834
};

export default PeakHoursHeatmap;
