export const authorizeWearable = async (provider: 'google_fit' | 'apple_health'): Promise<{ token: string }> => {
  // Simulate OAuth Flow
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ token: `mock_token_${provider}_${Date.now()}` });
    }, 1500);
  });
};

export const syncDailyHealthData = async () => {
  // Mock data to feed the optimistic UI
  return new Promise<{ steps: number, sleep_hours: number }>((resolve) => {
    setTimeout(() => {
      resolve({
        steps: 6500,
        sleep_hours: 7.2
      });
    }, 800);
  });
};
