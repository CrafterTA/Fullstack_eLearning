import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { getPaymentStats, PaymentStat } from '../../services/PaymentService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdStats() {
  const [stats, setStats] = useState<PaymentStat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPaymentStats();
        console.log('Fetched stats:', data);
        setStats(data);
      } catch (error: any) {
        setError(error.message || 'Không thể tải thống kê thanh toán');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  
  const total = stats.reduce((sum, cur) => sum + Number(cur.income), 0);
  const avg = stats.length > 0 ? Math.round(total / stats.length) : 0;
  const max = stats.length > 0 ? Math.max(...stats.map(m => m.income)) : 0;
  const min = stats.length > 0 ? Math.min(...stats.map(m => m.income)) : 0;
  const maxMonth = stats.find(m => m.income === max)?.month || 'N/A';
  const minMonth = stats.find(m => m.income === min)?.month || 'N/A';
  const totalTransactions = stats.reduce((sum, cur) => sum + cur.transactions, 0);

  const data = {
    labels: stats.map(item => item.month),
    datasets: [
      {
        label: 'Thu nhập (VND)',
        data: stats.map(item => item.income),
        backgroundColor: 'rgba(59,130,246,0.85)', 
        borderRadius: 12,
        barPercentage: 0.7,
        categoryPercentage: 0.6,
        borderSkipped: false,
      }
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        padding: 12,
        backgroundColor: '#111827', // bg-gray-900
        borderColor: '#3B82F6',
        borderWidth: 1.5,
        callbacks: {
          label: (context: any) => ` Thu nhập: ${context.parsed.y.toLocaleString('vi-VN')} VND`,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: { size: 14, weight: 'bold' },
          color: '#3B82F6',
          callback: (value: number) => `${value.toLocaleString('vi-VN')} VND`,
        },
        grid: {
          color: '#E5E7EB'
        },
        title: {
          display: true,
          text: 'VND',
          font: { size: 15 }
        }
      },
      x: {
        ticks: {
          font: { size: 13, weight: 'bold' },
          color: '#64748b'
        },
        grid: {
          color: '#F3F4F6'
        },
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-2 py-10">
      <div className="gap-3 mb-4 text-center items-center">
        <div className="text-3xl font-extrabold text-slate-800">Income Report</div>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-600">Đang tải thống kê...</p>
      ) : stats.length === 0 ? (
        <p className="text-center text-gray-600">Không có dữ liệu thống kê. Vui lòng kiểm tra bảng payments.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-100 to-blue-200 p-5 rounded-2xl flex flex-col items-center shadow">
              <span className="text-sm text-blue-600 font-semibold mb-1">Tổng thu nhập</span>
              <span className="text-2xl font-bold text-blue-900">{total} VND</span>
            </div>
            <div className="bg-gradient-to-r from-green-100 to-green-200 p-5 rounded-2xl flex flex-col items-center shadow">
              <span className="text-sm text-green-700 font-semibold mb-1">Trung bình/tháng</span>
              <span className="text-2xl font-bold text-green-900">{avg} VND</span>
            </div>
            <div className="bg-gradient-to-r from-violet-100 to-blue-100 p-5 rounded-2xl flex flex-col items-center shadow">
              <span className="text-sm text-violet-700 font-semibold mb-1">Cao nhất ({maxMonth})</span>
              <span className="text-2xl font-bold text-violet-900">{max} VND</span>
            </div>
            <div className="bg-gradient-to-r from-pink-100 to-red-100 p-5 rounded-2xl flex flex-col items-center shadow">
              <span className="text-sm text-pink-700 font-semibold mb-1">Tổng giao dịch</span>
              <span className="text-2xl font-bold text-pink-900">{totalTransactions}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg w-full min-h-[420px] p-6 flex flex-col justify-center">
            <Bar data={data} options={options as any} />
          </div>
          <div className="flex justify-end mt-3 text-sm text-gray-400 italic">
            * Đơn vị: VND
          </div>
        </>
      )}
    </div>
  );
}