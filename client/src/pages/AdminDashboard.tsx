import React, { useState } from 'react'
import AdminSidebar from '../components/admin/AdminSidebar';
import AdUsers from '../components/admin/AdUsers';
import AdCourses from '../components/admin/AdCourses';
import AdCate from '../components/admin/AdCate';
import AdPay from '../components/admin/AdPay';
import AdStats from '../components/admin/AdStats';
import AdReview from '../components/admin/AdReview';

export default function AdminDashboard() {
  const [toggleState, setToggleState] = useState(1);
  return (
    <div className=' flex'>
      <AdminSidebar toggleState={toggleState} setToggleState={setToggleState}/>
      <div className='flex-1'>
        {toggleState === 1 && <AdCate />}
        {toggleState === 2 && <AdUsers />}
        {toggleState === 3 && <AdCourses />}
        {toggleState === 4 && <AdPay />}
        {toggleState === 5 && <AdStats />}
        {toggleState === 6 && <AdReview />}
      </div>
    </div>
  )
}
