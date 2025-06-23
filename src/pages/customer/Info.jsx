import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';

const initialData = [
  {
    key: '1',
    code: 'C00001',
    name: '厦门建发浆纸集团有限公司',
    alias: '建发浆纸',
    address: '天津市塘沽区',
    owner: '是',
    picker: '否',
    paper: '是',
    bulk: '否',
    email: 'jianfa@example.com',
    contact1: '张三',
    phone1: '13800000000',
    contact2: '',
    phone2: '',
    contact3: '',
    phone3: ''
  },
  {
    key: '2',
    code: 'C00002',
    name: '风途有限公司',
    alias: '风途',
    address: '天津市塘沽区',
    owner: '否',
    picker: '是',
    paper: '否',
    bulk: '是',
    email: 'fengtultd@example.com',
    contact1: '李四',
    phone1: '13900000000',
    contact2: '',
    phone2: '',
    contact3: '',
    phone3: ''
  }
];

function CustomerInfo() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('customers');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(data));
  }, [data]);

  const columns = [
    { title: '客户编号', dataIndex: 'code', key: 'code' },
    { title: '客户名称', dataIndex: 'name', key: 'name' },
    { title: '别名', dataIndex: 'alias', key: 'alias' },
    { title: '客户地址', dataIndex: 'address', key: 'address' },
    { title: '货权人', dataIndex: 'owner', key: 'owner' },
    { title: '提货人', dataIndex: 'picker', key: 'picker' },
    { title: '纸类', dataIndex: 'paper', key: 'paper' },
    { title: '散货', dataIndex: 'bulk', key: 'bulk' },
    { title: '用户邮箱', dataIndex: 'email', key: 'email' },
    { title: '联系人1', dataIndex: 'contact1', key: 'contact1' },
    { title: '联系电话1', dataIndex: 'phone1', key: 'phone1' },
    { title: '联系人2', dataIndex: 'contact2', key: 'contact2' },
    { title: '联系电话2', dataIndex: 'phone2', key: 'phone2' },
    { title: '联系人3', dataIndex: 'contact3', key: 'contact3' },
    { title: '联系电话3', dataIndex: 'phone3', key: 'phone3' },
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
    setModalOpen(true);
  };

  const onEdit = (record) => {
    form.setFieldsValue(record);
    setEditing(record);
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
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

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>客户信息管理</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1500 }}
            bordered
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? '修改客户' : '新增客户'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="客户编号" rules={[{ required: true, message: '请输入客户编号' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="name" label="客户名称" rules={[{ required: true, message: '请输入客户名称' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="alias" label="别名" rules={[{ required: true, message: '请输入别名' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="address" label="客户地址" rules={[{ required: true, message: '请输入客户地址' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="owner" label="货权人" rules={[{ required: true, message: '请选择货权人' }]}> 
            <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} placeholder="请选择" />
          </Form.Item>
          <Form.Item name="picker" label="提货人" rules={[{ required: true, message: '请选择提货人' }]}> 
            <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} placeholder="请选择" />
          </Form.Item>
          <Form.Item name="paper" label="纸类" rules={[{ required: true, message: '请选择纸类' }]}> 
            <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} placeholder="请选择" />
          </Form.Item>
          <Form.Item name="bulk" label="散货" rules={[{ required: true, message: '请选择散货' }]}> 
            <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} placeholder="请选择" />
          </Form.Item>
          <Form.Item name="email" label="用户邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效邮箱' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="contact1" label="联系人1" rules={[{ required: true, message: '请输入联系人1' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="phone1" label="联系电话1" rules={[{ required: true, message: '请输入联系电话1' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="contact2" label="联系人2"> 
            <Input />
          </Form.Item>
          <Form.Item name="phone2" label="联系电话2"> 
            <Input />
          </Form.Item>
          <Form.Item name="contact3" label="联系人3"> 
            <Input />
          </Form.Item>
          <Form.Item name="phone3" label="联系电话3"> 
            <Input />
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

export default CustomerInfo;