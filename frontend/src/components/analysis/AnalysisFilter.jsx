// src/components/analysis/AnalysisFilter.jsx
import React from 'react';
import { Form, Row, Col, Input, Select, InputNumber, Button } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

const { Option } = Select;

/**
 * A component providing filter controls for item analysis.
 * @param {object} props
 * @param {function} props.onFilterChange - Function to call when filter values change.
 * @param {boolean} props.loading - Indicates if data is currently being fetched.
 */
const AnalysisFilter = ({ onFilterChange, loading }) => {
  const [form] = Form.useForm();

  const handleFinish = (values) => {
    // Menghapus field yang kosong atau null agar tidak dikirim sebagai query param
    const cleanValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
    onFilterChange(cleanValues);
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({}); // Kirim objek kosong untuk mereset filter
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      style={{ marginBottom: '24px' }}
    >
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="subject" label="Mata Pelajaran">
            <Input placeholder="Filter berdasarkan mata pelajaran" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="topic" label="Topik">
            <Input placeholder="Filter berdasarkan topik" />
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="question_type" label="Tipe Soal">
            <Select placeholder="Semua tipe" allowClear>
              <Option value="multiple_choice">Pilihan Ganda</Option>
              <Option value="essay">Esai</Option>
              <Option value="short_answer">Jawaban Singkat</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Form.Item name="min_responses" label="Minimal Respons">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Contoh: 10" />
          </Form.Item>
        </Col>
        <Col xs={24} style={{ textAlign: 'right' }}>
          <Button onClick={handleReset} icon={<ClearOutlined />} style={{ marginRight: 8 }}>
            Reset Filter
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
            Terapkan Filter
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AnalysisFilter;

