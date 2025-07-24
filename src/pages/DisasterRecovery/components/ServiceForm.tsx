import { ProForm, ProFormText, ProFormDigit, ProFormSwitch, ProFormTextArea } from '@ant-design/pro-form';

export default function ServiceForm({ initialValues = {}, onFinish, submitter }: any) {
  return (
    <ProForm
      layout="vertical"
      initialValues={initialValues}
      onFinish={onFinish}
      submitter={submitter}
    >
      <ProFormText name="name" label="服务名称" rules={[{ required: true }]} />
      <ProFormText name="primary_url" label="主服务地址" rules={[{ required: true }]} />
      <ProFormText name="backup_url" label="备服务地址" rules={[{ required: true }]} />
      <ProFormText name="health_check_endpoint" label="健康检查路径" />
      <ProFormDigit name="check_interval" label="检查间隔（秒）" min={1} />
      <ProFormDigit name="timeout" label="超时时间（秒）" min={1} />
      <ProFormDigit name="retry_count" label="重试次数" min={0} />
      <ProFormSwitch name="is_active" label="是否启用" />
      <ProFormTextArea name="description" label="服务描述" />
    </ProForm>
  );
}
