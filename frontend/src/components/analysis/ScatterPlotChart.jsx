// src/components/analysis/ScatterPlotChart.jsx
import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from 'antd';

/**
 * A chart to display a scatter plot of P-Value vs. D-Index.
 * @param {object} props
 * @param {Array} props.data - Array of analysis results, e.g., [{ pValue: 0.5, dIndex: 0.3, ... }]
 * @param {string} props.title - The title of the chart.
 */
const ScatterPlotChart = ({ data, title }) => {

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}>
          <p style={{ fontWeight: 'bold' }}>Soal: {point.question.content.substring(0, 50)}...</p>
          <p>{`P-Value (Kesulitan): ${point.difficulty_index_p_value?.toFixed(3)}`}</p>
          <p>{`D-Index (Pembeda): ${point.discrimination_index?.toFixed(3)}`}</p>
          <p>{`Jumlah Respons: ${point.responses_analyzed_count}`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card title={title}>
      <ResponsiveContainer width="100%" height={400}>
        <ScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis 
            type="number" 
            dataKey="difficulty_index_p_value" 
            name="P-Value (Kesulitan)" 
            domain={[0, 1]} 
            label={{ value: 'Tingkat Kesulitan (P-Value)', position: 'bottom', offset: 0 }}
          />
          <YAxis 
            type="number" 
            dataKey="discrimination_index" 
            name="D-Index (Pembeda)" 
            domain={[-1, 1]} 
            label={{ value: 'Daya Pembeda (D-Index)', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis type="number" dataKey="responses_analyzed_count" range={[60, 400]} name="Jumlah Respons" />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />}/>
          <Scatter name="Soal" data={data} fill="#8884d8" shape="circle" />
        </ScatterChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default ScatterPlotChart;
