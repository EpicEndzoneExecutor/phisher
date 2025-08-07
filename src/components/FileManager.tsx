import React, { useEffect, useState } from 'react';
import { Trash2, Download, Eye, FileText, Image, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileStorageService, StorageFile } from '@/services/fileStorageService';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';

interface FileManagerProps {
  bucket: 'EMAIL_ATTACHMENTS' | 'TEMPLATE_ASSETS' | 'REPORTS' | 'LOGOS';
  title: string;
  folder?: string;
  allowUpload?: boolean;
  acceptedTypes?: string;
  maxFileSize?: number;
}

export const FileManager: React.FC<FileManagerProps> = ({
  bucket,
  title,
  folder,
  allowUpload = true,
  acceptedTypes = "*/*",
  maxFileSize = 10 * 1024 * 1024
}) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFiles = async () => {
    setLoading(true);
    try {
      const fileList = await FileStorageService.listFiles(bucket, folder);
      setFiles(fileList);
    } catch (error) {
      console.error('Error loading files:', error);
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [bucket, folder]);

  const handleUploadComplete = () => {
    loadFiles(); // Refresh file list
  };

  const handleDelete = async (file: StorageFile) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) {
      return;
    }

    const result = await FileStorageService.deleteFile(bucket, file.path);
    if (result.success) {
      toast.success('File deleted successfully');
      loadFiles(); // Refresh file list
    } else {
      toast.error(`Failed to delete file: ${result.error}`);
    }
  };

  const handleDownload = (file: StorageFile) => {
    window.open(file.url, '_blank');
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4" />;
    }
    
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension || '')) {
      return <Archive className="h-4 w-4" />;
    }
    
    return <FileText className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getBucketDisplayName = (bucket: string) => {
    switch (bucket) {
      case 'EMAIL_ATTACHMENTS': return 'Email Attachments';
      case 'TEMPLATE_ASSETS': return 'Template Assets';
      case 'REPORTS': return 'Reports';
      case 'LOGOS': return 'Logos';
      default: return bucket;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {title}
            <Badge variant="outline">
              {getBucketDisplayName(bucket)}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {allowUpload && (
            <FileUpload
              bucket={bucket}
              onUploadComplete={handleUploadComplete}
              accept={acceptedTypes}
              maxSize={maxFileSize}
              multiple={true}
              path={folder}
            />
          )}

          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading files...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No files found</p>
              {allowUpload && (
                <p className="text-sm text-muted-foreground mt-2">
                  Upload files using the area above
                </p>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file, index) => (
                  <TableRow key={index}>
                    <TableCell className="flex items-center gap-2">
                      {getFileIcon(file.name)}
                      <span className="font-medium">{file.name}</span>
                    </TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell>
                      {file.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};