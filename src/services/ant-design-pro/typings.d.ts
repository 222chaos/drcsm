
declare namespace API {
  type deleteServiceApiV1ServicesServiceIdDeleteParams = {
    service_id: number;
  };

  type getHealthHistoryApiV1ServicesServiceIdHealthHistoryGetParams = {
    service_id: number;
    limit?: number;
    hours?: number;
  };

  type getServiceApiV1ServicesServiceIdGetParams = {
    service_id: number;
  };

  type getServiceStatusApiV1ServicesServiceIdStatusGetParams = {
    service_id: number;
  };

  type getServiceUptimeApiV1ServicesServiceIdUptimeGetParams = {
    service_id: number;
    days?: number;
  };

  type getSwitchHistoryApiV1ServicesServiceIdSwitchHistoryGetParams = {
    service_id: number;
    limit?: number;
  };

  type HealthCheckResponse = {
    /** Id */
    id: number;
    /** Service Id */
    service_id: number;
    /** Status */
    status: string;
    /** Response Time */
    response_time: number | null;
    /** Http Status */
    http_status: number | null;
    /** Error Message */
    error_message: string | null;
    /** Checked At */
    checked_at: string;
  };

  type HTTPValidationError = {
    /** Detail */
    detail?: ValidationError[];
  };

  type listServicesApiV1ServicesGetParams = {
    skip?: number;
    limit?: number;
    is_active?: boolean | null;
  };

  type ServiceConfigCreate = {
    /** Name 服务名称 */
    name: string;
    /** Primary Url 主服务URL */
    primary_url: string;
    /** Backup Url 备份服务URL */
    backup_url: string;
    /** Health Check Endpoint 健康检查端点 */
    health_check_endpoint?: string;
    /** Check Interval 检查间隔(秒) */
    check_interval?: number;
    /** Timeout 超时时间(秒) */
    timeout?: number;
    /** Retry Count 重试次数 */
    retry_count?: number;
    /** Is Active 是否激活 */
    is_active?: boolean;
    /** Description 服务描述 */
    description?: string | null;
  };

  type ServiceConfigResponse = {
    /** Name 服务名称 */
    name: string;
    /** Primary Url 主服务URL */
    primary_url: string;
    /** Backup Url 备份服务URL */
    backup_url: string;
    /** Health Check Endpoint 健康检查端点 */
    health_check_endpoint?: string;
    /** Check Interval 检查间隔(秒) */
    check_interval?: number;
    /** Timeout 超时时间(秒) */
    timeout?: number;
    /** Retry Count 重试次数 */
    retry_count?: number;
    /** Is Active 是否激活 */
    is_active?: boolean;
    /** Description 服务描述 */
    description?: string | null;
    /** Id */
    id: number;
    /** Created At */
    created_at: string;
    /** Updated At */
    updated_at: string;
  };

  type ServiceConfigUpdate = {
    /** Name */
    name?: string | null;
    /** Primary Url */
    primary_url?: string | null;
    /** Backup Url */
    backup_url?: string | null;
    /** Health Check Endpoint */
    health_check_endpoint?: string | null;
    /** Check Interval */
    check_interval?: number | null;
    /** Timeout */
    timeout?: number | null;
    /** Retry Count */
    retry_count?: number | null;
    /** Is Active */
    is_active?: boolean | null;
    /** Description */
    description?: string | null;
  };

  type ServiceStatus = {
    /** Service Id */
    service_id: number;
    /** Service Name */
    service_name: string;
    /** Current Status */
    current_status: string;
    /** Health Status */
    health_status: string;
    /** Last Check Time */
    last_check_time?: string | null;
    /** Last Switch Time */
    last_switch_time?: string | null;
    /** Total Switches */
    total_switches: number;
    /** Uptime Percentage */
    uptime_percentage?: number | null;
  };

  type SwitchLogResponse = {
    /** Id */
    id: number;
    /** Service Id */
    service_id: number;
    /** Switch Type */
    switch_type: string;
    /** From Status */
    from_status: string;
    /** To Status */
    to_status: string;
    /** Reason */
    reason: string | null;
    /** Operator */
    operator: string | null;
    /** Success */
    success: boolean;
    /** Error Message */
    error_message: string | null;
    /** Created At */
    created_at: string;
  };

  type SwitchRequest = {
    /** Service Id */
    service_id: number;
    /** Target Status 目标状态 */
    target_status: string;
    /** Reason 切换原因 */
    reason?: string | null;
    /** Operator 操作人 */
    operator?: string | null;
  };

  type SwitchResponse = {
    /** Success */
    success: boolean;
    /** Message */
    message: string;
    switch_log?: SwitchLogResponse | null;
  };

  type switchServiceApiV1ServicesServiceIdSwitchPostParams = {
    service_id: number;
  };

  type triggerHealthCheckApiV1ServicesServiceIdHealthCheckPostParams = {
    service_id: number;
    /** 强制检查 */
    force?: boolean;
  };

  type updateServiceApiV1ServicesServiceIdPutParams = {
    service_id: number;
  };

  type ValidationError = {
    /** Location */
    loc: (string | number)[];
    /** Message */
    msg: string;
    /** Error Type */
    type: string;
  };
}
