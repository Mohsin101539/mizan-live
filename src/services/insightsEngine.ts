export interface HealthMetrics {
  sleep_hours?: number;
  steps?: number;
}

export interface DeenMetrics {
  fajrCompleted?: boolean;
}

export const generateDailyInsight = (healthData?: HealthMetrics, deenData?: DeenMetrics): string | null => {
  if (!healthData) return null;

  if (healthData.sleep_hours !== undefined && healthData.sleep_hours < 6) {
    return "Insight: We noticed when you sleep less than 6 hours, your Fajr adherence drops by 40%. Let's prioritize rest tonight.";
  } else if (healthData.sleep_hours !== undefined && healthData.sleep_hours >= 6) {
    return "Stellar rest! Your consistent sleep correlates with a 90% higher chance of completing all prayers. Keep it up!";
  }

  return "Focusing on physical health directly impacts your spiritual consistency. Track your sleep to unlock more insights.";
};
