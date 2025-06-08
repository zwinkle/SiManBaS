// src/pages/AnalysisPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, message, Card } from 'antd';
import PageTitle from '../components/common/PageTitle';
import AnalysisFilter from '../components/analysis/AnalysisFilter';
import DistributionChart from '../components/analysis/DistributionChart';
import ScatterPlotChart from '../components/analysis/ScatterPlotChart';
import AnalysisSummaryTable from '../components/analysis/AnalysisSummaryTable';
import analysisService from '../api/analysisService';
import { getApiErrorMessage } from '../utils/errors';
import { useNavigate } from 'react-router-dom';

const AnalysisPage = () => {
    const [analysisData, setAnalysisData] = useState([]);
    const [filters, setFilters] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchAnalysisData = useCallback(async (currentFilters) => {
        try {
            setLoading(true);
            const data = await analysisService.getAnalysisSummary(currentFilters);
            setAnalysisData(data);
        } catch (error) {
            message.error(getApiErrorMessage(error));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalysisData(filters);
    }, [filters, fetchAnalysisData]);

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    const pValues = analysisData
        .map(item => item.difficulty_index_p_value)
        .filter(p => p !== null && p !== undefined);

    const dIndexes = analysisData
        .map(item => item.discrimination_index)
        .filter(d => d !== null && d !== undefined);

    return (
        <div>
            <PageTitle title="Analisis Kualitas Bank Soal" />
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
        </div>
    );
};

export default AnalysisPage;
