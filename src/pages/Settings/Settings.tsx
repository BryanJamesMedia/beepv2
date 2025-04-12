import { Box, Spinner, Center } from '@chakra-ui/react';
import { useSupabase } from '../../contexts/SupabaseContext';
import CreatorSettings from './CreatorSettings';
import MemberSettings from './MemberSettings';
import { useEffect, useState } from 'react';

function Settings() {
  const { supabase, user } = useSupabase();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getUserRole() {
      if (!user) return;
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setUserRole(profile.role);
      } catch (error) {
        console.error('Error fetching user role:', error);
      } finally {
        setLoading(false);
      }
    }

    getUserRole();
  }, [user, supabase]);

  if (loading) {
    return (
      <Center h="calc(100vh - 60px)">
        <Spinner size="xl" />
      </Center>
    );
  }

  return userRole === 'creator' ? <CreatorSettings /> : <MemberSettings />;
}

export default Settings; 