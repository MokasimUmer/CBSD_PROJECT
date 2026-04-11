import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * User Model
 *
 * Represents a platform user who can be either a 'creator' or a 'fan'.
 * Creators publish content; fans subscribe and consume content.
 *
 * Responsibility: Data persistence for user accounts and profiles.
 */

// ─── Types ───────────────────────────────────────────────────────────

export enum UserRole {
  FAN = 'fan',
  CREATOR = 'creator',
  ADMIN = 'admin',
}

export interface IUserProfile {
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface IUser {
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: IUserProfile;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}

// ─── Schema ──────────────────────────────────────────────────────────

const UserProfileSchema = new Schema<IUserProfile>(
  {
    displayName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
  },
  { _id: false }
);

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.FAN,
    },
    profile: {
      type: UserProfileSchema,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // auto createdAt & updatedAt
    toJSON: {
      transform(_doc: any, ret: any) {
        delete ret.passwordHash; // Never expose password hash in JSON
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ─── Model ───────────────────────────────────────────────────────────

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
