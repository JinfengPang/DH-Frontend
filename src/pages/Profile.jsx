import React, { useState } from 'react';
import { Card, Button, Input, Modal, Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const userInfo = {
  name: '张三',
  id: 'A10001',
  department: '仓储部',
  phone: '13812345678',
  email: 'zhangsan@example.com',
};

function Profile() {
  const [editType, setEditType] = useState(null); // 'phone' | 'email' | 'password' | null
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [info, setInfo] = useState(userInfo);
  const [formError, setFormError] = useState({});
  const navigate = useNavigate();

  const handleEdit = (type) => {
    setEditType(type);
    setModalOpen(true);
    form.resetFields();
  };

  const handleOk = () => {
    form.validateFields().then(values => {
      let error = {};
      if (editType === 'phone' || editType === 'email') {
        if (values.new !== values.confirm) {
          error.confirm = '两次输入的新数据不一致';
        }
        if (values.new === info[editType]) {
          error.new = '新数据不能与原数据相同';
        }
        if (Object.keys(error).length > 0) {
          setFormError(error);
          return;
        }
        setInfo(prev => ({ ...prev, [editType]: values.new }));
        setModalOpen(false);
        setFormError({});
      } else if (editType === 'password') {
        if (values.new !== values.confirm) {
          error.confirm = '两次输入的新密码不一致';
        }
        if (values.old !== '123456') {
          error.old = '原密码输入不正确';
        }
        if (values.new === values.old) {
          error.new = '新密码不能与原密码相同';
        }
        if (Object.keys(error).length > 0) {
          setFormError(error);
          return;
        }
        setModalOpen(false);
        setFormError({});
      }
    });
  };

  const getModalTitle = () => {
    if (editType === 'phone') return '修改手机号';
    if (editType === 'email') return '修改邮箱';
    if (editType === 'password') return '修改密码';
    return '';
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    message.success('已退出登录');
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 480, margin: '0' }}>
      <Card bordered style={{ borderRadius: 12, marginBottom: 32, width: 520 }}>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>个人资料</div>
        <div style={{ marginBottom: 18 }}>
          <span style={{ color: '#888', width: 80, display: 'inline-block' }}>姓名：</span>
          <span>{info.name}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <span style={{ color: '#888', width: 80, display: 'inline-block' }}>工号：</span>
          <span>{info.id}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <span style={{ color: '#888', width: 80, display: 'inline-block' }}>部门：</span>
          <span>{info.department}</span>
        </div>
        <div style={{ marginBottom: 18 }}>
          <span style={{ color: '#888', width: 80, display: 'inline-block' }}>手机号：</span>
          <span>{info.phone}</span>
          <Button size="small" style={{ marginLeft: 16 }} onClick={() => handleEdit('phone')}>修改</Button>
        </div>
        <div style={{ marginBottom: 18 }}>
          <span style={{ color: '#888', width: 80, display: 'inline-block' }}>邮箱：</span>
          <span>{info.email}</span>
          <Button size="small" style={{ marginLeft: 16 }} onClick={() => handleEdit('email')}>修改</Button>
        </div>
      </Card>
      <Card bordered style={{ borderRadius: 12, width: 520 }}>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>账号安全</div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button type="primary" onClick={() => handleEdit('password')}>修改密码</Button>
          <Button danger style={{ marginLeft: 8 }} onClick={handleLogout}>退出登录</Button>
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={getModalTitle()}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          {editType === 'phone' && (
            <>
              <Form.Item label="原手机号">
                <Input value={info.phone} disabled />
              </Form.Item>
              <Form.Item name="new" label="新手机号" rules={[{ required: true, message: '请输入新手机号' }]} validateStatus={formError.new ? 'error' : ''} help={formError.new}>
                <Input maxLength={20} />
              </Form.Item>
              <Form.Item name="confirm" label="再次输入新手机号" rules={[{ required: true, message: '请再次输入新手机号' }]} validateStatus={formError.confirm ? 'error' : ''} help={formError.confirm}>
                <Input maxLength={20} />
              </Form.Item>
            </>
          )}
          {editType === 'email' && (
            <>
              <Form.Item label="原邮箱">
                <Input value={info.email} disabled />
              </Form.Item>
              <Form.Item name="new" label="新邮箱" rules={[{ required: true, message: '请输入新邮箱' }]} validateStatus={formError.new ? 'error' : ''} help={formError.new}>
                <Input maxLength={40} />
              </Form.Item>
              <Form.Item name="confirm" label="再次输入新邮箱" rules={[{ required: true, message: '请再次输入新邮箱' }]} validateStatus={formError.confirm ? 'error' : ''} help={formError.confirm}>
                <Input maxLength={40} />
              </Form.Item>
            </>
          )}
          {editType === 'password' && (
            <>
              <Form.Item name="old" label="原密码" rules={[{ required: true, message: '请输入原密码' }]} validateStatus={formError.old ? 'error' : ''} help={formError.old}>
                <Input.Password maxLength={40} />
              </Form.Item>
              <Form.Item name="new" label="新密码" rules={[{ required: true, message: '请输入新密码' }]} validateStatus={formError.new ? 'error' : ''} help={formError.new}>
                <Input.Password maxLength={40} />
              </Form.Item>
              <Form.Item name="confirm" label="再次输入新密码" rules={[{ required: true, message: '请再次输入新密码' }]} validateStatus={formError.confirm ? 'error' : ''} help={formError.confirm}>
                <Input.Password maxLength={40} />
              </Form.Item>
            </>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default Profile;