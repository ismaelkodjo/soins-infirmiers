import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, ImageIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ImageDropZoneProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  bucket?: string;
}

const ImageDropZone = ({ value, onChange, folder = "uploads", bucket = "blog-images" }: ImageDropZoneProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Fichier invalide", description: "Veuillez sélectionner une image.", variant: "destructive" });
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file);
    if (error) {
      toast({ title: "Erreur upload", description: error.message, variant: "destructive" });
    } else {
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(urlData.publicUrl);
    }
    setUploading(false);
  }, [folder, bucket, onChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, [uploadFile]);

  return (
    <div>
      <label className="text-sm font-medium text-foreground">Image à la Une</label>
      <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`mt-1 cursor-pointer rounded-lg border-2 border-dashed transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : value
              ? "border-border"
              : "border-muted-foreground/25 hover:border-primary/50"
        }`}
      >
        {value ? (
          <div className="relative">
            <img src={value} alt="Aperçu" className="w-full h-36 object-cover rounded-lg" />
            {uploading && (
              <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-lg">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <div className="absolute bottom-2 right-2">
              <Button type="button" variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }} disabled={uploading}>
                <Upload className="h-3.5 w-3.5 mr-1" /> Changer
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            {uploading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploading ? "Upload en cours..." : "Glissez-déposez une image ici"}
            </p>
            {!uploading && (
              <p className="text-xs text-muted-foreground/70 mt-1">ou cliquez pour parcourir</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageDropZone;
