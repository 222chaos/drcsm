import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import {
  Button,
  Input,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { TableProps } from 'antd/es/table';
import { useEffect, useState } from 'react';
import {
  deleteServiceApiV1ServicesServiceIdDelete,
  listServicesApiV1ServicesGet,
} from '@/services/ant-design-pro/services';

// 定义表格行数据类型
type ServiceListItem = API.ServiceConfigResponse;

export default function ServiceList() {
  const [data, setData] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>('');
  const [pagination, setPagination] = useState<
    TableProps<ServiceListItem>['pagination']
  >({
    pageSize: 10,
    current: 1,
    showSizeChanger: true,
    showTotal: (total) => `共 ${total} 条记录`,
  });
  const navigate = useNavigate();

  // 获取服务列表数据
  const fetchServices = async () => {
    setLoading(true);
    try {
      // 默认分页参数
      const current =
        typeof pagination === 'object' && pagination
          ? (pagination.current ?? 1)
          : 1;
      const pageSize =
        typeof pagination === 'object' && pagination
          ? (pagination.pageSize ?? 10)
          : 10;

      const params: API.listServicesApiV1ServicesGetParams = {
        limit: pageSize,
        skip: (current - 1) * pageSize,
      };

      // 如果有搜索文本，添加过滤条件（视接口支持情况）
      if (searchText.trim()) {
        // 假设后端支持按名称过滤
        // params.name = searchText;
      }

      const response = await listServicesApiV1ServicesGet(params);
      setData(response ?? []);
      message.success('服务列表加载成功');
    } catch (error) {
      console.error('获取服务列表失败:', error);
      message.error('获取服务列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };
  // 删除服务
  const handleDelete = async (id: number) => {
    try {
      await deleteServiceApiV1ServicesServiceIdDelete({ service_id: id });
      message.success('服务删除成功');
      fetchServices(); // 重新加载数据
    } catch (error) {
      console.error('删除服务失败:', error);
      message.error('删除服务失败，请重试');
    }
  };

  // 处理分页变化
  const handleTableChange: TableProps<ServiceListItem>['onChange'] = (p) => {
    setPagination({
      ...pagination,
      current: p.current,
      pageSize: p.pageSize,
    });
  };

  // 处理搜索
  const handleSearch = () => {
    // 重置页码并重新加载数据
    setPagination({
      ...pagination,
      current: 1,
    });
    fetchServices();
  };

  // 初始加载和刷新数据
  useEffect(() => {
    fetchServices();
  }, [
    pagination ? pagination.current : 0,
    pagination ? pagination.pageSize : 0,
  ]);

  // 表格列定义
  const columns: TableProps<ServiceListItem>['columns'] = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      sorter: (a: ServiceListItem, b: ServiceListItem) =>
        a.name.localeCompare(b.name),
    },
    {
      title: '主服务地址',
      dataIndex: 'primary_url',
      key: 'primary_url',
      ellipsis: true,
    },
    {
      title: '备服务地址',
      dataIndex: 'backup_url',
      key: 'backup_url',
      ellipsis: true,
    },
    {
      title: '检查间隔',
      dataIndex: 'check_interval',
      key: 'check_interval',
      render: (interval) => `${interval || 0}秒`,
      sorter: (a: ServiceListItem, b: ServiceListItem) =>
        (a.check_interval || 0) - (b.check_interval || 0),
    },
    {
      title: '启用状态',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: '启用', value: true },
        { text: '停用', value: false },
      ],
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? '启用' : '停用'}
        </Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      ellipsis: true,
      sorter: (a: ServiceListItem, b: ServiceListItem) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: ServiceListItem) => (
        <Space size="small">
          <Tooltip title="查看详情">
            <Button
              type="text"
              onClick={() => navigate(`/services/${record.id}`)}
              size="small"
            >
              查看
            </Button>
          </Tooltip>
          <Tooltip title="编辑服务">
            <Button
              type="text"
              onClick={() => navigate(`/services/${record.id}/edit`)}
              size="small"
            >
              编辑
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定要删除此服务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip title="删除服务">
              <Button type="text" danger size="small">
                删除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="service-list-container">
      <div
        className="table-operations"
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          <Input
            placeholder="搜索服务名称"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchServices}>
            刷新
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/services/new')}
          >
            新增服务
          </Button>
        </Space>
      </div>
      <Table
        rowKey="id"
        dataSource={data}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
        size="middle"
        bordered
      />
    </div>
  );
}
