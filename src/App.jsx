import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WarehouseArea from './pages/warehouse/Area';
import WarehouseZone from './pages/warehouse/Zone';
import WarehouseSlot from './pages/warehouse/Slot';
import Employee from './pages/Employee';
import CustomerInfo from './pages/customer/Info';
import CustomerLimit from './pages/customer/Limit';
import CostRate from './pages/cost/Rate';
import CostContract from './pages/cost/Contract';
import CostIn from './pages/cost/In';
import CostOut from './pages/cost/Out';
import CostStorage from './pages/cost/Storage';
import ProductInout from './pages/product/Inout';
import ProductStock from './pages/product/Stock';
import ProductTransfer from './pages/product/Transfer';
import Customer from './pages/Customer';
import Cost from './pages/Cost';
import Product from './pages/Product';
import Profile from './pages/Profile';
import 'antd/dist/reset.css';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="warehouse/area" element={<WarehouseArea />} />
          <Route path="warehouse/zone" element={<WarehouseZone />} />
          <Route path="warehouse/slot" element={<WarehouseSlot />} />
          <Route path="customer/info" element={<CustomerInfo />} />
          <Route path="customer/limit" element={<CustomerLimit />} />
          <Route path="cost/rate" element={<CostRate />} />
          <Route path="cost/contract" element={<CostContract />} />
          <Route path="cost/in" element={<CostIn />} />
          <Route path="cost/out" element={<CostOut />} />
          <Route path="cost/storage" element={<CostStorage />} />
          <Route path="product/inout" element={<ProductInout />} />
          <Route path="product/stock" element={<ProductStock />} />
          <Route path="product/transfer" element={<ProductTransfer />} />
          <Route path="employee" element={<Employee />} />
          <Route path="customer" element={<Customer />} />
          <Route path="cost" element={<Cost />} />
          <Route path="product" element={<Product />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
