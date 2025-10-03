import { z } from "zod";

// Integration result processing schema
export const integrationResultSchema = z.object({
  integration: z.object({
    id: z.string(),
    name: z.string(),
    integration_id: z.string(),
    settings: z.any(),
    user_settings: z.any(),
    organization: z.object({
      id: z.string(),
      name: z.string(),
    }),
  }),
});

// Email notification schema
export const emailNotificationSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  body: z.string(),
  templateId: z.string().optional(),
  variables: z.record(z.any()).optional(),
});

// File processing schema
export const fileProcessingSchema = z.object({
  fileId: z.string(),
  s3Key: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  processingType: z.enum(["scan", "extract", "validate"]),
});

// Device fleet management schema
export const deviceFleetSchema = z.object({
  organizationId: z.string(),
  deviceIds: z.array(z.string()),
  action: z.enum(["create_label", "update_status", "sync_data"]),
  metadata: z.record(z.any()).optional(),
});

// Scheduled scraping schema
export const scrapingSchema = z.object({
  targetUrl: z.string().url(),
  organizationId: z.string(),
  scrapingType: z.enum(["compliance", "security", "policy"]),
  schedule: z.string().optional(),
});

export type IntegrationResultPayload = z.infer<typeof integrationResultSchema>;
export type EmailNotificationPayload = z.infer<typeof emailNotificationSchema>;
export type FileProcessingPayload = z.infer<typeof fileProcessingSchema>;
export type DeviceFleetPayload = z.infer<typeof deviceFleetSchema>;
export type ScrapingPayload = z.infer<typeof scrapingSchema>;
