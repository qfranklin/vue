<template>
  <div class="button-container">
    <div class="crypto-buttons">
      <button
        v-for="(valueCrypto, displayCrypto) in cryptoMapping"
        :key="valueCrypto"
        :class="{ active: activeCrypto === valueCrypto }"
        @click="fetchCryptoDataDebounced(valueCrypto, activeTime, false)"
        :disabled="loading"
      >
        {{ displayCrypto }}
      </button>
    </div>

    <div class="time-buttons">
      <button
        v-for="(valueTime, displayTime) in timeMapping"
        :key="valueTime"
        :class="{ active: activeTime === valueTime }"
        @click="fetchCryptoDataDebounced(activeCrypto, valueTime, false)"
        :disabled="loading"
      >
        {{ displayTime }}
      </button>
    </div>

  </div>
  <canvas id="cryptoChart"></canvas>
  <div id="chartTooltip"></div>
</template>

<script lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { Chart, registerables, Tooltip } from 'chart.js'
import type { ChartData } from 'chart.js'
import type { TooltipItem, TooltipModel, ActiveElement } from 'chart.js'
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial'
import { format } from 'date-fns'
import 'chartjs-adapter-date-fns'
import { debounce } from 'lodash'

declare module 'chart.js' {
  interface TooltipPositionerMap {
    custom: (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) => { x: number; y: number; xAlign: string; yAlign: string } | false
  }
}

Chart.register(...registerables, CandlestickController, CandlestickElement, OhlcElement)

Tooltip.positioners.custom = function (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) {
  const pos = Tooltip.positioners.average.call(this as unknown as TooltipModel<'line'>, items as unknown as ActiveElement[], eventPosition)

  if (!pos) {
    return false
  }

  const chart = (this as unknown as TooltipModel<'line'>).chart
  const dataPointY = items[0].element.y
  const chartHeight = chart.chartArea.bottom - chart.chartArea.top

  const yAlign = dataPointY > chartHeight / 2 ? 'top' : 'bottom'
  const y = yAlign === 'top' ? chart.chartArea.top : chart.chartArea.bottom

  return {
    x: pos.x,
    y: y,
    xAlign: 'center',
    yAlign: yAlign,
  }
}

export default {
  name: 'SMAChartComponent',
  setup() {
    const cryptoMapping = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      SOL: 'solana',
      XMR: 'monero',
    }
    const cryptos = Object.values(cryptoMapping)
    const timeMapping = {
      '24h': 'hourly',
      '7d': '7d',
      '30d': '30d',
    }
    const times = Object.values(timeMapping)
    const activeCrypto = ref('bitcoin')
    const activeTime = ref('7d')
    const responseData = ref<Array<{ date: string; current_price: number; high_24h: number; low_24h: number; ma_10: number; ma_50: number; rsi: number }>>([])
    const chartInstance = ref<Chart | null>(null)
    const loading = ref(false)
    const selectedDataPoint = ref<{ date: string; current_price: number; high_24h: number; low_24h: number; ma_10: number; ma_50: number; rsi: number } | null>(null)

    const fetchCryptoData = async (crypto: string, time: string, pageLoad: boolean) => {
      if (activeCrypto.value === crypto && activeTime.value === time && !pageLoad) return
      loading.value = true
      activeCrypto.value = crypto
      activeTime.value = time

      try {
        const response = await axios.get(`/api/crypto/get-prices`, {
          params: {
            crypto: crypto.toLowerCase(),
            range: time
          }
        })

        responseData.value = response.data.map((item: { timestamp: string; current_price: string; high_24h: string; low_24h: string; ma_10: string; ma_50: string; rsi: string }) => ({
          date: time === 'hourly' ? format(new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }), 'yyyy-MM-dd HH:mm:ss') : item.timestamp,
          current_price: parseFloat(item.current_price),
          high_24h: parseFloat(item.high_24h),
          low_24h: parseFloat(item.low_24h),
          ma_10: parseFloat(item.ma_10),
          ma_50: parseFloat(item.ma_50),
          rsi: parseFloat(item.rsi),
        }))


        renderChart()
      } catch (error) {
        console.error(`Failed to fetch ${crypto} data:`, error)
      } finally {
        loading.value = false
      }
    }

    const fetchCryptoDataDebounced = debounce(fetchCryptoData, 300)

    const displayTooltip = (data: { date: string; current_price: number; high_24h: number; low_24h: number; ma_10: number; ma_50: number; rsi: number }) => {
      const tooltipEl = document.getElementById('chartTooltip')
      if (!tooltipEl) {
        console.warn('Tooltip element not found.')
        return
      }

      let formattedDate;
      if (activeTime.value === 'hourly') {
        formattedDate = format(new Date(data.date), 'ha').toLowerCase()
      } else {
        const date = new Date(data.date)
        const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
        formattedDate = format(utcDate, 'MM/dd')
      }

      tooltipEl.innerHTML = `
        <div class="tooltip-content">
          <p class="tooltip-date">${formattedDate}</p>
          <p class="tooltip-item"><span class="tooltip-label">Price:</span> ${data.current_price.toFixed(2)}</p>
          <p class="tooltip-item"><span class="tooltip-label">24h High:</span> ${data.high_24h.toFixed(2)}</p>
          <p class="tooltip-item"><span class="tooltip-label">24h Low:</span> ${data.low_24h.toFixed(2)}</p>
          <p class="tooltip-item"><span class="tooltip-label">MA 10:</span> ${data.ma_10.toFixed(2)}</p>
          <p class="tooltip-item"><span class="tooltip-label">MA 50:</span> ${data.ma_50.toFixed(2)}</p>
          <p class="tooltip-item"><span class="tooltip-label">RSI:</span> ${data.rsi.toFixed(2)}</p>
        </div>
      `
      tooltipEl.style.opacity = '1'
    }

    const renderChart = () => {
      const canvas = document.getElementById('cryptoChart') as HTMLCanvasElement
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      if (chartInstance.value) {
        chartInstance.value.destroy()
        chartInstance.value = null
      }

      const low24hValues = responseData.value.map(item => item.low_24h).filter(value => !isNaN(value))
      const high24hValues = responseData.value.map(item => item.high_24h).filter(value => !isNaN(value))

      const chartData: ChartData = {
        labels: responseData.value.map(item => item.date),
        datasets: [
          {
            label: 'Price',
            type: 'candlestick',
            data: responseData.value.map((item, index) => ({
              x: new Date(item.date).getTime(),
              o: index === 0 ? item.current_price : responseData.value[index - 1].current_price,
              h: item.high_24h,
              l: item.low_24h,
              c: item.current_price,
            })),
            borderColor: '#333333',
            backgroundColor: '#333333',
          },
          {
            label: 'MA 10',
            type: 'line',
            data: responseData.value.map(item => ({
              x: new Date(item.date).getTime(),
              y: item.ma_10,
            })),
            borderColor: 'rgba(51, 51, 51, 0.5)',
            backgroundColor: 'rgba(51, 51, 51, 0.5)',
            fill: false,
            pointRadius: 0,
            borderWidth: 1,
            tension: 0.4,
          },
          {
            label: 'MA 50',
            type: 'line',
            data: responseData.value.map(item => ({
              x: new Date(item.date).getTime(),
              y: item.ma_50,
            })),
            borderColor: 'rgba(51, 51, 51, 0.3)',
            backgroundColor: 'rgba(51, 51, 51, 0.3)',
            fill: false,
            pointRadius: 0,
            borderWidth: 1,
            tension: 0.4,
          },
          {
            label: 'RSI',
            type: 'line',
            data: responseData.value.map(item => ({
              x: new Date(item.date).getTime(),
              y: item.rsi,
            })),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            pointRadius: 0,
            borderWidth: 1,
            tension: 0.4,
            yAxisID: 'y-rsi',
          },
        ],
      }

      chartInstance.value = new Chart(ctx, {
        type: 'candlestick',
        data: chartData,
        options: {
          responsive: true,
          scales: {
            x: {
              display: false
            },
            y: {
              beginAtZero: false,
              min: Math.min(...low24hValues) - 1000,
              max: Math.max(...high24hValues) + 1000,
              display: false
            },
            'y-rsi': {
              position: 'right',
              beginAtZero: false,
              min: 0,
              max: 100,
              ticks: {
                display: false
              },
              grid: {
                drawTicks: true,
                drawOnChartArea: true,
                color: context => {
                  return context.tick.value === 30 || context.tick.value === 70 ? 'rgba(0, 0, 0, 0.4)' : 'transparent'
                },
              },
            },
          },
          interaction: {
            intersect: false,
            mode: 'nearest',
            axis: 'x',
          },
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              enabled: false, // Disable the default tooltip rendering
              external: function (context) {
                const tooltipEl = document.getElementById('chartTooltip');

                // Handle null case
                if (!tooltipEl) {
                  console.warn('Tooltip element not found.');
                  return;
                }

                // Hide tooltip if no data and no data point is selected
                if (context.tooltip.opacity === 0 && !selectedDataPoint.value) {
                  tooltipEl.style.opacity = '0';
                  return;
                }

                // Get the data for the tooltip
                const index = context.tooltip.dataPoints[0].dataIndex;
                const data = responseData.value[index];

                displayTooltip(data)
              },
            },
          },
        },
      })

      // Set the selected data point to the latest data point and display the tooltip
      if (responseData.value.length > 0) {
        selectedDataPoint.value = responseData.value[responseData.value.length - 1]
        displayTooltip(selectedDataPoint.value)
      }
    }

    onMounted(() => {
      fetchCryptoDataDebounced(activeCrypto.value, activeTime.value, true)
    })

    return {
      responseData,
      cryptoMapping,
      cryptos,
      timeMapping,
      times,
      activeCrypto,
      activeTime,
      fetchCryptoDataDebounced,
      loading,
      selectedDataPoint,
    }
  },
}
</script>

<style>

.button-container {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.crypto-buttons button, .time-buttons button {
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.3s;
  padding: 3px;
}

.crypto-buttons button {
  font-size: 16px;
}

.crypto-buttons button.active, .time-buttons button.active {
  color: blue;
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.time-buttons, .crypto-buttons {
  display: flex;
}

canvas {
  max-width: 100%;
}

body {
    background-color: #f5f5f5;
}

.tooltip-content {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  max-width: 200px;
  font-family: Arial, sans-serif;
  font-size: 14px;
  color: #333;
}

.tooltip-date {
  font-weight: bold;
  margin-bottom: 5px;
}

.tooltip-item {
  margin: 5px 0;
}

.tooltip-label {
  font-weight: bold;
  color: #555;
}
</style>
