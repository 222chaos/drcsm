// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Monitoring Status 获取监控状态 GET /monitoring/status */
export async function monitoringStatusMonitoringStatusGet(options?: {
  [key: string]: any;
}) {
  return request<any>("/monitoring/status", {
    method: "GET",
    ...(options || {}),
  });
}
