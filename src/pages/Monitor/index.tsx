import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Menu,
  message,
  Progress,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import {
  getServiceStatusApiV1ServicesServiceIdStatusGet,
  listServicesApiV1ServicesGet,
} from '@/services/ant-design-pro/services';

// 定义监控页面状态类型
interface MonitorState {
  services: API.ServiceConfigResponse[];
  statusMap: Record<number, API.ServiceStatus>;
  loading: boolean;
  refreshInterval: NodeJS.Timeout | null;
  filterStatus: string;
  autoRefresh: boolean;
}

// 健康状态样式映射
const healthStatusStyles = {
  healthy: { color: '#52c41a', text: '健康' },
  unhealthy: { color: '#f5222d', text: '异常' },
  checking: { color: '#faad14', text: '检查中' },
  unknown: { color: '#cccccc', text: '未知' },
};

// 当前状态样式映射
const currentStatusStyles = {
  primary: { color: '#1890ff', text: '主服务' },
  backup: { color: '#fa8c16', text: '备服务' },
  unknown: { color: '#cccccc', text: '未知' },
};

const Monitor: React.FC = () => {
  const [state, setState] = useState<MonitorState>({
    services: [],
    statusMap: {},
    loading: true,
    refreshInterval: null,
    filterStatus: 'all',
    autoRefresh: true,
  });

  // 获取服务列表
  const fetchServices = useCallback(async () => {
    try {
      const response = await listServicesApiV1ServicesGet({ limit: 100 });
      return response || [];
    } catch (error) {
      console.error('获取服务列表失败:', error);
      message.error('获取服务列表失败，请重试');
      return [];
    }
  }, []);

  // 获取单个服务状态
  const fetchServiceStatus = useCallback(async (serviceId: number) => {
    try {
      return await getServiceStatusApiV1ServicesServiceIdStatusGet({
        service_id: serviceId,
      });
    } catch (error) {
      console.error(`获取服务 ${serviceId} 状态失败:`, error);
      return null;
    }
  }, []);

  // 加载所有服务及其状态
  const loadAllServicesAndStatuses = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const services = await fetchServices();
      setState((prev) => ({ ...prev, services }));

      const statusResults: Record<number, API.ServiceStatus> = {};
      // 并行获取所有服务状态
      await Promise.all(
        services.map(async (service) => {
          const status = await fetchServiceStatus(service.id);
          if (status) {
            statusResults[service.id] = status;
          }
        }),
      );

      setState((prev) => ({ ...prev, statusMap: statusResults }));
    } catch (error) {
      console.error('加载服务监控数据失败:', error);
      message.error('加载监控数据失败');
    } finally {
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [fetchServices, fetchServiceStatus]);

  // 手动刷新数据
  const handleRefresh = useCallback(() => {
    loadAllServicesAndStatuses();
  }, [loadAllServicesAndStatuses]);

  // 切换自动刷新
  const toggleAutoRefresh = useCallback(() => {
    setState((prev) => {
      // 清除现有定时器
      if (prev.refreshInterval) {
        clearInterval(prev.refreshInterval);
      }

      const autoRefresh = !prev.autoRefresh;
      let refreshInterval: NodeJS.Timeout | null = null;

      // 如果开启自动刷新，设置新定时器
      if (autoRefresh) {
        refreshInterval = setInterval(loadAllServicesAndStatuses, 30000); // 每30秒刷新一次
      }

      return { ...prev, autoRefresh, refreshInterval };
    });
  }, [loadAllServicesAndStatuses]);

  // 筛选状态变更
  const handleStatusFilter = useCallback((status: string) => {
    setState((prev) => ({ ...prev, filterStatus: status }));
  }, []);

  // 组件挂载时加载数据并设置自动刷新
  useEffect(() => {
    loadAllServicesAndStatuses();

    // 初始设置自动刷新
    const refreshInterval = setInterval(loadAllServicesAndStatuses, 30000);

    // 组件卸载时清除定时器
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [loadAllServicesAndStatuses]);

  // 根据筛选条件过滤服务
  const filteredServices = state.services.filter((service) => {
    if (state.filterStatus === 'all') return true;
    if (state.filterStatus === 'active') return service.is_active;
    if (state.filterStatus === 'inactive') return !service.is_active;

    const status = state.statusMap[service.id];
    if (!status) return false;

    if (state.filterStatus === 'healthy')
      return status.health_status === 'healthy';
    if (state.filterStatus === 'unhealthy')
      return status.health_status === 'unhealthy';
    return true;
  });

  // 计算服务健康状态统计
  const statusSummary = filteredServices.reduce(
    (acc, service) => {
      const status = state.statusMap[service.id];
      if (!status) return acc;

      acc.total += 1;
      if (status.health_status === 'healthy') acc.healthy += 1;
      else if (status.health_status === 'unhealthy') acc.unhealthy += 1;
      else if (status.health_status === 'checking') acc.checking += 1;
      else acc.unknown += 1;

      return acc;
    },
    { total: 0, healthy: 0, unhealthy: 0, checking: 0, unknown: 0 },
  );

  // 健康率计算
  const healthRate =
    statusSummary.total > 0
      ? Math.round((statusSummary.healthy / statusSummary.total) * 100)
      : 0;

  // 渲染服务状态卡片
  const renderServiceCard = (service: API.ServiceConfigResponse) => {
    const status = state.statusMap[service.id] || ({} as API.ServiceStatus);
    const healthStyle =
      healthStatusStyles[
        status.health_status as keyof typeof healthStatusStyles
      ] || healthStatusStyles.unknown;
    const currentStyle =
      currentStatusStyles[
        status.current_status as keyof typeof currentStatusStyles
      ] || currentStatusStyles.unknown;
    const uptimePercentage = status.uptime_percentage || 0;

    // 格式化时间
    const formatTime = (timeString?: string | null) => {
      return timeString
        ? moment(timeString).format('YYYY-MM-DD HH:mm:ss')
        : '从未';
    };

    return (
      <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
        <Card
          title={
            <Space size="middle" align="center">
              <Typography.Text strong>{service.name}</Typography.Text>
              <Tooltip title="服务ID">
                <Tag color="blue">ID: {service.id}</Tag>
              </Tooltip>
            </Space>
          }
          bordered
          hoverable
          extra={
            <Space>
              {service.is_active ? (
                <Badge status="success" text="已启用" />
              ) : (
                <Badge status="error" text="已禁用" />
              )}
              <Tooltip title="切换历史">
                <Tag icon={<SyncOutlined spin={false} />} color="purple">
                  {status.total_switches || 0}次
                </Tag>
              </Tooltip>
            </Space>
          }
          bodyStyle={{ padding: '16px' }}
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space align="center">
              <Typography.Text>健康状态:</Typography.Text>
              <Badge
                status={
                  healthStyle.color === '#52c41a'
                    ? 'success'
                    : healthStyle.color === '#f5222d'
                      ? 'error'
                      : 'processing'
                }
                text={healthStyle.text}
              />
              {status.health_status === 'unhealthy' && (
                <Tooltip title="健康状态异常">
                  <AlertOutlined style={{ color: '#f5222d' }} />
                </Tooltip>
              )}
            </Space>

            <Space align="center">
              <Typography.Text>当前节点:</Typography.Text>
              <Tag color={currentStyle.color}>{currentStyle.text}</Tag>
            </Space>

            <div style={{ width: '100%' }}>
              <Space
                align="center"
                style={{
                  width: '100%',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <Typography.Text>可用性:</Typography.Text>
                <Typography.Text strong>{uptimePercentage}%</Typography.Text>
              </Space>
              <Progress
                percent={uptimePercentage}
                size="small"
                status={uptimePercentage < 90 ? 'exception' : 'active'}
              />
            </div>

            <Space direction="vertical" size="small">
              <Tooltip title="最后检查时间">
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  <ClockCircleOutlined
                    style={{ fontSize: '12px', marginRight: 4 }}
                  />
                  最后检查: {formatTime(status.last_check_time)}
                </Typography.Text>
              </Tooltip>

              <Tooltip title="最后切换时间">
                <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                  <SyncOutlined style={{ fontSize: '12px', marginRight: 4 }} />
                  最后切换: {formatTime(status.last_switch_time)}
                </Typography.Text>
              </Tooltip>
            </Space>
          </Space>
        </Card>
      </Col>
    );
  };

  // 筛选菜单
  const filterMenu = (
    <Menu onClick={({ key }) => handleStatusFilter(key)}>
      <Menu.Item key="all">所有服务</Menu.Item>
      <Menu.Item key="active">已启用服务</Menu.Item>
      <Menu.Item key="inactive">已禁用服务</Menu.Item>
      <Menu.Item key="healthy">健康服务</Menu.Item>
      <Menu.Item key="unhealthy">异常服务</Menu.Item>
    </Menu>
  );

  return (
    <div style={{ padding: '24px' }}>
      <div
        style={{
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography.Title level={2}>服务监控仪表盘</Typography.Title>

        <Space>
          <Tooltip title={state.autoRefresh ? '禁用自动刷新' : '启用自动刷新'}>
            <Button
              icon={
                state.autoRefresh ? <SyncOutlined spin /> : <SyncOutlined />
              }
              onClick={toggleAutoRefresh}
              type={state.autoRefresh ? 'primary' : 'default'}
            >
              {state.autoRefresh ? '自动刷新中' : '开启自动刷新'}
            </Button>
          </Tooltip>

          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefresh}
            loading={state.loading}
          >
            手动刷新
          </Button>

          <Dropdown overlay={filterMenu} trigger={['click']}>
            <Button icon={<FilterOutlined />}>
              筛选:{' '}
              {state.filterStatus === 'all'
                ? '所有服务'
                : state.filterStatus === 'active'
                  ? '已启用'
                  : state.filterStatus === 'inactive'
                    ? '已禁用'
                    : state.filterStatus === 'healthy'
                      ? '健康'
                      : '异常'}
            </Button>
          </Dropdown>
        </Space>
      </div>

      {/* 监控概览卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card bordered={false}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                  总服务数
                </Typography.Text>
                <div
                  style={{ fontSize: '24px', fontWeight: 'bold', marginTop: 4 }}
                >
                  {statusSummary.total}
                </div>
              </div>
              <Badge count={statusSummary.total} status="default" />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card bordered={false}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                  健康服务
                </Typography.Text>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginTop: 4,
                    color: '#52c41a',
                  }}
                >
                  {statusSummary.healthy}
                </div>
              </div>
              <Badge count={statusSummary.healthy} status="success" />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card bordered={false}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                  异常服务
                </Typography.Text>
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    marginTop: 4,
                    color: '#f5222d',
                  }}
                >
                  {statusSummary.unhealthy}
                </div>
              </div>
              <Badge count={statusSummary.unhealthy} status="error" />
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card bordered={false}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Typography.Text type="secondary" style={{ fontSize: '14px' }}>
                  整体健康率
                </Typography.Text>
                <div
                  style={{ fontSize: '24px', fontWeight: 'bold', marginTop: 4 }}
                >
                  {healthRate}%
                </div>
                <Progress
                  percent={healthRate}
                  size="small"
                  status={healthRate < 90 ? 'exception' : 'success'}
                  style={{ marginTop: 8 }}
                />
              </div>
              <Tooltip title={`整体服务健康率: ${healthRate}%`}>
                <CheckCircleOutlined
                  style={{
                    fontSize: '32px',
                    color:
                      healthRate >= 90
                        ? '#52c41a'
                        : healthRate >= 70
                          ? '#faad14'
                          : '#f5222d',
                  }}
                />
              </Tooltip>
            </div>
          </Card>
        </Col>
      </Row>

      <Spin spinning={state.loading} tip="加载服务监控数据中...">
        {filteredServices.length > 0 ? (
          <Row gutter={[16, 16]}>{filteredServices.map(renderServiceCard)}</Row>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '64px',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px',
            }}
          >
            <AlertOutlined
              style={{
                fontSize: '48px',
                color: '#faad14',
                marginBottom: '16px',
              }}
            />
            <Typography.Title level={3} style={{ color: '#999' }}>
              没有找到服务数据
            </Typography.Title>
            <Typography.Text type="secondary">
              {state.filterStatus !== 'all'
                ? '请尝试调整筛选条件'
                : '暂无服务配置，请先添加服务'}
              <Button
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                style={{ marginLeft: '8px' }}
              >
                刷新重试
              </Button>
            </Typography.Text>
          </div>
        )}
      </Spin>
    </div>
  );
};

export default Monitor;
