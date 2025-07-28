// // src/pages/Monitor/index.tsx
// import { useEffect, useState } from 'react';
// import { Card, Col, Row, Tag, Spin, message } from 'antd';
// import { fetchServiceList, fetchServiceStatus } from '@/services/ant-design-pro/services';

// interface ServiceItem {
//   id: number;
//   name: string;
//   is_active: boolean;
// }

// export default function Monitor() {
//   const [services, setServices] = useState<ServiceItem[]>([]);
//   const [statusMap, setStatusMap] = useState<Record<number, any>>({});
//   const [loading, setLoading] = useState(true);

//   const loadServices = async () => {
//     setLoading(true);
//     try {
//       const list = await fetchServiceList();
//       setServices(list || []);
//       const statusResults: Record<number, any> = {};
//       await Promise.all(
//         list.map(async (item: ServiceItem) => {
//           const status = await fetchServiceStatus(item.id);
//           statusResults[item.id] = status;
//         }),
//       );
//       setStatusMap(statusResults);
//     } catch (err) {
//       message.error('监控信息加载失败');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadServices();
//   }, []);

//   return (
//     <Spin spinning={loading}>
//       <Row gutter={[16, 16]}>
//         {services.map((service) => {
//           const status = statusMap[service.id] || {};
//           const isPrimary = status.current_primary === 'primary';

//           return (
//             <Col xs={24} sm={12} md={8} lg={6} key={service.id}>
//               <Card
//                 title={service.name}
//                 bordered
//                 extra={service.is_active ? <Tag color="green">启用</Tag> : <Tag color="red">禁用</Tag>}
//               >
//                 <p>
//                   当前主节点：
//                   <Tag color={isPrimary ? 'blue' : 'purple'}>
//                     {isPrimary ? '主服务' : '备服务'}
//                   </Tag>
//                 </p>
//                 <p>最后更新时间：{status.last_updated || '-'}</p>
//               </Card>
//             </Col>
//           );
//         })}
//       </Row>
//     </Spin>
//   );
// }
