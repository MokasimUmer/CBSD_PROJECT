import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserRepository, UserRole, IUserDocument } from '@creator-platform/db';
import {
  RegisterDTO,
  LoginDTO,
  AuthResult,
  DecodedToken,
  DecodedRefreshToken,
  AuthConfig,
  AuthErrorCode,
  DEFAULT_AUTH_CONFIG,
} from './auth.types';

/**
 * Auth Service
 *
 * Encapsulates all authentication business logic:
 * - Registration (hash password → persist user → issue tokens)
 * - Login (verify credentials → issue tokens)
 * - Token verification & refresh
 * - Logout (stateless — client discards tokens)
 *
 * Design Pattern: SERVICE PATTERN
 *   Business logic lives here; persistence is delegated to
 *   UserRepository (from packages/db). This service never
 *   imports Mongoose directly.
 *
 * Design Pattern: MIDDLEWARE PATTERN (consumed by auth.middleware.ts)
 *   Produces JWTs that the middleware layer verifies on every
 *   protected request.
 */
export class AuthService {
  private userRepo: UserRepository;
  private config: AuthConfig;

  constructor(config?: Partial<AuthConfig>) {
    this.userRepo = new UserRepository();
    this.config = { ...DEFAULT_AUTH_CONFIG, ...config };
  }

  // ─── Registration ────────────────────────────────────────────────

  /**
   * Register a new user.
   *
   * Steps:
   *  1. Check uniqueness of email
   *  2. Hash the password with bcrypt
   *  3. Persist the user via UserRepository
   *  4. Return AuthResult (user + tokens)
   *
   * @throws Error with code AUTH_EMAIL_EXISTS if email is taken
   */
  async register(dto: RegisterDTO): Promise<AuthResult> {
    // 1. Uniqueness check
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      const error = new Error('A user with this email already exists');
      (error as any).code = AuthErrorCode.EMAIL_ALREADY_EXISTS;
      (error as any).statusCode = 409;
      throw error;
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(dto.password, this.config.saltRounds);

    // 3. Persist
    const user = await this.userRepo.create({
      email: dto.email.toLowerCase().trim(),
      passwordHash,
      role: dto.role || UserRole.FAN,
      profile: {
        displayName: dto.displayName,
      },
    } as Partial<IUserDocument>);

    // 4. Issue tokens
    return this.buildAuthResult(user);
  }

  // ─── Login ───────────────────────────────────────────────────────

  /**
   * Authenticate a user with email + password.
   *
   * @throws Error with code AUTH_INVALID_CREDENTIALS on mismatch
   * @throws Error with code AUTH_ACCOUNT_DEACTIVATED if account inactive
   */
  async login(dto: LoginDTO): Promise<AuthResult> {
    // Find user (including passwordHash — we need it for comparison)
    const user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      const error = new Error('Invalid email or password');
      (error as any).code = AuthErrorCode.INVALID_CREDENTIALS;
      (error as any).statusCode = 401;
      throw error;
    }

    // Account active?
    if (!user.isActive) {
      const error = new Error('This account has been deactivated');
      (error as any).code = AuthErrorCode.ACCOUNT_DEACTIVATED;
      (error as any).statusCode = 403;
      throw error;
    }

    // Verify password
    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      const error = new Error('Invalid email or password');
      (error as any).code = AuthErrorCode.INVALID_CREDENTIALS;
      (error as any).statusCode = 401;
      throw error;
    }

    // Update last login timestamp (fire-and-forget)
    this.userRepo.updateLastLogin(user.id).catch(() => {
      /* non-critical — swallow errors */
    });

    return this.buildAuthResult(user);
  }

  // ─── Token verification ──────────────────────────────────────────

  /**
   * Verify and decode an access token.
   *
   * @throws Error with code AUTH_TOKEN_INVALID / AUTH_TOKEN_EXPIRED
   */
  verifyAccessToken(token: string): DecodedToken {
    try {
      return jwt.verify(token, this.config.jwtSecret) as DecodedToken;
    } catch (err: any) {
      const error = new Error(
        err.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid access token'
      );
      (error as any).code =
        err.name === 'TokenExpiredError'
          ? AuthErrorCode.TOKEN_EXPIRED
          : AuthErrorCode.TOKEN_INVALID;
      (error as any).statusCode = 401;
      throw error;
    }
  }

  /**
   * Verify and decode a refresh token.
   *
   * @throws Error with code AUTH_REFRESH_TOKEN_INVALID
   */
  verifyRefreshToken(token: string): DecodedRefreshToken {
    try {
      const decoded = jwt.verify(token, this.config.jwtRefreshSecret) as DecodedRefreshToken;
      if (decoded.type !== 'refresh') {
        throw new Error('Not a refresh token');
      }
      return decoded;
    } catch {
      const error = new Error('Invalid or expired refresh token');
      (error as any).code = AuthErrorCode.REFRESH_TOKEN_INVALID;
      (error as any).statusCode = 401;
      throw error;
    }
  }

  // ─── Token refresh ───────────────────────────────────────────────

  /**
   * Issue a new access + refresh token pair from a valid refresh token.
   *
   * Steps:
   *  1. Verify the refresh token
   *  2. Confirm the user still exists and is active
   *  3. Issue fresh tokens
   */
  async refreshToken(refreshToken: string): Promise<AuthResult> {
    const decoded = this.verifyRefreshToken(refreshToken);

    const user = await this.userRepo.findById(decoded.userId);
    if (!user || !user.isActive) {
      const error = new Error('User not found or account deactivated');
      (error as any).code = AuthErrorCode.REFRESH_TOKEN_INVALID;
      (error as any).statusCode = 401;
      throw error;
    }

    return this.buildAuthResult(user);
  }

  // ─── Logout ──────────────────────────────────────────────────────

  /**
   * Logout is stateless in a pure-JWT architecture.
   * The client simply discards the tokens.
   *
   * In a production system you would add the token's `jti` to a
   * revocation list (Redis set) here.  For now this is a no-op that
   * returns a success flag.
   */
  async logout(_userId: string): Promise<{ success: boolean }> {
    // Future: add token to revocation list
    return { success: true };
  }

  // ─── Get current user ────────────────────────────────────────────

  /**
   * Retrieve the full user document for a decoded token.
   * Useful for profile endpoints.
   */
  async getCurrentUser(userId: string): Promise<IUserDocument | null> {
    return this.userRepo.findById(userId);
  }

  // ─── Private helpers ─────────────────────────────────────────────

  /**
   * Generate access + refresh tokens and assemble AuthResult.
   */
  private buildAuthResult(user: IUserDocument): AuthResult {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: user.profile.displayName,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Sign a short-lived access token.
   */
  private generateAccessToken(user: IUserDocument): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, this.config.jwtSecret, {
      expiresIn: this.config.accessTokenExpiry as any,
    });
  }

  /**
   * Sign a long-lived refresh token.
   */
  private generateRefreshToken(user: IUserDocument): string {
    const payload = {
      userId: user.id,
      type: 'refresh' as const,
    };
    return jwt.sign(payload, this.config.jwtRefreshSecret, {
      expiresIn: this.config.refreshTokenExpiry as any,
    });
  }
}
