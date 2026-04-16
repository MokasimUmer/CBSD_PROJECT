/**
 * @creator-platform/ui
 *
 * Reusable React UI component library for the Modular Creator Platform.
 *
 * This package provides:
 * - Button  — Primary, Secondary, Ghost, Danger variants with loading state
 * - Input   — Text inputs with labels, errors, helper text, and addons
 * - Card    — Container with default, elevated, outlined, and glass variants
 * - Modal   — Dialog overlay with backdrop, escape-key, and scroll lock
 * - Avatar  — Image avatar with initials fallback and status dot
 * - Badge   — Labels, notification counts, and status dots
 * - Layout  — Navbar, Sidebar, Footer, PageWrapper
 *
 * Design Principles:
 * - Reusability: every component is self-contained and prop-driven
 * - Separation of Concerns: UI logic lives here, never business logic
 * - High Cohesion: each component folder groups its code together
 *
 * Design Pattern: COMPONENT PATTERN
 */

// ─── Button ──────────────────────────────────────────────────────────
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize } from './Button';

// ─── Input ───────────────────────────────────────────────────────────
export { Input, type InputProps, type InputSize } from './Input';

// ─── Card ────────────────────────────────────────────────────────────
export { Card, type CardProps, type CardVariant } from './Card';

// ─── Modal ───────────────────────────────────────────────────────────
export { Modal, type ModalProps, type ModalSize } from './Modal';

// ─── Avatar ──────────────────────────────────────────────────────────
export { Avatar, type AvatarProps, type AvatarSize, type AvatarStatus } from './Avatar';

// ─── Badge ───────────────────────────────────────────────────────────
export { Badge, type BadgeProps, type BadgeVariant, type BadgeSize } from './Badge';

// ─── Layout ──────────────────────────────────────────────────────────
export { Navbar, type NavbarProps } from './Layout';
export { Sidebar, type SidebarProps } from './Layout';
export { Footer, type FooterProps } from './Layout';
export { PageWrapper, type PageWrapperProps } from './Layout';
