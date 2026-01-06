import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GlobalSynthesisResult } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const ANALYSIS_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    executive_summary: {
      type: Type.STRING,
      description: "Executive summary focusing on capacity bottlenecks and staffing risks.",
    },
    shift_analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          shift_name: { type: Type.STRING },
          ticket_volume: { type: Type.NUMBER },
          breach_rate_percent: { type: Type.NUMBER },
          avg_handling_time_hours: { type: Type.NUMBER },
          stress_score: { type: Type.NUMBER }
        },
        required: ["shift_name", "ticket_volume", "breach_rate_percent", "avg_handling_time_hours", "stress_score"]
      }
    },
    staffing_recommendations: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          shift_name: { type: Type.STRING },
          current_estimated_agents: { type: Type.NUMBER },
          recommended_agents: { type: Type.NUMBER },
          gap: { type: Type.NUMBER },
          justification: { type: Type.STRING }
        },
        required: ["shift_name", "current_estimated_agents", "recommended_agents", "gap", "justification"]
      }
    },
    staffing_roi: {
      type: Type.OBJECT,
      properties: {
        estimated_delay_reduction_percent: { type: Type.NUMBER },
        sla_adherence_improvement_percent: { type: Type.NUMBER },
        monthly_revenue_leakage_savings: { type: Type.NUMBER },
        total_optimized_value: { type: Type.NUMBER }
      },
      required: ["estimated_delay_reduction_percent", "sla_adherence_improvement_percent", "monthly_revenue_leakage_savings", "total_optimized_value"]
    },
    financial_impact: {
      type: Type.OBJECT,
      properties: {
        estimated_monthly_loss: { type: Type.NUMBER },
        revenue_leakage_analysis: { type: Type.STRING },
        management_invisibility_reason: { type: Type.STRING },
        business_risk_assessment: { type: Type.STRING }
      },
      required: ["estimated_monthly_loss", "revenue_leakage_analysis", "management_invisibility_reason", "business_risk_assessment"]
    },
    bottlenecks: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    summary_metrics: {
      type: Type.OBJECT,
      properties: {
        avg_resolution_time_hours: { type: Type.NUMBER },
        sla_breach_rate_percent: { type: Type.NUMBER },
        total_tickets_analyzed: { type: Type.NUMBER },
        peak_volume_hour: { type: Type.STRING }
      },
      required: ["avg_resolution_time_hours", "sla_breach_rate_percent", "total_tickets_analyzed", "peak_volume_hour"]
    },
    historical_comparison: {
      type: Type.OBJECT,
      properties: {
        period_label: { type: Type.STRING },
        resolution_time_change_percent: { type: Type.NUMBER },
        breach_rate_change_percent: { type: Type.NUMBER },
        loss_change_percent: { type: Type.NUMBER },
        is_improvement: {
          type: Type.OBJECT,
          properties: {
            resolution_time: { type: Type.BOOLEAN },
            breach_rate: { type: Type.BOOLEAN },
            loss: { type: Type.BOOLEAN }
          },
          required: ["resolution_time", "breach_rate", "loss"]
        }
      },
      required: ["period_label", "resolution_time_change_percent", "breach_rate_change_percent", "loss_change_percent", "is_improvement"]
    },
    baseline_metrics: {
      type: Type.OBJECT,
      properties: {
        avg_resolution_time_hours: { type: Type.NUMBER },
        sla_breach_rate_percent: { type: Type.NUMBER },
        estimated_monthly_loss: { type: Type.NUMBER },
        total_tickets_analyzed: { type: Type.NUMBER }
      },
      required: ["avg_resolution_time_hours", "sla_breach_rate_percent", "estimated_monthly_loss", "total_tickets_analyzed"]
    },
    capacity_utilization_distribution: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER }
        },
        required: ["name", "value"]
      }
    },
    loss_trend: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          loss_value: { type: Type.NUMBER },
          ticket_volume: { type: Type.NUMBER }
        },
        required: ["date", "loss_value", "ticket_volume"]
      }
    },
    recommended_actions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          insight: { type: Type.STRING },
          action: { type: Type.STRING },
          expected_impact: { type: Type.STRING }
        },
        required: ["insight", "action", "expected_impact"]
      }
    },
    temporal_heatmap: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          time_block: { type: Type.STRING },
          intensity: { type: Type.NUMBER }
        },
        required: ["day", "time_block", "intensity"]
      }
    }
  },
  required: [
    "executive_summary", "shift_analysis", "staffing_recommendations", "staffing_roi",
    "financial_impact", "bottlenecks", "summary_metrics", "historical_comparison",
    "baseline_metrics", "capacity_utilization_distribution", "loss_trend",
    "recommended_actions", "temporal_heatmap"
  ]
};

export const analyzeWorkflow = async (workflowData: string): Promise<AnalysisResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `SYSTEM PROMPT: You are a stateless Enterprise Operational Intelligence Analyst.
    
    TASK: Analyze ONLY the provided IT workflow data. 
    1. Extract core execution metrics (SLA, Volume, Resolution Velocity).
    2. Segment performance by Morning (08-12), Afternoon (12-16), Evening (16-20) shifts.
    3. To support benchmarking features, infer a realistic baseline from the provided data variance.
    
    STRICT DATA: ${workflowData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: ANALYSIS_SCHEMA,
      systemInstruction: "Expert Operations Planner. Produce strict JSON. Focus on accuracy and data-driven insights.",
    },
  });
  return JSON.parse(response.text!) as AnalysisResult;
};

export const analyzeGlobalSynthesis = async (datasetResults: Record<string, AnalysisResult>): Promise<GlobalSynthesisResult> => {
  const ai = getAI();
  const dataContext = Object.entries(datasetResults).map(([id, result]) => {
    return `PERIOD: ${id}\nSLA Breach: ${result.summary_metrics.sla_breach_rate_percent}%\nLoss: $${result.financial_impact.estimated_monthly_loss}`;
  }).join('\n\n');

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform Global Operational Synthesis across multiple analyzed periods.
    ${dataContext}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          management_insights: { type: Type.STRING },
          wow_summary_table: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                metric: { type: Type.STRING },
                current_state: { type: Type.STRING },
                previous_state: { type: Type.STRING },
                trend_description: { type: Type.STRING },
                impact_level: { type: Type.STRING }
              },
              required: ["metric", "current_state", "previous_state", "trend_description", "impact_level"]
            }
          },
          positives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { area: { type: Type.STRING }, outcome: { type: Type.STRING }, cause: { type: Type.STRING }, implication: { type: Type.STRING } } } },
          negatives: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { area: { type: Type.STRING }, outcome: { type: Type.STRING }, cause: { type: Type.STRING }, implication: { type: Type.STRING } } } },
          risk_signals: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { signal: { type: Type.STRING }, trigger: { type: Type.STRING }, action: { type: Type.STRING } } } },
          structural_assessment: { type: Type.STRING }
        },
        required: ["management_insights", "wow_summary_table", "positives", "negatives", "risk_signals", "structural_assessment"]
      },
      systemInstruction: "Operational Analyst synthesizing capacity trends across multiple weeks.",
    },
  });
  return JSON.parse(response.text!) as GlobalSynthesisResult;
};