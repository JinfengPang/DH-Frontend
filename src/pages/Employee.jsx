import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';

const initialData = [
  { key: '1', empId: 'X00011', name: '陈瑞博', phone: '13800000000', email: 'chenrb@example.com', department: '仓储部', position: '库管', role: '普通员工' },
  { key: '2', empId: 'X00012', name: '李明', phone: '13900000000', email: 'liming@example.com', department: '仓储部', position: '搬运', role: '普通员工' },
];

function Employee() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('employees');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);

  useEffect(() => {
    localStorage.setItem('employees', JSON.stringify(data));
  }, [data]);

  const columns = [
    { title: '员工工号', dataIndex: 'empId', key: 'empId' },
    { title: '员工姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '所属部门', dataIndex: 'department', key: 'department' },
    { title: '岗位', dataIndex: 'position', key: 'position' },
    { title: '所属角色', dataIndex: 'role', key: 'role' },
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
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>员工管理</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1000 }}
            bordered
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? '修改员工' : '新增员工'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="empId" label="员工工号" rules={[{ required: true, message: '请输入员工工号' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="name" label="员工姓名" rules={[{ required: true, message: '请输入员工姓名' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="手机号" rules={[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }, { type: 'email', message: '请输入有效邮箱' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="department" label="所属部门" rules={[{ required: true, message: '请输入所属部门' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="position" label="岗位" rules={[{ required: true, message: '请输入岗位' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="role" label="所属角色" rules={[{ required: true, message: '请选择角色' }]}> 
            <Select options={[{ label: '管理员', value: '管理员' }, { label: '普通员工', value: '普通员工' }]} placeholder="请选择角色" />
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

export default Employee;