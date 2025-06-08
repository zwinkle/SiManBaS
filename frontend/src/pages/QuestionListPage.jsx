// src/pages/QuestionListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Space } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import QuestionList from '../components/questions/QuestionList';
import BulkUploadModal from '../components/questions/BulkUploadModal';
import questionService from '../api/questionService';
import { getApiErrorMessage } from '../utils/errors';

const QuestionListPage = () => {
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchQuestions = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const queryParams = {
                skip: (params.page - 1) * params.pageSize,
                limit: params.pageSize,
            };
            const response = await questionService.getQuestions(queryParams);
            setQuestions(response.items);
            setPagination(prev => ({ ...prev, total: response.total }));
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuestions({ page: pagination.current, pageSize: pagination.pageSize });
    }, []);

    const handleTableChange = (newPagination) => {
        const newParams = { page: newPagination.current, pageSize: newPagination.pageSize };
        setPagination(newParams);
        fetchQuestions(newParams);
    };

    const handleUploadSuccess = () => {
        // Muat ulang data di halaman pertama setelah upload berhasil
        const newParams = { page: 1, pageSize: pagination.pageSize };
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchQuestions(newParams);
    };

    const handleView = (id) => navigate(`/questions/${id}`);
    const handleEdit = (id) => navigate(`/questions/edit/${id}`);
    const handleDelete = async (id) => {
        try {
            await questionService.deleteQuestion(id);
            message.success('Soal berhasil dihapus.');
            // Muat ulang daftar soal di halaman saat ini setelah berhasil dihapus
            fetchQuestions({ page: pagination.current, pageSize: pagination.pageSize });
        } catch (error) {
            message.error(getApiErrorMessage(error));
        }
    };

    return (
        <div>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
                <PageTitle title="Bank Soal" level={2} style={{ marginBottom: 0 }} />
                <Space>
                    <Button 
                        icon={<UploadOutlined />}
                        onClick={() => setIsUploadModalOpen(true)}
                    >
                        Upload Soal
                    </Button>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/questions/create')}
                    >
                        Tambah Soal Baru
                    </Button>
                </Space>
            </Space>
            
            <QuestionList 
                questions={questions}
                loading={loading}
                pagination={{
                    current: pagination.current,
                    pageSize: pagination.pageSize,
                    total: pagination.total,
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} soal`,
                }}
                onTableChange={handleTableChange}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <BulkUploadModal
                open={isUploadModalOpen}
                onCancel={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default QuestionListPage;
