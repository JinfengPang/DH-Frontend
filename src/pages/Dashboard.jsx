import React from 'react';
import { Card, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';

const stats = [
  { title: '当日入库数量', value: 120 },
  { title: '当日出库数量', value: 98 },
  { title: '当前员工数量', value: 23 },
  { title: '当前客户数量', value: 15 },
  { title: '当月结算单数量', value: 32 },
];

// 自动生成近7天日期（今天为最后一个，格式MM-DD）
function getLast7Days() {
  const days = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push(`${mm}-${dd}`);
  }
  return days;
}

const days = getLast7Days();
const inData = [20, 32, 41, 34, 50, 60, 70];
const outData = [15, 28, 35, 30, 40, 55, 65];

const chartOption = {
  tooltip: { trigger: 'axis' },
  legend: { data: ['入库数量', '出库数量'] },
  grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
  xAxis: { type: 'category', boundaryGap: false, data: days },
  yAxis: { type: 'value' },
  series: [
    {
      name: '入库数量',
      type: 'line',
      data: inData,
      smooth: true,
      symbol: 'circle',
      areaStyle: { color: '#eaf3fe' },
      lineStyle: { color: '#3b82f6' },
      itemStyle: { color: '#3b82f6' },
    },
    {
      name: '出库数量',
      type: 'line',
      data: outData,
      smooth: true,
      symbol: 'circle',
      areaStyle: { color: '#fbeee6' },
      lineStyle: { color: '#f59e42' },
      itemStyle: { color: '#f59e42' },
    },
  ],
};

function Dashboard() {
  return (
    <div>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>主页概览</div>
      <Row gutter={16} style={{ marginBottom: 24 }}>
        {stats.map((item) => (
          <Col key={item.title} xs={24} sm={12} md={8} lg={4} style={{ marginBottom: 16 }}>
            <Card bordered style={{ textAlign: 'center', borderRadius: 12 }}>
              <div style={{ fontSize: 16, color: '#888' }}>{item.title}</div>
              <div style={{ fontSize: 32, fontWeight: 700 }}>{item.value}</div>
            </Card>
          </Col>
        ))}
      </Row>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>近7天入库/出库数量</div>
        <ReactECharts option={chartOption} style={{ height: 320 }} />
      </Card>
    </div>
  );
}

export default Dashboard; 