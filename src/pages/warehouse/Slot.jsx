import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';

const initialData = [
  { key: '1', name: 'A1', code: 'S001', area: '宝湾库', zone: '10号库' },
  { key: '2', name: 'A2', code: 'S002', area: '泰达库', zone: '2号库' },
];

function WarehouseSlot() {
  const [data, setData] = useState(initialData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [areas, setAreas] = useState([]);
  const [zones, setZones] = useState([]);

  useEffect(() => {
    setAreas(JSON.parse(localStorage.getItem('warehouse_areas') || '[]'));
    setZones(JSON.parse(localStorage.getItem('warehouse_zones') || '[]'));
  }, [modalOpen]);

  useEffect(() => {
    if (!modalOpen) {
      form.resetFields();
    } else if (editing) {
      form.setFieldsValue(editing);
    }
  }, [modalOpen]);

  const columns = [
    { title: '库位名称', dataIndex: 'name', key: 'name' },
    { title: '编号', dataIndex: 'code', key: 'code' },
    { title: '从属仓位', dataIndex: 'area', key: 'area' },
    { title: '从属库区', dataIndex: 'zone', key: 'zone' },
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
    setModalOpen(true);
    form.resetFields();
  };

  const onEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
    form.setFieldsValue(record);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editing) {
        setData(data.map(item => item.key === editing.key ? { ...editing, ...values } : item));
        message.success('修改成功');
      } else {
        const newItem = { ...values, key: Date.now().toString() };
        setData([...data, newItem]);
        message.success('新增成功');
      }
      setModalOpen(false);
      setEditing(null);
      form.resetFields();
    } catch (e) {
      message.error('请填写完整且正确的数据');
    }
  };

  const handleDelete = () => {
    setData(data.filter(item => item.key !== deleteKey));
    setDeleteKey(null);
    message.success('删除成功');
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>库位管理</span>
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
        title={editing ? '修改库位' : '新增库位'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="库位名称" rules={[{ required: true, message: '请输入库位名称' }]}> <Input /> </Form.Item>
          <Form.Item name="code" label="编号" rules={[{ required: true, message: '请输入编号' }]}> <Input /> </Form.Item>
          <Form.Item name="area" label="从属仓位" rules={[{ required: true, message: '请选择从属仓位' }]}> <Select options={areas.map(a => ({ label: a.name, value: a.name }))} placeholder="请选择仓位" /> </Form.Item>
          <Form.Item name="zone" label="从属库区" rules={[{ required: true, message: '请选择从属库区' }]}> <Select options={zones.map(z => ({ label: z.name, value: z.name }))} placeholder="请选择库区" /> </Form.Item>
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

export default WarehouseSlot;