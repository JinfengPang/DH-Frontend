import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';

const initialData = [
  { key: '1', name: 'A1', code: 'S001', area: '宝湾库', zone: '10号库' },
  { key: '2', name: 'A2', code: 'S002', area: '泰达库', zone: '2号库' },
];

function WarehouseSlot() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('warehouse_slots');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [areas, setAreas] = useState([]);
  const [zones, setZones] = useState([]);
  const [filteredZones, setFilteredZones] = useState([]);

  useEffect(() => {
    const areaData = JSON.parse(localStorage.getItem('warehouse_areas') || '[]');
    const zoneData = JSON.parse(localStorage.getItem('warehouse_zones') || '[]');
    setAreas(areaData);
    setZones(zoneData);
  }, []);

  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        form.setFieldsValue(editing);
        const filtered = zones.filter(zone => zone.area === editing.area);
        setFilteredZones(filtered);
      } else {
        form.resetFields();
        setFilteredZones([]);
      }
    }
    // eslint-disable-next-line
  }, [modalOpen, editing, zones, form]);

  const handleAreaChange = (areaName) => {
    const filtered = zones.filter(zone => zone.area === areaName);
    setFilteredZones(filtered);
    if (!editing) {
      form.setFieldsValue({ zone: undefined });
    }
  };

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
    form.resetFields();
    setFilteredZones([]);
    setModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue(record);
    // 让库区选项与当前仓位匹配
    const filtered = zones.filter(zone => zone.area === record.area);
    setFilteredZones(filtered);
    setModalOpen(true);
  };

  const syncToLocalStorage = (newData) => {
    localStorage.setItem('warehouse_slots', JSON.stringify(newData));
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
          key: Date.now().toString() 
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
        onCancel={() => {
          setModalOpen(false);
          setFilteredZones([]);
        }}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="库位名称" rules={[{ required: true, message: '请输入库位名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="编号" rules={[{ required: true, message: '请输入编号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="area" label="从属仓位" rules={[{ required: true, message: '请选择从属仓位' }]}>
            <Select 
              options={areas.map(a => ({ label: a.name, value: a.name }))} 
              placeholder="请选择仓位"
              showSearch
              optionFilterProp="label"
              onChange={handleAreaChange}
            />
          </Form.Item>
          <Form.Item 
            name="zone" 
            label="从属库区" 
            rules={[{ required: true, message: '请选择从属库区' }]}
          >
            <Select 
              options={filteredZones.map(z => ({ label: z.name, value: z.name }))} 
              placeholder={filteredZones.length ? '请选择库区' : '请先选择仓位'}
              showSearch
              optionFilterProp="label"
              disabled={!filteredZones.length}
            />
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

export default WarehouseSlot;