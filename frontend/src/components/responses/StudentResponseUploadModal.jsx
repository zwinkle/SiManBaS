// src/components/responses/StudentResponseUploadModal.jsx
import React, { useState } from 'react';
import { Modal, Upload, Button, message, List, Typography, Divider, Space, Tag } from 'antd';
import { InboxOutlined, FileTextOutlined } from '@ant-design/icons';
import useAuth from '../../hooks/useAuth';

const { Dragger } = Upload;
const { Text, Paragraph } = Typography;

const StudentResponseUploadModal = ({ open, onCancel, onUploadSuccess }) => {
    const { token } = useAuth();
    const [uploadResponse, setUploadResponse] = useState(null);

    const draggerProps = {
        name: 'file',
        multiple: false,
        action: `${import.meta.env.VITE_API_BASE_URL}/responses/bulk`,
        headers: {
            Authorization: `Bearer ${token}`,
        },
        accept: ".csv,.json",
        onChange(info) {
            const { status, response } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} berhasil diunggah dan diproses.`);
                setUploadResponse(response);
                onUploadSuccess(); // Panggil callback untuk refresh data di halaman utama
            } else if (status === 'error') {
                const errorMessage = response?.detail || `${info.file.name} gagal diunggah.`;
                message.error(errorMessage);
                setUploadResponse(response);
            }
        },
        beforeUpload: (file) => {
            setUploadResponse(null); // Reset response saat file baru dipilih
            return true;
        },
    };

    return (
        <Modal
            title="Upload Jawaban Siswa Secara Massal"
            open={open}
            onCancel={onCancel}
            footer={[<Button key="back" onClick={onCancel}>Tutup</Button>]}
            width={800}
        >
            <Paragraph>
                Unggah file CSV atau JSON yang berisi jawaban siswa. Pastikan format file sesuai dengan template. Untuk soal pilihan ganda, `is_response_correct` bisa dikosongkan agar dinilai otomatis.
            </Paragraph>
             <Space>
                <a href="/templates/responses_template.csv" download>
                    <Button icon={<FileTextOutlined />}>Unduh Template CSV</Button>
                </a>
                <a href="/templates/responses_template.json" download>
                    <Button icon={<FileTextOutlined />}>Unduh Template JSON</Button>
                </a>
             </Space>

            <Divider />

            <Dragger {...draggerProps}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Klik atau seret file ke area ini untuk mengunggah</p>
            </Dragger>

            {uploadResponse && (
                <div style={{ marginTop: 24 }}>
                    <Divider>Hasil Proses Upload</Divider>
                    <p>Total Baris Diproses: <Text strong>{uploadResponse.total_processed}</Text></p>
                    <p>Berhasil Dibuat: <Text strong style={{ color: 'green' }}>{uploadResponse.successfully_created}</Text></p>
                    <p>Gagal: <Text strong style={{ color: 'red' }}>{uploadResponse.errors?.length || 0}</Text></p>
                    
                    {uploadResponse.errors?.length > 0 && (
                        <List
                            header={<div>Detail Error</div>}
                            bordered
                            dataSource={uploadResponse.errors}
                            renderItem={(item) => (
                                <List.Item>
                                    <Text type="danger">
                                        <Tag color="red">Baris {item.row_number}</Tag> {item.error_message}
                                    </Text>
                                </List.Item>
                            )}
                            style={{ maxHeight: 200, overflowY: 'auto', marginTop: 16 }}
                        />
                    )}
                </div>
            )}
        </Modal>
    );
};

export default StudentResponseUploadModal;
