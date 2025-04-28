import Link from 'next/link';
import React from 'react';
import { Button, buttonVariants } from './ui/button';

interface PageHeaderProps {
  title: string;
  description?: string;
  buttonLabel: string;
  href?: string;
  onClick?: () => void;
}

export default function PageHeader({
  title,
  description,
  buttonLabel,
  href,
  onClick,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-4 border-b border-gray-200">
      <div className="space-y-1">
        <h1 className="text-xl font-bold ">{title}</h1>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {onClick ? (
        <Button onClick={onClick}>{buttonLabel}</Button>
      ) : (
        <Link className={buttonVariants({ variant: 'default' })} href={href || '#'}>
          {buttonLabel}
        </Link>
      )}
    </div>
  );
}
