// src/components/questions/QuestionForm.jsx
import React, { useEffect } from 'react';
import { Form, Input, Button, Select, Space, Checkbox } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

/**
 * Komponen form yang dapat digunakan kembali untuk membuat dan mengedit soal.
 * @param {object} props
 * @param {function} props.onSubmit - Fungsi yang dipanggil saat form disubmit.
 * @param {object} [props.initialValues] - Nilai awal untuk mengisi form (mode edit).
 * @param {boolean} [props.loading=false] - Status loading untuk tombol submit.
 * @param {string} [props.submitButtonText="Simpan"] - Teks untuk tombol submit.
 */
const QuestionForm = ({ onSubmit, initialValues, loading = false, submitButtonText = "Simpan" }) => {
  const [form] = Form.useForm();

  // Gunakan Form.useWatch untuk memantau perubahan pada field 'question_type'
  // Ini adalah cara modern dan efisien untuk rendering kondisional di AntD Form.
  const questionType = Form.useWatch('question_type', form);

  // Gunakan useEffect untuk mengisi form saat initialValues tersedia (mode edit)
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, form]);

  const onFinish = (values) => {
    // Pastikan answer_options hanya dikirim jika tipe soal adalah multiple_choice
    // dan correct_answer_text hanya dikirim jika tipe soal adalah short_answer.
    const finalValues = {
        ...values,
        answer_options: values.question_type === 'multiple_choice' ? values.answer_options || [] : [],
        correct_answer_text: values.question_type === 'short_answer' ? values.correct_answer_text : null,
    };
    onSubmit(finalValues);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
      name="question_form"
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
        <Input placeholder="Contoh: Aljabar Dasar" />
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
        <Select placeholder="Pilih tipe soal">
          <Option value="multiple_choice">Pilihan Ganda</Option>
          <Option value="short_answer">Jawaban Singkat</Option>
          <Option value="essay">Esai</Option>
        </Select>
      </Form.Item>

      {/* Tampilkan input Kunci Jawaban HANYA jika tipe soal adalah Jawaban Singkat */}
      {questionType === 'short_answer' && (
        <Form.Item
            name="correct_answer_text"
            label="Kunci Jawaban Teks"
            rules={[{ required: true, message: 'Kunci jawaban harus diisi untuk tipe soal ini!' }]}
            help="Sistem akan mencocokkan jawaban siswa dengan teks ini (tidak peka huruf besar/kecil)."
        >
            <Input placeholder="Masukkan jawaban teks yang dianggap benar" />
        </Form.Item>
      )}

      {/* Tampilkan field Pilihan Jawaban HANYA jika tipe soal adalah Pilihan Ganda */}
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
                    rules={[{ required: true, whitespace: true, message: 'Pilihan jawaban tidak boleh kosong.' }]}
                    style={{ flexGrow: 1 }}
                  >
                    <Input placeholder={`Pilihan ${index + 1}`} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'is_correct']}
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox>Benar?</Checkbox>
                  </Form.Item>
                  <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(name)} />
                </Space>
              ))}
              <Form.Item>
                <Button type="dashed" onClick={() => add({ option_text: '', is_correct: false })} block icon={<PlusOutlined />}>
                  Tambah Pilihan Jawaban
                </Button>
                <Form.ErrorList errors={errors} />
              </Form.Item>
            </>
          )}
        </Form.List>
      )}

      <Form.Item style={{ marginTop: 24 }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {submitButtonText}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default QuestionForm;
