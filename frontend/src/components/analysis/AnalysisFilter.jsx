// src/components/analysis/AnalysisFilter.jsx
import React, { useState, useEffect } from 'react';
import { Form, Row, Col, Select, Button, InputNumber, App } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';
import metaService from '../../api/metaService';
import { getApiErrorMessage } from '../../utils/errors';

const { Option } = Select;

/**
 * Komponen untuk menyediakan kontrol filter di halaman Analisis.
 * @param {object} props
 * @param {function} props.onFilterChange - Fungsi yang dipanggil saat filter diterapkan.
 * @param {boolean} props.loading - Status loading dari halaman induk.
 */
const AnalysisFilter = ({ onFilterChange, loading }) => {
  const [form] = Form.useForm();
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [isTopicsLoading, setIsTopicsLoading] = useState(false);
  const { message: messageApi } = App.useApp();

  // Memuat daftar mata pelajaran saat komponen dimuat
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

  // Memuat daftar topik saat mata pelajaran dipilih
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
      setTopics([]);
    }
  }, [selectedSubject, messageApi]);

  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    form.setFieldsValue({ topic: undefined }); // Reset field topik
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
      <Col xs={24} sm={12} md={5}>
          <Form.Item name="question_type" label="Tipe Soal">
            <Select placeholder="Semua Tipe" allowClear>
              <Option value="multiple_choice">Pilihan Ganda</Option>
              <Option value="essay">Esai</Option>
              <Option value="short_answer">Jawaban Singkat</Option>
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="subject" label="Mata Pelajaran">
            <Select placeholder="Semua" onChange={handleSubjectChange} allowClear>
              {subjects.map(sub => <Option key={sub} value={sub}>{sub}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="topic" label="Topik">
            <Select placeholder="Pilih Mapel" disabled={!selectedSubject} loading={isTopicsLoading} allowClear>
              {topics.map(top => <Option key={top} value={top}>{top}</Option>)}
            </Select>
          </Form.Item>
        </Col>
        <Col xs={24} sm={12} md={5}>
          <Form.Item name="min_responses" label="Minimal Respons">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="Contoh: 10" />
          </Form.Item>
        </Col>
        <Col xs={24} md={4} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', paddingBottom: '24px' }}>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SearchOutlined />} block>
              Cari
            </Button>
            <Button onClick={handleReset} icon={<ClearOutlined />} block>
              Reset
            </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default AnalysisFilter;
