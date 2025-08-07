import { supabase } from "@/integrations/supabase/client";

export interface FileUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

export interface StorageFile {
  name: string;
  url: string;
  path: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

export class FileStorageService {
  private static readonly BUCKETS = {
    EMAIL_ATTACHMENTS: 'email-attachments',
    TEMPLATE_ASSETS: 'template-assets',
    REPORTS: 'reports',
    LOGOS: 'logos'
  };

  // Upload file to specific bucket
  static async uploadFile(
    file: File, 
    bucket: keyof typeof FileStorageService.BUCKETS,
    path?: string
  ): Promise<FileUploadResult> {
    try {
      const bucketName = this.BUCKETS[bucket];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      // Create user-specific path for private buckets
      const isPrivateBucket = bucket === 'EMAIL_ATTACHMENTS' || bucket === 'REPORTS';
      
      // Generate unique filename to avoid conflicts
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileExtension = file.name.split('.').pop() || '';
      const uniqueFileName = `${file.name.replace(/\.[^/.]+$/, '')}_${timestamp}_${randomId}.${fileExtension}`;
      
      const filePath = isPrivateBucket 
        ? `${user.id}/${path ? `${path}/` : ''}${uniqueFileName}`
        : `${path ? `${path}/` : ''}${uniqueFileName}`;

      console.log('Uploading file to path:', filePath);

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true // Allow overwriting if needed
        });

      if (error) {
        console.error('Upload error:', error);
        return { success: false, error: error.message };
      }

      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      return {
        success: true,
        url: urlData.publicUrl,
        path: data.path
      };

    } catch (error) {
      console.error('Unexpected upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      };
    }
  }

  // List files in bucket
  static async listFiles(
    bucket: keyof typeof FileStorageService.BUCKETS,
    folder?: string
  ): Promise<StorageFile[]> {
    try {
      const bucketName = this.BUCKETS[bucket];
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      // For private buckets, list only user's files
      const isPrivateBucket = bucket === 'EMAIL_ATTACHMENTS' || bucket === 'REPORTS';
      const listPath = isPrivateBucket 
        ? (folder ? `${user.id}/${folder}` : user.id)
        : (folder || '');

      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(listPath, {
          limit: 100,
          offset: 0
        });

      if (error) {
        console.error('List files error:', error);
        return [];
      }

      return data
        .filter(item => !item.name.endsWith('/')) // Filter out folders
        .map(item => {
          const fullPath = listPath ? `${listPath}/${item.name}` : item.name;
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fullPath);

          return {
            name: item.name,
            url: urlData.publicUrl,
            path: fullPath,
            size: item.metadata?.size || 0,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          };
        });

    } catch (error) {
      console.error('Error listing files:', error);
      return [];
    }
  }

  // Delete file
  static async deleteFile(
    bucket: keyof typeof FileStorageService.BUCKETS,
    path: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const bucketName = this.BUCKETS[bucket];
      
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };

    } catch (error) {
      console.error('Unexpected delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Delete failed'
      };
    }
  }

  // Generate signed URL for private file access
  static async getSignedUrl(
    bucket: keyof typeof FileStorageService.BUCKETS,
    path: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<{ url?: string; error?: string }> {
    try {
      const bucketName = this.BUCKETS[bucket];
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Signed URL error:', error);
        return { error: error.message };
      }

      return { url: data.signedUrl };

    } catch (error) {
      console.error('Unexpected signed URL error:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to generate signed URL'
      };
    }
  }

  // Upload email attachment
  static async uploadEmailAttachment(file: File, campaignId?: string): Promise<FileUploadResult> {
    const path = campaignId ? `${campaignId}/${file.name}` : file.name;
    return this.uploadFile(file, 'EMAIL_ATTACHMENTS', path);
  }

  // Upload template asset (logo, image)
  static async uploadTemplateAsset(file: File, templateId?: string): Promise<FileUploadResult> {
    const path = templateId ? `templates/${templateId}/${file.name}` : `assets/${file.name}`;
    return this.uploadFile(file, 'TEMPLATE_ASSETS', path);
  }

  // Upload logo
  static async uploadLogo(file: File, organizationId?: string): Promise<FileUploadResult> {
    const path = organizationId ? `${organizationId}/${file.name}` : file.name;
    return this.uploadFile(file, 'LOGOS', path);
  }

  // Save report file
  static async saveReport(file: File, reportType: string): Promise<FileUploadResult> {
    const timestamp = new Date().toISOString().split('T')[0];
    const path = `${reportType}/${timestamp}/${file.name}`;
    return this.uploadFile(file, 'REPORTS', path);
  }
}