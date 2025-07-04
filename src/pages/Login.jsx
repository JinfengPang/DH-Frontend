import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, message, Modal } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import logo from '../assets/dh_logo.jpg';

function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isErrorModalVisible, setIsErrorModalVisible] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleSendCode = () => {
    form.validateFields(['username']).then(() => {
        message.success('验证码已发送');
        setCountdown(180);
    }).catch(() => {
        message.error('请输入用户名');
    })
  };

  const onFinish = (values) => {
    setLoading(true);
    // Mock authentication
    setTimeout(() => {
      if (values.username === 'test' && values.password === '1234' && values.code === '1234') {
        message.success('登录成功');
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/dashboard');
      } else {
        setIsErrorModalVisible(true);
      }
    }, 1000);
  };

  const handleErrorModalClose = () => {
    setIsErrorModalVisible(false);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
      <Card style={{ width: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <img src={logo} alt="logo" style={{ height: 80, marginRight: 16 }} />
          <h2 style={{ fontSize: 28, fontWeight: 'bold', margin: 0 }}>大恒国际</h2>
        </div>
        <Form form={form} onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码" autoComplete="new-password" />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Form.Item name="code" noStyle rules={[{ required: true, message: '请输入验证码!' }]}>
                    <Input prefix={<MailOutlined />} placeholder="验证码" style={{ width: 'calc(100% - 110px)' }}/>
                </Form.Item>
                <Button onClick={handleSendCode} disabled={countdown > 0}>
                    {countdown > 0 ? `${countdown}s` : '发送验证码'}
                </Button>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
      <Modal
        title="登录失败"
        open={isErrorModalVisible}
        onOk={handleErrorModalClose}
        onCancel={handleErrorModalClose}
        footer={[
          <Button key="ok" type="primary" onClick={handleErrorModalClose}>
            重试
          </Button>,
        ]}
      >
        <p>用户名、密码或验证码错误，请重试。</p>
      </Modal>
    </div>
  );
}

export default Login;
