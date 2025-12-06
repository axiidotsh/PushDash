import { Cloud } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-2 flex justify-center">
              <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-lg">
                <Cloud className="h-5 w-5" />
              </div>
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
        <p className="text-muted-foreground mt-6 text-center text-xs">
          PushDash — Push files from terminal to cloud
        </p>
      </div>
    </div>
  );
}
