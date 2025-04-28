'use client';
import { WalletPass, WalletPassCustomization } from '@prisma/client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Share2, Wallet } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

interface PassCardProps {
  pass: WalletPass & {
    customization?: WalletPassCustomization[];
  };
}

export default function PassCard({ pass }: PassCardProps) {
  const customization = pass.customization?.[0];
  const shouldHeaderBePresent = customization?.coverImgUrl || customization?.logoUrl;

  const copyPassUrl = (url: string | null) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Pass URL copied to clipboard',
      description: 'You can now share the pass URL with your friends',
    });
  };

  return (
    <Card className="overflow-hidden">
      {/* TODO: Figure out if there is a cleaner and better way to write the code below. */}
      {shouldHeaderBePresent && (
        <CardHeader className="relative p-0">
          {customization?.coverImgUrl && (
            <div className="relative w-full h-32 overflow-hidden">
              <Image
                src={customization.coverImgUrl}
                alt={`${pass.name} cover`}
                fill
                className="object-cover transition-transform duration-300"
              />
            </div>
          )}
          {customization?.logoUrl && (
            <div className="absolute -bottom-8 left-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden border-4">
                <Image
                  src={customization.logoUrl}
                  alt={`${pass.name} logo`}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="pt-12 pb-6">
        <div className="space-y-2">
          <h3 className="font-semibold text-xl">{pass.name}</h3>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Wallet className="w-4 h-4" />
            <span className="capitalize">{pass.type}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t px-4 py-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <Button variant="default" onClick={() => copyPassUrl(pass.url)}>
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Link href={`/passes/edit/${pass.id}`} className={buttonVariants({ variant: 'outline' })}>
            Edit
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
