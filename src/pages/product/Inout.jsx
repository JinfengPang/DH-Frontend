import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message, Select, DatePicker, Tabs, Tag, Descriptions } from 'antd';
import dayjs from 'dayjs';
import './inout-tabs.css';

const { TabPane } = Tabs;

// 入库必填列
const inRequired = [
  'inNo', 'isTransfer', 'inDate', 'hasCarrier', 'warehouse', 'zone', 'slot', 'billNo', 'owner', 'picker', 'rollNo'
];
// 出库必填列
const outRequired = [
  'outNo', 'limitNo', 'isTransfer', 'inDate', 'outDate', 'hasCarrier', 'warehouse', 'zone', 'slot', 'billNo', 'owner', 'picker', 'outCarNo', 'rollNo'
];

const inAllFields = [
  { key: 'inNo', label: '入库单号' },
  { key: 'isTransfer', label: '是否货转' },
  { key: 'inDate', label: '入库日期' },
  { key: 'hasCarrier', label: '是否提供载具' },
  { key: 'warehouse', label: '所属仓库' },
  { key: 'zone', label: '所属库区' },
  { key: 'slot', label: '所属库位' },
  { key: 'billNo', label: '提单号' },
  { key: 'owner', label: '货权方' },
  { key: 'picker', label: '提货方' },
  { key: 'rollNo', label: '卷号' },
  { key: 'contractNo', label: '用户合同号' },
  { key: 'inCarNo', label: '入库车号' },
  { key: 'containerNo', label: '集装箱号' },
  { key: 'containerType', label: '集装箱型' },
  { key: 'containerAmount', label: '集装箱量' },
  { key: 'gramWeight', label: '克重' },
  { key: 'width', label: '宽度' },
  { key: 'diameter', label: '直径' },
  { key: 'length', label: '长度' },
  { key: 'color', label: '色度' },
  { key: 'grossWeight', label: '毛重' },
  { key: 'netWeight', label: '净重' },
  { key: 'origin', label: '货物原产地' },
  { key: 'brand', label: '货物品牌' },
  { key: 'productName', label: '货物品名' },
  { key: 'level', label: '等级' },
  { key: 'unit', label: '货物单位' },
  { key: 'amount', label: '货物数量' },
  { key: 'weight', label: '货物重量' },
  { key: 'remark', label: '入库要求备注' },
  { key: 'scanner', label: '扫码人' },
  { key: 'operator', label: '操作人' },
  { key: 'damageRemark', label: '破损情况备注' }
];

const outAllFields = [
  { key: 'outNo', label: '出库单号' },
  { key: 'limitNo', label: '赎货权编号' },
  { key: 'isTransfer', label: '是否货转' },
  { key: 'inDate', label: '入库日期' },
  { key: 'outDate', label: '出库日期' },
  { key: 'hasCarrier', label: '是否提供载具' },
  { key: 'warehouse', label: '所属仓库' },
  { key: 'zone', label: '所属库区' },
  { key: 'slot', label: '所属库位' },
  { key: 'billNo', label: '提单号' },
  { key: 'owner', label: '货权方' },
  { key: 'picker', label: '提货方' },
  { key: 'outCarNo', label: '出库车号' },
  { key: 'rollNo', label: '卷号' },
  { key: 'contractNo', label: '用户合同号' },
  { key: 'gramWeight', label: '克重' },
  { key: 'width', label: '宽度' },
  { key: 'diameter', label: '直径' },
  { key: 'length', label: '长度' },
  { key: 'color', label: '色度' },
  { key: 'grossWeight', label: '毛重' },
  { key: 'netWeight', label: '净重' },
  { key: 'origin', label: '货物原产地' },
  { key: 'brand', label: '货物品牌' },
  { key: 'productName', label: '货物品名' },
  { key: 'level', label: '等级' },
  { key: 'unit', label: '货物单位' },
  { key: 'amount', label: '货物数量' },
  { key: 'weight', label: '货物重量' },
  { key: 'remark', label: '库要求备注' },
  { key: 'scanner', label: '扫码人' },
  { key: 'operator', label: '操作人' },
  { key: 'damageRemark', label: '破损情况备注' }
];

function ProductInout() {
  const [tab, setTab] = useState('in');
  const [dataIn, setDataIn] = useState(() => {
    const local = localStorage.getItem('product_in');
    if (local && Array.isArray(JSON.parse(local)) && JSON.parse(local).length > 0) return JSON.parse(local);
    // 全字段假数据
    const fake = [
      {
        key: 'in1',
        inNo: 'RK20250623001',
        isTransfer: '否',
        inDate: '2025-06-23',
        hasCarrier: '是',
        warehouse: '宝湾库',
        zone: '10号库',
        slot: 'A01',
        billNo: 'TD20250623001',
        owner: '厦门建发浆纸集团有限公司',
        picker: '风途有限公司',
        rollNo: 'J001',
        contractNo: 'HT20250623001',
        inCarNo: '津A12345',
        containerNo: 'CONT001',
        containerType: '20GP',
        containerAmount: '1',
        gramWeight: '120',
        width: '1200',
        diameter: '1000',
        length: '2000',
        color: '白',
        grossWeight: '1000',
        netWeight: '980',
        origin: '中国',
        brand: 'APP',
        productName: '牛卡纸',
        level: 'A',
        unit: '吨',
        amount: '10',
        weight: '10000',
        remark: '无',
        scanner: '张三',
        operator: '李四',
        damageRemark: '无'
      },
      {
        key: 'in2',
        inNo: 'RK20250623002',
        isTransfer: '是',
        inDate: '2025-06-22',
        hasCarrier: '否',
        warehouse: '泰达库',
        zone: '2号库',
        slot: 'B02',
        billNo: 'TD20250623002',
        owner: '风途有限公司',
        picker: '厦门建发浆纸集团有限公司',
        rollNo: 'J002',
        contractNo: 'HT20250623002',
        inCarNo: '津B54321',
        containerNo: 'CONT002',
        containerType: '40HQ',
        containerAmount: '2',
        gramWeight: '130',
        width: '1100',
        diameter: '900',
        length: '2100',
        color: '黄',
        grossWeight: '2000',
        netWeight: '1980',
        origin: '日本',
        brand: '王子',
        productName: '白卡纸',
        level: 'B',
        unit: '吨',
        amount: '20',
        weight: '20000',
        remark: '注意防潮',
        scanner: '王五',
        operator: '赵六',
        damageRemark: '轻微破损'
      }
    ];
    localStorage.setItem('product_in', JSON.stringify(fake));
    return fake;
  });
  const [dataOut, setDataOut] = useState(() => {
    const local = localStorage.getItem('product_out');
    if (local && Array.isArray(JSON.parse(local)) && JSON.parse(local).length > 0) return JSON.parse(local);
    const fake = [
      {
        key: 'out1',
        outNo: 'CK20250623001',
        limitNo: '1',
        isTransfer: '否',
        inDate: '2025-06-23',
        outDate: '2025-06-24',
        hasCarrier: '是',
        warehouse: '宝湾库',
        zone: '10号库',
        slot: 'A01',
        billNo: 'TD20250623001',
        owner: '厦门建发浆纸集团有限公司',
        picker: '风途有限公司',
        outCarNo: '津A88888',
        rollNo: 'J001',
        contractNo: 'HT20250623001',
        gramWeight: '120',
        width: '1200',
        diameter: '1000',
        length: '2000',
        color: '白',
        grossWeight: '1000',
        netWeight: '980',
        origin: '中国',
        brand: 'APP',
        productName: '牛卡纸',
        level: 'A',
        unit: '吨',
        amount: '10',
        weight: '10000',
        remark: '无',
        scanner: '张三',
        operator: '李四',
        damageRemark: '无'
      },
      {
        key: 'out2',
        outNo: 'CK20250623002',
        limitNo: '2',
        isTransfer: '是',
        inDate: '2025-06-22',
        outDate: '2025-06-25',
        hasCarrier: '否',
        warehouse: '泰达库',
        zone: '2号库',
        slot: 'B02',
        billNo: 'TD20250623002',
        owner: '风途有限公司',
        picker: '厦门建发浆纸集团有限公司',
        outCarNo: '津B99999',
        rollNo: 'J002',
        contractNo: 'HT20250623002',
        gramWeight: '130',
        width: '1100',
        diameter: '900',
        length: '2100',
        color: '黄',
        grossWeight: '2000',
        netWeight: '1980',
        origin: '日本',
        brand: '王子',
        productName: '白卡纸',
        level: 'B',
        unit: '吨',
        amount: '20',
        weight: '20000',
        remark: '注意防潮',
        scanner: '王五',
        operator: '赵六',
        damageRemark: '轻微破损'
      }
    ];
    localStorage.setItem('product_out', JSON.stringify(fake));
    return fake;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  // 自动同步 localStorage
  useEffect(() => { localStorage.setItem('product_in', JSON.stringify(dataIn)); }, [dataIn]);
  useEffect(() => { localStorage.setItem('product_out', JSON.stringify(dataOut)); }, [dataOut]);

  // 美化Tabs
  const tabBarStyle = {
    background: 'transparent',
    border: 'none',
    marginBottom: 20,
    boxShadow: 'none',
  };

  // 表格列（只显示必填字段+操作）
  const getColumns = (type) => {
    const required = type === 'in' ? inRequired : outRequired;
    const all = type === 'in' ? inAllFields : outAllFields;
    const showFields = all.filter(f => required.includes(f.key));
    return [
      ...showFields.map(f => ({
        title: f.label,
        dataIndex: f.key,
        key: f.key,
        render: (val) => {
          if (f.key === 'isTransfer' || f.key === 'hasCarrier') return val === '是' ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>;
          if (f.key === 'inDate' || f.key === 'outDate') return val ? <span>{val}</span> : '';
          return val;
        }
      })),
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 180,
        render: (_, record) => (
          <Space>
            <Button size="small" type="link" onClick={() => onEdit(record, type)}>修改</Button>
            <Button size="small" type="link" danger onClick={() => handleDelete(record, type)}>删除</Button>
            <Button size="small" type="link" onClick={() => { setDetailRecord(record); setDetailOpen(true); }}>查看详情</Button>
          </Space>
        ),
      },
    ];
  };

  // 新增/编辑
  const onAdd = () => {
    form.resetFields();
    setEditing(null);
    setModalOpen(true);
  };
  const onEdit = (record, type) => {
    const values = { ...record };
    if (values.inDate) values.inDate = dayjs(values.inDate);
    if (values.outDate) values.outDate = dayjs(values.outDate);
    form.setFieldsValue(values);
    setEditing({ ...record, type });
    setModalOpen(true);
  };

  // 删除
  const handleDelete = (record, type) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条数据吗？',
      onOk: () => {
        if (type === 'in') setDataIn(dataIn.filter(item => item.key !== record.key));
        else setDataOut(dataOut.filter(item => item.key !== record.key));
        message.success('删除成功');
      }
    });
  };

  // 提交
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (values.inDate && values.inDate.format) values.inDate = values.inDate.format('YYYY-MM-DD');
      if (values.outDate && values.outDate.format) values.outDate = values.outDate.format('YYYY-MM-DD');
      if (tab === 'in') {
        if (editing) {
          const newData = dataIn.map(item => item.key === editing.key ? { ...editing, ...values } : item);
          setDataIn(newData);
          message.success('修改成功');
        } else {
          const newItem = { ...values, key: Date.now().toString() };
          setDataIn([...dataIn, newItem]);
          message.success('新增成功');
        }
      } else {
        if (editing) {
          const newData = dataOut.map(item => item.key === editing.key ? { ...editing, ...values } : item);
          setDataOut(newData);
          message.success('修改成功');
        } else {
          const newItem = { ...values, key: Date.now().toString() };
          setDataOut([...dataOut, newItem]);
          message.success('新增成功');
        }
      }
      setModalOpen(false);
      form.resetFields();
    } catch (error) {
      message.error('请填写完整且正确的数据');
    }
  };

  // 详情弹窗
  const renderDetail = () => {
    if (!detailRecord) return null;
    const fields = (tab === 'in' ? inAllFields : outAllFields);
    return (
      <Descriptions bordered column={1} size="small">
        {fields.map(f => (
          <Descriptions.Item label={f.label} key={f.key}>
            {detailRecord[f.key] || <span style={{ color: '#aaa' }}>-</span>}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  // 表单渲染（所有字段）
  const renderFormItems = () => {
    const all = tab === 'in' ? inAllFields : outAllFields;
    return all.map(meta => {
      let input = <Input placeholder={`请输入${meta.label}`} />;
      if (meta.key === 'isTransfer' || meta.key === 'hasCarrier') {
        input = <Select options={[{ label: '是', value: '是' }, { label: '否', value: '否' }]} placeholder={`请选择${meta.label}`} />;
      } else if (meta.key === 'inDate' || meta.key === 'outDate') {
        input = <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" placeholder={`请选择${meta.label}`}/>;
      }
      return (
        <Form.Item
          key={meta.key}
          label={meta.label}
          name={meta.key}
          rules={[{ required: inRequired.concat(outRequired).includes(meta.key), message: `请输入${meta.label}` }]}
        >
          {input}
        </Form.Item>
      );
    });
  };

  // 搜索状态
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchRollNo, setSearchRollNo] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');

  // 过滤数据
  const getFilteredData = (type) => {
    const data = type === 'in' ? dataIn : dataOut;
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
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20 }}>出入库操作</div>
      <div className="inout-tabs-bar">
        <Button
          type={tab === 'in' ? 'primary' : 'default'}
          className={tab === 'in' ? 'inout-tab-active' : 'inout-tab'}
          onClick={() => setTab('in')}
        >
          入库
        </Button>
        <Button
          type={tab === 'out' ? 'primary' : 'default'}
          className={tab === 'out' ? 'inout-tab-active' : 'inout-tab'}
          onClick={() => setTab('out')}
          style={{ marginLeft: 16 }}
        >
          出库
        </Button>
      </div>
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
          <span style={{ flex: 1 }} />
          <Button type="primary" onClick={onAdd}>新增{tab === 'in' ? '入库' : '出库'}</Button>
        </div>
        <Table
          columns={getColumns(tab)}
          dataSource={getFilteredData(tab)}
          rowKey="key"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
          bordered
        />
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? `修改${tab === 'in' ? '入库' : '出库'}记录` : `新增${tab === 'in' ? '入库' : '出库'}记录`}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          {renderFormItems()}
        </Form>
      </Modal>
      <Modal
        open={detailOpen}
        title="详情"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {renderDetail()}
      </Modal>
    </div>
  );
}

export default ProductInout;