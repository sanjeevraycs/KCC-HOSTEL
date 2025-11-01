import { MainLayout } from '@/components/layout/MainLayout';
import { Card } from '@/components/ui/card';

export default function Settings() {
  return (
    <MainLayout title="Settings">
      <div className="container space-y-6 px-4 py-6">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Settings feature coming soon</p>
        </Card>
      </div>
    </MainLayout>
  );
}
