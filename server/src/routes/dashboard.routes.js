const { Router } = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const validateRequest = require('../middleware/validateRequest');
const { validatePlanInput } = require('../validators/api.validators');

const router = Router();

router.get('/', dashboardController.getDashboardData);
router.post('/plan', validateRequest(validatePlanInput), dashboardController.createOrUpdatePlan);
router.post('/reset-demo', dashboardController.resetDemo);

module.exports = router;
