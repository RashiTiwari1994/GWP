import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Cropper from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import Image from 'next/image';
import { validateImage } from '@/lib/image-validation';
import { toast } from '@/hooks/use-toast';
import { Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploadProps {
  onImageSelected: (file: File, croppedImageUrl: string) => void;
  previewUrl?: string;
  label: string;
  isLoading?: boolean;
}

interface CroppedArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageUpload({
  onImageSelected,
  previewUrl,
  label,
  isLoading = false,
}: ImageUploadProps) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CroppedArea | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCropping, setIsCropping] = useState(false);

  useEffect(() => {
    if (!isLoading && isCropping) {
      setIsDialogOpen(false);
      setIsCropping(false);
    }
  }, [isLoading, isCropping]);

  const onCropComplete = useCallback((croppedArea: CroppedArea, croppedAreaPixels: CroppedArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      const validationError = validateImage(file);
      if (validationError) {
        toast({
          title: 'Error',
          description: validationError.message,
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setIsDialogOpen(true);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const fileInput = document.getElementById(`${label}-upload`) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  };
  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = document.createElement('img');
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error: ErrorEvent) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CroppedArea
  ): Promise<{ file: File; url: string }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        const file = new File([blob], 'cropped-image.jpg', {
          type: 'image/jpeg',
        });
        const url = URL.createObjectURL(blob);
        resolve({ file, url });
      }, 'image/jpeg');
    });
  };
  const handleCropSave = async () => {
    if (!image || !croppedAreaPixels) return;

    try {
      const { file, url } = await getCroppedImg(image, croppedAreaPixels);

      const validationError = validateImage(file);
      if (validationError) {
        toast({
          title: 'Error',
          description: validationError.message,
          variant: 'destructive',
        });

        return;
      }

      setIsCropping(true);
      onImageSelected(file, url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cropping image';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      console.error('Error cropping image:', error);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div
            className={`
                            relative h-14 
                            ${label === 'Logo' ? 'aspect-square' : 'aspect-video'} 
                            rounded-lg 
                            transition-all 
                            duration-200 
                            ${!isLoading ? 'hover:bg-gray-50/50 cursor-pointer' : 'cursor-wait'} 
                            overflow-hidden
                        `}
            onClick={!isLoading ? handleFileInputClick : undefined}
          >
            {previewUrl ? (
              <div className="relative w-full h-full group">
                <Image src={previewUrl} alt={`${label} preview`} className="object-cover" fill />
                {!isLoading && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="text-white text-center">
                      <Upload className="w-6 h-6 mx-auto mb-2" />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative group flex flex-col h-full items-center border border-dashed border-gray-300 rounded-lg justify-center p-2">
                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="text-white text-center">
                    <Upload className="w-6 h-6 mx-auto mb-2" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <input
            type="file"
            id={`${label}-upload`}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          if (isLoading && !open) return;
          setIsDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isLoading ? `Uploading ${label}...` : `Crop ${label}`}</DialogTitle>
          </DialogHeader>
          <div className="relative h-[300px] w-full bg-gray-100 rounded-lg overflow-hidden">
            {image && (
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={label === 'Logo' ? 1 : 16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10">
                <div className="bg-white rounded-lg p-4 flex flex-col items-center shadow-lg">
                  <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
                  <span className="text-sm font-medium">Uploading {label}...</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Zoom:</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                className="flex-1"
                onValueChange={(value) => setZoom(value[0])}
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleCropSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
