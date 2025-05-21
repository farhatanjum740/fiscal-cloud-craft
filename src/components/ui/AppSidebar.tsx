
import React from 'react';
import Sidebar from './sidebar';
import { useAuth } from '@/contexts/AuthContext';

const AppSidebar = () => {
  const { signOut } = useAuth();
  
  return <Sidebar signOut={signOut} />;
};

export default AppSidebar;
