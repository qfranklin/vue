<template>
  <div>
    <canvas id="smaChart"></canvas>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import { startOfMonth, endOfMonth, format } from 'date-fns'
import 'chartjs-adapter-date-fns'

Chart.register(...registerables)

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
              borderColor: 'blue',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day',
                tooltipFormat: 'MMM dd, yyyy',
                displayFormats: {
                  day: 'MMM dd, yyyy'
                }
              }
            },
            y: {
              beginAtZero: false
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: function (context) {
                  const data = smaData.value[context.dataIndex]
                  return [
                    `Max Price: ${data.high_24h}`,
                    `50-day SMA: ${data.sma_50}`,
                    `200-day SMA: ${data.sma_200}`
                  ]
                }
              }
            }
          }
        }
      })
    }

    onMounted(() => {
      const startDate = startOfMonth(new Date())
      const endDate = endOfMonth(new Date())
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
