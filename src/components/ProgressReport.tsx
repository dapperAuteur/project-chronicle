'use client';

import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

interface ReportData {
  totalPomos: number;
  mostProductiveDay: string;
  categoryData: {
    labels: string[];
    data: number[];
  };
  dailyPomosData: {
    labels: string[];
    data: number[];
  };
}

interface ProgressReportProps {
  data: ReportData;
  onClose: () => void;
}

export default function ProgressReport({ data, onClose }: ProgressReportProps) {
  const categoryChartRef = useRef<HTMLCanvasElement>(null);
  const dailyChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let categoryChartInstance: Chart | null = null;
    let dailyChartInstance: Chart | null = null;
    
    if (categoryChartRef.current) {
      categoryChartInstance = new Chart(categoryChartRef.current, {
        type: 'doughnut',
        data: {
          labels: data.categoryData.labels,
          datasets: [{
            label: 'Pomos by Category',
            data: data.categoryData.data,
            backgroundColor: ['#4D88FF', '#FFC107', '#FF5722', '#34D399', '#A78BFA'],
            borderColor: '#1F2937',
            borderWidth: 2,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }

    if (dailyChartRef.current) {
      dailyChartInstance = new Chart(dailyChartRef.current, {
        type: 'bar',
        data: {
          labels: data.dailyPomosData.labels,
          datasets: [{
            label: 'Pomos per Day',
            data: data.dailyPomosData.data,
            backgroundColor: '#4D88FF',
            borderRadius: 4,
          }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
      });
    }

    return () => {
      if (categoryChartInstance) categoryChartInstance.destroy();
      if (dailyChartInstance) dailyChartInstance.destroy();
    };
  }, [data]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-4xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Weekly Progress Report</h2>
            <button onClick={onClose} className="text-2xl">&times;</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
            <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-3xl font-bold text-blue-400">{data.totalPomos}</p>
                <p className="text-sm text-gray-400">Total Pomodoros</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-3xl font-bold text-amber-400">{data.totalPomos * 25}</p>
                <p className="text-sm text-gray-400">Minutes of Focus</p>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
                <p className="text-3xl font-bold text-green-400">{data.mostProductiveDay}</p>
                <p className="text-sm text-gray-400">Most Productive Day</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-center">Focus by Category</h3>
                <div className="relative h-64">
                    <canvas ref={categoryChartRef}></canvas>
                </div>
            </div>
            <div className="bg-white/10 p-4 rounded-lg">
                <h3 className="font-bold mb-2 text-center">Daily Pomodoros</h3>
                <div className="relative h-64">
                    <canvas ref={dailyChartRef}></canvas>
                </div>
            </div>
        </div>

        <button onClick={onClose} className="mt-6 w-full bg-gray-600 hover:bg-gray-700 p-2 rounded-md font-bold">Close</button>
      </div>
    </div>
  );
}
