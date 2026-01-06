export type UserRole = 'Admin' | 'Manager' | 'Analyst';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface DatasetMetadata {
  id: string;
  name: string;
  timestamp: string;
  status: 'synced' | 'pending' | 'empty';
}

export interface ShiftPerformance {
  shift_name: string;
  ticket_volume: number;
  breach_rate_percent: number;
  avg_handling_time_hours: number;
  stress_score: number; // 1-10
}

export interface StaffingRecommendation {
  shift_name: string;
  current_estimated_agents: number;
  recommended_agents: number;
  gap: number;
  justification: string;
}

export interface StaffingImpactROI {
  estimated_delay_reduction_percent: number;
  sla_adherence_improvement_percent: number;
  monthly_revenue_leakage_savings: number;
  total_optimized_value: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TrendDataPoint {
  date: string;
  loss_value: number;
  ticket_volume: number;
}

export interface RecommendedAction {
  insight: string;
  action: string;
  expected_impact: string;
}

export interface FinancialImpact {
  estimated_monthly_loss: number;
  revenue_leakage_analysis: string;
  management_invisibility_reason: string;
  business_risk_assessment: string;
}

export interface HeatmapDataPoint {
  day: string;
  time_block: string;
  intensity: number;
}

export interface AnalysisResult {
  executive_summary: string;
  shift_analysis: ShiftPerformance[];
  staffing_recommendations: StaffingRecommendation[];
  staffing_roi: StaffingImpactROI;
  financial_impact: FinancialImpact;
  bottlenecks: string[];
  summary_metrics: {
    avg_resolution_time_hours: number;
    sla_breach_rate_percent: number;
    total_tickets_analyzed: number;
    peak_volume_hour: string;
  };
  historical_comparison: {
    period_label: string;
    resolution_time_change_percent: number;
    breach_rate_change_percent: number;
    loss_change_percent: number;
    is_improvement: {
      resolution_time: boolean;
      breach_rate: boolean;
      loss: boolean;
    };
  };
  baseline_metrics: {
    avg_resolution_time_hours: number;
    sla_breach_rate_percent: number;
    estimated_monthly_loss: number;
    total_tickets_analyzed: number;
  };
  capacity_utilization_distribution: ChartDataPoint[];
  loss_trend: TrendDataPoint[];
  recommended_actions: RecommendedAction[];
  temporal_heatmap: HeatmapDataPoint[];
}

export interface GlobalSynthesisResult {
  management_insights: string;
  wow_summary_table: {
    metric: string;
    current_state: string;
    previous_state: string;
    trend_description: string;
    impact_level: 'High' | 'Medium' | 'Low';
  }[];
  positives: {
    area: string;
    outcome: string;
    cause: string;
    implication: string;
  }[];
  negatives: {
    area: string;
    outcome: string;
    cause: string;
    implication: string;
  }[];
  risk_signals: {
    signal: string;
    trigger: string;
    action: string;
  }[];
  structural_assessment: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}