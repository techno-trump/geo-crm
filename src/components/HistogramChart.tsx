import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
	ChartOptions,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
);

export const options: ChartOptions<"bar"> = {
	maintainAspectRatio: true,
  indexAxis: 'y' as const,
	scales: {
		x: {
			reverse: true,
		},
		y: {
			reverse: true,
		}
	},
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
};

interface IHistogramChartProps {
	intervals: Array<number>;
	values: Array<number>;
}
const HistogramChart = ({ intervals, values }:IHistogramChartProps) => {
	const data = {
		labels: intervals,
		datasets: [
			{
				data: values,
				backgroundColor: 'rgb(69, 165, 234)',
			},
		],
	};
	
	return <Bar width={356} height={800} options={options} data={data} />;
} 
export default HistogramChart;