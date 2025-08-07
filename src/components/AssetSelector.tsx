import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileUpload } from './FileUpload';
import { FileStorageService, StorageFile } from '@/services/fileStorageService';
import { useToast } from '@/hooks/use-toast';
import { 
  File, 
  FileImage, 
  FileText, 
  Archive, 
  Download,
  Trash2,
  Check
} from 'lucide-react';

interface AssetSelectorProps {
  bucket: 'EMAIL_ATTACHMENTS' | 'TEMPLATE_ASSETS' | 'REPORTS' | 'LOGOS';
  title: string;
  folder?: string;
  allowUpload?: boolean;
  acceptedTypes?: string;
  maxFileSize?: number;
  selectedAssets: string[];
  onAssetSelect: (url: string) => void;
}

export const AssetSelector: React.FC<AssetSelectorProps> = ({
  bucket,
  title,
  folder,
  allowUpload = true,
  acceptedTypes,
  maxFileSize,
  selectedAssets,
  onAssetSelect,
}) => {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadFiles();
  }, [bucket, folder]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const result = await FileStorageService.listFiles(bucket, folder);
      setFiles(result);
    } catch (error) {
      console.error('Error loading files:', error);
      toast({
        title: "Error",
        description: "Failed to load files",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (result: any) => {
    if (result.success) {
      loadFiles();
      toast({
        title: "Upload Success",
        description: "File uploaded successfully",
      });
    }
  };

  const handleDelete = async (file: StorageFile) => {
    if (window.confirm(`Are you sure you want to delete ${file.name}?`)) {
      try {
        await FileStorageService.deleteFile(bucket, file.name);
        loadFiles();
        toast({
          title: "File Deleted",
          description: `${file.name} has been deleted`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete file",
          variant: "destructive",
        });
      }
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return <FileImage className="h-4 w-4" />;
      case 'pdf':
      case 'doc':
      case 'docx':
        return <FileText className="h-4 w-4" />;
      case 'zip':
      case 'rar':
        return <Archive className="h-4 w-4" />;
      default:
        return <File className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const convertToMimeTypes = (extensions?: string): string => {
    if (!extensions) return "*/*";
    
    const mimeMap: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.xls': 'application/vnd.ms-excel',
      '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      '.zip': 'application/zip',
      '.rar': 'application/vnd.rar',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      'image/*': 'image/*'
    };

    if (extensions.includes('image/*')) {
      return 'image/*';
    }

    const extensionList = extensions.split(',').map(ext => ext.trim());
    const mimeTypes = extensionList.map(ext => mimeMap[ext] || ext).filter(Boolean);
    
    return mimeTypes.length > 0 ? mimeTypes.join(',') : "*/*";
  };

  const isSelected = (fileUrl: string) => selectedAssets.includes(fileUrl);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {allowUpload && (
          <FileUpload
            bucket={bucket}
            accept={convertToMimeTypes(acceptedTypes)}
            maxSize={maxFileSize}
            path={folder}
            onUploadComplete={handleUploadComplete}
          />
        )}

        {loading ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading files...</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <File className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No files uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-medium">Available Files ({files.length})</p>
            <div className="grid gap-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                    isSelected(file.url || '') 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={isSelected(file.url || '')}
                      onCheckedChange={() => onAssetSelect(file.url || '')}
                    />
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getFileIcon(file.name)}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size || 0)} • {' '}
                          {file.createdAt ? new Date(file.createdAt).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {isSelected(file.url || '') && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Selected
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(file.url, '_blank')}
                      title="Download/View"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedAssets.length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">
                  Selected Assets ({selectedAssets.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedAssets.map((url, index) => {
                    const fileName = url.split('/').pop() || `Asset ${index + 1}`;
                    return (
                      <Badge key={url} variant="secondary" className="text-xs">
                        {fileName}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};