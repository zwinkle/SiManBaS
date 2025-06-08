// src/components/questions/QuestionList.jsx
import React from 'react';
import { Table, Button, Space, Tag, Popconfirm, Tooltip } from 'antd';
import { EyeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

/**
 * Komponen untuk menampilkan daftar soal dalam tabel dengan paginasi.
 * @param {object} props
 * @param {Array} props.questions - Array soal untuk ditampilkan.
 * @param {boolean} props.loading - Status loading.
 * @param {object} props.pagination - Objek konfigurasi paginasi dari AntD.
 * @param {function} props.onTableChange - Handler saat paginasi atau sort berubah.
 * @param {function} props.onView - Handler untuk tombol lihat.
 * @param {function} props.onEdit - Handler untuk tombol edit.
 * @param {function} props.onDelete - Handler untuk tombol hapus.
 */
const QuestionList = ({ questions, loading, pagination, onTableChange, onView, onEdit, onDelete }) => {

  const getTagColor = (type) => {
    switch (type) {
      case 'multiple_choice': return 'blue';
      case 'essay': return 'green';
      case 'short_answer': return 'purple';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Isi Pertanyaan',
      dataIndex: 'content',
      key: 'content',
      render: (text) => (
        <Tooltip title={text}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </Tooltip>
      ),
    },
    {
      title: 'Tipe',
      dataIndex: 'question_type',
      key: 'question_type',
      render: (type) => <Tag color={getTagColor(type)}>{type.replace('_', ' ').toUpperCase()}</Tag>,
    },
    {
      title: 'Mata Pelajaran',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Topik',
      dataIndex: 'topic',
      key: 'topic',
    },
    {
      title: 'Aksi',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Lihat Detail"><Button type="text" icon={<EyeOutlined />} onClick={() => onView(record.id)} /></Tooltip>
          <Tooltip title="Edit"><Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record.id)} /></Tooltip>
          <Popconfirm
            title="Hapus Soal"
            description="Apakah Anda yakin ingin menghapus soal ini?"
            onConfirm={() => onDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Batal"
          >
            <Tooltip title="Hapus"><Button type="text" danger icon={<DeleteOutlined />} /></Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={questions}
      loading={loading}
      rowKey="id"
      pagination={pagination} // <-- Gunakan prop paginasi
      onChange={onTableChange} // <-- Gunakan prop handler perubahan
    />
  );
};

export default QuestionList;
