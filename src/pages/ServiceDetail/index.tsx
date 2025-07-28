import { useParams } from '@umijs/max';
import {
  Button,
  Card,
  Descriptions,
  message,
  Space,
  Table,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import {
  getHealthHistoryApiV1ServicesServiceIdHealthHistoryGet,
  getServiceStatusApiV1ServicesServiceIdStatusGet,
  getServiceUptimeApiV1ServicesServiceIdUptimeGet,
  getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGet,
  switchServiceApiV1ServicesServiceIdSwitchPost,
  triggerHealthCheckApiV1ServicesServiceIdHealthCheckPost,
} from '@/services/ant-design-pro/service';

export default function ServiceDetail() {
  const { id } = useParams();
  const serviceId = Number(id);

  const [status, setStatus] = useState<API.ServiceStatusResponse>();
  const [uptime, setUptime] = useState<API.ServiceUptimeResponse>();
  const [healthLogs, setHealthLogs] = useState<API.HealthCheckLog[]>([]);
  const [switchLogs, setSwitchLogs] = useState<API.SwitchLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statusRes, uptimeRes, healthRes, switchRes] = await Promise.all([
        getServiceStatusApiV1ServicesServiceIdStatusGet({
          service_id: serviceId,
        }),
        getServiceUptimeApiV1ServicesServiceIdUptimeGet({
          service_id: serviceId,
        }),
        getHealthHistoryApiV1ServicesServiceIdHealthHistoryGet({
          service_id: serviceId,
        }),
        getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGet({
          service_id: serviceId,
        }),
      ]);
      setStatus(statusRes);
      setUptime(uptimeRes);
      setHealthLogs(healthRes.logs || []);
      setSwitchLogs(switchRes.logs || []);
    } catch (err) {
      message.error('获取服务详情失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [serviceId]);

  const handleHealthCheck = async () => {
    try {
      await triggerHealthCheckApiV1ServicesServiceIdHealthCheckPost({
        service_id: serviceId,
      });
      message.success('健康检查已触发');
      fetchData();
    } catch {
      message.error('触发健康检查失败');
    }
  };

  const handleSwitch = async () => {
    try {
      await switchServiceApiV1ServicesServiceIdSwitchPost({
        service_id: serviceId,
      });
      message.success('主备切换已触发');
      fetchData();
    } catch {
      message.error('主备切换失败');
    }
  };

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Card
        title="当前服务状态"
        loading={loading}
        extra={
          <Space>
            <Button onClick={handleHealthCheck}>触发健康检查</Button>
            <Button danger onClick={handleSwitch}>
              主备切换
            </Button>
          </Space>
        }
      >
        <Descriptions column={1} bordered>
          <Descriptions.Item label="主地址">
            {status?.primary_url}
          </Descriptions.Item>
          <Descriptions.Item label="备地址">
            {status?.backup_url}
          </Descriptions.Item>
          <Descriptions.Item label="当前活跃地址">
            {status?.active_url}
          </Descriptions.Item>
          <Descriptions.Item label="是否健康">
            {status?.is_healthy ? '是' : '否'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="运行时长">
        <Typography.Text>
          当前活跃地址已运行时间：{uptime?.uptime_seconds ?? 0} 秒
        </Typography.Text>
      </Card>

      <Card title="健康检查记录">
        <Table
          dataSource={healthLogs}
          rowKey={(r) => r.timestamp}
          pagination={{ pageSize: 5 }}
          columns={[
            {
              title: '时间',
              dataIndex: 'timestamp',
              render: (t) => dayjs(t).format('YYYY-MM-DD HH:mm:ss'),
            },
            { title: '地址', dataIndex: 'url' },
            {
              title: '结果',
              dataIndex: 'status',
              render: (status) => (status === 'success' ? '成功' : '失败'),
            },
          ]}
        />
      </Card>

      <Card title="主备切换历史">
        <Timeline
          items={switchLogs.map((log) => ({
            label: dayjs(log.timestamp).format('YYYY-MM-DD HH:mm:ss'),
            children: `切换到 ${log.new_active_url}`,
          }))}
        />
      </Card>
    </Space>
  );
}
