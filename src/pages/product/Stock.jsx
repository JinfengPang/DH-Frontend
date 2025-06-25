import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Input, Tag, Descriptions } from 'antd';
import dayjs from 'dayjs';

// 必填字段
const requiredFields = [
  'rollNo', 'billNo', 'inDate', 'hasCarrier', 'owner', 'picker', 'warehouse', 'zone', 'slot'
];

// 全部字段
const allFields = [
  { key: 'rollNo', label: '卷号' },
  { key: 'billNo', label: '提单号' },
  { key: 'inDate', label: '入库日期' },
  { key: 'hasCarrier', label: '是否提供载具' },
  { key: 'owner', label: '货权方' },
  { key: 'picker', label: '提货方' },
  { key: 'warehouse', label: '所属仓库' },
  { key: 'zone', label: '所属库区' },
  { key: 'slot', label: '所属库位' },
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
  { key: 'weight', label: '货物重量' }
];

function ProductStock() {
  // 初始化本地数据
  const [data, setData] = useState(() => {
    const local = localStorage.getItem('stock');
    if (local && Array.isArray(JSON.parse(local)) && JSON.parse(local).length > 0) return JSON.parse(local);
    // 假数据
    const fake = [
      {
        key: 's1',
        rollNo: 'J001',
        billNo: 'TD20250623001',
        inDate: '2025-06-23',
        hasCarrier: '是',
        owner: '厦门建发浆纸集团有限公司',
        picker: '风途有限公司',
        warehouse: '宝湾库',
        zone: '10号库',
        slot: 'A01',
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
        weight: '10000'
      },
      {
        key: 's2',
        rollNo: 'J002',
        billNo: 'TD20250623002',
        inDate: '2025-06-22',
        hasCarrier: '否',
        owner: '风途有限公司',
        picker: '厦门建发浆纸集团有限公司',
        warehouse: '泰达库',
        zone: '2号库',
        slot: 'B02',
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
        weight: '20000'
      }
    ];
    localStorage.setItem('stock', JSON.stringify(fake));
    return fake;
  });

  // 自动同步 localStorage
  useEffect(() => { localStorage.setItem('stock', JSON.stringify(data)); }, [data]);

  // 详情弹窗
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  // 搜索状态
  const [searchBillNo, setSearchBillNo] = useState('');
  const [searchRollNo, setSearchRollNo] = useState('');
  const [searchOwner, setSearchOwner] = useState('');
  const [searchPicker, setSearchPicker] = useState('');

  // 批量出库相关
  const [batchMode, setBatchMode] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // 过滤数据
  const getFilteredData = () => {
    return data.filter(item => {
      const billMatch = searchBillNo ? (item.billNo || '').includes(searchBillNo) : true;
      const rollMatch = searchRollNo ? (item.rollNo || '').includes(searchRollNo) : true;
      const ownerMatch = searchOwner ? (item.owner || '').toLowerCase().includes(searchOwner.toLowerCase()) : true;
      const pickerMatch = searchPicker ? (item.picker || '').toLowerCase().includes(searchPicker.toLowerCase()) : true;
      return billMatch && rollMatch && ownerMatch && pickerMatch;
    });
  };

  // 表格列
  const columns = [
    ...allFields.filter(f => requiredFields.includes(f.key)).map(f => ({
      title: f.label,
      dataIndex: f.key,
      key: f.key,
      render: (val) => {
        if (f.key === 'hasCarrier') return val === '是' ? <Tag color="green">是</Tag> : <Tag color="red">否</Tag>;
        if (f.key === 'inDate') return val ? <span>{val}</span> : '';
        return val;
      }
    })),
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => { setDetailRecord(record); setDetailOpen(true); }}>查看详情</Button>
          <Button size="small" type="link" danger disabled>删除</Button>
        </Space>
      ),
    },
  ];

  // 详情渲染
  const renderDetail = () => {
    if (!detailRecord) return null;
    return (
      <Descriptions bordered column={1} size="small">
        {allFields.map(f => (
          <Descriptions.Item label={f.label} key={f.key}>
            {detailRecord[f.key] || <span style={{ color: '#aaa' }}>-</span>}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };

  // 批量出库操作
  const handleBatchOut = () => {
    setBatchMode(true);
    setSelectedRowKeys([]);
  };
  const handleBatchConfirm = () => {
    Modal.confirm({
      title: '确认批量出库',
      content: `确定要将选中的${selectedRowKeys.length}条记录出库吗？`,
      onOk: () => {
        setData(data.filter(item => !selectedRowKeys.includes(item.key)));
        setBatchMode(false);
        setSelectedRowKeys([]);
      }
    });
  };
  const handleBatchCancel = () => {
    setBatchMode(false);
    setSelectedRowKeys([]);
  };
  const handleSelectAll = () => {
    setSelectedRowKeys(getFilteredData().map(item => item.key));
  };
  const handleUnselectAll = () => {
    setSelectedRowKeys([]);
  };

  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center' }}>
        <span>库存查看</span>
        <span style={{ flex: 1 }} />
        {!batchMode && (
          <Button type="primary" onClick={handleBatchOut}>批量出库</Button>
        )}
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
            placeholder="按货权方搜索"
            allowClear
            style={{ width: 180 }}
            value={searchOwner}
            onChange={e => setSearchOwner(e.target.value)}
          />
          <Input
            placeholder="按提货方搜索"
            allowClear
            style={{ width: 180 }}
            value={searchPicker}
            onChange={e => setSearchPicker(e.target.value)}
          />
          {batchMode && (
            <>
              <Button onClick={handleSelectAll}>全选</Button>
              <Button onClick={handleUnselectAll}>全部取消</Button>
              <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={handleBatchConfirm}>确认出库</Button>
              <Button onClick={handleBatchCancel}>退出批量</Button>
            </>
          )}
        </div>
        <Table
          columns={columns}
          dataSource={getFilteredData()}
          rowKey="key"
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
          bordered
          rowSelection={batchMode ? {
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          } : undefined}
        />
      </Card>
      <Modal
        open={detailOpen}
        title="库存详情"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={600}
      >
        {renderDetail()}
      </Modal>
    </div>
  );
}

export default ProductStock;