// src/components/analysis/AnalysisSummaryTable.jsx
import React from 'react';
import { Table, Button, Tooltip, Tag, Alert, Space } from 'antd';
import { AreaChartOutlined, WarningOutlined } from '@ant-design/icons';

const AnalysisSummaryTable = ({ analysisData, loading, onViewQuestion }) => {

    const getPValueTag = (value) => {
        if (value === null || value === undefined) return <Tag>N/A</Tag>;
        let color = 'green';
        if (value < 0.3) color = 'red'; // Sulit
        if (value > 0.7) color = 'gold'; // Mudah
        return <Tag color={color}>{value.toFixed(3)}</Tag>;
    };

    const getDIndexTag = (value) => {
        if (value === null || value === undefined) return <Tag>N/A</Tag>;
        let color = 'blue'; // Cukup/Baik
        if (value >= 0.4) color = 'green'; // Sangat Baik
        if (value < 0.2) color = 'red'; // Buruk
        return <Tag color={color}>{value.toFixed(3)}</Tag>;
    };

    const columns = [
        {
            title: 'Soal',
            dataIndex: ['question', 'content'],
            key: 'content',
            render: (text, record) => {
                const needsReview = record.discrimination_index !== null && record.discrimination_index < 0.2;
                return (
                    <Space>
                        {needsReview && (
                            <Tooltip title="Soal ini memiliki daya pembeda rendah dan perlu direview.">
                                <WarningOutlined style={{ color: '#faad14' }} />
                            </Tooltip>
                        )}
                        <Tooltip title={text}>
                            <span>{text && text.length > 90 ? `${text.substring(0, 90)}...` : text}</span>
                        </Tooltip>
                    </Space>
                );
            },
        },
        {
            title: 'P-Value',
            dataIndex: 'difficulty_index_p_value',
            key: 'pValue',
            align: 'center',
            sorter: (a, b) => (a.difficulty_index_p_value || -1) - (b.difficulty_index_p_value || -1),
            render: getPValueTag,
        },
        {
            title: 'D-Index',
            dataIndex: 'discrimination_index',
            key: 'dIndex',
            align: 'center',
            sorter: (a, b) => (a.discrimination_index || -2) - (b.discrimination_index || -2),
            render: getDIndexTag,
        },
        {
            title: 'Jml. Respons',
            dataIndex: 'responses_analyzed_count',
            key: 'responsesCount',
            align: 'center',
            sorter: (a, b) => a.responses_analyzed_count - b.responses_analyzed_count,
        },
        {
            title: 'Aksi',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <Tooltip title="Lihat Detail Analisis">
                    <Button
                        type="text"
                        icon={<AreaChartOutlined />}
                        onClick={() => onViewQuestion(record.question_id)}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <>
            <Alert
                message="Panduan Interpretasi"
                description={
                    <div>
                        <p><Tag color="green">P-Value Ideal (0.3 - 0.7)</Tag> <Tag color="gold">Mudah (&gt;0.7)</Tag> <Tag color="red">Sulit (&lt;0.3)</Tag></p>
                        <p><Tag color="green">D-Index Sangat Baik (&ge;0.4)</Tag> <Tag color="blue">Baik (0.2 - 0.39)</Tag> <Tag color="red">Buruk (&lt;0.2)</Tag></p>
                    </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
            />
            <Table
                columns={columns}
                dataSource={analysisData}
                loading={loading}
                rowKey="id"
                scroll={{ x: 800 }}
            />
        </>
    );
};

export default AnalysisSummaryTable;
