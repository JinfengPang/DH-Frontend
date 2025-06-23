import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Modal, Form, Input, message } from 'antd';
import { MinusCircleFilled } from '@ant-design/icons';

const DEFAULT_STEP_COUNT = 3;
const initialData = [
  {
    key: '1',
    rateNo: 'R001',
    rateName: '费率6090120',
    steps: [
      { day: 30, price: 10 },
      { day: 60, price: 8 },
      { day: 90, price: 6 },
    ],
  },
];

function CostRate() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('cost_rates');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form] = Form.useForm();
  const [deleteKey, setDeleteKey] = useState(null);
  const [stepsCount, setStepsCount] = useState(DEFAULT_STEP_COUNT);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRecord, setDetailRecord] = useState(null);

  useEffect(() => {
    localStorage.setItem('cost_rates', JSON.stringify(data));
  }, [data]);

  // 打开弹窗时初始化表单
  useEffect(() => {
    if (modalOpen && editing) {
      // 设置阶梯数量为编辑数据的阶梯数
      setStepsCount(editing.steps.length);
      
      // 准备表单初始值
      const initialValues = {
        rateNo: editing.rateNo,
        rateName: editing.rateName,
      };
      
      // 为每个阶梯添加字段
      editing.steps.forEach((step, idx) => {
        initialValues[`day${idx+1}`] = step.day;
        initialValues[`price${idx+1}`] = step.price;
      });
      
      // 设置表单值
      form.setFieldsValue(initialValues);
    } else if (modalOpen) {
      // 新增时重置表单
      form.resetFields();
      setStepsCount(DEFAULT_STEP_COUNT);
    }
  }, [modalOpen, editing, form]);

  const columns = [
    { title: '费率编号', dataIndex: 'rateNo', key: 'rateNo' },
    { title: '费率名称', dataIndex: 'rateName', key: 'rateName' },
    ...Array.from({ length: 3 }).flatMap((_, idx) => [
      { title: `阶梯天数${idx + 1}(小于等于)`, key: `day${idx + 1}`, render: (_, r) => r.steps[idx]?.day ?? '' },
      { title: `阶梯单价${idx + 1}(元/吨/天)`, key: `price${idx + 1}`, render: (_, r) => r.steps[idx]?.price ?? '' },
    ]),
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button size="small" type="link" onClick={() => onEdit(record)}>修改</Button>
          <Button size="small" type="link" danger onClick={() => setDeleteKey(record.key)}>删除</Button>
          <Button size="small" type="link" onClick={() => { setDetailRecord(record); setDetailOpen(true); }}>详情</Button>
        </Space>
      ),
    },
  ];

  const onAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const onEdit = (record) => {
    setEditing(record);
    setModalOpen(true);
  };

  // 校验阶梯是否严格递增
  const validateSteps = (steps) => {
    for (let i = 1; i < steps.length; i++) {
      if (steps[i].day <= steps[i - 1].day) {
        form.setFields([
          {
            name: `day${i+1}`,
            errors: ['阶梯天数必须严格递增'],
          }
        ]);
        return false;
      }
    }
    return true;
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      
      // 组装阶梯数据
      const steps = [];
      for (let i = 1; i <= stepsCount; i++) {
        const day = values[`day${i}`];
        const price = values[`price${i}`];
        
        // 只添加有值的阶梯
        if (day !== undefined && day !== '' && price !== undefined && price !== '') {
          steps.push({
            day: Number(day),
            price: Number(price)
          });
        }
      }
      
      // 验证必填项
      if (!values.rateNo || !values.rateName || steps.length === 0) {
        throw new Error('请填写费率编号、费率名称和至少一个阶梯');
      }
      
      // 验证阶梯天数是否严格递增
      if (!validateSteps(steps)) return;

      if (editing) {
        // 更新数据
        const newData = data.map(item => 
          item.key === editing.key ? { ...item, ...values, steps } : item
        );
        setData(newData);
        message.success('修改成功');
      } else {
        // 新增数据
        const newItem = {
          key: Date.now().toString(),
          rateNo: values.rateNo,
          rateName: values.rateName,
          steps
        };
        setData([...data, newItem]);
        message.success('新增成功');
      }
      
      setModalOpen(false);
    } catch (error) {
      message.error(error.message || '请填写完整且正确的数据');
    }
  };

  const handleDelete = () => {
    const newData = data.filter(item => item.key !== deleteKey);
    setData(newData);
    setDeleteKey(null);
    message.success('删除成功');
  };

  // 删除阶梯
  const removeStep = (idx) => {
    if (stepsCount <= 1) return;
    
    // 更新阶梯数量
    setStepsCount(count => count - 1);
    
    // 从表单中移除该阶梯的值
    form.setFieldsValue({
      [`day${idx+1}`]: undefined,
      [`price${idx+1}`]: undefined
    });
  };

  // 增加阶梯
  const addStep = () => {
    setStepsCount(count => count + 1);
  };

  // 渲染阶梯表单项
  const renderStepItems = () => {
    return Array.from({ length: stepsCount }).map((_, idx) => (
      <Space key={idx} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
        <Form.Item
          name={`day${idx+1}`}
          label={`阶梯天数${idx+1}(小于等于)`}
          rules={[
            { 
              required: idx === 0, 
              message: '请输入天数' 
            },
            { 
              validator: (_, value) => {
                if (value && isNaN(Number(value))) {
                  return Promise.reject('请输入有效数字');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input type="number" min={1} placeholder="天数" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name={`price${idx+1}`}
          label={`阶梯单价${idx+1}(元/吨/天)`}
          rules={[
            { 
              required: idx === 0, 
              message: '请输入单价' 
            },
            { 
              validator: (_, value) => {
                if (value && (isNaN(Number(value)) || Number(value) < 0)) {
                  return Promise.reject('请输入有效正数');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input type="number" min={0} step={0.01} placeholder="单价" style={{ width: 140 }} />
        </Form.Item>
        {idx > 0 && (
          <span
            onClick={() => removeStep(idx)}
            style={{
              marginLeft: 8,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background 0.2s',
              width: 24,
              height: 24,
            }}
            title="删除该阶梯"
          >
            <MinusCircleFilled style={{ fontSize: 22, color: '#ff4d4f' }} />
          </span>
        )}
      </Space>
    ));
  };

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>费率规则管理</span>
        <Button type="primary" style={{ marginLeft: 'auto', borderRadius: 20 }} onClick={onAdd}>新增</Button>
      </div>
      <Card bordered style={{ borderRadius: 12 }}>
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            scroll={{ x: 1200 }}
            bordered
            rowKey="key"
          />
        </div>
      </Card>
      <Modal
        open={modalOpen}
        title={editing ? '修改费率规则' : '新增费率规则'}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        okText="确认"
        cancelText="取消"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item 
            name="rateNo" 
            label="费率编号" 
            rules={[{ required: true, message: '请输入费率编号' }]}
          >
            <Input disabled={!!editing} />
          </Form.Item>
          <Form.Item 
            name="rateName" 
            label="费率名称" 
            rules={[{ required: true, message: '请输入费率名称' }]}
          >
            <Input />
          </Form.Item>
          {renderStepItems()}
          <Button 
            type="dashed" 
            onClick={addStep} 
            style={{ width: 260, marginBottom: 8 }}
          >
            继续增加阶梯
          </Button>
        </Form>
      </Modal>
      <Modal
        open={!!deleteKey}
        title="确认删除"
        onOk={handleDelete}
        onCancel={() => setDeleteKey(null)}
        okText="确认"
        cancelText="取消"
        maskClosable={false}
      >
        <div>确定要删除这条数据吗？</div>
      </Modal>
      <Modal
        open={detailOpen}
        title="详情"
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={500}
      >
        {detailRecord && (
          <div>
            <div style={{ marginBottom: 8 }}><b>费率编号：</b>{detailRecord.rateNo}</div>
            <div style={{ marginBottom: 8 }}><b>费率名称：</b>{detailRecord.rateName}</div>
            {detailRecord.steps.map((s, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                <b>阶梯{idx + 1}：</b>天数≤{s.day}，单价：{s.price}元/吨/天
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default CostRate;