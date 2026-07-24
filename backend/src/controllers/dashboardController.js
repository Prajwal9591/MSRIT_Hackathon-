import { dashboardService } from '../services/dashboardService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const dashboardController = {
  getDashboardMetrics: (req, res, next) => {
    try {
      const data = dashboardService.getDashboardMetrics();
      return ApiResponse.success(res, 200, data, 'Dashboard overview metrics retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
};
