// src/pages/QuestionListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Space, App, Card } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import QuestionList from '../components/questions/QuestionList';
import BulkUploadModal from '../components/questions/BulkUploadModal';
import QuestionFilter from '../components/questions/QuestionFilter'
import questionService from '../api/questionService';
import { getApiErrorMessage } from '../utils/errors';

const QuestionListPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const navigate = useNavigate();
    const { message: messageApi } = App.useApp();

    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} soal`,
        pageSizeOptions: ['5', '10', '50', '100']
    });

    const fetchQuestions = useCallback(async (currentFilters, currentPage, currentPageSize) => {
        setLoading(true);
        try {
            const queryParams = {
                ...currentFilters,
                page: currentPage,
                limit: currentPageSize,
            };
            const response = await questionService.getQuestions(queryParams);
            setQuestions(response.items);
            setPagination(prev => ({ 
                ...prev, 
                total: response.total || 0,
                current: Math.min(prev.current, Math.ceil((response.total || 0) / prev.pageSize))
            }));
        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
            setQuestions([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    // useEffect ini HANYA berjalan satu kali saat komponen pertama kali dimuat
    useEffect(() => {
        fetchQuestions(filters, pagination.current, pagination.pageSize);
    }, [filters, pagination.current, pagination.pageSize, fetchQuestions]);

    const handleFilterChange = (newFilters) => {
        // Saat filter baru diterapkan, kembali ke halaman pertama
        setPagination(prev => ({ ...prev, current: 1 }));
        setFilters(newFilters);
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        handleFilterChange({});
    };

    const handleDelete = async (id) => {
        try {
            await questionService.deleteQuestion(id);
            messageApi.success('Soal berhasil dihapus.');
            fetchQuestions(filters, pagination.current, pagination.pageSize);
        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
        }
    };
    
    return (
        <div>
            <Space style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap' }}>
                <PageTitle title="Bank Soal" level={2} style={{ marginBottom: 0 }} />
                <Space>
                    <Button icon={<UploadOutlined />} onClick={() => setIsUploadModalOpen(true)}>
                        Upload Soal
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/questions/create')}>
                        Tambah Soal Baru
                    </Button>
                </Space>
            </Space>
            
            <Card style={{ marginBottom: 24 }}>
                <QuestionFilter onFilterChange={handleFilterChange} loading={loading} />
            </Card>

            <QuestionList 
                questions={questions}
                loading={loading}
                pagination={pagination}
                onTableChange={handleTableChange}
                onView={(id) => navigate(`/questions/${id}`)}
                onEdit={(id) => navigate(`/questions/edit/${id}`)}
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
