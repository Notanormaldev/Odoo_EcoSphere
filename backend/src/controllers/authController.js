import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { blacklistToken, isTokenBlacklisted } from '../config/redis.js';
import User from '../models/User.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';
import { AppError } from '../middleware/errorHandler.js';
import { generateTokens } from '../utils/tokenGenerator.js';

// Register
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, employeeId, designation, gender } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 409);
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'employee',
      department: department || null,
      employeeId,
      designation,
      gender,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpiry,
    });

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify email
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    if (!token) {
      throw new AppError('Verification token is required', 400);
    }

    // First check if a user has this token (regardless of expiry)
    const userWithToken = await User.findOne({
      emailVerificationToken: token,
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!userWithToken) {
      // Maybe token was already used (user is verified) — check by token value not expiry
      throw new AppError(
        'This verification link is invalid or has already been used. Please request a new one.',
        400
      );
    }

    // Check if already verified
    if (userWithToken.isEmailVerified) {
      // Already verified — just generate tokens and let them in
      const { accessToken, refreshToken } = generateTokens(userWithToken._id);
      return res.status(200).json({
        success: true,
        message: 'Email already verified',
        data: {
          accessToken,
          refreshToken,
          user: {
            id: userWithToken._id,
            name: userWithToken.name,
            email: userWithToken.email,
            role: userWithToken.role,
            isEmailVerified: true,
          },
        },
      });
    }

    // Check expiry
    if (userWithToken.emailVerificationExpires < Date.now()) {
      throw new AppError(
        'This verification link has expired (valid for 24 hours). Please request a new one below.',
        400
      );
    }

    // All good — verify the user
    userWithToken.isEmailVerified = true;
    userWithToken.emailVerificationToken = undefined;
    userWithToken.emailVerificationExpires = undefined;
    await userWithToken.save();

    const { accessToken, refreshToken } = generateTokens(userWithToken._id);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: userWithToken._id,
          name: userWithToken.name,
          email: userWithToken.email,
          role: userWithToken.role,
          isEmailVerified: true,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Please verify your email before logging in', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated. Contact admin.', 403);
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const { accessToken, refreshToken } = generateTokens(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          xp: user.xp,
          points: user.points,
          department: user.department,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Google OAuth callback
export const googleAuthCallback = async (req, res, next) => {
  try {
    const user = req.user;
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Redirect to frontend with tokens
    const redirectUrl = `${config.clientUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`;
    res.redirect(redirectUrl);
  } catch (error) {
    next(error);
  }
};

// Refresh token
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) throw new AppError('Refresh token required', 400);

    const blacklisted = await isTokenBlacklisted(token);
    if (blacklisted) throw new AppError('Refresh token revoked', 401);

    const decoded = jwt.verify(token, config.jwtRefreshSecret);
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new AppError('User not found', 401);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // Blacklist old refresh token
    const exp = decoded.exp - Math.floor(Date.now() / 1000);
    await blacklistToken(token, Math.max(exp, 1));

    res.status(200).json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken },
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req, res, next) => {
  try {
    const token = req.token;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.split(' ')[1] || token;

    if (accessToken) {
      const decoded = jwt.decode(accessToken);
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) await blacklistToken(accessToken, ttl);
      }
    }

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

// Get current user
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name code')
      .populate('badges', 'name icon rarity');

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) throw new AppError('User not found', 404);
    if (user.isEmailVerified) throw new AppError('Email already verified', 400);

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    await sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(200).json({ success: true, message: 'Verification email resent' });
  } catch (error) {
    next(error);
  }
};
