import React, { useState } from 'react';
import Sidebar from '../components/ui/Sidebar';
import ProfileEdit from '../components/ui/ProfileEdit';
import SecurityEdit from '../components/ui/Security';

import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const [toggleState, setToggleState] = useState<number>(1);
  const { user } = useAuth(); 

  return (
    <div className="max-w-7xl mx-auto p-6 flex gap-8">
    
      <Sidebar toggleState={toggleState} setToggleState={setToggleState} />
      
      <div className="flex-1">
        {toggleState === 1 && <ProfileEdit userId={user?.id ? Number(user.id) : undefined} />}
        {toggleState === 2 && <SecurityEdit userId={user?.id ? Number(user.id) : undefined} />}
       
      </div>
    </div>
  );
}