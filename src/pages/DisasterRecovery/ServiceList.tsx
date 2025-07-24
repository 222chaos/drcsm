import { ProTable } from '@ant-design/pro-components';
import { Button, Popconfirm, message } from 'antd';
import { fetchServiceList, deleteService } from '@/services/disasterRecovery';
import { history } from '@umijs/max';

export default () => {
  return (
    <ProTable
      columns={[
        { title: '服务名称', dataIndex: 'name' },
        { title: '主服务地址', dataIndex: 'primary_url' },
        { title: '备服务地址', dataIndex: 'backup_url' },
        { title: '健康检查路径', dataIndex: 'health_check_endpoint' },
        { title: '启用状态', dataIndex: 'is_active', valueEnum: {
            true: { text: '启用', status: 'Success' },
            false: { text: '禁用', status: 'Default' },
          } 
        },
        {
          title: '操作',
          valueType: 'option',
          render: (_, row) => [
            <a key="edit" onClick={() => history.push(`/disaster-recovery/${row.id}`)}>编辑</a>,
            <Popconfirm
              key="delete"
              title="确定要删除这个服务配置吗？"
              onConfirm={async () => {
                await deleteService(row.id);
                message.success('删除成功');
              }}
            >
              <a>删除</a>
            </Popconfirm>
          ],
        },
      ]}
      request={async () => {
        const res = await fetchServiceList();
        return {
          data: res.items,
          success: true,
        };
      }}
      rowKey="id"
      headerTitle="服务配置列表"
      toolBarRender={() => [
        <Button type="primary" onClick={() => history.push('/disaster-recovery/new')}>
          新建服务
        </Button>,
      ]}
    />
  );
};
