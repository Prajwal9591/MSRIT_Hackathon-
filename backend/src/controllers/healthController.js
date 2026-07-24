import { healthService } from '../services/healthService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const healthController = {
  getHealthStatus: (req, res, next) => {
    try {
      const data = healthService.getSystemHealth();
      return ApiResponse.success(res, 200, data, 'System is healthy');
    } catch (error) {
      next(error);
    }
  }
};
