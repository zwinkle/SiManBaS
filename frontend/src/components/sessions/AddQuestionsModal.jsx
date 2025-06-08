// src/components/sessions/AddQuestionsModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, message, Card } from 'antd';
import QuestionList from '../questions/QuestionList';
import QuestionFilter from '../questions/QuestionFilter';
import questionService from '../../api/questionService';
import testSessionService from '../../api/testSessionService';
import { getApiErrorMessage } from '../../utils/errors';

const AddQuestionsModal = ({ open, onCancel, session, onQuestionsAdded }) => {
    const [loading, setLoading] = useState(false);
    const [allQuestions, setAllQuestions] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [filters, setFilters] = useState({});
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} soal`
    });

    const fetchAllQuestions = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            const queryParams = { 
                ...currentFilters,
                page: pagination.current,
                limit: pagination.pageSize
            };
            const response = await questionService.getQuestions(queryParams);
            
            const existingQuestionIds = new Set(session.questions.map(q => q.id));
            const availableQuestions = response.items.filter(q => !existingQuestionIds.has(q.id));
            
            setAllQuestions(availableQuestions);
            
            // Update pagination with the correct total count
            setPagination(prev => ({
                ...prev,
                total: response.total || 0,
                // Ensure current page is valid
                current: Math.min(prev.current, Math.ceil((response.total || 0) / prev.pageSize))
            }));
        } catch (error) {
            message.error(`Gagal memuat daftar soal: ${getApiErrorMessage(error)}`);
            setAllQuestions([]);
            setPagination(prev => ({
                ...prev,
                total: 0
            }));
        } finally {
            setLoading(false);
        }
    }, [session, pagination.current, pagination.pageSize]);

    useEffect(() => {
        if (open) {
            fetchAllQuestions(filters);
        }
    }, [open, filters, fetchAllQuestions]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
        if (newFilters.page_size) {
            setPagination(prev => ({
                ...prev,
                pageSize: parseInt(newFilters.page_size),
                current: 1 // Reset to first page when changing page size
            }));
        }
    };

    const handleTableChange = (newPagination) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleAddQuestions = async () => {
        setLoading(true);
        try {
            await testSessionService.addQuestionsToSession(session.id, selectedRowKeys);
            message.success(`${selectedRowKeys.length} soal berhasil ditambahkan.`);
            onQuestionsAdded();
            onCancel();
            setSelectedRowKeys([]);
        } catch (error) {
            message.error(`Gagal menambahkan soal: ${getApiErrorMessage(error)}`);
        } finally {
            setLoading(false);
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        },
    };

    return (
        <Modal
            title="Tambah Soal ke Sesi Ujian"
            open={open}
            onCancel={onCancel}
            width={1200}
            footer={[
                <Button key="back" onClick={onCancel}>Batal</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleAddQuestions} disabled={selectedRowKeys.length === 0}>
                    Tambah {selectedRowKeys.length} Soal Terpilih
                </Button>,
            ]}
        >
            <Card style={{ marginBottom: 16 }}>
                <QuestionFilter onFilterChange={handleFilterChange} loading={loading} />
            </Card>

            <QuestionList
                questions={allQuestions}
                loading={loading}
                pagination={pagination}
                rowSelection={rowSelection}
                onView={() => {}} 
                onEdit={() => {}}
                onDelete={() => {}}
                onTableChange={handleTableChange}
            />
        </Modal>
    );
};

export default AddQuestionsModal;
