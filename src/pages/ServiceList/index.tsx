import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from '@umijs/max';
import { Button, message, Popconfirm, Table, Tag } from 'antd';
import { useEffect, useState } from 'react';
import {
  deleteServiceApiV1ServicesServiceIdDelete,
  listServicesApiV1ServicesGet,
} from '@/services/ant-design-pro/services';

export default function ServiceList() {
  const [data, setData] = useState<API.ServiceConfigResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await listServicesApiV1ServicesGet({});
      setData(res || []);
    } catch (err) {
      message.error('获取服务列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteServiceApiV1ServicesServiceIdDelete({ service_id: id });
      message.success('删除成功');
      loadData();
    } catch (err) {
      message.error('删除失败');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns = [
    {
      title: '服务名称',
      dataIndex: 'name',
    },
    {
      title: '主服务地址',
      dataIndex: 'primary_url',
    },
    {
      title: '备服务地址',
      dataIndex: 'backup_url',
    },
    {
      title: '启用状态',
      dataIndex: 'is_active',
      render: (val: boolean) =>
        val ? <Tag color="green">启用</Tag> : <Tag color="red">停用</Tag>,
    },
    {
      title: '操作',
      render: (_: any, record: API.ServiceConfigResponse) => (
        <>
          <a onClick={() => navigate(`/services/${record.id}`)}>查看</a>
          <span style={{ margin: '0 8px' }}>|</span>
          <a onClick={() => navigate(`/services/${record.id}/edit`)}>编辑</a>
          <span style={{ margin: '0 8px' }}>|</span>
          <Popconfirm
            title="确认删除该服务？"
            onConfirm={() => handleDelete(record.id!)}
          >
            <a style={{ color: 'red' }}>删除</a>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate('/services/new')}
      >
        新建服务
      </Button>
      <Table
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={data}
      />
    </div>
  );
}
