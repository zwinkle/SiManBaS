// src/components/analysis/OptionStatsChart.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { Card } from 'antd';

/**
 * A chart to display selection statistics for each answer option of a question.
 * @param {object} props
 * @param {object} props.statsData - The data object from the option-stats API endpoint.
 * It should have a property `options_stats` which is an array.
 */
const OptionStatsChart = ({ statsData }) => {
  if (!statsData || !statsData.options_stats) {
    return <Card title="Statistik Pilihan Jawaban">Data tidak tersedia.</Card>;
  }

  const { options_stats, question_content } = statsData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
          <p className="label">{`${label}`}</p>
          <p className="intro">{`Dipilih oleh: ${payload[0].payload.selection_count} responden`}</p>
          <p className="desc">{`Persentase: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card title={`Statistik Pilihan Jawaban: "${question_content}"`}>
      <ResponsiveContainer width="100%" height={50 * options_stats.length + 50}>
        <BarChart
          layout="vertical"
          data={options_stats}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" domain={[0, 100]} unit="%" />
          <YAxis
            type="category"
            dataKey="option_text"
            width={150}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="selection_percentage" name="Persentase Pemilihan" fill="#8884d8">
            <LabelList dataKey="selection_count" position="right" formatter={(value) => `${value} org`} />
            {options_stats.map((entry, index) => (
              // Beri warna berbeda untuk jawaban yang benar
              <Cell key={`cell-${index}`} fill={entry.is_correct ? '#82ca9d' : '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};

export default OptionStatsChart;
