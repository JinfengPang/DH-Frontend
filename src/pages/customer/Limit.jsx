import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select, InputNumber, DatePicker, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

// 获取客户信息列表
const getCustomerOptions = () => {
  const customers = JSON.parse(localStorage.getItem('customers') || '[]');
  return customers.map(c => ({ label: c.name, value: c.name }));
};

const initialData = [
  {
    key: '1',
    code: '1',
    owner: '厦门建发浆纸集团有限公司',
    picker: '风途有限公司',
    totalWeight: 100,
    outWeight: 80,
    date: '2025-06-20',
    voucher: ''
  }
];

function CustomerLimit() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('customer_limits');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    localStorage.setItem('customer_limits', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    setCustomerOptions(getCustomerOptions());
  }, [modalOpen]);

  const columns = [
    { title: '赎货权编号', dataIndex: 'code', key: 'code' },
    { title: '货权方', dataIndex: 'owner', key: 'owner' },
    { title: '提货方', dataIndex: 'picker', key: 'picker' },
    { title: '货权总重(吨)', dataIndex: 'totalWeight', key: 'totalWeight' },
    { title: '已出库总重(吨)', dataIndex: 'outWeight', key: 'outWeight' },
    { title: '赎货总重最新变更日期', dataIndex: 'date', key: 'date' },
    {
      title: '赎货总重变更凭证',
      dataIndex: 'voucher',
      key: 'voucher',
      render: (url) => url ? <a href={url} target="_blank" rel="noopener noreferrer">查看凭证</a> : <span style={{ color: '#aaa' }}>无</span>
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => onEdit(record)}>修改</Button>
          <Button size="small" type="link" danger onClick={() => setDeleteKey(record.key)}>删除</Button>
        </Space>
      ),
    },
  ];

  const onAdd = () => {
    form.resetFields();
    setEditing(null);
    setFileList([]);
    setModalOpen(true);
  };

  const onEdit = (record) => {
    // 日期字段转 dayjs 对象
    const values = { ...record };
    if (values.date) {
      values.date = dayjs(values.date);
    }
    form.setFieldsValue(values);
    setEditing(record);
    setFileList(record.voucher ? [{ uid: '-1', name: '凭证', status: 'done', url: record.voucher }] : []);
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      // 日期格式化
      if (values.date && values.date.format) {
        values.date = values.date.format('YYYY-MM-DD');
      }
      // 取图片url
      if (fileList.length > 0 && fileList[0].url) {
        values.voucher = fileList[0].url;
      } else {
        values.voucher = '';
      }
      if (editing) {
        const newData = data.map(item =>
          item.key === editing.key ? { ...editing, ...values } : item
        );
        setData(newData);
        message.success('修改成功');
      } else {
        const newItem = { ...values, key: Date.now().toString() };
        const newData = [...data, newItem];
        setData(newData);
        message.success('新增成功');
      }
      setModalOpen(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error('验证失败:', error);
      message.error('请填写完整且正确的数据');
    }
  };

  const handleDelete = () => {
    const newData = data.filter(item => item.key !== deleteKey);
    setData(newData);
    setDeleteKey(null);
    message.success('删除成功');
  };

  // 上传图片按钮（仅展示，不做上传）
  const uploadProps = {
    fileList,
    beforeUpload: () => false,
    onChange: ({ fileList: fl }) => setFileList(fl),
    showUploadList: { showRemoveIcon: true },
    accept: 'image/*',
    maxCount: 1
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>提货方赎货限制</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1200 }}
            bordered
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? '修改赎货限制' : '新增赎货限制'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="赎货权编号" rules={[{ required: true, message: '请输入编号' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="owner" label="货权方" rules={[{ required: true, message: '请选择货权方' }]}> 
            <Select
              showSearch
              placeholder="请选择货权方"
              options={customerOptions}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="picker" label="提货方" rules={[{ required: true, message: '请选择提货方' }]}> 
            <Select
              showSearch
              placeholder="请选择提货方"
              options={customerOptions}
              filterOption={(input, option) => option.label.toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item name="totalWeight" label="货权总重(吨)" rules={[{ required: true, message: '请输入货权总重' }]}> 
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="outWeight" label="已出库总重(吨)" rules={[{ required: true, message: '请输入已出库总重' }]}> 
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="date" label="赎货总重最新变更日期" rules={[{ required: true, message: '请选择日期' }]}> 
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="voucher" label="赎货总重变更凭证">
            <Upload {...uploadProps} listType="picture">
              <Button icon={<UploadOutlined />}>上传图片</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={!!deleteKey}
        title="确认删除"
        onOk={handleDelete}
        onCancel={() => setDeleteKey(null)}
        okText="确认"
        cancelText="取消"
        maskClosable={false}
      >
        <div>确定要删除这条数据吗？</div>
      </Modal>
    </div>
  );
}

export default CustomerLimit;