import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

// 从 Info.jsx 获取客户 mock 数据
const customerMockData = [
  {
    key: '1',
    code: 'C00001',
    name: '厦门建发浆纸集团有限公司',
    alias: '建发浆纸'
  },
  {
    key: '2',
    code: 'C00002',
    name: '风途有限公司',
    alias: '风途'
  }
];

// 从 Contract.jsx 获取合同 mock 数据
const contractMockData = [
  {
    key: '1',
    customerName: '厦门建发浆纸集团有限公司',
    contractName: '2025合作合同',
    contractId: 'C001',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    storageRate: 0.5, // 堆存费率（元/吨/天）
  }
];

const initialData = [
  {
    key: '1',
    cargoOwner: '厦门建发浆纸集团有限公司',
    pickupParty: '风途有限公司',
    contractName: '2025合作合同',
    rollNo: 'R001', // 卷号
    startDate: '2025-06-01', // 计算开始日期
    endDate: '2025-06-24', // 计算终止日期
    monthlyDays: 24, // 当月堆存天数
    totalDays: 24, // 堆存总天数
    weight: 100, // 结存重量（吨）
    unitPrice: 0.5, // 单价（元/吨/天）
    storageFee: 1200, // 堆存费
    feesPaid: false, // 是否已支付
    paymentPerson: '', // 付款人
    paymentMethod: '月结单', // 付款方式
    remark: '常温仓库堆存', // 备注
  }
];

function CostStorage() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cost_storage');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [searchContract, setSearchContract] = useState('');
  const [searchRollNo, setSearchRollNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [searchMonth, setSearchMonth] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);
  const [contractOptions, setContractOptions] = useState([]);

  // 自动同步到 localStorage
  useEffect(() => {
    localStorage.setItem('cost_storage', JSON.stringify(data));
  }, [data]);

  // 使用 mock 数据设置客户选项
  useEffect(() => {
    setCustomerOptions(customerMockData.map(c => ({ 
      label: c.name, 
      value: c.name 
    })));
  }, []);

  // 使用 mock 数据设置合同选项
  useEffect(() => {
    setContractOptions(contractMockData.map(c => ({ 
      label: c.contractName, 
      value: c.contractName,
      cargoOwner: c.customerName,
      storageRate: c.storageRate
    })));
  }, [modalOpen]);

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '货权方', dataIndex: 'cargoOwner', key: 'cargoOwner' },
    { title: '提货方', dataIndex: 'pickupParty', key: 'pickupParty' },
    { title: '系统合同名称', dataIndex: 'contractName', key: 'contractName' },
    { title: '卷号', dataIndex: 'rollNo', key: 'rollNo' },
    { title: '计算开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '计算终止日期', dataIndex: 'endDate', key: 'endDate' },
    { title: '当月堆存天数', dataIndex: 'monthlyDays', key: 'monthlyDays' },
    { title: '堆存总天数', dataIndex: 'totalDays', key: 'totalDays' },
    { title: '结存重量(吨)', dataIndex: 'weight', key: 'weight' },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => onEdit(record)}>修改</Button>
          <Button size="small" type="link" danger onClick={() => setDeleteKey(record.key)}>删除</Button>
          <Button size="small" type="link" onClick={() => { setDetailRecord(record); setDetailOpen(true); }}>详情</Button>
        </Space>
      ),
    },
  ];

  // 自动计算堆存天数
  const calculateDays = (start, end) => {
    if (!start || !end) return { monthlyDays: 0, totalDays: 0 };
    const startDate = dayjs(start);
    const endDate = dayjs(end);
    const totalDays = endDate.diff(startDate, 'day') + 1;
    
    // 如果开始和结束日期在同一个月，则月堆存天数等于总天数
    if (startDate.format('YYYY-MM') === endDate.format('YYYY-MM')) {
      return { monthlyDays: totalDays, totalDays };
    }
    
    // 否则计算当月天数
    const monthStart = dayjs(searchMonth || endDate.format('YYYY-MM'));
    const monthEnd = monthStart.endOf('month');
    const monthlyDays = endDate.diff(monthStart.startOf('month'), 'day') + 1;
    
    return { 
      monthlyDays: Math.min(monthlyDays, dayjs(end).date()),
      totalDays
    };
  };

  // 搜索过滤
  const getFilteredData = () => {
    return data.filter(item => {
      const matchContract = !searchContract || 
        (item.contractName || '').toLowerCase().includes(searchContract.toLowerCase());
      const matchRollNo = !searchRollNo || 
        (item.rollNo || '').toLowerCase().includes(searchRollNo.toLowerCase());
      const matchCustomer = !searchCustomer || 
        (item.cargoOwner || '').toLowerCase().includes(searchCustomer.toLowerCase()) ||
        (item.pickupParty || '').toLowerCase().includes(searchCustomer.toLowerCase());
      const matchMonth = !searchMonth || (
        dayjs(item.startDate).format('YYYY-MM') === searchMonth ||
        dayjs(item.endDate).format('YYYY-MM') === searchMonth
      );
      return matchContract && matchRollNo && matchCustomer && matchMonth;
    });
  };

  const onAdd = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      startDate: record.startDate ? dayjs(record.startDate) : null,
      endDate: record.endDate ? dayjs(record.endDate) : null,
    });
    setModalOpen(true);
  };

  // 自动计算堆存费
  const calculateStorageFee = (weight, days, unitPrice) => {
    return Number(weight || 0) * Number(days || 0) * Number(unitPrice || 0);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 格式化日期
      const startDate = values.startDate?.format('YYYY-MM-DD');
      const endDate = values.endDate?.format('YYYY-MM-DD');
      
      // 计算天数
      const { monthlyDays, totalDays } = calculateDays(startDate, endDate);
      
      // 计算堆存费
      const storageFee = calculateStorageFee(values.weight, totalDays, values.unitPrice);
      
      const newItem = {
        ...values,
        startDate,
        endDate,
        monthlyDays,
        totalDays,
        storageFee,
        key: editing ? editing.key : Date.now().toString(),
      };

      if (editing) {
        setData(data.map(item => item.key === editing.key ? newItem : item));
        message.success('修改成功');
      } else {
        setData([...data, newItem]);
        message.success('新增成功');
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('验证失败:', error);
      message.error('请填写完整且正确的数据');
    }
  };

  const handleDelete = () => {
    setData(data.filter(item => item.key !== deleteKey));
    setDeleteKey(null);
    message.success('删除成功');
  };

  // 选择合同时自动填充相关信息
  const handleContractChange = (value, option) => {
    if (!option) return;
    form.setFieldsValue({
      cargoOwner: option.cargoOwner,
      unitPrice: option.storageRate
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>堆存费结算</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>

      {/* 搜索区域 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <span>系统合同名称</span>
        <Input
          placeholder="按合同名称搜索"
          allowClear
          style={{ width: 200 }}
          value={searchContract}
          onChange={e => setSearchContract(e.target.value)}
        />
        <span>卷号</span>
        <Input
          placeholder="按卷号搜索"
          allowClear
          style={{ width: 160 }}
          value={searchRollNo}
          onChange={e => setSearchRollNo(e.target.value)}
        />
        <span>客户</span>
        <Input
          placeholder="搜索货权方或提货方"
          allowClear
          style={{ width: 200 }}
          value={searchCustomer}
          onChange={e => setSearchCustomer(e.target.value)}
        />
        <span>结算月份</span>
        <DatePicker.MonthPicker
          placeholder="按月份搜索"
          allowClear
          style={{ width: 120 }}
          value={searchMonth ? dayjs(searchMonth) : null}
          onChange={date => setSearchMonth(date ? date.format('YYYY-MM') : '')}
        />
      </div>

      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={getFilteredData()}
            pagination={false}
            scroll={{ x: 1500 }}
            bordered
            rowKey="key"
          />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? '修改堆存费结算' : '新增堆存费结算'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="contractName" label="系统合同名称" rules={[{ required: true, message: '请选择合同' }]}>
            <Select 
              options={contractOptions}
              placeholder="请选择合同"
              onChange={handleContractChange}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="cargoOwner" label="货权方" rules={[{ required: true, message: '请选择货权方' }]}>
            <Select
              options={customerOptions}
              placeholder="请选择货权方"
              disabled
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="pickupParty" label="提货方" rules={[{ required: true, message: '请选择提货方' }]}>
            <Select
              options={customerOptions}
              placeholder="请选择提货方"
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="rollNo" label="卷号" rules={[{ required: true, message: '请输入卷号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="计算开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="计算终止日期" rules={[{ required: true, message: '请选择终止日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="weight" label="结存重量(吨)" rules={[{ required: true, message: '请输入结存重量' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="unitPrice" label="堆存费单价(元/吨/天)">
            <Input type="number" min={0} disabled />
          </Form.Item>
          <Form.Item name="feesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="paymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="paymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={4} />
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

      <Modal
        open={detailOpen}
        title="详情"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {detailRecord && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>基本信息</div>
              <div style={{ marginBottom: 8 }}><b>货权方：</b>{detailRecord.cargoOwner}</div>
              <div style={{ marginBottom: 8 }}><b>提货方：</b>{detailRecord.pickupParty}</div>
              <div style={{ marginBottom: 8 }}><b>系统合同名称：</b>{detailRecord.contractName}</div>
              <div style={{ marginBottom: 8 }}><b>卷号：</b>{detailRecord.rollNo}</div>
              <div style={{ marginBottom: 8 }}><b>计算开始日期：</b>{detailRecord.startDate}</div>
              <div style={{ marginBottom: 8 }}><b>计算终止日期：</b>{detailRecord.endDate}</div>
              <div style={{ marginBottom: 8 }}><b>当月堆存天数：</b>{detailRecord.monthlyDays}天</div>
              <div style={{ marginBottom: 8 }}><b>堆存总天数：</b>{detailRecord.totalDays}天</div>
              <div style={{ marginBottom: 8 }}><b>结存重量：</b>{detailRecord.weight}吨</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>费用信息</div>
              <div style={{ marginBottom: 8 }}><b>堆存费单价：</b>{detailRecord.unitPrice}元/吨/天</div>
              <div style={{ marginBottom: 8 }}><b>堆存费：</b>{detailRecord.storageFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.feesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.feesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.paymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.paymentMethod}</div>
                </>
              )}
              <div style={{ marginBottom: 8 }}><b>备注：</b>{detailRecord.remark}</div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CostStorage; 