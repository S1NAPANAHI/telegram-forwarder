import { useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

export function withAuth<P>(Wrapped: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
      if (loading) return; // wait until session bootstrap completes
      if (!user) {
        const next = encodeURIComponent(router.asPath);
        Router.replace(`/login?next=${next}`);
      }
    }, [loading, user, router.asPath]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="spinner w-8 h-8" />
        </div>
      );
    }

    if (!user) return null; // Redirecting

    return <Wrapped {...props} />;
  };

  return ComponentWithAuth;
}
