import { request } from '@umijs/max';

// 获取服务列表
export async function fetchServiceList(params?: {
  active_only?: boolean;
  limit?: number;
  offset?: number;
}) {
  return request('/services', {
    method: 'GET',
    params,
  });
}

// 获取服务详情
export async function fetchServiceDetail(id: number | string) {
  return request(`/services/${id}`, {
    method: 'GET',
  });
}

// 创建服务
export async function createService(data: any) {
  return request('/services', {
    method: 'POST',
    data,
  });
}

// 更新服务
export async function updateService(id: number | string, data: any) {
  return request(`/services/${id}`, {
    method: 'PUT',
    data,
  });
}

// 删除服务
export async function deleteService(id: number | string) {
  return request(`/services/${id}`, {
    method: 'DELETE',
  });
}
