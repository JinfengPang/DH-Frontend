import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select } from 'antd';

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
  }
];

const initialData = [
  {
    key: '1',
    cargoOwner: '厦门建发浆纸集团有限公司', // 合同中的客户
    pickupParty: '风途有限公司', // 可以是任意存在的客户
    contractName: '2025合作合同',
    billNo: 'B001',
    totalInFee: 5000,
    inUnitPrice: 10,
    inWeight: 500,
    inFee: 5000,
    outUnitPrice: 8,
    outWeight: 0,
    outFee: 0,
    boxUnitPrice: 200,
    boxCount: 20,
    boxTotalFee: 4000,
    checkFee: 1000,
    packageFee: 2000,
    additionalFee: 500,
    additionalDetail: '临时仓储费',
    inDetail: '包含码头费用',
  }
];

function CostIn() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cost_in');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchCargoOwner, setSearchCargoOwner] = useState('');
  const [searchContract, setSearchContract] = useState('');
  const [contractOptions, setContractOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  // 自动同步到 localStorage
  useEffect(() => {
    localStorage.setItem('cost_in', JSON.stringify(data));
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
      inUnitPrice: c.inFee,
      outUnitPrice: c.outFee,
      boxUnitPrice: c.boxFee
    })));
  }, [modalOpen]);

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '货权方', dataIndex: 'cargoOwner', key: 'cargoOwner' },
    { title: '提货方', dataIndex: 'pickupParty', key: 'pickupParty' },
    { title: '系统合同名称', dataIndex: 'contractName', key: 'contractName' },
    { title: '提单号', dataIndex: 'billNo', key: 'billNo' },
    { 
      title: '入库一次性费用合计', 
      dataIndex: 'totalInFee', 
      key: 'totalInFee',
      render: v => `${v}元`
    },
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

  // 搜索过滤
  const getFilteredData = () => {
    return data.filter(item => {
      const matchBillNo = !searchBillNo || (item.billNo || '').toLowerCase().includes(searchBillNo.toLowerCase());
      const matchCustomer = !searchCargoOwner || 
        (item.cargoOwner || '').toLowerCase().includes(searchCargoOwner.toLowerCase()) ||
        (item.pickupParty || '').toLowerCase().includes(searchCargoOwner.toLowerCase());
      const matchContract = !searchContract || (item.contractName || '').includes(searchContract);
      return matchBillNo && matchCustomer && matchContract;
    });
  };

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

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 计算各项费用
      const inFee = Number(values.inWeight) * Number(values.inUnitPrice);
      const outFee = Number(values.outWeight) * Number(values.outUnitPrice);
      const boxTotalFee = Number(values.boxCount) * Number(values.boxUnitPrice);
      
      const newItem = {
        ...values,
        inFee,
        outFee,
        boxTotalFee,
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

  // 选择合同时自动填充相关费用和货权方
  const handleContractChange = (value, option) => {
    if (!option) return;
    
    // 从合同中获取关联的客户信息和费率信息
    form.setFieldsValue({
      cargoOwner: option.cargoOwner, // 货权方是合同中的客户
      inUnitPrice: option.inUnitPrice,
      outUnitPrice: option.outUnitPrice,
      boxUnitPrice: option.boxUnitPrice
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>入库结算</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>

      {/* 搜索区域 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
        <span>提单号</span>
        <Input
          placeholder="按提单号搜索"
          allowClear
          style={{ width: 160 }}
          value={searchBillNo}
          onChange={e => setSearchBillNo(e.target.value)}
        />
        <span>客户</span>
        <Input
          placeholder="搜索货权方或提货方"
          allowClear
          style={{ width: 200 }}
          value={searchCargoOwner}
          onChange={e => setSearchCargoOwner(e.target.value)}
        />
        <span>系统合同名称</span>
        <Input
          placeholder="按合同名称搜索"
          allowClear
          style={{ width: 200 }}
          value={searchContract}
          onChange={e => setSearchContract(e.target.value)}
        />
      </div>

      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={getFilteredData()}
            pagination={false}
            scroll={{ x: 1200 }}
            bordered
            rowKey="key"
          />
        </div>
      </Card>

      <Modal
        open={modalOpen}
        title={editing ? '修改入库结算' : '新增入库结算'}
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
          <Form.Item name="billNo" label="提单号" rules={[{ required: true, message: '请输入提单号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="inUnitPrice" label="入库费单价(元/吨)" rules={[{ required: true, message: '请输入入库费单价' }]}>
            <Input type="number" min={0} disabled />
          </Form.Item>
          <Form.Item name="inWeight" label="入库重量(吨)" rules={[{ required: true, message: '请输入入库重量' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="outUnitPrice" label="出库费单价(元/吨)" rules={[{ required: true, message: '请输入出库费单价' }]}>
            <Input type="number" min={0} disabled />
          </Form.Item>
          <Form.Item name="outWeight" label="出库重量(吨)" rules={[{ required: true, message: '请输入出库重量' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="boxUnitPrice" label="掏箱费(元/箱)" rules={[{ required: true, message: '请输入掏箱费' }]}>
            <Input type="number" min={0} disabled />
          </Form.Item>
          <Form.Item name="boxCount" label="箱数" rules={[{ required: true, message: '请输入箱数' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="checkFee" label="对掏费" rules={[{ required: true, message: '请输入对掏费' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="packageFee" label="包干费" rules={[{ required: true, message: '请输入包干费' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="additionalFee" label="附加费" rules={[{ required: true, message: '请输入附加费' }]}>
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="additionalDetail" label="附加费明细" rules={[{ required: true, message: '请输入附加费明细' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="inDetail" label="入库一次性费用明细备注" rules={[{ required: true, message: '请输入备注' }]}>
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
            <div style={{ marginBottom: 8 }}><b>货权方：</b>{detailRecord.cargoOwner}</div>
            <div style={{ marginBottom: 8 }}><b>提货方：</b>{detailRecord.pickupParty}</div>
            <div style={{ marginBottom: 8 }}><b>系统合同名称：</b>{detailRecord.contractName}</div>
            <div style={{ marginBottom: 8 }}><b>提单号：</b>{detailRecord.billNo}</div>
            <div style={{ marginBottom: 8 }}><b>入库费单价：</b>{detailRecord.inUnitPrice}元/吨</div>
            <div style={{ marginBottom: 8 }}><b>入库重量：</b>{detailRecord.inWeight}吨</div>
            <div style={{ marginBottom: 8 }}><b>入库费用：</b>{detailRecord.inFee}元</div>
            <div style={{ marginBottom: 8 }}><b>出库费单价：</b>{detailRecord.outUnitPrice}元/吨</div>
            <div style={{ marginBottom: 8 }}><b>出库重量：</b>{detailRecord.outWeight}吨</div>
            <div style={{ marginBottom: 8 }}><b>出库费用：</b>{detailRecord.outFee}元</div>
            <div style={{ marginBottom: 8 }}><b>掏箱费：</b>{detailRecord.boxUnitPrice}元/箱</div>
            <div style={{ marginBottom: 8 }}><b>箱数：</b>{detailRecord.boxCount}</div>
            <div style={{ marginBottom: 8 }}><b>掏箱总费：</b>{detailRecord.boxTotalFee}元</div>
            <div style={{ marginBottom: 8 }}><b>对掏费：</b>{detailRecord.checkFee}元</div>
            <div style={{ marginBottom: 8 }}><b>包干费：</b>{detailRecord.packageFee}元</div>
            <div style={{ marginBottom: 8 }}><b>附加费：</b>{detailRecord.additionalFee}元</div>
            <div style={{ marginBottom: 8 }}><b>附加费明细：</b>{detailRecord.additionalDetail}</div>
            <div style={{ marginBottom: 8 }}><b>入库一次性费用明细备注：</b>{detailRecord.inDetail}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CostIn;