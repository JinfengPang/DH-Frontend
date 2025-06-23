import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select, InputNumber } from 'antd';

const initialData = [
  { key: '1', name: '10号库', index: '1', area: '宝湾库', length: 100, width: 100, height: 10 },
  { key: '3', name: '2号库', index: '2', area: '泰达库', length: 100, width: 100, height: 10 },
];

function WarehouseZone() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('warehouse_zones');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    // 从仓位管理页获取仓位数据
    const areaData = JSON.parse(localStorage.getItem('warehouse_areas') || '[]');
    setAreas(areaData);
  }, []); // 移除 modalOpen 依赖，只在组件加载时获取一次

  const columns = [
    { title: '库区名称', dataIndex: 'name', key: 'name' },
    { title: '库位序号', dataIndex: 'index', key: 'index' },
    { title: '从属仓位', dataIndex: 'area', key: 'area' },
    { title: '长', dataIndex: 'length', key: 'length' },
    { title: '宽', dataIndex: 'width', key: 'width' },
    { title: '高', dataIndex: 'height', key: 'height' },
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
    setModalOpen(true);
    setTimeout(() => {
      form.setFieldsValue(record);
    }, 0);
  };

  const syncToLocalStorage = (newData) => {
    localStorage.setItem('warehouse_zones', JSON.stringify(newData));
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editing) {
        const newData = data.map(item => 
          item.key === editing.key ? { ...editing, ...values } : item
        );
        setData(newData);
        syncToLocalStorage(newData);
        message.success('修改成功');
      } else {
        const newItem = { 
          ...values, 
          key: Date.now().toString(),
          // 确保数字类型字段存储为数字
          index: Number(values.index),
          length: Number(values.length),
          width: Number(values.width),
          height: Number(values.height)
        };
        const newData = [...data, newItem];
        setData(newData);
        syncToLocalStorage(newData);
        message.success('新增成功');
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('表单验证失败:', error);
      message.error('请填写完整且正确的数据');
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
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>库区管理</span>
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
        title={editing ? '修改库区' : '新增库区'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="库区名称" rules={[{ required: true, message: '请输入库区名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="index" label="库位序号" rules={[{ required: true, message: '请输入库位序号' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="area" label="从属仓位" rules={[{ required: true, message: '请选择从属仓位' }]}>
            <Select 
              options={areas.map(a => ({ label: a.name, value: a.name }))} 
              placeholder="请选择仓位"
            />
          </Form.Item>
          <Form.Item name="length" label="长" rules={[{ required: true, message: '请输入长度' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="width" label="宽" rules={[{ required: true, message: '请输入宽度' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="height" label="高" rules={[{ required: true, message: '请输入高度' }]}>
            <InputNumber style={{ width: '100%' }} min={1} />
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

export default WarehouseZone;