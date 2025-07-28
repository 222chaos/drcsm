// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** List Services 获取服务列表 GET /api/v1/services/ */
export async function listServicesApiV1ServicesGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.listServicesApiV1ServicesGetParams,
  options?: { [key: string]: any }
) {
  return request<API.ServiceConfigResponse[]>("/api/v1/services/", {
    method: "GET",
    params: {
      // // limit has a default value: 100
      // limit: "100",
      ...params,
    },
    ...(options || {}),
  });
}

/** Create Service 创建新的服务配置 POST /api/v1/services/ */
export async function createServiceApiV1ServicesPost(
  body: API.ServiceConfigCreate,
  options?: { [key: string]: any }
) {
  return request<API.ServiceConfigResponse>("/api/v1/services/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** Get Service 获取单个服务详情 GET /api/v1/services/${param0} */
export async function getServiceApiV1ServicesServiceIdGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getServiceApiV1ServicesServiceIdGetParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.ServiceConfigResponse>(`/api/v1/services/${param0}`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Update Service 更新服务配置 PUT /api/v1/services/${param0} */
export async function updateServiceApiV1ServicesServiceIdPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.updateServiceApiV1ServicesServiceIdPutParams,
  body: API.ServiceConfigUpdate,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.ServiceConfigResponse>(`/api/v1/services/${param0}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Delete Service 删除服务 DELETE /api/v1/services/${param0} */
export async function deleteServiceApiV1ServicesServiceIdDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteServiceApiV1ServicesServiceIdDeleteParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/services/${param0}`, {
    method: "DELETE",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Trigger Health Check 触发健康检查 POST /api/v1/services/${param0}/health-check */
export async function triggerHealthCheckApiV1ServicesServiceIdHealthCheckPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.triggerHealthCheckApiV1ServicesServiceIdHealthCheckPostParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.HealthCheckResponse>(
    `/api/v1/services/${param0}/health-check`,
    {
      method: "POST",
      params: {
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** Get Health History 获取健康检查历史 GET /api/v1/services/${param0}/health-history */
export async function getHealthHistoryApiV1ServicesServiceIdHealthHistoryGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getHealthHistoryApiV1ServicesServiceIdHealthHistoryGetParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.HealthCheckResponse[]>(
    `/api/v1/services/${param0}/health-history`,
    {
      method: "GET",
      params: {
        // limit has a default value: 100
        limit: "100",
        // hours has a default value: 24
        hours: "24",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** Get Service Status 获取服务状态 GET /api/v1/services/${param0}/status */
export async function getServiceStatusApiV1ServicesServiceIdStatusGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getServiceStatusApiV1ServicesServiceIdStatusGetParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.ServiceStatus>(`/api/v1/services/${param0}/status`, {
    method: "GET",
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** Switch Service 手动切换服务 POST /api/v1/services/${param0}/switch */
export async function switchServiceApiV1ServicesServiceIdSwitchPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.switchServiceApiV1ServicesServiceIdSwitchPostParams,
  body: API.SwitchRequest,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.SwitchResponse>(`/api/v1/services/${param0}/switch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** Get Switch History 获取切换历史 GET /api/v1/services/${param0}/switch-history */
export async function getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGetParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<API.SwitchLogResponse[]>(
    `/api/v1/services/${param0}/switch-history`,
    {
      method: "GET",
      params: {
        // limit has a default value: 50
        limit: "50",
        ...queryParams,
      },
      ...(options || {}),
    }
  );
}

/** Get Service Uptime 获取服务可用性统计 GET /api/v1/services/${param0}/uptime */
export async function getServiceUptimeApiV1ServicesServiceIdUptimeGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getServiceUptimeApiV1ServicesServiceIdUptimeGetParams,
  options?: { [key: string]: any }
) {
  const { service_id: param0, ...queryParams } = params;
  return request<any>(`/api/v1/services/${param0}/uptime`, {
    method: "GET",
    params: {
      // days has a default value: 7
      days: "7",
      ...queryParams,
    },
    ...(options || {}),
  });
}
