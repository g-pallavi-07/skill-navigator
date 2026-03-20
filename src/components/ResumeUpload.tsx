import { useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
  file: File | null;
}

export function ResumeUpload({ onFileSelect, file }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      onFileSelect(droppedFile);
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-300",
        isDragging
          ? "border-primary bg-primary/5 scale-[1.01]"
          : file
          ? "border-success/40 bg-success/5"
          : "border-border hover:border-primary/40 hover:bg-primary/[0.02]"
      )}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileSelect(f);
        }}
      />
      {file ? (
        <div className="flex items-center justify-center gap-3">
          <FileText className="h-6 w-6 text-success" />
          <span className="font-medium">{file.name}</span>
          <span className="text-sm text-muted-foreground">
            ({(file.size / 1024).toFixed(1)} KB)
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onFileSelect(null as any)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Upload className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Drop your resume here</p>
            <p className="text-sm text-muted-foreground">PDF format, up to 20MB</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
            Browse Files
          </Button>
        </div>
      )}
    </div>
  );
}