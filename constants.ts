export const SAMPLE_DATA = `[
  {
    "ticket_id": "INC-2023-001",
    "type": "Access Request",
    "created_at": "2023-10-23T08:00:00Z",
    "resolved_at": "2023-10-25T14:30:00Z",
    "sla_target_hours": 24,
    "workflow_steps": [
      { "step": "Created", "timestamp": "2023-10-23T08:00:00Z", "actor": "User" },
      { "step": "Manager Approval", "timestamp": "2023-10-23T09:15:00Z", "actor": "Manager_A" },
      { "step": "Security Review", "timestamp": "2023-10-24T10:00:00Z", "actor": "Sec_Team", "note": "Pending additional info" },
      { "step": "User Response", "timestamp": "2023-10-24T11:00:00Z", "actor": "User" },
      { "step": "Security Approval", "timestamp": "2023-10-25T13:00:00Z", "actor": "Sec_Team" },
      { "step": "Provisioning", "timestamp": "2023-10-25T14:30:00Z", "actor": "Auto_System" }
    ]
  },
  {
    "ticket_id": "INC-2023-002",
    "type": "VPN Issue",
    "created_at": "2023-10-23T09:30:00Z",
    "resolved_at": "2023-10-23T10:15:00Z",
    "sla_target_hours": 4,
    "workflow_steps": [
      { "step": "Created", "timestamp": "2023-10-23T09:30:00Z", "actor": "User" },
      { "step": "L1 Triage", "timestamp": "2023-10-23T09:35:00Z", "actor": "Agent_K" },
      { "step": "Resolved", "timestamp": "2023-10-23T10:15:00Z", "actor": "Agent_K", "note": "Password reset" }
    ]
  },
  {
    "ticket_id": "INC-2023-003",
    "type": "Server Outage",
    "created_at": "2023-10-24T02:00:00Z",
    "resolved_at": "2023-10-24T06:00:00Z",
    "sla_target_hours": 2,
    "workflow_steps": [
      { "step": "Alert Generated", "timestamp": "2023-10-24T02:00:00Z", "actor": "Monitoring_Sys" },
      { "step": "Ack by NOC", "timestamp": "2023-10-24T02:45:00Z", "actor": "NOC_Operator" },
      { "step": "Escalate to L2", "timestamp": "2023-10-24T03:00:00Z", "actor": "NOC_Operator" },
      { "step": "L2 Investigation", "timestamp": "2023-10-24T04:30:00Z", "actor": "SysAdmin_Dave", "note": "Waiting for logs" },
      { "step": "Fix Applied", "timestamp": "2023-10-24T05:50:00Z", "actor": "SysAdmin_Dave" },
      { "step": "Verified", "timestamp": "2023-10-24T06:00:00Z", "actor": "Monitoring_Sys" }
    ]
  },
  {
    "ticket_id": "INC-2023-004",
    "type": "Access Request",
    "created_at": "2023-10-25T08:00:00Z",
    "resolved_at": null,
    "sla_target_hours": 24,
    "workflow_steps": [
      { "step": "Created", "timestamp": "2023-10-25T08:00:00Z", "actor": "User" },
      { "step": "Manager Approval", "timestamp": "2023-10-26T15:00:00Z", "actor": "Manager_B" },
      { "step": "Security Queue", "timestamp": "2023-10-26T15:01:00Z", "actor": "System" }
    ]
  }
]`;
