import React from 'react';
import { Card } from 'antd';
import { Outlet } from 'react-router-dom';

function Customer() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

export default Customer;
