// src/components/questions/QuestionForm.jsx
import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, Checkbox } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const QuestionForm = ({ onSubmit, initialValues, loading = false, submitButtonText = "Simpan" }) => {
  const [form] = Form.useForm();
  // State untuk melacak tipe soal yang dipilih
  const [questionType, setQuestionType] = useState(initialValues?.question_type || null);

  useEffect(() => {
    // Set nilai form jika initialValues berubah (untuk mode edit)
    form.setFieldsValue(initialValues);
    setQuestionType(initialValues?.question_type);
  }, [initialValues, form]);

  const onFinish = (values) => {
    // Memastikan answer_options hanya dikirim jika tipe soal adalah multiple_choice
    const finalValues = {
      ...values,
      answer_options: questionType === 'multiple_choice' ? values.answer_options : [],
    };
    onSubmit(finalValues);
  };

  const handleQuestionTypeChange = (value) => {
    setQuestionType(value);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      <Form.Item
        name="subject"
        label="Mata Pelajaran"
        rules={[{ required: true, message: 'Silakan masukkan mata pelajaran!' }]}
      >
        <Input placeholder="Contoh: Matematika" />
      </Form.Item>

      <Form.Item
        name="topic"
        label="Topik"
        rules={[{ required: true, message: 'Silakan masukkan topik soal!' }]}
      >
        <Input placeholder="Contoh: Aljabar" />
      </Form.Item>

      <Form.Item
        name="content"
        label="Isi Pertanyaan"
        rules={[{ required: true, message: 'Silakan masukkan isi pertanyaan!' }]}
      >
        <TextArea rows={4} placeholder="Tuliskan pertanyaan di sini..." />
      </Form.Item>

      <Form.Item
        name="question_type"
        label="Tipe Soal"
        rules={[{ required: true, message: 'Silakan pilih tipe soal!' }]}
      >
        <Select placeholder="Pilih tipe soal" onChange={handleQuestionTypeChange}>
          <Option value="multiple_choice">Pilihan Ganda</Option>
          <Option value="essay">Esai</Option>
          <Option value="short_answer">Jawaban Singkat</Option>
        </Select>
      </Form.Item>

      {/* Tampilkan field untuk pilihan jawaban HANYA jika tipe soal adalah Pilihan Ganda */}
      {questionType === 'multiple_choice' && (
        <Form.List
          name="answer_options"
          rules={[
            {
              validator: async (_, options) => {
                if (!options || options.length < 2) {
                  return Promise.reject(new Error('Minimal harus ada 2 pilihan jawaban.'));
                }
                const correctAnswers = options.filter(opt => opt && opt.is_correct);
                if (correctAnswers.length === 0) {
                  return Promise.reject(new Error('Harus ada minimal 1 jawaban yang benar.'));
                }
                // Jika ingin hanya satu jawaban benar, tambahkan validasi ini:
                // if (correctAnswers.length > 1) {
                //   return Promise.reject(new Error('Hanya boleh ada 1 jawaban yang benar.'));
                // }
              },
            },
          ]}
        >
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name, ...restField }, index) => (
                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, 'option_text']}
                    validateTrigger={['onChange', 'onBlur']}
                    rules={[{ required: true, message: 'Pilihan jawaban tidak boleh kosong.' }]}
                    style={{ width: '400px' }}
                  >
                    <Input placeholder={`Pilihan ${index + 1}`} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'is_correct']}
                    valuePropName="checked"
                  >
                    <Checkbox>Benar?</Checkbox>
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  Tambah Pilihan Jawaban
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default QuestionForm;