'use client';

import { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface ChartProps {
  englishScore: {
    correct: number;
    incorrect: number;
    total: number;
    percentage: number;
  };
  koreanScore: {
    correct: number;
    incorrect: number;
    total: number;
    percentage: number;
  };
}

export default function Charts({ englishScore, koreanScore }: ChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const barChartData = {
    labels: ['영어→한글', '한글→영어'],
    datasets: [
      {
        label: '정답',
        data: [englishScore.correct, koreanScore.correct],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
      {
        label: '오답',
        data: [englishScore.incorrect, koreanScore.incorrect],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  const doughnutData = {
    labels: ['정답', '오답'],
    datasets: [
      {
        data: [
          englishScore.correct + koreanScore.correct,
          englishScore.incorrect + koreanScore.incorrect,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">전체 정답률</h2>
          <div className="w-full h-64 flex items-center justify-center">로딩 중...</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">유형별 결과</h2>
          <div className="w-full h-64 flex items-center justify-center">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">전체 정답률</h2>
        <div className="w-full h-64">
          <Doughnut 
            data={doughnutData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom' as const
                }
              }
            }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">유형별 결과</h2>
        <div className="w-full h-64">
          <Bar
            data={barChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { stacked: true },
                y: { 
                  stacked: true,
                  beginAtZero: true,
                  max: englishScore.total
                }
              },
              plugins: {
                legend: {
                  position: 'bottom' as const
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
} 