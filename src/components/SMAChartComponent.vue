<template>
  <div>
    <div class="crypto-buttons">
      <button
        v-for="crypto in cryptos"
        :key="crypto"
        :class="{ active: activeCrypto === crypto }"
        @click="fetchCryptoDataDebounced(crypto, activeTime, false)"
        :disabled="loading"
      >
        {{ crypto }}
      </button>
    </div>
    <canvas id="cryptoChart"></canvas>
    <div class="time-buttons">
      <button
        v-for="time in times"
        :key="time"
        :class="{ active: activeTime === time }"
        @click="fetchCryptoDataDebounced(activeCrypto, time, false)"
        :disabled="loading"
      >
        {{ time }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'
import { ref, onMounted } from 'vue'
import { Chart, registerables, Tooltip} from 'chart.js'
import type { ChartData } from 'chart.js'
import type { TooltipItem, TooltipModel, ActiveElement } from 'chart.js'
import {CandlestickController, CandlestickElement, OhlcElement} from 'chartjs-chart-financial';
import { format } from 'date-fns'
import 'chartjs-adapter-date-fns'
import { debounce } from 'lodash';

declare module 'chart.js' {
  interface TooltipPositionerMap {
    custom: (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) => { x: number; y: number; xAlign: string; yAlign: string } | false;
  }
}

export interface TooltipPositionerMap {
  custom: (items: TooltipItem<'line'>[], eventPosition: { x: number; y: number }) => { x: number; y: number; xAlign: string; yAlign: string } | false;
}

Chart.register(...registerables, CandlestickController, CandlestickElement, OhlcElement)

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
  name: 'CryptoChartComponent',
  setup() {
    const cryptos = ['Bitcoin', 'Ethereum', 'Solana', 'Monero'];
    const times = ['hourly', '7d', '30d']
    const activeCrypto = ref('Bitcoin');
    const activeTime = ref('7d')
    const responseData = ref<Array<{
      date: string;
      current_price: number;
      high_24h: number;
      low_24h: number;
      ma_10: number;
      ma_50: number;
      rsi: number;
    }>>([]);
    const chartInstance = ref<Chart | null>(null);
    const loading = ref(false);

    const fetchCryptoData = async (crypto: string, time: string, pageLoad: boolean) => {

      if (activeCrypto.value === crypto && activeTime.value === time && !pageLoad) return;

      loading.value = true;
      activeCrypto.value = crypto;
      activeTime.value = time;

      try {
        const response = await axios.get(`/api/crypto/get-prices`, {
          params: {
            crypto: crypto.toLowerCase(),
            range: time
          }
        });

        responseData.value = response.data.map((item: { timestamp: string; current_price: string; high_24h: string; low_24h: string; ma_10: string; ma_50: string; rsi: string; }) => ({
          date: format(new Date(item.timestamp), 'yyyy-MM-dd'),
          current_price: parseFloat(item.current_price),
          high_24h: parseFloat(item.high_24h),
          low_24h: parseFloat(item.low_24h),
          ma_10: parseFloat(item.ma_10),
          ma_50: parseFloat(item.ma_50),
          rsi: parseFloat(item.rsi)
        }));
        renderChart();
      } catch (error) {
        console.error(`Failed to fetch ${crypto} data:`, error);
      } finally {
        loading.value = false;
      }
    };

    const fetchCryptoDataDebounced = debounce(fetchCryptoData, 300);

    const renderChart = () => {
      const canvas = document.getElementById('cryptoChart') as HTMLCanvasElement
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      if (chartInstance.value) {
        chartInstance.value.destroy()
        chartInstance.value = null
      }

      const low24hValues = responseData.value.map(item => item.low_24h).filter(value => !isNaN(value));
      const high24hValues = responseData.value.map(item => item.high_24h).filter(value => !isNaN(value));

      const candlestickData = responseData.value.map((item, index) => ({
        x: new Date(item.date).getTime(),
        o: index === 0 ? item.current_price : responseData.value[index - 1].current_price, // Open price
        h: item.high_24h, // High price
        l: item.low_24h, // Low price
        c: item.current_price, // Close price
      }));

      const ma10Data = responseData.value.map(item => ({
        x: new Date(item.date).getTime(),
        y: item.ma_10,
      }));

      const ma50Data = responseData.value.map(item => ({
        x: new Date(item.date).getTime(),
        y: item.ma_50,
      }));

      const rsiData = responseData.value.map(item => ({
        x: new Date(item.date + 'T00:00:00Z').getTime(), // Use UTC time
        y: item.rsi,
      }));

      const chartData: ChartData = {
        labels: responseData.value.map(item => item.date),
        datasets: [
          {
            label: 'Price',
            type: 'candlestick',
            data: candlestickData,
            borderColor: '#333333',
            backgroundColor: '#333333',
          },
          {
            label: 'MA 10',
            type: 'line',
            data: ma10Data,
            borderColor: 'rgba(51, 51, 51, 0.5)', // Lighter color
            backgroundColor: 'rgba(51, 51, 51, 0.5)',
            fill: false,
            pointRadius: 0,
            borderWidth: 1, // Thinner line
            tension: 0.4 // Smooth line
          },
          {
            label: 'MA 50',
            type: 'line',
            data: ma50Data,
            borderColor: 'rgba(51, 51, 51, 0.3)', // Lighter color
            backgroundColor: 'rgba(51, 51, 51, 0.3)',
            fill: false,
            pointRadius: 0,
            borderWidth: 1, // Thinner line
            tension: 0.4 // Smooth line
          },
          {
            label: 'RSI',
            type: 'line',
            data: rsiData,
            borderColor: 'rgba(255, 99, 132, 1)', // Red color for RSI
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            fill: false,
            pointRadius: 0,
            borderWidth: 1, // Thinner line
            tension: 0.4, // Smooth line
            yAxisID: 'y-rsi', // Use a separate y-axis for RSI
          }
        ]
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
              min: Math.min(...low24hValues) - 1000, // Adjust min value
              max: Math.max(...high24hValues) + 1000, // Adjust max value
            },
            'y-rsi': {
              position: 'right',
              beginAtZero: false,
              min: 0,
              max: 100,
              ticks: {
                // Only at 30 and 70
                callback: function (value) {
                  return value === 30 || value === 70 ? value : '';
                },
              },
              grid: {
                // Only draw grid lines at 30 and 70
                drawTicks: true,
                drawOnChartArea: true,
                color: (context) => {
                  return context.tick.value === 30 || context.tick.value === 70
                    ? 'rgba(0, 0, 0, 0.4)' // Grid line color at 30 and 70
                    : 'transparent'; // Hide other grid lines
                },
              },
            },
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
                  return ''; // No title
                },
                beforeBody: function (context) {
                  const index = context[0].dataIndex; // Use the index from the first dataset
                  const data = responseData.value[index];
                  const date = format(new Date(data.date + 'T00:00:00'), 'EEE, MMM d');
                  const highPrice = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.high_24h);
                  const lowPrice = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.low_24h);
                  const currentPrice = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.current_price);
                  const ma10 = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.ma_10);
                  const ma50 = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.ma_50);
                  const rsi = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.rsi);

                  return `${date}\nHigh: ${highPrice}\nLow: ${lowPrice}\n5am EST: ${currentPrice}\nMA 10: ${ma10}\nMA 50: ${ma50}\nRSI: ${rsi}`;
                },
                label: function () {
                  return ''; // Remove dataset-specific labels
                },
              },
            },
          }
        }
      })
    }

    onMounted(() => {
      fetchCryptoDataDebounced(activeCrypto.value, activeTime.value, true);
    })

    return {
      responseData,
      cryptos,
      times,
      activeCrypto,
      activeTime,
      fetchCryptoDataDebounced,
      loading
    }
  }
}
</script>

<style scoped>
.crypto-buttons {
  display: flex;
  gap: 5px;
  margin-bottom: 10px;
}

.crypto-buttons button {
  padding: 5px;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.crypto-buttons button.active {
  background-color: #007bff;
  color: white;
}

.time-buttons {
  display: flex;
  gap: 5px;
  margin-top: 10px;
  justify-content: flex-start;
}

.time-buttons button {
  padding: 5px;
  border: none;
  background: none;
  cursor: pointer;
  transition: color 0.3s;
}

.time-buttons button.active {
  text-decoration: underline;
}

canvas {
  max-width: 100%;
}
</style>
