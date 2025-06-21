import React from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import dhLogo from '../assets/dh_logo.jpg';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: 'warehouse', icon: <AppstoreOutlined />, label: '仓库管理', path: '/warehouse' },
  { key: 'employee', icon: <IdcardOutlined />, label: '员工管理', path: '/employee' },
  { key: 'customer', icon: <UserOutlined />, label: '客户管理', path: '/customer' },
  { key: 'cost', icon: <DollarOutlined />, label: '结费管理', path: '/cost' },
  { key: 'product', icon: <ShoppingCartOutlined />, label: '商品管理', path: '/product' },
];

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = menuItems.find(item => location.pathname.startsWith(item.path))?.key || 'warehouse';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', height: '1000px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: 20, flexShrink: 0, paddingLeft: 24, fontFamily: 'Kaiti, KaiTi, STKaiti, serif', justifyContent: 'flex-start' }}>
          <img src={dhLogo} alt="dh_logo" style={{ height: 40, width: 'auto', marginRight: 12, display: 'block' }} />
          <span>大恒国际</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            style={{ borderRight: 0 }}
            onClick={({ key }) => {
              const item = menuItems.find(i => i.key === key);
              if (item) navigate(item.path);
            }}
            items={menuItems}
          />
        </div>
      </Sider>
      <Layout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Kaiti, KaiTi, STKaiti, serif' }}>欢迎, 特朗普</div>
          <Button onClick={() => navigate('/profile')}>查看个人资料</Button>
        </Header>
        <Content style={{ margin: '24px', overflow: 'auto', flex: 1 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

export default MainLayout; 