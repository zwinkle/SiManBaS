// src/components/analysis/AnalysisTriggerModal.jsx

import React, { useState } from 'react';
import { Modal, Upload, Button, message, Typography, Divider } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import Papa from 'papaparse';

const { Paragraph, Text } = Typography;

const AnalysisTriggerModal = ({ open, onCancel, onRunAnalysis, loading }) => {
    const [scores, setScores] = useState(null);
    const [fileName, setFileName] = useState('');

    const handleFileParse = (file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target.result;
                let parsedScores = {};
                
                if (file.type === 'application/json') {
                    const data = JSON.parse(text);
                    if (data.scores && typeof data.scores === 'object') {
                        parsedScores = data.scores;
                    } else {
                        throw new Error("Format JSON tidak valid. Harus berupa objek dengan key 'scores'.");
                    }
                } else { // Asumsikan CSV
                    const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                    if (!result.meta.fields.includes('student_identifier') || !result.meta.fields.includes('total_score')) {
                        throw new Error("Header CSV harus berisi 'student_identifier' dan 'total_score'.");
                    }
                    result.data.forEach(row => {
                        parsedScores[row.student_identifier] = parseFloat(row.total_score);
                    });
                }
                
                setScores(parsedScores);
                setFileName(file.name);
                message.success(`File ${file.name} berhasil dibaca dan siap untuk dianalisis.`);

            } catch (err) {
                message.error(`Gagal memproses file: ${err.message}`);
                setScores(null);
                setFileName('');
            }
        };
        reader.readAsText(file);
        return false; // Mencegah upload otomatis
    };
    
    const handleRun = () => {
        onRunAnalysis(scores);
    };

    return (
        <Modal
            title="Jalankan Analisis dengan Skor"
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>Batal</Button>,
                <Button key="submit" type="primary" loading={loading} onClick={handleRun} disabled={!scores}>
                    Jalankan Analisis
                </Button>,
            ]}
        >
            <Paragraph>
                Untuk menghitung Indeks Diskriminasi, unggah file CSV atau JSON yang berisi skor total setiap siswa.
            </Paragraph>
            <a href="/templates/scores_template.csv" download>
                <Button icon={<FileTextOutlined />}>Unduh Template Skor</Button>
            </a>
            <Divider />
            <Upload.Dragger
                name="file"
                multiple={false}
                accept=".csv,.json"
                beforeUpload={handleFileParse}
                onRemove={() => { setScores(null); setFileName(''); }}
                maxCount={1}
            >
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Klik atau seret file skor ke area ini</p>
            </Upload.Dragger>
            {fileName && <Text type="success" style={{marginTop: 8, display: 'block'}}>File terpilih: {fileName}</Text>}
        </Modal>
    );
};

export default AnalysisTriggerModal;
