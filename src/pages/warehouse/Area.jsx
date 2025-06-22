import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message } from 'antd';

const initialData = [
  { key: '1', name: '宝湾库', code: 'A001', address: '天津市滨海新区聚源路288号' },
  { key: '2', name: '泰达库', code: 'A002', address: '天津市滨海新区聚源路288号' },
  { key: '3', name: '鹏程库', code: 'A003', address: '天津市滨海新区聚源路288号' },
];

function WarehouseArea() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('warehouse_areas');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);

  const columns = [
    { title: '仓位名称', dataIndex: 'name', key: 'name' },
    { title: '仓库编号', dataIndex: 'code', key: 'code' },
    { title: '仓库地址', dataIndex: 'address', key: 'address' },
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
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const syncToLocalStorage = (newData) => {
    localStorage.setItem('warehouse_areas', JSON.stringify(newData));
  };

  const handleOk = async () => {
    try {
      // 先验证表单
      const values = await form.validateFields();
      
      // 验证通过后执行更新
      if (editing) {
        const newData = data.map(item => item.key === editing.key ? { ...editing, ...values } : item);
        setData(newData);
        syncToLocalStorage(newData);
        message.success('修改成功');
      } else {
        const newItem = { ...values, key: Date.now().toString() };
        const newData = [...data, newItem];
        setData(newData);
        syncToLocalStorage(newData);
        message.success('新增成功');
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('验证失败:', error);
    }
  };

  const handleDelete = () => {
    const newData = data.filter(item => item.key !== deleteKey);
    setData(newData);
    syncToLocalStorage(newData);
    setDeleteKey(null);
    message.success('删除成功');
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>仓位管理</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 800 }}
            bordered
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? '修改仓位' : '新增仓位'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="name" label="仓位名称" rules={[{ required: true, message: '请输入仓位名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="仓库编号" rules={[{ required: true, message: '请输入仓库编号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="address" label="仓库地址" rules={[{ required: true, message: '请输入仓库地址' }]}>
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

export default WarehouseArea;