import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { FileStorageService, FileUploadResult } from '@/services/fileStorageService';
import { toast } from 'sonner';

interface FileUploadProps {
  bucket: 'EMAIL_ATTACHMENTS' | 'TEMPLATE_ASSETS' | 'REPORTS' | 'LOGOS';
  onUploadComplete?: (result: FileUploadResult) => void;
  onUploadError?: (error: string) => void;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
  path?: string;
}

interface UploadingFile {
  file: File;
  progress: number;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  bucket,
  onUploadComplete,
  onUploadError,
  accept = "*/*",
  maxSize = 10 * 1024 * 1024, // 10MB default
  multiple = false,
  className = "",
  path
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsDragging(false);
    
    // Initialize uploading files
    const newUploadingFiles = acceptedFiles.map(file => ({
      file,
      progress: 0
    }));
    
    setUploadingFiles(newUploadingFiles);

    // Upload files sequentially
    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      
      try {
        // Update progress to show upload starting
        setUploadingFiles(prev => 
          prev.map((uf, index) => 
            index === i ? { ...uf, progress: 10 } : uf
          )
        );

        const result = await FileStorageService.uploadFile(file, bucket, path);
        
        // Update progress to show completion
        setUploadingFiles(prev => 
          prev.map((uf, index) => 
            index === i ? { ...uf, progress: 100 } : uf
          )
        );

        if (result.success) {
          toast.success(`${file.name} uploaded successfully`);
          onUploadComplete?.(result);
        } else {
          const error = result.error || 'Upload failed';
          setUploadingFiles(prev => 
            prev.map((uf, index) => 
              index === i ? { ...uf, error } : uf
            )
          );
          toast.error(`Failed to upload ${file.name}: ${error}`);
          onUploadError?.(error);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        setUploadingFiles(prev => 
          prev.map((uf, index) => 
            index === i ? { ...uf, error: errorMessage } : uf
          )
        );
        toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
        onUploadError?.(errorMessage);
      }
    }

    // Clear uploading files after a delay
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);
  }, [bucket, path, onUploadComplete, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept ? { [accept]: [] } : undefined,
    maxSize,
    multiple,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false)
  });

  const removeUploadingFile = (index: number) => {
    setUploadingFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive || isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            
            {isDragActive ? (
              <div>
                <p className="text-lg font-medium">Drop files here...</p>
                <p className="text-sm text-muted-foreground">Release to upload</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium">Drag & drop files here</p>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to select files
                </p>
                <Button variant="outline">
                  Choose Files
                </Button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              Max file size: {(maxSize / 1024 / 1024).toFixed(1)}MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              {uploadingFiles.map((uploadingFile, index) => (
                <div key={index} className="flex items-center gap-3">
                  <File className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadingFile.file.name}
                    </p>
                    
                    {uploadingFile.error ? (
                      <Alert className="mt-1">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          {uploadingFile.error}
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="mt-1">
                        <Progress value={uploadingFile.progress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {uploadingFile.progress === 100 ? 'Complete' : `${uploadingFile.progress}%`}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeUploadingFile(index)}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};