// src/components/dashboard/StatCard.jsx
import React from 'react';
import { Card, Statistic, Skeleton } from 'antd';

const StatCard = ({ title, value, icon, loading, precision = 0, prefix, suffix, style = {} }) => {
  if (loading) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 1 }} />
      </Card>
    );
  }

  return (
    <Card style={style}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        prefix={icon ? <span style={{ marginRight: 8 }}>{icon}</span> : prefix}
        suffix={suffix}
      />
    </Card>
  );
};

export default StatCard;