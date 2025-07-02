import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

interface CVUploadFormProps {
  onDataExtracted: (data: any) => void;
  userId: string;
}

export default function CVUploadForm({ onDataExtracted, userId }: CVUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
      } else {
        toast.error('Please upload a PDF or DOCX file');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);

    try {
      const response = await fetch('/api/ai/process-cv', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process CV');
      }

      const data = await response.json();
      onDataExtracted(data.extractedData);
      toast.success('CV processed successfully!');
    } catch (error) {
      console.error('Error uploading CV:', error);
      toast.error('Failed to process CV. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Upload Your CV</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="min-w-[120px]"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Upload your CV in PDF or DOCX format to automatically fill your profile information.
        </p>
      </div>
    </div>
  );
} 