import { useEffect } from 'react';
import Router, { useRouter } from 'next/router';

export function withAuth<P>(Wrapped: React.ComponentType<P>) {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();

    useEffect(() => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('token');
      if (!token) {
        const next = encodeURIComponent(router.asPath);
        Router.replace(`/login?next=${next}`);
      }
    }, [router.asPath]);

    return <Wrapped {...props} />;
  };

  return ComponentWithAuth;
}
