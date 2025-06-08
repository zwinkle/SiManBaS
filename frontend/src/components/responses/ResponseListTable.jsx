// src/components/responses/ResponseListTable.jsx
import React from 'react';
import { Table, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { formatDateTime } from '../../utils/formatters';

const ResponseListTable = ({ responses, loading }) => {
    const columns = [
        {
            title: 'ID Siswa',
            dataIndex: 'student_identifier',
            key: 'student_identifier',
        },
        {
            title: 'ID Sesi Tes',
            dataIndex: 'test_session_identifier',
            key: 'test_session_identifier',
        },
        {
            title: 'Jawaban',
            dataIndex: 'response_text',
            key: 'response_text',
            render: (text, record) => {
                // Tampilkan ID opsi jika pilihan ganda, atau teks jika esai
                return record.selected_option_id || text || <Tag>Tidak ada jawaban</Tag>;
            }
        },
        {
            title: 'Benar/Salah',
            dataIndex: 'is_response_correct',
            key: 'is_response_correct',
            align: 'center',
            render: (isCorrect) => {
                if (isCorrect === null || isCorrect === undefined) return <Tag>?</Tag>;
                return isCorrect ? 
                    <Tooltip title="Benar"><CheckCircleOutlined style={{ color: 'green', fontSize: '18px' }} /></Tooltip> : 
                    <Tooltip title="Salah"><CloseCircleOutlined style={{ color: 'red', fontSize: '18px' }} /></Tooltip>;
            }
        },
        {
            title: 'Waktu Submit',
            dataIndex: 'submitted_at',
            key: 'submitted_at',
            render: (date) => formatDateTime(date),
        },
    ];

    return (
        <Table
            columns={columns}
            dataSource={responses}
            loading={loading}
            rowKey="id"
            scroll={{ x: true }}
        />
    );
};

export default ResponseListTable;