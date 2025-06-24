import React from 'react';
import { FaRegUser, FaBook, FaComment } from 'react-icons/fa';
import { BiCategory } from 'react-icons/bi';
import { CiCreditCard1 } from 'react-icons/ci';
import { FaChartSimple } from 'react-icons/fa6';

interface SidebarProps {
  toggleState: number;
  setToggleState: (index: number) => void;
}

export default function AdminSidebar({ toggleState, setToggleState }: SidebarProps) {
  return (
    <div className="relative h-screen w-64 hidden sm:block shadow-xl">
      <div className="py-6 px-4">
        <div className="mt-4 text-center font-bold text-3xl">Admin</div>
        <div className="mt-6">
          <ul className="space-y-1 pt-3">
            <li className={`hover:bg-gray-200 ${toggleState === 1 ? 'bg-gray-200 rounded' : ''}`}>
              <button
                onClick={() => setToggleState(1)}
                className="cursor-pointer text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center rounded py-4 pl-6 transition-all"
              >
                <BiCategory className="w-[18px] h-[18px] mr-3" />
                <span>Category Management</span>
              </button>
            </li>
            <li className={`hover:bg-gray-200 ${toggleState === 2 ? 'bg-gray-200 rounded' : ''}`}>
              <button
                onClick={() => setToggleState(2)}
                className="cursor-pointer text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center rounded py-4 pl-6 transition-all"
              >
                <FaRegUser className="w-[18px] h-[18px] mr-3" />
                <span>Users Management</span>
              </button>
            </li>
            <li className={`hover:bg-gray-200 ${toggleState === 3 ? 'bg-gray-200 rounded' : ''}`}>
              <button
                onClick={() => setToggleState(3)}
                className="cursor-pointer text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center rounded py-4 pl-6 transition-all"
              >
                <FaBook className="w-[18px] h-[18px] mr-3" />
                <span>Courses Management</span>
              </button>
            </li>
            <li className={`hover:bg-gray-200 ${toggleState === 4 ? 'bg-gray-200 rounded' : ''}`}>
              <button
                onClick={() => setToggleState(4)}
                className="cursor-pointer text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center rounded py-4 pl-6 transition-all"
              >
                <CiCreditCard1 className="w-[18px] h-[18px] mr-3" />
                <span>Payments Management</span>
              </button>
            </li>
            <li className={`hover:bg-gray-200 ${toggleState === 5 ? 'bg-gray-200 rounded' : ''}`}>
              <button
                onClick={() => setToggleState(5)}
                className="cursor-pointer text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center rounded py-4 pl-6 transition-all"
              >
                <FaChartSimple className="w-[18px] h-[18px] mr-3" />
                <span>Income Stats</span>
              </button>
            </li>
            <li className={`hover:bg-gray-200 ${toggleState === 6 ? 'bg-gray-200 rounded' : ''}`}>
              <button
                onClick={() => setToggleState(6)}
                className="cursor-pointer text-slate-800 font-medium hover:text-slate-900 text-[15px] flex items-center rounded py-4 pl-6 transition-all"
              >
                <FaComment className="w-[18px] h-[18px] mr-3" />
                <span>Review Management</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}