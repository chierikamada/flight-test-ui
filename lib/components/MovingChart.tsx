import { useEffect, useRef, useId, useState } from 'react';
import type { DataPoint } from '../states/dataPoint';
import { TelemetryTime } from '../states/telemetryTime';
import * as d3 from 'd3';


type MovingChartProp = {
  dataPoint: DataPoint | undefined;
  durationSec?: number;
  yLim?: [number, number];
  title?: string;
  xLabel?: string;
  yLabel?: string;
  width?: number;
  height?: number;
  hideAxes?: boolean;
  lineColor?: string;
  grid?: boolean;
  telemetryTime?: TelemetryTime; 
}

export function MovingChart({ dataPoint, yLim, durationSec = 5, title = "", xLabel = "Time", yLabel = "Value", width = 500, height = 250, lineColor = "lightblue", hideAxes = false, grid = true, telemetryTime }: MovingChartProp) {
  const dataRef = useRef<DataPoint[]>([]);

  const svgRef = useRef<SVGSVGElement>(null);

  const margin = hideAxes ? { top: 15, right: 5, bottom: 5, left: 5 } : { top: 15, right: 10, bottom: 45, left: 50 };

  const [tmTimeSynced, setTMTimeSynced] = useState(false);

  // Generate unique ID for each chart instance so clipping doesn't "leak" outside the component
  const clipId = useId();

  // Append data to array when new data point is passed
  useEffect(() => {
    if(dataPoint) {
        let arr = [...dataRef.current, dataPoint];
        let tmTimeNow = telemetryTime?.getCurrentTelemetryTime();
        if (!tmTimeNow) { tmTimeNow = new Date(); }
        arr = arr.filter(p => p.time.getTime() > (tmTimeNow.getTime() - durationSec*1000));
        dataRef.current = arr;
    }
  }, [dataPoint, durationSec])

  // Set up initial rendering and update cycle
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const yScale = d3.scaleLinear();
    const xScale = d3.scaleUtc();

    let lastData: DataPoint[] | null = null;

    // Set up plot update cycle. d3.timer acts like a game loop, painting the screen as smoothly as the monitor allows  
    const timer = d3.timer(() => {
      const currentData = dataRef.current;

      // Only update yScale domain if data changed since last render
      if (currentData !== lastData) {
        let min: number, max: number;
        if(yLim !== undefined) {
          [min, max] = yLim;
        } else {
          min = d3.min(currentData, p => p.value) ?? 0.0;
          max = d3.max(currentData, p => p.value) ?? 1.0;
        }
        yScale.domain([min, max]);        
        lastData = currentData; // Update the data cache
      }
      yScale.range([height - margin.bottom, margin.top]);
      
      // xScale updates every time so the time axis moves smoothly 
      let tmTimeNow = telemetryTime?.getCurrentTelemetryTime();
      
      if (!tmTimeNow) { 
        tmTimeNow = new Date(); 
        setTMTimeSynced(false);
      } else {
        setTMTimeSynced(true);
      }

      xScale.range([margin.left, width - margin.right]).domain([new Date(tmTimeNow.getTime() - durationSec*1000), tmTimeNow]);

      if(grid) {
        svg.select<SVGGElement>(".y-grid")
          .call(d3.axisLeft(yScale).ticks(5).tickSize(-(width-margin.left-margin.right)).tickFormat(() => ""))
          .call(g => g.select(".domain").attr("stroke", "oklch(87% 0 0)"))
          .call(g => g.selectAll(".tick line").attr("stroke", "oklch(87% 0 0)"));

        svg.select<SVGGElement>(".x-grid")
          .call(d3.axisBottom<Date>(xScale).ticks(5).tickSize(-(height - margin.top - margin.bottom)).tickFormat(() => ""))
          .call(g => g.select(".domain").attr("stroke", "oklch(87% 0 0)"))
          .call(g => g.selectAll(".tick line").attr("stroke", "oklch(87% 0 0)"));
      }

      if(!hideAxes) {
        // Update Y axis
        svg.select<SVGGElement>(".y-axis").call(d3.axisLeft(yScale).ticks(5));
        // Update X Axis
        svg.select<SVGGElement>(".x-axis").call(d3.axisBottom<Date>(xScale).ticks(5).tickFormat(d3.timeFormat("%H:%M:%S")));
      }
      
      // Update the line path
      const lineGenerator = d3.line<DataPoint>()
        .x((d: DataPoint) => xScale(d.time))
        .y((d: DataPoint) => yScale(d.value))
        .curve(d3.curveLinear);

      // Update line
      svg.select(".line-path")
        .datum(dataRef.current)
        .attr("d", lineGenerator);
    });

    return () => timer.stop();
  }, [width, height, durationSec, yLim, hideAxes, grid, telemetryTime]);

  return (
    <div className="border rounded-xs w-fit">
    <svg ref={svgRef} width={width} height={height}>
        <text className="text-sm" fill="oklch(87% 0 0)"textAnchor="middle" x={margin.left + (width - margin.left - margin.right) / 2} y={12}>{title}</text>
        <text className="text-[0.65rem]" fill="green" textAnchor="end" x={width - 2} y={8}>{tmTimeSynced && "Time Synced"}</text>
        <defs>
        <clipPath id={`chart-clip-${clipId}`}>
            <rect fill="red" x={margin.left} y={margin.top} width={width - margin.left - margin.right} height={height - margin.top - margin.bottom}/>
        </clipPath>
        </defs>
        {grid && <g className="x-grid" transform={`translate(0, ${height - margin.bottom})`}/>}
        {grid && <g className="y-grid" transform={`translate(${margin.left},0)`}/>}
        {!hideAxes && <g className="x-axis" transform={`translate(0, ${height - margin.bottom})`}/>}
        {!hideAxes && <g className="y-axis" transform={`translate(${margin.left},0)`}/>}
        {!hideAxes && <text className="x-label text-xs" fill="oklch(87% 0 0)" textAnchor="middle" x={margin.left + (width - margin.left - margin.right) / 2} y={height - 10}>{xLabel}</text>}
        {!hideAxes && <text className="y-label text-xs" fill="oklch(87% 0 0)" textAnchor="middle"  x={-(margin.top + (height - margin.top - margin.bottom) / 2)} y={margin.left - 30} transform="rotate(-90)">{yLabel}</text>}

        <path className="line-path" fill="none" stroke={lineColor} strokeWidth={1.75} clipPath={`url(#chart-clip-${clipId})`}/>
    </svg>
    </div>
  );
}