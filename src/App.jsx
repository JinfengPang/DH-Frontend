import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Warehouse from './pages/Warehouse';
import Employee from './pages/Employee';
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
          <Route path="warehouse" element={<Warehouse />} />
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
