import React, { useEffect, useRef, useMemo } from "react";

import { scaleLinear, max, extent, scaleTime, timeFormat, bin, timeMonths, sum, brushX, select } from "d3";
import { Marks } from "./Marks";
import { AxisBottom } from "./axisBottom";
import { AxisLeft } from "./axisLeft";

const margin = {
  top: 0,
  bottom: 50,
  right: 0,
  left: 70,
};
const xAxisTickFormat = timeFormat("%m/%Y");
const xAxisLabel = "Date";

const yValue = (d) => d["Total Dead and Missing"];
const yAxisLabel = "Total Dead and Missing";

export const DateHistogram = ({ data, height, width, setBrushExtent, xValue }) => {
  const brushRef = useRef();

  const innerHeight = height - margin.top - margin.bottom;
  const innerWidth = width - margin.right - margin.left;

  const xScale = useMemo(
    () => scaleTime().domain(extent(data, xValue)).range([0, innerWidth]),
    [data, xValue, innerWidth]
  );

  const binnedData = useMemo(() => {
    const [start, stop] = xScale.domain();

    return bin()
      .value(xValue)
      .domain(xScale.domain())
      .thresholds(timeMonths(start, stop))(data)
      .map((array) => ({
        y: sum(array, yValue),
        x0: array.x0,
        x1: array.x1,
      }));
  }, [xValue, xScale, data, yValue]);
  const yScale = useMemo(() => {
    // console.log("test")
    return scaleLinear()
      .domain([0, max(binnedData, (d) => d.y)])
      .range([innerHeight, 0])
      .nice();
  }, [binnedData, innerHeight]);
  useEffect(() => {
    const brush = brushX().extent([
      [0, 0],
      [innerWidth, innerHeight],
    ]);
    brush(select(brushRef.current));
    brush.on("brush end", (e) => {
      setBrushExtent(e.selection && e.selection.map(xScale.invert));
    });
  }, [innerWidth, innerHeight]);
  return (
    <>
      <rect width={width} height={height} fill="none" />
      <g transform={`translate(${margin.left},${margin.top})`}>
        <line y2={innerHeight} />
        <line y2={innerHeight + 1} y1={innerHeight + 1} x2={innerWidth} />
        <AxisBottom height={height} xScale={xScale} tickFormat={xAxisTickFormat} />
        <AxisLeft yScale={yScale} width={width} />
        <text className="label" textAnchor="middle" x={innerWidth / 2} y={height}>
          {" "}
          {xAxisLabel}
        </text>
        <text className="label" textAnchor="middle" transform={`translate(${-50},${innerHeight / 2}) rotate(-90)`}>
          {yAxisLabel}
        </text>
        <Marks
          fill="#ececec"
          binnedData={binnedData}
          xScale={xScale}
          yScale={yScale}
          xValue={xValue}
          yValue={yValue}
          innerHeight={innerHeight}
          tooltip={(d) => d}
        />
        <g ref={brushRef} />
      </g>
    </>
  );
};
