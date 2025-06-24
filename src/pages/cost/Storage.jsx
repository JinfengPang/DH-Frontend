import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

// 从 Contract.jsx 同步的客户 mock 数据
const customerMockData = [
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

// 从 Rate.jsx 同步的费率规则 mock 数据
const rateMockData = [
  {
    key: '1',
    rateNo: 'R001',
    rateName: '费率6090120',
    steps: [
      { day: 30, price: 10 },
      { day: 60, price: 8 },
      { day: 90, price: 6 },
    ],
  },
];

// 从 Contract.jsx 同步的合同 mock 数据
const contractMockData = [
  {
    key: '1',
    customerName: '厦门建发浆纸集团有限公司',
    rateNo: 'R001',
    contractName: '2025合作合同',
    contractId: 'C001',
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    contractType: '纸质',
    invoiceRate: 13,
    inFee: 10,
    outFee: 8,
    boxFee: 200,
  },
];

// 将核心计算函数移到组件外部，以提高代码复用性和清晰度

/**
 * 根据堆存天数和费率阶梯计算单价
 * @param {number} days - 堆存总天数
 * @param {Array} rateSteps - 费率阶梯规则
 * @returns {number} - 计算出的单价
 */
const calculateUnitPrice = (days, rateSteps) => {
  if (!Array.isArray(rateSteps) || !rateSteps.length) return 0;
  // 假设 rateSteps 按 day 升序排列，找到第一个满足条件的阶梯
  const step = rateSteps.find(s => days <= s.day);
  return step ? step.price : rateSteps[rateSteps.length - 1]?.price || 0;
};

/**
 * 计算堆存天数
 * @param {string} start - 开始日期 (YYYY-MM-DD)
 * @param {string} end - 结束日期 (YYYY-MM-DD)
 * @param {string} settlementMonthStr - 结算月份 (YYYY-MM)
 * @returns {{monthlyDays: number, totalDays: number}} - 当月天数和总天数
 */
const calculateDays = (start, end, settlementMonthStr) => {
  if (!start || !end) return { monthlyDays: 0, totalDays: 0 };
  const startDate = dayjs(start);
  const endDate = dayjs(end);

  if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
    return { monthlyDays: 0, totalDays: 0 };
  }

  const totalDays = endDate.diff(startDate, 'day') + 1;
  let monthlyDays = 0;

  const settlementMonth = settlementMonthStr ? dayjs(settlementMonthStr) : (startDate.isSame(endDate, 'month') ? startDate : null);

  if (settlementMonth && settlementMonth.isValid()) {
    const settlementStart = settlementMonth.startOf('month');
    const settlementEnd = settlementMonth.endOf('month');

    if (!(endDate.isBefore(settlementStart) || startDate.isAfter(settlementEnd))) {
      const effectiveStart = startDate.isAfter(settlementStart) ? startDate : settlementStart;
      const effectiveEnd = endDate.isBefore(settlementEnd) ? endDate : settlementEnd;
      monthlyDays = effectiveEnd.diff(effectiveStart, 'day') + 1;
    }
  }
  
  return { monthlyDays, totalDays };
};

/**
 * 计算总堆存费
 * @param {number} weight - 重量
 * @param {number} days - 总天数
 * @param {number} unitPrice - 单价
 * @returns {number} - 总费用
 */
const calculateStorageFee = (weight, days, unitPrice) => {
  return Number(weight || 0) * Number(days || 0) * Number(unitPrice || 0);
};

// 初始数据（与新的 mock 数据对齐）
const initialData = [
  {
    key: '1',
    cargoOwner: '厦门建发浆纸集团有限公司',
    pickupParty: '风途有限公司',
    contractName: '2025合作合同',
    contractId: 'C001',
    rateRuleName: '费率6090120',
    rateNo: 'R001',
    rollNo: 'R001',
    startDate: '2025-06-01',
    endDate: '2025-06-15',
    weight: 100,
    unitPrice: 10, // 根据费率规则 R001 和 15天 计算得出
    feesPaid: false,
    paymentPerson: '',
    paymentMethod: '月结单',
    remark: '常温仓库堆存',
  },
];

function CostStorage() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cost_storage');
    const initial = saved && JSON.parse(saved).length > 0 ? JSON.parse(saved) : initialData;
    // 初始化数据时，计算天数和费用，确保数据完整性
    return initial.map(item => {
      const settlementMonth = dayjs(item.endDate).format('YYYY-MM');
      const { monthlyDays, totalDays } = calculateDays(item.startDate, item.endDate, settlementMonth);
      const storageFee = calculateStorageFee(item.weight, totalDays, item.unitPrice);
      return { ...item, monthlyDays, totalDays, storageFee };
    });
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

  // 加载客户选项
  useEffect(() => {
    const savedCustomers = localStorage.getItem('customers');
    const customers = savedCustomers && JSON.parse(savedCustomers).length > 0 
      ? JSON.parse(savedCustomers) 
      : customerMockData;
    setCustomerOptions(customers.map(c => ({ label: c.name, value: c.name })));
  }, []);

  // 加载合同选项（包含费率信息）
  useEffect(() => {
    const savedContracts = localStorage.getItem('contracts');
    const contracts = savedContracts && JSON.parse(savedContracts).length > 0 
      ? JSON.parse(savedContracts) 
      : contractMockData;
    
    const savedRates = localStorage.getItem('cost_rates');
    const rates = savedRates && JSON.parse(savedRates).length > 0 
      ? JSON.parse(savedRates) 
      : rateMockData;
    
    setContractOptions(contracts.map(contract => {
      const rate = rates.find(r => r.rateNo === contract.rateNo);
      return {
        label: contract.contractName,
        value: contract.contractName,
        cargoOwner: contract.customerName,
        contractId: contract.contractId, // 传递 contractId
        rateNo: contract.rateNo,
        rateName: rate?.rateName || '',
        rateSteps: rate?.steps.sort((a, b) => a.day - b.day) || [] // 确保阶梯按天数升序
      };
    }));
  }, [modalOpen]);

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1, fixed: 'left' },
    { title: '货权方', dataIndex: 'cargoOwner', key: 'cargoOwner', width: 220 },
    { title: '提货方', dataIndex: 'pickupParty', key: 'pickupParty', width: 220 },
    { title: '系统合同名称', dataIndex: 'contractName', key: 'contractName', width: 200 },
    { title: '费率规则名称', dataIndex: 'rateRuleName', key: 'rateRuleName', width: 150 },
    { title: '卷号', dataIndex: 'rollNo', key: 'rollNo', width: 120 },
    { title: '计算开始日期', dataIndex: 'startDate', key: 'startDate', width: 120 },
    { title: '计算终止日期', dataIndex: 'endDate', key: 'endDate', width: 120 },
    { title: '当月堆存天数', dataIndex: 'monthlyDays', key: 'monthlyDays', width: 120 },
    { title: '堆存总天数', dataIndex: 'totalDays', key: 'totalDays', width: 110 },
    { title: '结存重量(吨)', dataIndex: 'weight', key: 'weight', width: 120 },
    { title: '堆存费', dataIndex: 'storageFee', key: 'storageFee', width: 100, render: v => v?.toFixed(2) },
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

  // 搜索过滤数据，并根据搜索月份动态计算当月天数
  const getFilteredData = () => {
    const filtered = data.filter(item => {
      const matchContract = !searchContract || 
        (item.contractName || '').toLowerCase().includes(searchContract.toLowerCase());
      const matchRollNo = !searchRollNo || 
        (item.rollNo || '').toLowerCase().includes(searchRollNo.toLowerCase());
      const matchCustomer = !searchCustomer || 
        (item.cargoOwner || '').toLowerCase().includes(searchCustomer.toLowerCase()) ||
        (item.pickupParty || '').toLowerCase().includes(searchCustomer.toLowerCase());
      
      const itemStartDate = dayjs(item.startDate);
      const itemEndDate = dayjs(item.endDate);
      const searchMonthStart = searchMonth ? dayjs(searchMonth).startOf('month') : null;
      const searchMonthEnd = searchMonth ? dayjs(searchMonth).endOf('month') : null;

      // 修正月份匹配逻辑，改为检查日期范围重叠
      const matchMonth = !searchMonth || 
        (!itemEndDate.isBefore(searchMonthStart) && !itemStartDate.isAfter(searchMonthEnd));

      return matchContract && matchRollNo && matchCustomer && matchMonth;
    });

    // 如果按月份搜索，则动态计算当月天数用于显示
    if (searchMonth) {
      return filtered.map(item => {
        const { monthlyDays } = calculateDays(item.startDate, item.endDate, searchMonth);
        return { ...item, monthlyDays };
      });
    }

    return filtered;
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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      const startDate = values.startDate?.format('YYYY-MM-DD');
      const endDate = values.endDate?.format('YYYY-MM-DD');
      
      // 存储时，基于结束日期的月份计算当月天数作为默认值
      const settlementMonthForStorage = values.endDate?.format('YYYY-MM');
      const { monthlyDays, totalDays } = calculateDays(startDate, endDate, settlementMonthForStorage);
      
      const storageFee = calculateStorageFee(values.weight, totalDays, values.unitPrice);
      
      const newItem = {
        ...values,
        startDate,
        endDate,
        monthlyDays,
        totalDays,
        storageFee,
        // contractId 从 values 中获取
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

  // 选择合同时自动填充货权方、费率规则、单价等信息
  const handleContractChange = (value, option) => {
    if (!option) return;
    
    const startDate = form.getFieldValue('startDate')?.format('YYYY-MM-DD');
    const endDate = form.getFieldValue('endDate')?.format('YYYY-MM-DD');
    const { totalDays } = calculateDays(startDate, endDate);
    
    const unitPrice = calculateUnitPrice(totalDays || 0, option.rateSteps);
    
    form.setFieldsValue({
      cargoOwner: option.cargoOwner,
      rateRuleName: option.rateName,
      unitPrice,
      rateNo: option.rateNo,
      contractId: option.contractId, // 自动填充合同ID
    });
  };

  // 日期变化时，动态更新单价
  const handleDateChange = () => {
    const startDate = form.getFieldValue('startDate')?.format('YYYY-MM-DD');
    const endDate = form.getFieldValue('endDate')?.format('YYYY-MM-DD');
    const contractName = form.getFieldValue('contractName');
    
    if (startDate && endDate && contractName) {
      const { totalDays } = calculateDays(startDate, endDate);
      const contract = contractOptions.find(c => c.value === contractName);
      if (contract) {
        const unitPrice = calculateUnitPrice(totalDays, contract.rateSteps);
        form.setFieldsValue({ unitPrice });
      }
    }
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
            <DatePicker style={{ width: '100%' }} onChange={handleDateChange} />
          </Form.Item>
          <Form.Item
            name="endDate"
            label="计算终止日期"
            rules={[
              { required: true, message: '请选择终止日期' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || !getFieldValue('startDate')) {
                    return Promise.resolve();
                  }
                  if (value.isBefore(getFieldValue('startDate'))) {
                    return Promise.reject(new Error('终止日期不能早于开始日期!'));
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker style={{ width: '100%' }} onChange={handleDateChange} />
          </Form.Item>
          <Form.Item name="weight" label="结存重量(吨)" rules={[{ required: true, message: '请输入结存重量' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="contractId" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="rateNo" hidden>
            <Input />
          </Form.Item>
          <Form.Item name="rateRuleName" label="费率规则名称" rules={[{ required: true, message: '请选择费率规则' }]}>
            <Input disabled />
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
              <div style={{ marginBottom: 8 }}><b>合同ID：</b>{detailRecord.contractId}</div>
              <div style={{ marginBottom: 8 }}><b>卷号：</b>{detailRecord.rollNo}</div>
              <div style={{ marginBottom: 8 }}><b>计算开始日期：</b>{detailRecord.startDate}</div>
              <div style={{ marginBottom: 8 }}><b>计算终止日期：</b>{detailRecord.endDate}</div>
              <div style={{ marginBottom: 8 }}><b>当月堆存天数：</b>{detailRecord.monthlyDays}天</div>
              <div style={{ marginBottom: 8 }}><b>堆存总天数：</b>{detailRecord.totalDays}天</div>
              <div style={{ marginBottom: 8 }}><b>结存重量：</b>{detailRecord.weight}吨</div>
              <div style={{ marginBottom: 8 }}><b>费率规则名称：</b>{detailRecord.rateRuleName}</div>
              <div style={{ marginBottom: 8 }}><b>费率编号：</b>{detailRecord.rateNo}</div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>费用信息</div>
              <div style={{ marginBottom: 8 }}><b>堆存费单价：</b>{detailRecord.unitPrice}元/吨/天</div>
              <div style={{ marginBottom: 8 }}><b>堆存费：</b>{detailRecord.storageFee?.toFixed(2)}元</div>
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