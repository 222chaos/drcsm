import { request } from '@umijs/max';

const baseURL = 'http://192.168.100.10:9090/api/v1';

export async function fetchServiceList(params?: {
  active_only?: boolean;
  limit?: number;
  offset?: number;
}) {
  return request(`${baseURL}/services`, {
    method: 'GET',
    params,
  });
}

export async function fetchServiceDetail(id: number | string) {
  return request(`${baseURL}/services/${id}`, {
    method: 'GET',
  });
}

export async function createService(data: any) {
  return request(`${baseURL}/services`, {
    method: 'POST',
    data,
  });
}

export async function updateService(id: number | string, data: any) {
  return request(`${baseURL}/services/${id}`, {
    method: 'PUT',
    data,
  });
}

export async function deleteService(id: number | string) {
  return request(`${baseURL}/services/${id}`, {
    method: 'DELETE',
  });
}