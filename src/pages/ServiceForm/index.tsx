import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Space,
  Switch,
  Tooltip,
  Typography,
} from 'antd';
import { useEffect, useState } from 'react';
import {
  createServiceApiV1ServicesPost,
  getServiceApiV1ServicesServiceIdGet,
  updateServiceApiV1ServicesServiceIdPut,
} from '@/services/ant-design-pro/services';

// 定义表单值类型，继承API接口类型确保类型一致性
type ServiceFormValues = Omit<API.ServiceConfigCreate, 'description'> & {
  description?: string;
};

export default function ServiceForm() {
  const [form] = Form.useForm<ServiceFormValues>();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id && id !== 'new';
  const serviceId = isEdit ? Number(id) : undefined;

  // 从API加载服务详情（编辑模式）
  const fetchServiceDetail = async () => {
    if (!serviceId) return;

    setLoading(true);
    try {
      const response = await getServiceApiV1ServicesServiceIdGet({
        service_id: serviceId,
      });
      if (response) {
        // 将API响应数据映射到表单
        form.setFieldsValue({
          name: response.name,
          primary_url: response.primary_url,
          backup_url: response.backup_url,
          health_check_endpoint: response.health_check_endpoint,
          check_interval: response.check_interval,
          timeout: response.timeout,
          retry_count: response.retry_count,
          is_active: response.is_active,
          description: response.description || undefined,
        });
      }
    } catch (error) {
      console.error('获取服务详情失败:', error);
      message.error('加载服务详情失败，请刷新页面重试');
      setFormError('无法加载服务数据，请返回列表页');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据（编辑模式）
  useEffect(() => {
    if (isEdit) {
      fetchServiceDetail();
    } else {
      // 创建模式下设置默认值
      form.setFieldsValue({
        check_interval: 30,
        timeout: 10,
        retry_count: 3,
        is_active: true,
        health_check_endpoint: '/health',
      });
      setLoading(false);
    }
  }, [isEdit, form]);

  // 表单提交处理
  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      const values = await form.validateFields();

      // 准备提交数据
      const submitData: API.ServiceConfigCreate | API.ServiceConfigUpdate = {
        ...values,
        // 确保空字符串转换为null（符合API要求）
        description: values.description || null,
      };

      if (isEdit && serviceId) {
        // 更新现有服务
        await updateServiceApiV1ServicesServiceIdPut(
          { service_id: serviceId },
          submitData as API.ServiceConfigUpdate,
        );
        message.success('服务更新成功');
      } else {
        // 创建新服务
        await createServiceApiV1ServicesPost(
          submitData as API.ServiceConfigCreate,
        );
        message.success('服务创建成功');
      }

      // 返回服务列表页
      navigate('/services');
    } catch (error) {
      console.error('表单提交失败:', error);
      // 表单验证错误不需要额外提示，Ant Design会自动显示
      if (
        !(error instanceof Error && error.message.includes('Validation failed'))
      ) {
        message.error(isEdit ? '更新服务失败' : '创建服务失败');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // 取消按钮处理
  const handleCancel = () => {
    navigate('/services');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card
        title={
          <Space size="middle" align="center">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleCancel}
              type="text"
            >
              返回列表
            </Button>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {isEdit ? `编辑服务 #${serviceId}` : '创建新服务'}
            </Typography.Title>
          </Space>
        }
        bordered
        loading={loading}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        {formError && (
          <Alert
            message="加载错误"
            description={formError}
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          validateMessages={{
            required: '${label}不能为空',
            types: {
              string: '${label}必须是字符串',
              number: '${label}必须是数字',
            },
          }}
        >
          <Typography.Text
            type="secondary"
            style={{ marginBottom: '16px', display: 'block' }}
          >
            请填写服务配置信息，带 <span style={{ color: 'red' }}>*</span>{' '}
            的为必填项
          </Typography.Text>

          {/* 基本信息组 */}
          <Card
            title="基本信息"
            bordered={false}
            style={{ marginBottom: '16px' }}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item<ServiceFormValues>
                name="name"
                label={
                  <Space size="small">
                    <span>服务名称</span>
                    <Tooltip title="用于标识服务的唯一名称，建议使用有意义的名称">
                      <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </Space>
                }
                rules={[
                  { required: true },
                  { min: 2, message: '服务名称至少2个字符' },
                  { max: 50, message: '服务名称最多50个字符' },
                  {
                    pattern: /^[a-zA-Z0-9_-]+$/,
                    message: '服务名称只能包含字母、数字、下划线和连字符',
                  },
                ]}
              >
                <Input
                  placeholder="请输入服务名称（例如：user-service）"
                  maxLength={50}
                />
              </Form.Item>
            </Space.Compact>

            <Form.Item<ServiceFormValues>
              name="description"
              label={
                <Space size="small">
                  <span>服务描述</span>
                  <Tooltip title="对服务功能的简要描述，便于其他用户理解">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              }
              rules={[{ max: 200, message: '描述最多200个字符' }]}
            >
              <Input.TextArea
                rows={3}
                placeholder="请输入服务描述（可选）"
                maxLength={200}
              />
            </Form.Item>

            <Form.Item<ServiceFormValues>
              name="is_active"
              label={
                <Space size="small">
                  <span>是否启用</span>
                  <Tooltip title="启用后系统将开始监控该服务">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                </Space>
              }
              valuePropName="checked"
            >
              <Switch
                checkedChildren="启用"
                unCheckedChildren="禁用"
                defaultChecked
              />
            </Form.Item>
          </Card>

          {/* 服务地址组 */}
          <Card
            title="服务地址配置"
            bordered={false}
            style={{ marginBottom: '16px' }}
          >
            <Typography.Text
              type="secondary"
              style={{ marginBottom: '16px', display: 'block' }}
            >
              配置服务的主备地址，系统将根据健康检查结果自动切换
            </Typography.Text>

            <Form.Item<ServiceFormValues>
              name="primary_url"
              label={
                <Space size="small">
                  <span>主服务URL</span>
                  <Tooltip title="主服务的完整URL地址（包含协议和端口）">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                  <span style={{ color: 'red' }}>*</span>
                </Space>
              }
              rules={[
                { required: true },
                { type: 'url', message: '请输入有效的URL格式' },
                { max: 200, message: 'URL最多200个字符' },
              ]}
            >
              <Input
                placeholder="请输入主服务URL（例如：https://api.example.com:8080）"
                maxLength={200}
              />
            </Form.Item>

            <Form.Item<ServiceFormValues>
              name="backup_url"
              label={
                <Space size="small">
                  <span>备服务URL</span>
                  <Tooltip title="备份服务的完整URL地址，主服务异常时将自动切换至此">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                  <span style={{ color: 'red' }}>*</span>
                </Space>
              }
              rules={[
                { required: true },
                { type: 'url', message: '请输入有效的URL格式' },
                { max: 200, message: 'URL最多200个字符' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const primaryUrl = getFieldValue('primary_url');
                    if (value && primaryUrl && value === primaryUrl) {
                      return Promise.reject(
                        new Error('备服务URL不能与主服务URL相同'),
                      );
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input
                placeholder="请输入备服务URL（例如：https://backup.example.com:8080）"
                maxLength={200}
              />
            </Form.Item>
          </Card>

          {/* 健康检查配置组 */}
          <Card title="健康检查配置" bordered={false}>
            <Alert
              message="健康检查说明"
              description="系统将定期访问健康检查端点来判断服务状态，建议使用专用的健康检查接口而非业务接口"
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />

            <Form.Item<ServiceFormValues>
              name="health_check_endpoint"
              label={
                <Space size="small">
                  <span>健康检查路径</span>
                  <Tooltip title="服务健康检查接口的路径部分，系统将自动拼接至服务URL">
                    <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                  </Tooltip>
                  <span style={{ color: 'red' }}>*</span>
                </Space>
              }
              rules={[
                { required: true },
                {
                  pattern: /^\/[\w\-/]*$/,
                  message:
                    '路径必须以/开头，只能包含字母、数字、下划线、连字符和/',
                },
                { max: 100, message: '路径最多100个字符' },
              ]}
            >
              <Input
                placeholder="请输入健康检查路径（例如：/health）"
                maxLength={100}
              />
            </Form.Item>

            <Divider orientation="left" plain>
              检查参数
            </Divider>

            <Space.Compact style={{ width: '100%' }}>
              <Form.Item<ServiceFormValues>
                name="check_interval"
                label={
                  <Space size="small">
                    <span>检查间隔（秒）</span>
                    <Tooltip title="系统定期检查服务健康状态的时间间隔">
                      <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </Space>
                }
                rules={[
                  { required: true },
                  { type: 'number', min: 10, message: '检查间隔不能小于10秒' },
                  {
                    type: 'number',
                    max: 300,
                    message: '检查间隔不能大于300秒',
                  },
                ]}
              >
                <InputNumber<number>
                  min={10}
                  max={300}
                  formatter={(value) => `${value} 秒`}
                  parser={(value) => Number(value?.replace(' 秒', '') || 0)}
                />
              </Form.Item>

              <Form.Item<ServiceFormValues>
                name="timeout"
                label={
                  <Space size="small">
                    <span>超时时间（秒）</span>
                    <Tooltip title="等待健康检查响应的最大时间，超过此时间视为服务异常">
                      <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </Space>
                }
                rules={[
                  { required: true },
                  { type: 'number', min: 1, message: '超时时间不能小于1秒' },
                  { type: 'number', max: 30, message: '超时时间不能大于30秒' },
                ]}
              >
                <InputNumber<number>
                  min={1}
                  max={30}
                  formatter={(value) => `${value} 秒`}
                  parser={(value) => Number(value?.replace(' 秒', '') || 0)}
                />
              </Form.Item>

              <Form.Item<ServiceFormValues>
                name="retry_count"
                label={
                  <Space size="small">
                    <span>重试次数</span>
                    <Tooltip title="健康检查失败后重试的次数，达到次数后才判定为服务异常">
                      <QuestionCircleOutlined style={{ color: '#1890ff' }} />
                    </Tooltip>
                    <span style={{ color: 'red' }}>*</span>
                  </Space>
                }
                rules={[
                  { required: true },
                  { type: 'number', min: 0, message: '重试次数不能小于0' },
                  { type: 'number', max: 5, message: '重试次数不能大于5次' },
                ]}
              >
                <InputNumber<number>
                  min={0}
                  max={5}
                  formatter={(value) => `${value} 次`}
                  parser={(value) => Number(value?.replace(' 次', '') || 0)}
                />
              </Form.Item>
            </Space.Compact>
          </Card>

          {/* 操作按钮区域 */}
          <div style={{ marginTop: '24px', textAlign: 'right' }}>
            <Space size="middle">
              <Button onClick={handleCancel}>取消</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={submitLoading}
              >
                {isEdit ? '保存修改' : '创建服务'}
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
}
