import { useParams, history } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { createService, fetchServiceDetail, updateService } from '@/services/disasterRecovery';
import { message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import ServiceForm from './components/ServiceForm';

export default function ServiceDetail() {
  const { id } = useParams(); // new | id
  const isNew = id === 'new';
  const [initialValues, setInitialValues] = useState<any>({});
  const [loading, setLoading] = useState(!isNew);

  useEffect(() => {
    if (!isNew) {
      fetchServiceDetail(id!).then(res => {
        setInitialValues(res);
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (values: any) => {
    try {
      if (isNew) {
        await createService(values);
        message.success('创建成功');
      } else {
        await updateService(id!, values);
        message.success('更新成功');
      }
      history.push('/disaster-recovery');
    } catch (e) {
      message.error('操作失败');
    }
  };

  return (
    <PageContainer title={isNew ? '新建服务配置' : '编辑服务配置'}>
      <Spin spinning={loading}>
        <ServiceForm initialValues={initialValues} onFinish={handleSubmit} />
      </Spin>
    </PageContainer>
  );
}
