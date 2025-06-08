// src/components/common/PageTitle.jsx
import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const PageTitle = ({ title, level = 2, style = {} }) => {
  return (
    <Title level={level} style={{ marginBottom: '24px', ...style }}>
      {title}
    </Title>
  );
};

export default PageTitle;