// src/pages/AnalysisPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, message, Card, Button, App } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import PageTitle from '../components/common/PageTitle';
import AnalysisFilter from '../components/analysis/AnalysisFilter'; // <-- Gunakan filter yang sudah diperbarui
import DistributionChart from '../components/analysis/DistributionChart';
import ScatterPlotChart from '../components/analysis/ScatterPlotChart';
import AnalysisSummaryTable from '../components/analysis/AnalysisSummaryTable';
import StudentResponseUploadModal from '../components/responses/StudentResponseUploadModal';
import analysisService from '../api/analysisService';
import { getApiErrorMessage } from '../utils/errors';

const AnalysisPage = () => {
    const [analysisData, setAnalysisData] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const { message: messageApi } = App.useApp();
    const navigate = useNavigate();

    // Fungsi untuk mengambil data analisis dari backend
    const fetchAnalysisData = useCallback(async (currentFilters) => {
        setLoading(true);
        try {
            // Gabungkan filter dengan parameter paginasi jika ada
            const queryParams = { ...currentFilters };
            const data = await analysisService.getAnalysisSummary(queryParams);
            setAnalysisData(data);
        } catch (error) {
            messageApi.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, [messageApi]);

    // Panggil fetchAnalysisData saat filter berubah
    useEffect(() => {
        fetchAnalysisData(filters);
    }, [filters, fetchAnalysisData]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };
    
    const handleUploadSuccess = () => {
        setIsUploadModalOpen(false);
        fetchAnalysisData(filters); // Muat ulang data setelah upload jawaban berhasil
        messageApi.info("Data analisis akan diperbarui saat Anda memicu analisis ulang pada soal terkait.");
    };

    // Ekstrak data untuk grafik
    const pValues = analysisData.map(item => item.difficulty_index_p_value).filter(p => p !== null);
    const dIndexes = analysisData.map(item => item.discrimination_index).filter(d => d !== null);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <PageTitle title="Analisis Kualitas Bank Soal" style={{ marginBottom: 0 }} />
                <Button 
                    icon={<UploadOutlined />}
                    onClick={() => setIsUploadModalOpen(true)}
                >
                    Upload Jawaban Siswa
                </Button>
            </div>
            
            <Card style={{ marginBottom: 24 }}>
                <AnalysisFilter onFilterChange={handleFilterChange} loading={loading} />
            </Card>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={12}>
                    <DistributionChart 
                        data={pValues}
                        title="Distribusi Tingkat Kesulitan (P-Value)"
                        dataKey="P-Value"
                    />
                </Col>
                <Col xs={24} lg={12}>
                    <DistributionChart 
                        data={dIndexes}
                        title="Distribusi Daya Pembeda (D-Index)"
                        dataKey="D-Index"
                    />
                </Col>
                <Col xs={24}>
                    <ScatterPlotChart 
                        data={analysisData}
                        title="Peta Kualitas Soal (P-Value vs D-Index)"
                    />
                </Col>
                <Col xs={24}>
                    <Card title="Tabel Rincian Analisis">
                        <AnalysisSummaryTable 
                            analysisData={analysisData}
                            loading={loading}
                            onViewQuestion={(questionId) => navigate(`/questions/${questionId}`)}
                        />
                    </Card>
                </Col>
            </Row>

            <StudentResponseUploadModal
                open={isUploadModalOpen}
                onCancel={() => setIsUploadModalOpen(false)}
                onUploadSuccess={handleUploadSuccess}
            />
        </div>
    );
};

export default AnalysisPage;
