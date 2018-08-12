import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import { BarSeries, CandlestickSeries } from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip } from "react-stockcharts/lib/tooltip";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

class CandleStickChartWithCHMousePointer extends React.Component {
  render() {
    const { type, data: initialData, width, ratio } = this.props;

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      d => d.date
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      initialData
    );

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 150)]);
    const xExtents = [start, end];

    return (
      <ChartCanvas
        height={350}
        ratio={ratio}
        width={width}
        margin={{ left: 50, right: 50, top: 40, bottom: 20 }}
        type={type}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart id={1} yExtents={[d => [d.high, d.low]]}>
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" ticks={15} />
          <MouseCoordinateY
            at="right"
            orient="right"
            displayFormat={format(".2f")}
          />
          <CandlestickSeries />
          <OHLCTooltip forChart={1} origin={[-40, 0]} />
        </Chart>
        <Chart
          id={2}
          height={150}
          yExtents={d => d.volume}
          origin={(w, h) => [0, h - 150]}
        >
          <YAxis
            axisAt="left"
            orient="left"
            ticks={0}
            tickFormat={format(".2s")}
          />

          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            displayFormat={timeFormat("%Y-%m-%d")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")}
          />

          <BarSeries
            yAccessor={d => d.volume}
            fill={d => (d.close > d.open ? "#008c3a" : "#FF0000")}
          />
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    );
  }
}

CandleStickChartWithCHMousePointer.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithCHMousePointer.defaultProps = {
  type: "svg"
};
CandleStickChartWithCHMousePointer = fitWidth(
  CandleStickChartWithCHMousePointer
);

export default CandleStickChartWithCHMousePointer;
