import { Navigation } from '@/components/navigation';
import { auth } from '@/auth';

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation role="MEMBER" userName={session?.user?.name || undefined} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}