'use client';

import { useApiSWR, UseApiSWROptions } from '@/hooks/use-api-swr';
import { useActiveOrganization } from '@/utils/auth-client';
import type { AttachmentType } from '@db';
import { useCallback } from 'react';

// Types for attachments API
// Note: API returns dates as ISO strings, not Date objects
export interface Attachment {
  id: string;
  name: string;
  type: AttachmentType;
  url: string;
  createdAt: string; // ISO string from API
  updatedAt: string; // ISO string from API
  entityId: string;
  entityType: string;
  organizationId: string;
  commentId: string | null;
  description: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  assigneeId: string | null;
  organizationId: string;
  createdAt: string; // ISO string from API
  updatedAt: string; // ISO string from API
}

export interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    downloadUrl: string;
    createdAt: string; // ISO string from API
  }>;
  createdAt: string; // ISO string from API
}

/**
 * Hook to fetch all tasks using SWR
 */
export function useTasks(options: UseApiSWROptions<Task[]> = {}) {
  return useApiSWR<Task[]>('/v1/tasks', options);
}

/**
 * Hook to fetch a single task using SWR
 */
export function useTask(taskId: string | null, options: UseApiSWROptions<Task> = {}) {
  return useApiSWR<Task>(taskId ? `/v1/tasks/${taskId}` : null, options);
}

/**
 * Hook to fetch task attachments using SWR
 * Uses Next.js API route proxy for server-side API key injection
 */
export function useTaskAttachments(
  taskId: string | null,
  options: UseApiSWROptions<Attachment[]> = {},
) {
  return useApiSWR<Attachment[]>(taskId ? `/api/attachments/${taskId}` : null, options);
}

/**
 * Hook for task attachment actions (upload, download, delete)
 */
export function useTaskAttachmentActions(taskId: string) {
  const { data: activeOrg } = useActiveOrganization();

  const uploadAttachment = useCallback(
    (file: File): Promise<Attachment> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const orgId = activeOrg?.id;
            if (!orgId) {
              reject(new Error('Missing organization ID'));
              return;
            }

            const base64String = reader.result as string;
            const base64Data = base64String.split(',')[1]; // Remove data:image/...;base64, prefix

            // Call Next.js API route proxy (server-side API key injection)
            const response = await fetch(`/api/attachments/${taskId}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Organization-Id': orgId,
              },
              body: JSON.stringify({
                fileName: file.name,
                fileType: file.type || 'application/octet-stream',
                fileData: base64Data,
              }),
            });

            if (!response.ok) {
              const error = await response.json();
              throw new Error(error.error || 'Upload failed');
            }

            const data = await response.json();
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    },
    [taskId, activeOrg?.id],
  );

  const getDownloadUrl = useCallback(
    async (attachmentId: string) => {
      // This endpoint doesn't exist in proxy yet, but attachments already have downloadUrl
      // Can be removed or implemented if needed
      throw new Error('Use downloadUrl from attachment object instead');
    },
    [taskId],
  );

  const deleteAttachment = useCallback(
    async (attachmentId: string) => {
      const orgId = activeOrg?.id;
      if (!orgId) {
        throw new Error('Missing organization ID');
      }

      // Call Next.js API route proxy (server-side API key injection)
      const response = await fetch(`/api/attachments/${taskId}/${attachmentId}`, {
        method: 'DELETE',
        headers: {
          'X-Organization-Id': orgId,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Delete failed' }));
        throw new Error(error.error || 'Delete failed');
      }

      // DELETE returns 204 No Content - success if no error
      return { success: true, status: response.status };
    },
    [taskId, activeOrg?.id],
  );

  return {
    uploadAttachment,
    getDownloadUrl,
    deleteAttachment,
  };
}

/**
 * Enhanced hooks with optimistic updates following official SWR patterns
 */
export function useOptimisticTaskAttachments(taskId: string) {
  const { data, error, isLoading, mutate } = useTaskAttachments(taskId);
  const { uploadAttachment, deleteAttachment } = useTaskAttachmentActions(taskId);

  const optimisticUpload = useCallback(
    async (file: File) => {
      // Create optimistic attachment matching full Attachment type
      const optimisticAttachment: Attachment = {
        id: `temp-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? ('image' as any) : ('document' as any),
        url: '', // Will be populated by real response
        entityId: taskId,
        entityType: 'task' as any,
        organizationId: '',
        commentId: null,
        description: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return mutate(
        async () => {
          // Call the API and transform single item response to array format for SWR cache
          const newAttachment = await uploadAttachment(file);
          const currentAttachments = data?.data || [];

          // Replace optimistic attachment with real one, or add if not found
          const optimisticIndex = currentAttachments.findIndex(
            (att) => att.id === optimisticAttachment.id,
          );
          const updatedAttachments =
            optimisticIndex >= 0
              ? currentAttachments.map((att) =>
                  att.id === optimisticAttachment.id ? newAttachment : att,
                )
              : [...currentAttachments, newAttachment];

          return {
            data: updatedAttachments,
            status: 200,
          };
        },
        {
          optimisticData: data
            ? {
                ...data,
                data: [...(data.data || []), optimisticAttachment],
              }
            : { data: [optimisticAttachment], status: 200 },
          populateCache: true,
          revalidate: false,
          rollbackOnError: true,
        },
      );
    },
    [mutate, uploadAttachment, data],
  );

  const optimisticDelete = useCallback(
    async (attachmentId: string) => {
      return mutate(
        async () => {
          // Call the API and return updated cache data
          await deleteAttachment(attachmentId);
          const updatedAttachments = (data?.data || []).filter((att) => att.id !== attachmentId);

          return {
            data: updatedAttachments,
            status: 200,
          };
        },
        {
          optimisticData: data
            ? {
                ...data,
                data: (data.data || []).filter((att) => att.id !== attachmentId),
              }
            : undefined,
          populateCache: true,
          revalidate: false,
          rollbackOnError: true,
        },
      );
    },
    [mutate, deleteAttachment, data],
  );

  return {
    data,
    error,
    isLoading,
    mutate,
    optimisticUpload,
    optimisticDelete,
  };
}

/**
 * Legacy task comment hooks (deprecated - use generic comment hooks instead)
 * @deprecated Use useComments from '@/hooks/use-comments-api' instead
 */
export function useTaskComments(taskId: string | null, options: UseApiSWROptions<Comment[]> = {}) {
  return useApiSWR<Comment[]>(taskId ? `/v1/tasks/${taskId}/comments` : null, options);
}

// Deprecated function removed - use useCommentActions from '@/hooks/use-comments-api' instead
