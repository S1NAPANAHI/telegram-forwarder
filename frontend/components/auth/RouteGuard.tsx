import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(router.asPath);
      router.replace(`/login?next=${next}`);
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (!user) return null;
  return <>{children}</>;
}
