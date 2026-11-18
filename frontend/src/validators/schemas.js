const { z } = require('zod');

const STATUSES = ['upcoming', 'success', 'failed', 'delayed'];

// ---------- Auth ----------
const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(255),
  // bcrypt only uses the first 72 bytes, so we cap the length there
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ---------- Launches ----------
const launchFields = {
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
  rocket: z.string().trim().min(2).max(100),
  agency: z.string().trim().min(2).max(100),
  launchSite: z.string().trim().min(2).max(150),
  launchDate: z.coerce.date({ errorMap: () => ({ message: 'launchDate must be a valid date' }) }),
  status: z.enum(STATUSES, {
    errorMap: () => ({ message: `status must be one of: ${STATUSES.join(', ')}` }),
  }),
  description: z.string().trim().max(2000),
};

const createLaunchSchema = z.object({
  ...launchFields,
  status: launchFields.status.default('upcoming'),
  description: launchFields.description.default(''),
});

const updateLaunchSchema = z
  .object(launchFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

const launchQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  status: z.enum(STATUSES).optional(),
});

// ---------- Watchlist ----------
const addWatchlistSchema = z.object({
  launchId: z.coerce.number().int().positive('launchId must be a positive number'),
});

const updateNoteSchema = z.object({
  note: z.string().trim().max(1000, 'Note can be at most 1000 characters'),
});

// ---------- Shared ----------
const idParamSchema = z.object({
  id: z.coerce.number().int().positive('id must be a positive number'),
});

module.exports = {
  registerSchema,
  loginSchema,
  createLaunchSchema,
  updateLaunchSchema,
  launchQuerySchema,
  addWatchlistSchema,
  updateNoteSchema,
  idParamSchema,
};
