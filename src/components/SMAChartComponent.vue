<template>
  <div class="button-container">
    <div class="crypto-buttons">
      <button
        v-for="(valueCrypto, displayCrypto) in cryptoMapping"
        :key="valueCrypto"
        :class="{ active: activeCrypto === valueCrypto }"
        @click="handleCryptoClick(valueCrypto)"
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
        @click="handleTimeClick(valueTime)"
        :disabled="loading"
      >
        {{ displayTime }}
      </button>
    </div>

  </div>
  <canvas id="cryptoChart"></canvas>
  <div id="chartTooltip" :style="{ opacity: tooltipState.isVisible ? 1 : 0 }" v-if="tooltipState.data">
    <div class="tooltip-content">
      <p class="tooltip-date">{{ tooltipState.formattedDate }}</p>
      <p class="tooltip-item">
        <span class="tooltip-label">Price:</span>
        {{ tooltipState.data.current_price.toFixed(2) }}
      </p>
      <p class="tooltip-item">
        <span class="tooltip-label">24h High:</span>
        {{ tooltipState.data.high_24h.toFixed(2) }}
      </p>
      <p class="tooltip-item">
        <span class="tooltip-label">24h Low:</span>
        {{ tooltipState.data.low_24h.toFixed(2) }}
      </p>
      <p class="tooltip-item">
        <span class="tooltip-label">MA 10:</span>
        {{ tooltipState.data.ma_10.toFixed(2) }}
      </p>
      <p class="tooltip-item">
        <span class="tooltip-label">MA 50:</span>
        {{ tooltipState.data.ma_50.toFixed(2) }}
      </p>
      <p class="tooltip-item">
        <span class="tooltip-label">RSI:</span>
        {{ tooltipState.data.rsi.toFixed(2) }}
      </p>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import type { Ref } from 'vue'
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

interface CryptoMapping {
  [key: string]: string;
}
interface TimeMapping {
  [key: string]: string;
}
interface CryptoDataPoint {
  timestamp: string;
  current_price: number;
  high_24h: number;
  low_24h: number;
  ma_10: number;
  ma_50: number;
  rsi: number;
}
interface ApiResponseItem {
  timestamp: string;
  current_price: string;
  high_24h: string;
  low_24h: string;
  ma_10: string;
  ma_50: string;
  rsi: string;
}
interface FetchCryptoDataParams {
  crypto: CryptoType;
  time: TimeType;
  pageLoad: boolean;
}
interface TooltipData {
  isVisible: boolean;
  formattedDate: string;
  data: CryptoDataPoint | null;
}

type CryptoType = typeof CRYPTO_MAPPING[keyof typeof CRYPTO_MAPPING]
type TimeType = typeof TIME_MAPPING[keyof typeof TIME_MAPPING]

const CRYPTO_MAPPING: CryptoMapping = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
  XMR: 'monero',
  PAXG: 'paxg',
} as const;
const TIME_MAPPING: TimeMapping = {
  '24h': 'hourly',
  '7d': '7d',
  '30d': '30d',
} as const;

export default {
  name: 'SMAChartComponent',
  setup() {
    const activeCrypto: Ref<CryptoType> = ref('bitcoin')
    const activeTime: Ref<TimeType> = ref('hourly')
    const responseData = ref<CryptoDataPoint[]>([])
    const selectedDataPoint = ref<CryptoDataPoint | null>(null)
    const chartInstance = ref<Chart | null>(null)
    const loading = ref(false)

    const fetchCryptoDataDebounced = debounce(
      (params: FetchCryptoDataParams) => fetchCryptoData(params),
      300
    ) as (params: FetchCryptoDataParams) => Promise<void>

    const tooltipState = ref<TooltipData>({
      isVisible: false,
      formattedDate: '',
      data: null
    })
    const formatDate = (timestamp: string, timeFormat: TimeType): string => {
      if (timeFormat === 'hourly') {
        return format(new Date(timestamp), 'ha').toLowerCase()
      }
      const date = new Date(timestamp)
      const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
      return format(utcDate, 'MM/dd')
    }

    const fetchCryptoData = async ({
      crypto,
      time,
      pageLoad
    }: FetchCryptoDataParams): Promise<void> => {
      if (activeCrypto.value === crypto &&
          activeTime.value === time &&
          !pageLoad){
       return;
      }

      try {

        loading.value = true
        activeCrypto.value = crypto
        activeTime.value = time

        const response = await axios.get(`/api/crypto/get-prices`, {
          params: {
            crypto: crypto.toLowerCase(),
            range: time
          }
        });

        responseData.value = response.data.map((item: ApiResponseItem): CryptoDataPoint => ({
          timestamp: time === 'hourly'
            ? format(
                new Date(item.timestamp).toLocaleString('en-US', { timeZone: 'America/New_York' }),
                'yyyy-MM-dd HH:mm:ss'
              )
            : item.timestamp,
          current_price: parseFloat(item.current_price),
          high_24h: parseFloat(item.high_24h),
          low_24h: parseFloat(item.low_24h),
          ma_10: parseFloat(item.ma_10),
          ma_50: parseFloat(item.ma_50),
          rsi: parseFloat(item.rsi)
        }));


        if (chartInstance.value) {
          chartInstance.value.destroy();
        }
        renderChart();

      } catch (error) {
        console.error(`Failed to fetch ${crypto} data:`, error)
      } finally {
        loading.value = false
      }
    }

    const displayTooltip = (data: CryptoDataPoint) => {
      tooltipState.value = {
        isVisible: true,
        formattedDate: formatDate(data.timestamp, activeTime.value),
        data
      }
    }

    const renderChart = () => {
      const canvas = document.getElementById('cryptoChart') as HTMLCanvasElement
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

      const low24hValues = responseData.value.map(item => item.low_24h).filter(value => !isNaN(value))
      const high24hValues = responseData.value.map(item => item.high_24h).filter(value => !isNaN(value))

      const chartData: ChartData = {
        labels: responseData.value.map(item => item.timestamp),
        datasets: [
          {
            label: 'Price',
            type: 'candlestick',
            data: responseData.value.map((item, index) => ({
              x: new Date(item.timestamp).getTime(),
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
              x: new Date(item.timestamp).getTime(),
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
              x: new Date(item.timestamp).getTime(),
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
              x: new Date(item.timestamp).getTime(),
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
              min: Math.min(...low24hValues) * 0.95,
              max: Math.max(...high24hValues) * 1.05,
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
            }
          },
        },
      })

      // Set the selected data point to the latest data point and display the tooltip
      if (responseData.value.length > 0) {
        selectedDataPoint.value = responseData.value[responseData.value.length - 1]
        displayTooltip(selectedDataPoint.value)
      }
    }

    const handleCryptoClick = (crypto: CryptoType) => {
      fetchCryptoDataDebounced({
        crypto,
        time: activeTime.value,
        pageLoad: false
      });
    };

    const handleTimeClick = (time: TimeType) => {
      fetchCryptoDataDebounced({
        crypto: activeCrypto.value,
        time,
        pageLoad: false
      });
    };

    onMounted(async () => {
      await fetchCryptoData({
        crypto: activeCrypto.value,
        time: activeTime.value,
        pageLoad: true
      })
    })

    return {
      responseData,
      cryptoMapping: CRYPTO_MAPPING,
      timeMapping : TIME_MAPPING,
      activeCrypto,
      activeTime,
      fetchCryptoDataDebounced,
      loading,
      selectedDataPoint,
      fetchCryptoData,
      tooltipState,
      handleCryptoClick,
      handleTimeClick
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
