import express, { Router } from 'express';
import { validate } from '../../modules/validate';
import { authValidation, authController } from '../../modules/auth';

const router: Router = express.Router();

router.post('/register', validate(authValidation.register), authController.register);
router.post('/login', validate(authValidation.login), authController.login);
router.post('/logout', validate(authValidation.logout), authController.logout);
router.post('/refresh-tokens', validate(authValidation.refreshTokens), authController.refreshTokens);
router.post('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);
router.post('/verify-email', validate(authValidation.verifyEmail), authController.verifyEmail);

export default router;
