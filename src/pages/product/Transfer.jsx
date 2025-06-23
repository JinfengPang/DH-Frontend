import React, { useState } from 'react';
import { Card, Table, Button, Modal, Form, Select, Input, Tag, message } from 'antd';

// 必填字段（与库存表一致，去掉是否提供载具）
const requiredFields = [
  'rollNo', 'billNo', 'inDate', 'owner', 'picker', 'warehouse', 'zone', 'slot'
];

// 字段元数据（去掉是否提供载具）
const allFields = [
  { key: 'rollNo', label: '卷号' },
  { key: 'billNo', label: '提单号' },
  { key: 'inDate', label: '入库日期' },
  { key: 'owner', label: '货权方' },
  { key: 'picker', label: '提货方' },
  { key: 'warehouse', label: '所属仓库' },
  { key: 'zone', label: '所属库区' },
  { key: 'slot', label: '所属库位' }
];

function ProductTransfer() {
  // 读取库存数据
  const [data, setData] = useState(() => {
    const local = localStorage.getItem('stock');
    if (local && Array.isArray(JSON.parse(local))) return JSON.parse(local);
    return [];
  });

  // 客户下拉选项（货权方/提货方）
  const customerSet = new Set();
  data.forEach(item => {
    if (item.owner) customerSet.add(item.owner);
    if (item.picker) customerSet.add(item.picker);
  });
  const customerOptions = Array.from(customerSet).map(name => ({ label: name, value: name }));

  // 编辑弹窗
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();

  // 修改操作
  const onEdit = (record) => {
    form.setFieldsValue({ owner: record.owner, picker: record.picker });
    setEditing(record);
    setModalOpen(true);
  };

  // 提交
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const newData = data.map(item =>
        item.key === editing.key ? { ...item, ...values } : item
      );
      setData(newData);
      localStorage.setItem('stock', JSON.stringify(newData));
      setModalOpen(false);
      setEditing(null);
      message.success('修改成功');
    } catch {
      message.error('请填写完整数据');
    }
  };

  // 表格列
  const columns = [
    ...allFields.map(f => ({
      title: f.label,
      dataIndex: f.key,
      key: f.key,
      render: (val) => {
        if (f.key === 'inDate') return val ? <span>{val}</span> : '';
        return val;
      }
    })),
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button size="small" type="link" onClick={() => onEdit(record)}>修改</Button>
      ),
    },
  ];

  // 搜索状态
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchRollNo, setSearchRollNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  // 过滤数据
  const getFilteredData = () => {
    return data.filter(item => {
      const billMatch = searchBillNo ? (item.billNo || '').includes(searchBillNo) : true;
      const rollMatch = searchRollNo ? (item.rollNo || '').includes(searchRollNo) : true;
      const customerMatch = searchCustomer
        ? ((item.owner && item.owner.includes(searchCustomer)) || (item.picker && item.picker.includes(searchCustomer)))
        : true;
      return billMatch && rollMatch && customerMatch;
    });
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>货权转换</div>
      <Card bordered style={{ borderRadius: 12, marginTop: 16 }}>
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <Input
            placeholder="按提单号搜索"
            allowClear
            style={{ width: 180 }}
            value={searchBillNo}
            onChange={e => setSearchBillNo(e.target.value)}
          />
          <Input
            placeholder="按卷号搜索"
            allowClear
            style={{ width: 180 }}
            value={searchRollNo}
            onChange={e => setSearchRollNo(e.target.value)}
          />
          <Input
            placeholder="按客户（货权方/提货方）搜索"
            allowClear
            style={{ width: 220 }}
            value={searchCustomer}
            onChange={e => setSearchCustomer(e.target.value)}
          />
        </div>
        <Table
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="key"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
          bordered
        />
      </Card>
      <Modal
        open={modalOpen}
        title="货权转换"
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="货权方"
            name="owner"
            rules={[{ required: true, message: '请选择货权方' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="请选择货权方"
              options={customerOptions}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          <Form.Item
            label="提货方"
            name="picker"
            rules={[{ required: true, message: '请选择提货方' }]}
          >
            <Select
              showSearch
              allowClear
              placeholder="请选择提货方"
              options={customerOptions}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default ProductTransfer;