<template>
  <div>
    <canvas id="smaChart"></canvas>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { Chart, registerables, Tooltip} from 'chart.js'
import type { TooltipItem, TooltipModel, ActiveElement } from 'chart.js'
import { subDays, format } from 'date-fns'
import 'chartjs-adapter-date-fns'

declare module 'chart.js' {
  interface TooltipPositionerMap {
    custom: (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) => { x: number; y: number; xAlign: string; yAlign: string } | false;
  }
}

export interface TooltipPositionerMap {
  custom: (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) => { x: number; y: number; xAlign: string; yAlign: string } | false;
}

Chart.register(...registerables)

Tooltip.positioners.custom = function(items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) {
  const pos = Tooltip.positioners.average.call(this as unknown as TooltipModel<'line'>, items as unknown as ActiveElement[], eventPosition);

  if (!pos) {
    return false;
  }

  const chart = (this as unknown as TooltipModel<'line'>).chart;
  const dataPointY = items[0].element.y;
  const chartHeight = chart.chartArea.bottom - chart.chartArea.top;

  // Display tooltip at the top if the data point is in the bottom half of the chart
  // Otherwise, display tooltip at the bottom
  const yAlign = dataPointY > chartHeight / 2 ? 'top' : 'bottom';
  const y = yAlign === 'top' ? chart.chartArea.top : chart.chartArea.bottom;

  return {
    x: pos.x,
    y: y,
    xAlign: 'center',
    yAlign: yAlign,
  };
};

export default {
  name: 'SMAChartComponent',
  setup() {
    const smaData = ref<Array<{ date: string; high_24h: number; sma_50: number; sma_200: number }>>([])
    const chartInstance = ref<Chart | null>(null)

    const fetchSMAData = async (startDate: Date, endDate: Date) => {
      try {
        const response = await axios.get(`/api/bitcoin/sma`, {
          params: {
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd')
          }
        })
        smaData.value = response.data
        renderChart()
      } catch (error) {
        console.error('Failed to fetch SMA data:', error)
      }
    }

    const renderChart = () => {
      const canvas = document.getElementById('smaChart') as HTMLCanvasElement
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      if (chartInstance.value) {
        chartInstance.value.destroy()
      }
      chartInstance.value = new Chart(ctx, {
        type: 'line',
        data: {
          labels: smaData.value.map(item => format(new Date(item.date + 'T00:00:00'), 'yyyy-MM-dd')),
          datasets: [
            {
              label: 'Max Price',
              data: smaData.value.map(item => item.high_24h),
              borderColor: '#333333',
              backgroundColor: '#333333',
              fill: false,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              display: false
            },
            y: {
              beginAtZero: false,
              ticks: {
                stepSize: 10000 
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'x'      
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              position: 'custom',
              caretSize: 0,
              displayColors: false,
              callbacks: {
                title: function () {
                  return ''
                },
                label: function (context) {
                  const data = smaData.value[context.dataIndex]
                  const price = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(data.high_24h)
                  //const sma50 = Math.round(data.sma_50)
                  //const sma200 = Math.round(data.sma_200)
                  const date = format(new Date(data.date + 'T00:00:00'), 'EEE, MMM d')
                  return `${price} ${date}`
                }
              }
            }
          }
        }
      })
    }

    onMounted(() => {
      const endDate = new Date()
      const startDate = subDays(endDate, 30)
      fetchSMAData(startDate, endDate)
    })

    return {
      smaData
    }
  }
}
</script>

<style scoped>
canvas {
  max-width: 100%;
}
</style>
