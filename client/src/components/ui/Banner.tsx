import React from 'react';
import { Link } from 'react-router-dom';
import bannerImage from '../../assets/images/banner.jpg'; 
const Banner = () => {
  return (
    <div className="main container px-[100px] py-[40px] w-[1440px] h-[400px] mt-[30px]">
      <div className="banner grid grid-cols-12 bg-[#3DCBB1] rounded-[12px]">
        {/* Left Side Banner */}
        <div className="left-banner col-span-6 flex flex-col bg-[#3DCBB1] w-[600px] h-[400px] rounded-[12px] p-[60px]">
          <div className="flex flex-col">
            <h1
              className="text-[48px] font-extrabold leading-[62px] text-[#FFFFFF] w-[520px]"
              style={{
                fontFamily: 'Playwrite ES Deco, cursive',
                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.2)',
              }}
            >
              Learn something new everyday.
            </h1>
            <p
              className="text-[16px] text-[#F9F9F9] mt-2"
              
            >
              Become professionals and ready to join the world.
            </p>
          </div>
          <Link
            to="/courses"
            className="text-[#3DCBB1] px-[16px] py-[8px] rounded-[12px] font-bold text-sm bg-[#FFFFFF] mt-4 w-fit transform transition-transform duration-200 hover:scale-105"
            style={{ fontFamily: 'Roboto, sans-serif', fontWeight: 700 }}
          >
            Explore all courses
          </Link>
        </div>
        {/* Right Side Banner */}
        <div className="right-banner col-span-6 flex justify-center items-center w-[840px] h-[400px] ">
          <img src={bannerImage} alt="Banner" className="w-[720px] h-[400px] rounded-[12px]" />
        </div>
      </div>
    </div>
  );
};

export default Banner;