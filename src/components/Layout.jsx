import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button } from 'antd';
import {
  AppstoreOutlined,
  UserOutlined,
  DollarOutlined,
  IdcardOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  PartitionOutlined,
  BorderInnerOutlined,
  SolutionOutlined,
  LockOutlined,
  FileProtectOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  FileSyncOutlined,
  SwapOutlined,
  EyeOutlined,
  ImportOutlined,
  ExportOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import dhLogo from '../assets/dh_logo.jpg';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: 'warehouse',
    icon: <AppstoreOutlined />, 
    label: '仓库管理',
    children: [
      { key: 'warehouse-area', icon: <DatabaseOutlined />, label: '仓位管理', path: '/warehouse/area', style: { paddingLeft: 24 } },
      { key: 'warehouse-zone', icon: <PartitionOutlined />, label: '库区管理', path: '/warehouse/zone', style: { paddingLeft: 24 } },
      { key: 'warehouse-slot', icon: <BorderInnerOutlined />, label: '库位管理', path: '/warehouse/slot', style: { paddingLeft: 24 } },
    ]
  },
  {
    key: 'customer',
    icon: <UserOutlined />,
    label: '客户管理',
    children: [
      { key: 'customer-info', icon: <SolutionOutlined />, label: '客户信息管理', path: '/customer/info', style: { paddingLeft: 24 } },
      { key: 'customer-limit', icon: <LockOutlined />, label: '提货方赎货限制', path: '/customer/limit', style: { paddingLeft: 24 } },
    ]
  },
  {
    key: 'cost',
    icon: <DollarOutlined />,
    label: '结费管理',
    children: [
      { key: 'cost-rate', icon: <FileProtectOutlined />, label: '费率规则管理', path: '/cost/rate', style: { paddingLeft: 24 } },
      { key: 'cost-contract', icon: <FileTextOutlined />, label: '系统合同管理', path: '/cost/contract', style: { paddingLeft: 24 } },
      { key: 'cost-in', icon: <ImportOutlined />, label: '入库结算', path: '/cost/in', style: { paddingLeft: 24 } },
      { key: 'cost-out', icon: <ExportOutlined />, label: '出库结算', path: '/cost/out', style: { paddingLeft: 24 } },
      { key: 'cost-storage', icon: <FileDoneOutlined />, label: '堆存费结算', path: '/cost/storage', style: { paddingLeft: 24 } },
    ]
  },
  {
    key: 'product',
    icon: <ShoppingCartOutlined />,
    label: '商品管理',
    children: [
      { key: 'product-inout', icon: <SwapOutlined />, label: '出入库操作', path: '/product/inout', style: { paddingLeft: 24 } },
      { key: 'product-stock', icon: <EyeOutlined />, label: '库存查看', path: '/product/stock', style: { paddingLeft: 24 } },
      { key: 'product-transfer', icon: <FileSyncOutlined />, label: '货权转换', path: '/product/transfer', style: { paddingLeft: 24 } },
    ]
  },
  { key: 'employee', icon: <IdcardOutlined />, label: '员工管理', path: '/employee' },
];

function findSelectedKeys(pathname) {
  if (pathname.startsWith('/warehouse/area')) return ['warehouse', 'warehouse-area'];
  if (pathname.startsWith('/warehouse/zone')) return ['warehouse', 'warehouse-zone'];
  if (pathname.startsWith('/warehouse/slot')) return ['warehouse', 'warehouse-slot'];
  if (pathname.startsWith('/customer/info')) return ['customer', 'customer-info'];
  if (pathname.startsWith('/customer/limit')) return ['customer', 'customer-limit'];
  if (pathname.startsWith('/cost/rate')) return ['cost', 'cost-rate'];
  if (pathname.startsWith('/cost/contract')) return ['cost', 'cost-contract'];
  if (pathname.startsWith('/cost/in')) return ['cost', 'cost-in'];
  if (pathname.startsWith('/cost/out')) return ['cost', 'cost-out'];
  if (pathname.startsWith('/cost/storage')) return ['cost', 'cost-storage'];
  if (pathname.startsWith('/product/inout')) return ['product', 'product-inout'];
  if (pathname.startsWith('/product/stock')) return ['product', 'product-stock'];
  if (pathname.startsWith('/product/transfer')) return ['product', 'product-transfer'];
  if (pathname.startsWith('/employee')) return ['employee'];
  return [];
}

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKeys = findSelectedKeys(location.pathname);

  // 用 useState 管理 openKeys
  const [openKeys, setOpenKeys] = useState([]);

  // 路由变化时自动展开正确的父菜单
  useEffect(() => {
    // 只展开当前选中项的一级菜单
    const selected = findSelectedKeys(location.pathname);
    if (selected.length > 0) {
      setOpenKeys([selected[0]]);
    } else {
      setOpenKeys([]);
    }
  }, [location.pathname]);

  // 菜单展开/收起事件，保证只展开一个一级菜单
  const handleOpenChange = (keys) => {
    // 只允许展开一个一级菜单
    setOpenKeys(keys.length > 0 ? [keys[keys.length - 1]] : []);
  };

  // 递归渲染菜单，支持 style
  const renderMenuItems = (items) =>
    items.map((item) => {
      if (item.children) {
        return {
          key: item.key,
          icon: item.icon,
          label: item.label,
          children: renderMenuItems(item.children),
        };
      }
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        style: item.style || {},
      };
    });

  // 递归扁平化所有二级菜单项
  const getAllMenuItems = (items) => {
    let result = [];
    items.forEach(item => {
      if (item.children) {
        result = result.concat(getAllMenuItems(item.children));
      } else {
        result.push(item);
      }
    });
    return result;
  };

  // 菜单点击事件
  const handleMenuClick = ({ key }) => {
    const flatItems = getAllMenuItems(menuItems);
    const found = flatItems.find(i => i.key === key);
    if (found && found.path) {
      navigate(found.path);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', height: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div className="sider-logo-area" style={{ fontWeight: 'bold', fontSize: 22, fontFamily: 'Kaiti, KaiTi, STKaiti, serif' }}>
          <img src={dhLogo} alt="dh_logo" style={{ height: 40, width: 'auto', marginRight: 12, display: 'block' }} />
          <span>大恒国际</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            openKeys={openKeys}
            style={{ borderRight: 0 }}
            onClick={handleMenuClick}
            onOpenChange={handleOpenChange}
            items={renderMenuItems(menuItems)}
          />
        </div>
        <div style={{ color: '#aaa', fontSize: 13, padding: '0 0 18px 24px', minHeight: 32, textAlign: 'left', position: 'absolute', left: 0, bottom: 20, width: '100%' }}>
          v1.0.1 &nbsp;
        </div>
        <div style={{ color: '#aaa', fontSize: 13, padding: '0 0 18px 24px', minHeight: 32, textAlign: 'left', position: 'absolute', left: 0, bottom: 0, width: '100%' }}>
          Copyright © 2025 大恒国际
        </div>
      </Sider>
      <Layout style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Kaiti, KaiTi, STKaiti, serif' }}>欢迎, 大恒007</div>
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