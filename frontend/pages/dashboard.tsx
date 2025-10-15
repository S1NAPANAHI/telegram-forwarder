import Dashboard from './dashboard-improved';
import RouteGuard from '../components/auth/RouteGuard';

export default function ProtectedDashboard() {
  return (
    <RouteGuard>
      <Dashboard />
    </RouteGuard>
  );
}
