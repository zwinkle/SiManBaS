// src/components/comments/CommentForm.jsx
import React, { useState } from 'react';
import { Form, Button, Input } from 'antd';

const { TextArea } = Input;

/**
 * Form untuk menulis dan mengirim komentar baru.
 */
const CommentForm = ({ onSubmit, loading }) => {
    const [form] = Form.useForm();

    const onFinish = (values) => {
        onSubmit(values);
        form.resetFields(); // Reset form setelah submit
    };

    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
                name="content"
                rules={[{ required: true, message: 'Komentar tidak boleh kosong!' }]}
            >
                <TextArea rows={3} placeholder="Tuliskan umpan balik atau komentar Anda di sini..." />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" loading={loading} type="primary">
                    Kirim Komentar
                </Button>
            </Form.Item>
        </Form>
    );
};

export default CommentForm;