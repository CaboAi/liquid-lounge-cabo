import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import {
  requireAuth,
  optionalAuth,
  requireActiveAccount,
  smsRateLimit,
  verificationRateLimit,
  apiRateLimit,
  customRateLimit,
} from '../middleware/auth.middleware';

// Create router instance
const router = Router();

/**
 * @route   POST /api/auth/send-code
 * @desc    Send verification code to phone number
 * @access  Public
 * @rateLimit 3 requests per hour per phone number
 */
router.post(
  '/send-code',
  smsRateLimit, // 3 SMS per hour per phone
  AuthController.sendCode
);

/**
 * @route   POST /api/auth/verify-code
 * @desc    Verify code and return JWT tokens
 * @access  Public
 * @rateLimit 5 attempts per 15 minutes per phone number
 */
router.post(
  '/verify-code',
  verificationRateLimit, // 5 attempts per 15 minutes per phone
  AuthController.verifyCode
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public (requires refresh token)
 * @rateLimit 20 requests per 15 minutes per user/IP
 */
router.post(
  '/refresh',
  customRateLimit(20, 15 * 60, 'refresh', 'Too many token refresh requests'),
  AuthController.refresh
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and invalidate tokens
 * @access  Private
 */
router.post(
  '/logout',
  requireAuth,
  requireActiveAccount,
  AuthController.logout
);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  '/me',
  requireAuth,
  requireActiveAccount,
  AuthController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 * @rateLimit 10 updates per hour per user
 */
router.put(
  '/profile',
  requireAuth,
  requireActiveAccount,
  customRateLimit(10, 60 * 60, 'profile_update', 'Too many profile updates'),
  AuthController.updateProfile
);

export default router;