// src/pages/QuestionListPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Space, App } from 'antd'; // Impor App untuk notifikasi
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import QuestionList from '../components/questions/QuestionList';
import BulkUploadModal from '../components/questions/BulkUploadModal';
import questionService from '../api/questionService';
import { getApiErrorMessage } from '../utils/errors';

const QuestionListPage = () => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const navigate = useNavigate();
    const { message: messageApi } = App.useApp(); // Gunakan hook AntD untuk notifikasi

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
    });

    // Fungsi untuk mengambil data, kini hanya menerima parameter yang dibutuhkan
    const fetchQuestions = useCallback(async (page, pageSize) => {
        setLoading(true);
        try {
            const queryParams = {
                skip: (page - 1) * pageSize,
                limit: pageSize,
            };
            const response = await questionService.getQuestions(queryParams);
            setQuestions(response.items);
            // Update total item dari respons API
            setPagination(prev => ({ ...prev, total: response.total }));
        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [messageApi]); // Tambahkan messageApi sebagai dependensi

    // useEffect ini HANYA berjalan satu kali saat komponen pertama kali dimuat
    useEffect(() => {
        fetchQuestions(pagination.current, pagination.pageSize);
    }, [fetchQuestions]); // Dependensi pada fetchQuestions

    // Fungsi ini akan dipanggil oleh komponen Tabel saat pengguna berinteraksi
    const handleTableChange = (newPagination) => {
        // Update state pagination dengan halaman dan ukuran halaman yang baru
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
        // Panggil kembali data dengan parameter paginasi yang baru
        fetchQuestions(newPagination.current, newPagination.pageSize);
    };

    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        // Kembali ke halaman pertama setelah upload berhasil
        setPagination(prev => ({ ...prev, current: 1 }));
        fetchQuestions(1, pagination.pageSize);
    };

    const handleDelete = async (id) => {
        try {
            await questionService.deleteQuestion(id);
            messageApi.success('Soal berhasil dihapus.');
            // Muat ulang daftar soal di halaman saat ini
            fetchQuestions(pagination.current, pagination.pageSize);
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
