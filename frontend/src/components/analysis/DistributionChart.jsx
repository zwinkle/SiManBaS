// src/components/analysis/DistributionChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'antd';

/**
 * A reusable chart to display data distribution as a histogram.
 * @param {object} props
 * @param {Array<number>} props.data - An array of numerical data points (e.g., all P-values).
 * @param {string} props.title - The title of the chart.
 * @param {string} props.dataKey - The name for the data (e.g., "P-Value").
 * @param {number} [props.binCount=10] - The number of bars/bins in the histogram.
 */
const DistributionChart = ({ data, title, dataKey = "Value", binCount = 10 }) => {
  // Helper function to create histogram bins from raw data
  const createHistogramData = (rawData) => {
    if (!rawData || rawData.length === 0) return [];

    const minValue = Math.min(...rawData);
    const maxValue = Math.max(...rawData);
    const binSize = (maxValue - minValue) / binCount;

    // Initialize bins
    const bins = Array.from({ length: binCount }, (_, i) => {
      const rangeStart = minValue + i * binSize;
      const rangeEnd = rangeStart + binSize;
      return {
        name: `${rangeStart.toFixed(2)}-${rangeEnd.toFixed(2)}`,
        [dataKey]: 0,
      };
    });
    
    // Fallback for single value
    if (binSize === 0) {
        bins[0].name = `${minValue.toFixed(2)}`;
        bins[0][dataKey] = rawData.length;
        return bins;
    }

    // Populate bins with data
    for (const value of rawData) {
      let binIndex = Math.floor((value - minValue) / binSize);
      // Handle edge case where value is exactly maxValue
      if (binIndex === binCount) {
        binIndex = binCount - 1;
      }
      if (bins[binIndex]) {
        bins[binIndex][dataKey]++;
      }
    }
    return bins;
  };

  const histogramData = createHistogramData(data);

  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={histogramData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" angle={-30} textAnchor="end" height={50} />
          <YAxis allowDecimals={false} label={{ value: 'Jumlah Soal', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default DistributionChart;
