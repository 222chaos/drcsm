import {
  ArrowLeftOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from '@umijs/max';
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Divider,
  Empty,
  message,
  Popconfirm,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import type { TableProps, TabsProps } from 'antd/es';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useEffect, useState } from 'react';
import {
  getHealthHistoryApiV1ServicesServiceIdHealthHistoryGet,
  getServiceApiV1ServicesServiceIdGet,
  getServiceStatusApiV1ServicesServiceIdStatusGet,
  getServiceUptimeApiV1ServicesServiceIdUptimeGet,
  getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGet,
  switchServiceApiV1ServicesServiceIdSwitchPost,
  triggerHealthCheckApiV1ServicesServiceIdHealthCheckPost,
} from '@/services/ant-design-pro/services';

// 扩展dayjs支持duration
dayjs.extend(duration);

// 定义标签页类型
type TabPaneKey = 'overview' | 'health' | 'switch' | 'uptime';

// 健康检查状态格式化
const formatHealthStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'success':
      return <Tag color="success">健康</Tag>;
    case 'failed':
      return <Tag color="error">异常</Tag>;
    default:
      return <Tag color="default">未知</Tag>;
  }
};

// 服务状态格式化
const formatServiceStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'primary':
      return <Badge status="success" text="主服务活跃" />;
    case 'backup':
      return <Badge status="processing" text="备服务活跃" />;
    case 'unknown':
      return <Badge status="warning" text="状态未知" />;
    default:
      return <Badge status="default" text={status} />;
  }
};

// 切换类型格式化
const formatSwitchType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'auto':
      return <Tag color="blue">自动切换</Tag>;
    case 'manual':
      return <Tag color="orange">手动切换</Tag>;
    default:
      return <Tag color="default">{type}</Tag>;
  }
};

// 格式化持续时间
const formatDuration = (seconds: number) => {
  if (!seconds || seconds < 0) return '0秒';
  const d = dayjs.duration(seconds, 'seconds');
  const days = d.days();
  const hours = d.hours();
  const minutes = d.minutes();
  const secs = d.seconds();

  const parts = [];
  if (days > 0) parts.push(`${days}天`);
  if (hours > 0) parts.push(`${hours}时`);
  if (minutes > 0) parts.push(`${minutes}分`);
  parts.push(`${secs}秒`);

  return parts.join('');
};

export default function ServiceDetail() {
  const navigate = useNavigate();
  const params = useParams<{ id?: string }>();
  const serviceId = Number(params.id);

  // 状态管理
  const [activeKey, setActiveKey] = useState<TabPaneKey>('overview');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [serviceDetail, setServiceDetail] =
    useState<API.ServiceConfigResponse | null>(null);
  const [serviceStatus, setServiceStatus] = useState<API.ServiceStatus | null>(
    null,
  );
  const [uptimeData, setUptimeData] = useState<any | null>(null);
  const [healthHistory, setHealthHistory] = useState<API.HealthCheckResponse[]>(
    [],
  );
  const [switchHistory, setSwitchHistory] = useState<API.SwitchLogResponse[]>(
    [],
  );

  // 获取服务详情
  const fetchServiceDetail = async () => {
    try {
      const response = await getServiceApiV1ServicesServiceIdGet({
        service_id: serviceId,
      });
      setServiceDetail(response);
      return response;
    } catch (error) {
      console.error('获取服务详情失败:', error);
      message.error('获取服务详情失败');
      return null;
    }
  };

  // 获取服务状态
  const fetchServiceStatus = async () => {
    try {
      const response = await getServiceStatusApiV1ServicesServiceIdStatusGet({
        service_id: serviceId,
      });
      setServiceStatus(response);
      return response;
    } catch (error) {
      console.error('获取服务状态失败:', error);
      message.error('获取服务状态失败');
      return null;
    }
  };

  // 获取服务可用性
  const fetchServiceUptime = async () => {
    try {
      const response = await getServiceUptimeApiV1ServicesServiceIdUptimeGet({
        service_id: serviceId,
      });
      setUptimeData(response);
      return response;
    } catch (error) {
      console.error('获取服务可用性失败:', error);
      message.error('获取服务可用性失败');
      return null;
    }
  };

  // 获取健康检查历史
  const fetchHealthHistory = async () => {
    try {
      const response =
        await getHealthHistoryApiV1ServicesServiceIdHealthHistoryGet({
          service_id: serviceId,
          limit: 10,
          hours: 24,
        });
      setHealthHistory(response);
      return response;
    } catch (error) {
      console.error('获取健康检查历史失败:', error);
      message.error('获取健康检查历史失败');
      return [];
    }
  };

  // 获取切换历史
  const fetchSwitchHistory = async () => {
    try {
      const response =
        await getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGet({
          service_id: serviceId,
          limit: 10,
        });
      setSwitchHistory(response);
      return response;
    } catch (error) {
      console.error('获取切换历史失败:', error);
      message.error('获取切换历史失败');
      return [];
    }
  };

  // 刷新所有数据
  const refreshAllData = async () => {
    setLoading(true);
    try {
      // 并行获取数据
      await Promise.all([
        fetchServiceDetail(),
        fetchServiceStatus(),
        fetchHealthHistory(),
        fetchSwitchHistory(),
      ]);
      // 串行获取uptime数据（依赖于status数据）
      await fetchServiceUptime();
    } catch (error) {
      console.error('数据刷新失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 触发健康检查
  const handleTriggerHealthCheck = async () => {
    setActionLoading(true);
    try {
      await triggerHealthCheckApiV1ServicesServiceIdHealthCheckPost({
        service_id: serviceId,
        force: true,
      });
      message.success('健康检查已触发');
      // 刷新健康检查历史
      await fetchHealthHistory();
      // 刷新服务状态
      await fetchServiceStatus();
    } catch (error) {
      console.error('触发健康检查失败:', error);
      message.error('触发健康检查失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 手动切换服务
  const handleSwitchService = async () => {
    if (!serviceStatus) return;

    setActionLoading(true);
    try {
      // 确定目标状态
      const currentStatus = serviceStatus.current_status;
      const targetStatus = currentStatus === 'primary' ? 'backup' : 'primary';

      // 调用切换API
      const response = await switchServiceApiV1ServicesServiceIdSwitchPost(
        { service_id: serviceId },
        {
          service_id: serviceId,
          target_status: targetStatus,
          reason: '手动切换',
          operator: 'admin',
        },
      );

      if (response.success) {
        message.success('服务切换成功');
        // 刷新所有数据
        await refreshAllData();
      } else {
        message.error(`切换失败: ${response.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('服务切换失败:', error);
      message.error('服务切换失败');
    } finally {
      setActionLoading(false);
    }
  };

  // 初始化加载数据
  useEffect(() => {
    if (serviceId) {
      refreshAllData();
    } else {
      navigate('/services');
      message.error('服务ID无效');
    }
  }, [serviceId]);

  // 标签页切换处理
  const handleTabChange: TabsProps['onChange'] = (key) => {
    setActiveKey(key as TabPaneKey);
    // 如果切换到某个标签页且数据未加载，则加载数据
    if (key === 'uptime' && !uptimeData) {
      fetchServiceUptime();
    }
  };

  // 返回服务列表
  const handleBack = () => {
    navigate('/services');
  };

  // 编辑服务
  const handleEdit = () => {
    navigate(`/services/${serviceId}/edit`);
  };

  // 健康检查历史表格列定义
  const healthHistoryColumns: TableProps<API.HealthCheckResponse>['columns'] = [
    {
      title: '检查时间',
      dataIndex: 'checked_at',
      key: 'checked_at',
      render: (time) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
      sorter: (a, b) =>
        dayjs(a.checked_at).valueOf() - dayjs(b.checked_at).valueOf(),
      defaultSortOrder: 'descend',
    },
    {
      title: '检查地址',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <Tooltip title={url} placement="top">
          <Typography.Text ellipsis style={{ maxWidth: 250 }}>
            {url}
          </Typography.Text>
        </Tooltip>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status) => formatHealthStatus(status),
      filters: [
        { text: '健康', value: 'success' },
        { text: '异常', value: 'failed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: '响应时间',
      dataIndex: 'response_time',
      key: 'response_time',
      render: (time) => (time !== null ? `${time}ms` : '-'),
      sorter: (a, b) => (a.response_time || 0) - (b.response_time || 0),
    },
    {
      title: 'HTTP状态码',
      dataIndex: 'http_status',
      key: 'http_status',
      render: (status) => status || '-',
    },
    {
      title: '错误信息',
      dataIndex: 'error_message',
      key: 'error_message',
      render: (msg) => msg || '-',
    },
  ];

  return (
    <div className="service-detail-container">
      <div
        className="page-header"
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
            返回列表
          </Button>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {serviceDetail?.name || '服务详情'}
            {serviceDetail?.is_active && (
              <Tag color="success" style={{ marginLeft: 8 }}>
                已启用
              </Tag>
            )}
            {!serviceDetail?.is_active && (
              <Tag color="error" style={{ marginLeft: 8 }}>
                已停用
              </Tag>
            )}
          </Typography.Title>
        </Space>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refreshAllData}
            loading={loading}
          >
            刷新
          </Button>
          <Button type="primary" onClick={handleEdit}>
            编辑
          </Button>
        </Space>
      </div>

      <Spin spinning={loading} tip="加载中...">
        <Tabs
          activeKey={activeKey}
          onChange={handleTabChange}
          animated={{ inkBar: true, tabPane: false }}
        >
          {/* 概览标签页 */}
          <Tabs.TabPane tab="服务概览" key="overview">
            <Card bordered={true} style={{ marginBottom: 16 }}>
              <Descriptions
                title="基本信息"
                bordered
                column={1}
                layout="vertical"
              >
                <Descriptions.Item label="服务ID">
                  {serviceId}
                </Descriptions.Item>
                <Descriptions.Item label="服务名称">
                  {serviceDetail?.name || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="服务描述">
                  {serviceDetail?.description || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">
                  {serviceDetail
                    ? dayjs(serviceDetail.created_at).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="最后更新时间">
                  {serviceDetail
                    ? dayjs(serviceDetail.updated_at).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )
                    : '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card bordered={true} style={{ marginBottom: 16 }}>
              <Descriptions
                title="服务配置"
                bordered
                column={1}
                layout="vertical"
              >
                <Descriptions.Item label="主服务地址">
                  {serviceDetail?.primary_url || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="备服务地址">
                  {serviceDetail?.backup_url || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="健康检查路径">
                  {serviceDetail?.health_check_endpoint || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="检查间隔">
                  {serviceDetail?.check_interval
                    ? `${serviceDetail.check_interval}秒`
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="超时时间">
                  {serviceDetail?.timeout ? `${serviceDetail.timeout}秒` : '-'}
                </Descriptions.Item>
                <Descriptions.Item label="重试次数">
                  {serviceDetail?.retry_count || '-'}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card bordered={true}>
              <Typography.Title level={5}>当前状态</Typography.Title>
              {serviceStatus ? (
                <Space direction="vertical" size="large">
                  <Space size="middle">
                    <Statistic
                      title="当前活跃地址"
                      valueStyle={{ fontSize: 16 }}
                      prefix={formatServiceStatus(serviceStatus.current_status)}
                    />
                    <Statistic
                      title="健康状态"
                      valueStyle={{ fontSize: 16 }}
                      prefix={formatHealthStatus(serviceStatus.health_status)}
                    />
                  </Space>
                  <Space size="middle">
                    <Statistic
                      title="最后检查时间"
                      valueStyle={{ fontSize: 16 }}
                      value={
                        serviceStatus.last_check_time
                          ? dayjs(serviceStatus.last_check_time).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )
                          : '-'
                      }
                    />
                    <Statistic
                      title="最后切换时间"
                      valueStyle={{ fontSize: 16 }}
                      value={
                        serviceStatus.last_switch_time
                          ? dayjs(serviceStatus.last_switch_time).format(
                              'YYYY-MM-DD HH:mm:ss',
                            )
                          : '-'
                      }
                    />
                  </Space>
                  <Space size="middle">
                    <Statistic
                      title="切换次数"
                      valueStyle={{ fontSize: 16 }}
                      value={serviceStatus.total_switches}
                    />
                    <Statistic
                      title="可用性"
                      valueStyle={{ fontSize: 16 }}
                      value={
                        serviceStatus.uptime_percentage
                          ? `${serviceStatus.uptime_percentage}%`
                          : '-'
                      }
                    />
                  </Space>
                  <Divider orientation="left">操作</Divider>
                  <Space size="middle">
                    <Button
                      type="primary"
                      icon={<SyncOutlined />}
                      onClick={handleTriggerHealthCheck}
                      loading={actionLoading}
                    >
                      触发健康检查
                    </Button>
                    <Popconfirm
                      title="确定要手动切换服务吗？"
                      description="此操作将切换当前活跃的服务实例，可能会影响业务可用性。"
                      okText="确认"
                      cancelText="取消"
                      onConfirm={handleSwitchService}
                    >
                      <Button
                        danger
                        icon={<ReloadOutlined />}
                        loading={actionLoading}
                      >
                        手动切换服务
                      </Button>
                    </Popconfirm>
                  </Space>
                </Space>
              ) : (
                <Empty description="无法获取服务状态数据" />
              )}
            </Card>
          </Tabs.TabPane>

          {/* 健康检查历史标签页 */}
          <Tabs.TabPane tab="健康检查历史" key="health">
            <Card bordered={true}>
              <Table
                dataSource={healthHistory}
                columns={healthHistoryColumns}
                rowKey="id"
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: '暂无健康检查历史数据' }}
              />
            </Card>
          </Tabs.TabPane>

          {/* 切换历史标签页 */}
          <Tabs.TabPane tab="切换历史" key="switch">
            <Card bordered={true}>
              {switchHistory.length > 0 ? (
                <Timeline mode="left">
                  {switchHistory.map((log) => (
                    <Timeline.Item
                      key={log.id}
                      label={dayjs(log.created_at).format(
                        'YYYY-MM-DD HH:mm:ss',
                      )}
                      dot={formatSwitchType(log.switch_type)}
                    >
                      <Typography.Paragraph strong>
                        从 {log.from_status} 切换到 {log.to_status}
                      </Typography.Paragraph>
                      <Typography.Paragraph>
                        原因: {log.reason || '未记录'}
                      </Typography.Paragraph>
                      <Typography.Paragraph>
                        操作人: {log.operator || '系统'}
                      </Typography.Paragraph>
                      {log.error_message && (
                        <Typography.Paragraph type="danger">
                          错误信息: {log.error_message}
                        </Typography.Paragraph>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              ) : (
                <Empty description="暂无切换历史数据" />
              )}
            </Card>
          </Tabs.TabPane>

          {/* 可用性统计标签页 */}
          <Tabs.TabPane tab="可用性统计" key="uptime">
            <Card bordered={true}>
              {uptimeData ? (
                <Space direction="vertical" size="large">
                  <Statistic
                    title="7天内可用性"
                    value={uptimeData.uptime_percentage}
                    precision={2}
                    suffix="%"
                  />
                  <Statistic
                    title="总运行时间"
                    value={formatDuration(uptimeData.total_uptime_seconds)}
                  />
                  <Statistic
                    title="总宕机时间"
                    value={formatDuration(uptimeData.total_downtime_seconds)}
                  />
                  <Statistic
                    title="平均恢复时间"
                    value={
                      uptimeData.avg_recovery_time
                        ? `${uptimeData.avg_recovery_time}秒`
                        : '-'
                    }
                  />
                </Space>
              ) : (
                <Empty description="暂无可用性统计数据" />
              )}
            </Card>
          </Tabs.TabPane>
        </Tabs>
      </Spin>
    </div>
  );
}
