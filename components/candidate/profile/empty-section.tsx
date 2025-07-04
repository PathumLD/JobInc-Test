// components/candidate/profile/empty-section.tsx
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';

interface EmptySectionProps {
  title: string;
  description: string;
  addHref: string;
  buttonText: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function EmptySection({
  title,
  description,
  addHref,
  buttonText,
  icon: Icon
}: EmptySectionProps) {
  return (
    <div className="text-center py-8 px-4">
      {/* Icon */}
      {Icon && (
        <div className="flex justify-center mb-4">
          <Icon className="h-12 w-12 text-gray-300" />
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <p className="text-gray-600 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
        
        {/* Add Button */}
        <div className="pt-2">
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={addHref}>
              <Plus className="h-4 w-4 mr-2" />
              {buttonText}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}