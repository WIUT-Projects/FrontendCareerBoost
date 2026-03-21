import { useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadFile } from '@/services/blogService';
import { resolveMediaUrl } from '@/lib/utils';

interface CoverImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  disabled?: boolean;
  session?: { access_token: string } | null;
}

export function CoverImageUpload({
  value,
  onChange,
  label = 'Cover Image',
  disabled = false,
  session,
}: CoverImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!session) return;
    if (!file.type.startsWith('image/')) {
      setError('Only images are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('File must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const url = await uploadFile(session.access_token, file);
      onChange(url);
    } catch {
      setError('Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-3">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-border bg-muted/30 hover:border-primary/50'
            } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              disabled={disabled || uploading}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            <div className="flex flex-col items-center gap-2">
              <div className={`rounded-full p-3 ${dragActive ? 'bg-primary/10' : 'bg-muted'}`}>
                <Upload className={`h-6 w-6 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="font-medium text-sm">
                  {uploading ? 'Uploading...' : 'Drop image here or click to browse'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">{error}</div>
          )}
        </TabsContent>

        <TabsContent value="url" className="space-y-3">
          <Input
            placeholder="https://example.com/image.jpg"
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
          />
        </TabsContent>
      </Tabs>

      {value && (
        <div className="relative rounded-lg overflow-hidden bg-muted">
          <img src={resolveMediaUrl(value)} alt="Preview" className="w-full h-40 object-cover" onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = 'none';
          }} />
          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-background/80 backdrop-blur-sm hover:bg-background transition-colors"
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
