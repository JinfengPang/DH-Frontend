import React from 'react';
import { Layout, Menu, Card, Table, Button } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  DollarOutlined,
  IdcardOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons';
import 'antd/dist/reset.css';
import './App.css';

const { Header, Sider, Content } = Layout;

const stats = [
  { title: '生产中的订单', value: 5 },
  { title: '本周质量问题', value: 0 },
  { title: '延迟发货', value: 3 },
  { title: '紧急通知', value: 1 },
];

const columns = [
  { title: '订单编号', dataIndex: 'id', key: 'id' },
  { title: '产品', dataIndex: 'product', key: 'product' },
  { title: '工厂', dataIndex: 'factory', key: 'factory' },
  { title: '下单时间', dataIndex: 'orderDate', key: 'orderDate' },
  { title: '预计交货时间', dataIndex: 'deliveryDate', key: 'deliveryDate' },
  { title: '状态', dataIndex: 'status', key: 'status', render: (text) => <Button type="default" size="small">{text}</Button> },
];

const dataSource = [
  { id: '#12345', product: '女士牛仔裤', factory: '上海服装厂', orderDate: '10/12/21', deliveryDate: '01/12/22', status: '生产中' },
  { id: '#12346', product: '男士羊毛衫', factory: '宁波织衣厂', orderDate: '10/12/21', deliveryDate: '01/12/22', status: '生产中' },
  { id: '#12347', product: '中性帆布鞋', factory: '广州鞋厂', orderDate: '10/12/21', deliveryDate: '01/12/22', status: '准备发货' },
  { id: '#12348', product: '儿童纯棉睡衣', factory: '杭州成衣厂', orderDate: '10/12/21', deliveryDate: '01/12/22', status: '生产中' },
  { id: '#12349', product: '科技旅行背包', factory: '深圳箱包厂', orderDate: '10/12/21', deliveryDate: '01/12/22', status: '生产中' },
];

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', height: '1000px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, flexShrink: 0 }}>
          生产控制面板
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu mode="inline" defaultSelectedKeys={['dashboard']} style={{ borderRight: 0 }}>
            <Menu.Item key="dashboard" icon={<HomeOutlined />}>控制面板</Menu.Item>
            <Menu.Item key="warehouse" icon={<AppstoreOutlined />}>库房管理</Menu.Item>
            <Menu.Item key="order" icon={<ShoppingCartOutlined />}>订单管理</Menu.Item>
            <Menu.Item key="customer" icon={<UserOutlined />}>客户管理</Menu.Item>
            <Menu.Item key="cost" icon={<DollarOutlined />}>费用管理</Menu.Item>
            <Menu.Item key="employee" icon={<IdcardOutlined />}>员工管理</Menu.Item>
            <Menu.Item key="setting" icon={<SettingOutlined />}>设置</Menu.Item>
            <Menu.Item key="help" icon={<QuestionCircleOutlined />}>帮助与反馈</Menu.Item>
          </Menu>
        </div>
      </Sider>
      <Layout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700 }}>欢迎, 张三</div>
          <Button>查看个人资料</Button>
        </Header>
        <Content style={{ margin: '24px', overflow: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
            {stats.map((item) => (
              <Card key={item.title} style={{ flex: 1, textAlign: 'center', borderRadius: 12 }}>
                <div style={{ fontSize: 16, color: '#888' }}>{item.title}</div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>{item.value}</div>
              </Card>
            ))}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16 }}>进行中的订单</div>
          <Table
            columns={columns}
            dataSource={dataSource}
            pagination={false}
            bordered
            style={{ background: '#fff', borderRadius: 12 }}
          />
        </Content>
      </Layout>
    </Layout>
  );
}

export default App;
