import { Redirect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { LoadingScreen } from '../components/LoadingScreen';
import { ROUTES } from '../constants/routes';

export default function Index() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <Redirect href={session ? ROUTES.MAIN : ROUTES.LOGIN} />;
}
