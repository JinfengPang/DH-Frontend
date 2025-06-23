import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select, DatePicker } from 'antd';
import dayjs from 'dayjs';

const initialData = [
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

function Contract() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('contracts');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [rateOptions, setRateOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);

  useEffect(() => {
    localStorage.setItem('contracts', JSON.stringify(data));
  }, [data]);

  // 获取费率规则编号下拉
  useEffect(() => {
    const rates = JSON.parse(localStorage.getItem('cost_rates') || '[]');
    setRateOptions(rates.map(r => ({ label: `${r.rateNo}（${r.rateName}）`, value: r.rateNo })));
    // 获取客户下拉
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    setCustomerOptions(customers.map(c => ({ label: c.name, value: c.name })));
  }, [modalOpen]);

  // 修复1：确保修改时正确回填数据
  useEffect(() => {
    if (modalOpen) {
      if (editing) {
        // 使用setTimeout确保DOM更新完成后再设置表单值
        setTimeout(() => {
          form.setFieldsValue({
            customerName: editing.customerName,
            rateNo: editing.rateNo,
            contractName: editing.contractName,
            contractId: editing.contractId,
            startDate: editing.startDate ? dayjs(editing.startDate) : null,
            endDate: editing.endDate ? dayjs(editing.endDate) : null,
            contractType: editing.contractType,
            invoiceRate: editing.invoiceRate,
            inFee: editing.inFee,
            outFee: editing.outFee,
            boxFee: editing.boxFee,
          });
        }, 0);
      } else {
        form.resetFields();
      }
    }
  }, [modalOpen, editing, form]);

  const columns = [
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
    { title: '堆存费率编号', dataIndex: 'rateNo', key: 'rateNo' },
    { title: '系统合同名称', dataIndex: 'contractName', key: 'contractName' },
    { title: '合同id', dataIndex: 'contractId', key: 'contractId' },
    { title: '合同开始日期', dataIndex: 'startDate', key: 'startDate' },
    { title: '合同截止日期', dataIndex: 'endDate', key: 'endDate' },
    { title: '合同形式', dataIndex: 'contractType', key: 'contractType' },
    { title: '开票税率', dataIndex: 'invoiceRate', key: 'invoiceRate', render: v => `${v}%` },
    { title: '入库费单价', dataIndex: 'inFee', key: 'inFee', render: v => v !== undefined ? `${v}元/吨` : '' },
    { title: '出库费单价', dataIndex: 'outFee', key: 'outFee', render: v => v !== undefined ? `${v}元/吨` : '' },
    { title: '掏箱费', dataIndex: 'boxFee', key: 'boxFee', render: v => v !== undefined ? `${v}元/箱` : '' },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size={4}>
          <Button size="small" type="link" onClick={() => onEdit(record)}>修改</Button>
          <Button size="small" type="link" danger onClick={() => setDeleteKey(record.key)}>删除</Button>
          <Button size="small" type="link" onClick={() => { setDetailRecord(record); setDetailOpen(true); }}>详情</Button>
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
  };

  // 修复2：优化表单验证逻辑
  const handleOk = async () => {
    try {
      // 先触发表单验证
      await form.validateFields();
      
      // 获取表单值
      const values = form.getFieldsValue();
      
      // 日期格式化
      const startDate = values.startDate ? values.startDate.format('YYYY-MM-DD') : '';
      const endDate = values.endDate ? values.endDate.format('YYYY-MM-DD') : '';
      
      // 创建/更新合同对象
      const newItem = {
        ...values,
        startDate,
        endDate,
        invoiceRate: values.invoiceRate ? Number(values.invoiceRate) : 0,
        inFee: values.inFee !== undefined ? Number(values.inFee) : undefined,
        outFee: values.outFee !== undefined ? Number(values.outFee) : undefined,
        boxFee: values.boxFee !== undefined ? Number(values.boxFee) : undefined,
        key: editing ? editing.key : Date.now().toString(),
      };

      // 更新数据
      if (editing) {
        setData(data.map(item => item.key === editing.key ? newItem : item));
        message.success('修改成功');
      } else {
        setData([...data, newItem]);
        message.success('新增成功');
      }
      
      setModalOpen(false);
    } catch (error) {
      console.error('表单验证错误:', error);
      message.error('请检查表单数据是否正确填写');
    }
  };

  // 税率校验
  const validateInvoiceRate = (_, value) => {
    if (value === undefined || value === '') {
      return Promise.reject('请输入税率');
    }
    const num = Number(value);
    if (isNaN(num)) {
      return Promise.reject('请输入有效数字');
    }
    if (num < 0 || num > 100) {
      return Promise.reject('税率需为0-100');
    }
    return Promise.resolve();
  };

  const handleDelete = () => {
    setData(data.filter(item => item.key !== deleteKey));
    setDeleteKey(null);
    message.success('删除成功');
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>系统合同管理</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1200 }}
            bordered
            rowKey="key"
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? '修改合同' : '新增合同'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerName" label="客户名称" rules={[{ required: true, message: '请选择客户' }]}>
            <Select options={customerOptions} placeholder="请选择客户" showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="rateNo" label="堆存费率编号" rules={[{ required: true, message: '请选择费率规则' }]}>
            <Select options={rateOptions} placeholder="请选择费率规则" showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="contractName" label="系统合同名称" rules={[{ required: true, message: '请输入合同名称' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="contractId" label="合同id" rules={[{ required: true, message: '请输入合同id' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="合同开始日期" rules={[{ required: true, message: '请选择开始日期' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="endDate" label="合同截止日期" rules={[{ required: true, message: '请选择截止日期' }]}>
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="contractType" label="合同形式" rules={[{ required: true, message: '请选择合同形式' }]}>
            <Select options={[{ label: '纸质', value: '纸质' }, { label: '电子', value: '电子' }]} placeholder="请选择合同形式" />
          </Form.Item>
          <Form.Item 
            name="invoiceRate" 
            label="开票税率(%)" 
            rules={[
              { validator: validateInvoiceRate }
            ]}
          >
            <Input type="number" placeholder="0-100" />
          </Form.Item>
          <Form.Item name="inFee" label="入库费单价(元/吨)" rules={[{ required: true, message: '请输入入库费单价' }]}>
            <Input type="number" min={0} placeholder="元/吨" />
          </Form.Item>
          <Form.Item name="outFee" label="出库费单价(元/吨)" rules={[{ required: true, message: '请输入出库费单价' }]}>
            <Input type="number" min={0} placeholder="元/吨" />
          </Form.Item>
          <Form.Item name="boxFee" label="掏箱费(元/箱)" rules={[{ required: true, message: '请输入掏箱费' }]}>
            <Input type="number" min={0} placeholder="元/箱" />
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
        width={500}
      >
        {detailRecord && (
          <div>
            <div style={{ marginBottom: 8 }}><b>客户名称：</b>{detailRecord.customerName}</div>
            <div style={{ marginBottom: 8 }}><b>堆存费率编号：</b>{detailRecord.rateNo}</div>
            <div style={{ marginBottom: 8 }}><b>系统合同名称：</b>{detailRecord.contractName}</div>
            <div style={{ marginBottom: 8 }}><b>合同id：</b>{detailRecord.contractId}</div>
            <div style={{ marginBottom: 8 }}><b>合同开始日期：</b>{detailRecord.startDate}</div>
            <div style={{ marginBottom: 8 }}><b>合同截止日期：</b>{detailRecord.endDate}</div>
            <div style={{ marginBottom: 8 }}><b>合同形式：</b>{detailRecord.contractType}</div>
            <div style={{ marginBottom: 8 }}><b>开票税率：</b>{detailRecord.invoiceRate}%</div>
            <div style={{ marginBottom: 8 }}><b>入库费单价：</b>{detailRecord.inFee}元/吨</div>
            <div style={{ marginBottom: 8 }}><b>出库费单价：</b>{detailRecord.outFee}元/吨</div>
            <div style={{ marginBottom: 8 }}><b>掏箱费：</b>{detailRecord.boxFee}元/箱</div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Contract;