'use client';

import { Doughnut } from 'react-chartjs-2';

export default function DoughnutChart({ data }: { data: any }) {
  return (
    <Doughnut 
      data={data}
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
  );
} 