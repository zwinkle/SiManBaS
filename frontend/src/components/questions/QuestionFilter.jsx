// src/components/questions/QuestionFilter.jsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Select, Button, App } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import metaService from '../../api/metaService';
import { getApiErrorMessage } from '../../utils/errors';

const { Option } = Select;

const QuestionFilter = ({ onFilterChange, loading }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isTopicsLoading, setIsTopicsLoading] = useState(false);
  const { message: messageApi } = App.useApp();

  // Efek untuk memuat daftar mata pelajaran saat komponen dimuat
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await metaService.getSubjects();
        setSubjects(data);
      } catch (error) {
        messageApi.error(`Gagal memuat mata pelajaran: ${getApiErrorMessage(error)}`);
      }
    };
    fetchSubjects();
  }, [messageApi]);

  // Efek untuk memuat daftar topik saat mata pelajaran dipilih
  useEffect(() => {
    if (selectedSubject) {
      const fetchTopics = async () => {
        setIsTopicsLoading(true);
        try {
          const data = await metaService.getTopics(selectedSubject);
          setTopics(data);
        } catch (error) {
            messageApi.error(`Gagal memuat topik: ${getApiErrorMessage(error)}`);
        } finally {
            setIsTopicsLoading(false);
        }
      };
      fetchTopics();
    } else {
      setTopics([]); // Kosongkan topik jika tidak ada mata pelajaran yang dipilih
    }
  }, [selectedSubject, messageApi]);

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    form.setFieldsValue({ topic: undefined }); // Reset field topik saat mata pelajaran berubah
  };
  
  const handleFinish = (values) => {
    const cleanValues = Object.fromEntries(
      Object.entries(values).filter(([_, v]) => v !== null && v !== undefined && v !== '')
    );
    onFilterChange(cleanValues);
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedSubject(null);
    onFilterChange({});
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      <Row gutter={[16, 0]}>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="question_type" label="Tipe Soal">
            <Select placeholder="Semua Tipe" allowClear>
              <Option value="multiple_choice">Pilihan Ganda</Option>
              <Option value="essay">Esai</Option>
              <Option value="short_answer">Jawaban Singkat</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="subject" label="Mata Pelajaran">
            <Select
              placeholder="Semua Mata Pelajaran"
              onChange={handleSubjectChange}
              allowClear
              loading={subjects.length === 0 && loading}
            >
              {subjects.map(sub => <Option key={sub} value={sub}>{sub}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Form.Item name="topic" label="Topik">
            <Select
              placeholder={!selectedSubject ? "Pilih Mata Pelajaran Dulu" : "Semua Topik"}
              disabled={!selectedSubject}
              loading={isTopicsLoading}
              allowClear
            >
              {topics.map(top => <Option key={top} value={top}>{top}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
          <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />}>
            Cari
          </Button>
          <Button onClick={handleReset} icon={<ClearOutlined />}>
            Reset
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default QuestionFilter;
