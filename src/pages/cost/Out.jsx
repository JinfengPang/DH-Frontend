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

const initialData = [
  {
    key: '1',
    outId: 'OUT001', // 出库ID
    cargoOwner: '厦门建发浆纸集团有限公司',
    pickupParty: '风途有限公司',
    outTime: '2025-06-24 10:30:00', // 出库时间，精确到秒
    billNo: 'B001',
    plateNumber: '闽A12345', // 车牌号
    
    // 切纸费
    paperCutUnitPrice: 100, // 单价（元/刀）
    paperCutQuantity: 5, // 数量（刀）
    paperCutFee: 500, // 总费用
    paperCutFeesPaid: true, // 是否支付
    paperCutPaymentPerson: '张三', // 付款人
    paperCutPaymentMethod: '电子支付', // 付款方式
    
    // 加班费
    overtimeUnitPrice: 200, // 单价（元/吨）
    overtimeQuantity: 4, // 数量（吨）
    overtimeFee: 800, // 总费用
    overtimeFeesPaid: true,
    overtimePaymentPerson: '李四',
    overtimePaymentMethod: '现金',
    
    // 装箱费
    boxingUnitPrice: 250, // 单价（元/吨）
    boxingQuantity: 4, // 数量（吨）
    boxingFee: 1000, // 总费用
    boxingFeesPaid: false,
    boxingPaymentPerson: '',
    boxingPaymentMethod: '月结单',
    
    // 高栏费
    highRailUnitPrice: 150, // 单价（元/吨）
    highRailQuantity: 4, // 数量（吨）
    highRailFee: 600, // 总费用
    highRailFeesPaid: true,
    highRailPaymentPerson: '王五',
    highRailPaymentMethod: '电子支付',
    
    // 躺装费
    layingUnitPrice: 100, // 单价（元/吨）
    layingQuantity: 4, // 数量（吨）
    layingFee: 400, // 总费用
    layingFeesPaid: true,
    layingPaymentPerson: '赵六',
    layingPaymentMethod: '现金',
    
    // 角木费
    cornerWoodUnitPrice: 30, // 单价（元/个）
    cornerWoodQuantity: 10, // 数量（个）
    cornerWoodFee: 300, // 总费用
    cornerWoodFeesPaid: true,
    cornerWoodPaymentPerson: '钱七',
    cornerWoodPaymentMethod: '月结单',
    
    // 纸板费
    cardboardUnitPrice: 35, // 单价（元/个）
    cardboardQuantity: 20, // 数量（个）
    cardboardFee: 700, // 总费用
    cardboardFeesPaid: true,
    cardboardPaymentPerson: '孙八',
    cardboardPaymentMethod: '电子支付',
    
    // 运费
    transportFee: 1500, // 总费用
    transportFeesDetail: '长途运输费用',
    transportFeesPaid: true,
    transportPaymentPerson: '周九',
    transportPaymentMethod: '月结单',
    
    // 其他费用
    otherFees: 200, // 总费用
    otherFeesDetail: '临时装卸费',
    otherFeesPaid: true,
    otherPaymentPerson: '吴十',
    otherPaymentMethod: '现金'
  }
];

function CostOut() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cost_out');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchOwner, setSearchOwner] = useState('');
  const [searchPicker, setSearchPicker] = useState('');
  const [searchPlateNumber, setSearchPlateNumber] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [customerOptions, setCustomerOptions] = useState([]);

  // 自动同步到 localStorage
  useEffect(() => {
    localStorage.setItem('cost_out', JSON.stringify(data));
  }, [data]);

  // 使用 mock 数据设置客户选项
  useEffect(() => {
    setCustomerOptions(customerMockData.map(c => ({ 
      label: c.name, 
      value: c.name 
    })));
  }, []);

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '出库ID', dataIndex: 'outId', key: 'outId' },
    { title: '货权方', dataIndex: 'cargoOwner', key: 'cargoOwner' },
    { title: '提货方', dataIndex: 'pickupParty', key: 'pickupParty' },
    { title: '出库时间', dataIndex: 'outTime', key: 'outTime' },
    { title: '提单号', dataIndex: 'billNo', key: 'billNo' },
    { title: '车牌号', dataIndex: 'plateNumber', key: 'plateNumber' },
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
      const matchOwner = !searchOwner || (item.cargoOwner || '').toLowerCase().includes(searchOwner.toLowerCase());
      const matchPicker = !searchPicker || (item.pickupParty || '').toLowerCase().includes(searchPicker.toLowerCase());
      const matchPlateNumber = !searchPlateNumber || 
        (item.plateNumber || '').toLowerCase().includes(searchPlateNumber.toLowerCase());
      // 按日期过滤，只看是否在同一天
      const matchDate = !searchDate || dayjs(item.outTime).format('YYYY-MM-DD') === searchDate;
      return matchBillNo && matchOwner && matchPicker && matchPlateNumber && matchDate;
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
      outTime: record.outTime ? dayjs(record.outTime) : null
    });
    setModalOpen(true);
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 格式化出库时间，保留到秒
      const outTime = values.outTime ? values.outTime.format('YYYY-MM-DD HH:mm:ss') : '';
      
      // 计算各项费用总额
      const paperCutFee = Number(values.paperCutUnitPrice || 0) * Number(values.paperCutQuantity || 0);
      const overtimeFee = Number(values.overtimeUnitPrice || 0) * Number(values.overtimeQuantity || 0);
      const boxingFee = Number(values.boxingUnitPrice || 0) * Number(values.boxingQuantity || 0);
      const highRailFee = Number(values.highRailUnitPrice || 0) * Number(values.highRailQuantity || 0);
      const layingFee = Number(values.layingUnitPrice || 0) * Number(values.layingQuantity || 0);
      const cornerWoodFee = Number(values.cornerWoodUnitPrice || 0) * Number(values.cornerWoodQuantity || 0);
      const cardboardFee = Number(values.cardboardUnitPrice || 0) * Number(values.cardboardQuantity || 0);

      const newItem = {
        ...values,
        outTime,
        paperCutFee,
        overtimeFee,
        boxingFee,
        highRailFee,
        layingFee,
        cornerWoodFee,
        cardboardFee,
        key: editing ? editing.key : Date.now().toString(),
        outId: editing ? editing.outId : `OUT${Date.now().toString().slice(-6)}`,
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

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>出库结算</span>
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
        <span>货权方</span>
        <Input
          placeholder="按货权方搜索"
          allowClear
          style={{ width: 160 }}
          value={searchOwner}
          onChange={e => setSearchOwner(e.target.value)}
        />
        <span>提货方</span>
        <Input
          placeholder="按提货方搜索"
          allowClear
          style={{ width: 160 }}
          value={searchPicker}
          onChange={e => setSearchPicker(e.target.value)}
        />
        <span>车牌号</span>
        <Input
          placeholder="按车牌号搜索"
          allowClear
          style={{ width: 160 }}
          value={searchPlateNumber}
          onChange={e => setSearchPlateNumber(e.target.value)}
        />
        <span>出库日期</span>
        <DatePicker
          placeholder="按日期搜索"
          allowClear
          style={{ width: 120 }}
          value={searchDate ? dayjs(searchDate) : null}
          onChange={date => setSearchDate(date ? date.format('YYYY-MM-DD') : '')}
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
        title={editing ? '修改出库结算' : '新增出库结算'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="outId" label="出库ID" rules={[{ required: true, message: '请输入出库ID' }]}>
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item name="cargoOwner" label="货权方" rules={[{ required: true, message: '请选择货权方' }]}>
            <Select 
              options={customerOptions}
              placeholder="请选择货权方"
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
          <Form.Item name="outTime" label="出库时间" rules={[{ required: true, message: '请选择出库时间' }]}>
            <DatePicker 
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: '100%' }} 
              placeholder="请选择出库时间"
            />
          </Form.Item>
          <Form.Item name="billNo" label="提单号" rules={[{ required: true, message: '请输入提单号' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="plateNumber" label="车牌号" rules={[{ required: true, message: '请输入车牌号' }]}>
            <Input />
          </Form.Item>

          {/* 切纸费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>切纸费</div>
          <Form.Item name="paperCutUnitPrice" label="单价（元/刀）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="paperCutQuantity" label="数量（刀）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="paperCutFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="paperCutPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="paperCutPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 加班费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>加班费</div>
          <Form.Item name="overtimeUnitPrice" label="单价（元/吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="overtimeQuantity" label="数量（吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="overtimeFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="overtimePaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="overtimePaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 装箱费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>装箱费</div>
          <Form.Item name="boxingUnitPrice" label="单价（元/吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="boxingQuantity" label="数量（吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="boxingFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="boxingPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="boxingPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 高栏费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>高栏费</div>
          <Form.Item name="highRailUnitPrice" label="单价（元/吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="highRailQuantity" label="数量（吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="highRailFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="highRailPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="highRailPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 躺装费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>躺装费</div>
          <Form.Item name="layingUnitPrice" label="单价（元/吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="layingQuantity" label="数量（吨）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="layingFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="layingPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="layingPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 角木费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>角木费</div>
          <Form.Item name="cornerWoodUnitPrice" label="单价（元/个）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="cornerWoodQuantity" label="数量（个）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="cornerWoodFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="cornerWoodPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="cornerWoodPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 纸板费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>纸板费</div>
          <Form.Item name="cardboardUnitPrice" label="单价（元/个）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="cardboardQuantity" label="数量（个）">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="cardboardFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="cardboardPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="cardboardPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 运费 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>运费</div>
          <Form.Item name="transportFee" label="运费">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="transportFeesDetail" label="费用明细">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="transportFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="transportPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="transportPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
          </Form.Item>

          {/* 其他费用 */}
          <div style={{ marginTop: 16, marginBottom: 8, fontWeight: 'bold' }}>其他费用</div>
          <Form.Item name="otherFees" label="其他费用">
            <Input type="number" min={0} />
          </Form.Item>
          <Form.Item name="otherFeesDetail" label="费用明细">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="otherFeesPaid" label="是否已支付">
            <Select options={[{ label: '是', value: true }, { label: '否', value: false }]} />
          </Form.Item>
          <Form.Item name="otherPaymentPerson" label="付款人">
            <Input />
          </Form.Item>
          <Form.Item name="otherPaymentMethod" label="付款方式">
            <Select options={[
              { label: '电子支付', value: '电子支付' },
              { label: '现金', value: '现金' },
              { label: '月结单', value: '月结单' }
            ]} />
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
        width={800}
      >
        {detailRecord && (
          <div>
            {/* 基本信息 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>基本信息</div>
              <div style={{ marginBottom: 8 }}><b>出库ID：</b>{detailRecord.outId}</div>
              <div style={{ marginBottom: 8 }}><b>货权方：</b>{detailRecord.cargoOwner}</div>
              <div style={{ marginBottom: 8 }}><b>提货方：</b>{detailRecord.pickupParty}</div>
              <div style={{ marginBottom: 8 }}><b>出库时间：</b>{detailRecord.outTime}</div>
              <div style={{ marginBottom: 8 }}><b>提单号：</b>{detailRecord.billNo}</div>
              <div style={{ marginBottom: 8 }}><b>车牌号：</b>{detailRecord.plateNumber}</div>
            </div>
            
            {/* 切纸费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>切纸费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.paperCutUnitPrice}元/刀</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.paperCutQuantity}刀</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.paperCutFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.paperCutFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.paperCutFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.paperCutPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.paperCutPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 加班费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>加班费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.overtimeUnitPrice}元/吨</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.overtimeQuantity}吨</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.overtimeFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.overtimeFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.overtimeFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.overtimePaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.overtimePaymentMethod}</div>
                </>
              )}
            </div>

            {/* 装箱费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>装箱费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.boxingUnitPrice}元/吨</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.boxingQuantity}吨</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.boxingFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.boxingFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.boxingFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.boxingPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.boxingPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 高栏费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>高栏费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.highRailUnitPrice}元/吨</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.highRailQuantity}吨</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.highRailFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.highRailFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.highRailFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.highRailPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.highRailPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 躺装费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>躺装费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.layingUnitPrice}元/吨</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.layingQuantity}吨</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.layingFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.layingFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.layingFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.layingPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.layingPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 角木费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>角木费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.cornerWoodUnitPrice}元/个</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.cornerWoodQuantity}个</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.cornerWoodFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.cornerWoodFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.cornerWoodFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.cornerWoodPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.cornerWoodPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 纸板费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>纸板费</div>
              <div style={{ marginBottom: 8 }}><b>单价：</b>{detailRecord.cardboardUnitPrice}元/个</div>
              <div style={{ marginBottom: 8 }}><b>数量：</b>{detailRecord.cardboardQuantity}个</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.cardboardFee}元</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.cardboardFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.cardboardFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.cardboardPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.cardboardPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 运费 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>运费</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.transportFee}元</div>
              <div style={{ marginBottom: 8 }}><b>费用明细：</b>{detailRecord.transportFeesDetail}</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.transportFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.transportFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.transportPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.transportPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 其他费用 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8, fontSize: 16, fontWeight: 'bold' }}>其他费用</div>
              <div style={{ marginBottom: 8 }}><b>费用：</b>{detailRecord.otherFees}元</div>
              <div style={{ marginBottom: 8 }}><b>费用明细：</b>{detailRecord.otherFeesDetail}</div>
              <div style={{ marginBottom: 8 }}><b>支付状态：</b>{detailRecord.otherFeesPaid ? '已支付' : '未支付'}</div>
              {detailRecord.otherFeesPaid && (
                <>
                  <div style={{ marginBottom: 8 }}><b>付款人：</b>{detailRecord.otherPaymentPerson}</div>
                  <div style={{ marginBottom: 8 }}><b>付款方式：</b>{detailRecord.otherPaymentMethod}</div>
                </>
              )}
            </div>

            {/* 费用合计 */}
            <div style={{ marginTop: 16, fontSize: 16, fontWeight: 'bold' }}>
              费用合计：{
                (detailRecord.paperCutFee || 0) +
                (detailRecord.overtimeFee || 0) +
                (detailRecord.boxingFee || 0) +
                (detailRecord.highRailFee || 0) +
                (detailRecord.layingFee || 0) +
                (detailRecord.cornerWoodFee || 0) +
                (detailRecord.cardboardFee || 0) +
                (detailRecord.transportFee || 0) +
                (detailRecord.otherFees || 0)
              }元
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CostOut;