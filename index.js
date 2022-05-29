import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useWorldAtlas } from "./Data/useWorldAtlas";
import { useData } from "./Data/useData";

import { scaleSqrt, max } from "d3";
import { BubbleMap } from "./BubbleMap/index";
import { DateHistogram } from "./DateHistogram/index";
const width = 960;
const height = 650;
const DateHistogramSize = 0.4;
const xValue = (d) => d["Reported Date"];
const App = () => {
  const worldAtlas = useWorldAtlas();
  const data = useData();
  const [brushExtent, setBrushExtent] = useState();
  // console.log(brushExtent)
  if (!worldAtlas || !data) {
    return <pre>Loading...</pre>;
  }
  const filteredData = brushExtent
    ? data.filter((d) => {
        const date = xValue(d);
        return date > brushExtent[0] && date < brushExtent[1];
      })
    : data;
  return (
    <>
      <div id="title">
        <h1>Dead and Missing Migrants [2014-2020]</h1>
      </div>
      <svg width={width} height={height}>
        <BubbleMap data={data} worldAtlas={worldAtlas} filteredData={filteredData} />
        <g transform={`translate(0,${height - DateHistogramSize * height})`}>
          <DateHistogram
            data={data}
            height={DateHistogramSize * height}
            width={width}
            setBrushExtent={setBrushExtent}
            xValue={xValue}
          />
        </g>
        <g className="copyright" transform={`translate(${width - 35},${height - 25}) `}>
          <text textAnchor="middle" dx={-15} dy={18}>
            By
          </text>
          <a xlink:href="https://thembdev.com">
            {" "}
            <image xlink:href="https://mbdev-utils.s3.eu-west-3.amazonaws.com/mbdev_logo_sm.svg" width={25} />
          </a>
        </g>
      </svg>
    </>
  );
};
const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
