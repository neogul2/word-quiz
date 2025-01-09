'use client';

import { Bar } from 'react-chartjs-2';

export default function BarChart({ data }: { data: any }) {
  return (
    <Bar
      data={data}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { stacked: true },
          y: { 
            stacked: true,
            beginAtZero: true,
            max: data.datasets[0].data[0] + data.datasets[1].data[0]
          }
        },
        plugins: {
          legend: {
            position: 'bottom' as const
          }
        }
      }}
    />
  );
} 