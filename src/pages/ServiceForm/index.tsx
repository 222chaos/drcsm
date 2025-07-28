import { useNavigate, useParams } from '@umijs/max';
import { Button, Card, Form, Input, InputNumber, message, Switch } from 'antd';
import { useEffect, useState } from 'react';
import {
  createServiceApiV1ServicesPost,
  getServiceApiV1ServicesServiceIdGet,
  updateServiceApiV1ServicesServiceIdPut,
} from '@/services/ant-design-pro/services';

export default function ServiceForm() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = !!params.id && params.id !== 'new';
  const serviceId = Number(params.id);

  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      getServiceApiV1ServicesServiceIdGet({ service_id: serviceId })
        .then((res) => {
          form.setFieldsValue(res);
        })
        .catch(() => {
          message.error('获取服务详情失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isEdit, serviceId]);

  const handleFinish = async (values: API.ServiceConfigCreate) => {
    try {
      if (isEdit) {
        await updateServiceApiV1ServicesServiceIdPut(
          { service_id: serviceId },
          values,
        );
        message.success('更新成功');
      } else {
        await createServiceApiV1ServicesPost(values);
        message.success('创建成功');
      }
      navigate('/services');
    } catch (err) {
      message.error(isEdit ? '更新失败' : '创建失败');
    }
  };

  return (
    <Card loading={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{
          is_active: true,
          check_interval: 30,
          timeout: 10,
          retry_count: 3,
        }}
      >
        <Form.Item
          name="name"
          label="服务名称"
          rules={[{ required: true, message: '请输入服务名称' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="primary_url"
          label="主服务地址"
          rules={[{ required: true, message: '请输入主服务地址' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="backup_url"
          label="备服务地址"
          rules={[{ required: true, message: '请输入备服务地址' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="health_check_endpoint"
          label="健康检查路径"
          rules={[{ required: true, message: '请输入健康检查路径' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="check_interval"
          label="检查间隔（秒）"
          rules={[{ required: true, message: '请输入检查间隔' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="timeout"
          label="超时时间（秒）"
          rules={[{ required: true, message: '请输入超时时间' }]}
        >
          <InputNumber min={1} />
        </Form.Item>
        <Form.Item
          name="retry_count"
          label="重试次数"
          rules={[{ required: true, message: '请输入重试次数' }]}
        >
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item name="is_active" label="是否启用" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEdit ? '保存修改' : '创建服务'}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}
