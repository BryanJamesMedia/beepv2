import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner, Center } from '@chakra-ui/react';
import { useSupabase } from '../contexts/SupabaseContext';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { supabase, user, session } = useSupabase();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!session) {
          navigate('/login', { replace: true });
          return;
        }

        // If roles need to be checked
        if (allowedRoles?.length) {
          // Get user's profile with role
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user?.id)
            .single();

          if (error || !profile) {
            console.error('Error fetching user role:', error);
            navigate('/login', { replace: true });
            return;
          }

          // Check if user's role is allowed
          if (!allowedRoles.includes(profile.role)) {
            // Redirect to appropriate dashboard based on role
            navigate(profile.role === 'creator' ? '/creator-dashboard' : '/member-dashboard', { replace: true });
            return;
          }
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/login', { replace: true });
      }
    };

    checkAuth();
  }, [navigate, allowedRoles, session, user, supabase]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  return children;
}

export default ProtectedRoute; 