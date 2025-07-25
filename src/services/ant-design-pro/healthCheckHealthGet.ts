// @ts-ignore
/* eslint-disable */
import { request } from "@umijs/max";

/** Health Check 服务健康检查 GET /health */
export async function healthCheckHealthGet(options?: { [key: string]: any }) {
  return request<any>("/health", {
    method: "GET",
    ...(options || {}),
  });
}
