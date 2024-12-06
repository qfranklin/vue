<template>
  <div>
    <div class="crypto-buttons">
      <button
        v-for="crypto in cryptos"
        :key="crypto"
        :class="{ active: activeCrypto === crypto }"
        @click="fetchCryptoDataDebounced(crypto, false)"
        :disabled="loading"
      >
        {{ crypto }}
      </button>
    </div>
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
import { debounce } from 'lodash';

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
    const cryptos = ['Bitcoin', 'Ethereum', 'Solana', 'Monero'];
    const activeCrypto = ref('Bitcoin');
    const smaData = ref<Array<{ date: string; high_24h: number; ma_10: number; ma_50: number }>>([]);
    const chartInstance = ref<Chart | null>(null);
    const loading = ref(false);

    const fetchCryptoData = async (crypto: string, pageLoad: boolean) => {
      if (activeCrypto.value === crypto && !pageLoad) return;
      loading.value = true;
      activeCrypto.value = crypto;
      const endDate = new Date();
      const startDate = subDays(endDate, 30);
      try {
        const response = await axios.get(`/api/crypto/get-prices`, {
          params: {
            crypto: crypto.toLowerCase(),
            start_date: format(startDate, 'yyyy-MM-dd'),
            end_date: format(endDate, 'yyyy-MM-dd')
          }
        });
        smaData.value = response.data.map((item: { date: string; high_24h: string; ma_10: string; ma_50: string }) => ({
          date: item.date,
          high_24h: parseFloat(item.high_24h),
          ma_10: parseFloat(item.ma_10),
          ma_50: parseFloat(item.ma_50),
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
      const canvas = document.getElementById('smaChart') as HTMLCanvasElement
      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
      if (chartInstance.value) {
        chartInstance.value.destroy()
        chartInstance.value = null
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
              pointRadius: 0,
              tension: 0.4 // Smooth line
            },
            {
              label: 'MA 10',
              data: smaData.value.map(item => item.ma_10),
              borderColor: 'rgba(51, 51, 51, 0.5)', // Lighter color
              backgroundColor: 'rgba(51, 51, 51, 0.5)',
              fill: false,
              pointRadius: 0,
              borderWidth: 1, // Thinner line
              tension: 0.4 // Smooth line
            },
            {
              label: 'MA 50',
              data: smaData.value.map(item => item.ma_50),
              borderColor: 'rgba(51, 51, 51, 0.3)', // Lighter color
              backgroundColor: 'rgba(51, 51, 51, 0.3)',
              fill: false,
              pointRadius: 0,
              borderWidth: 1, // Thinner line
              tension: 0.4 // Smooth line
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
                  return ''; // No title
                },
                beforeBody: function (context) {
                  const index = context[0].dataIndex; // Use the index from the first dataset
                  const data = smaData.value[index];
                  const date = format(new Date(data.date + 'T00:00:00'), 'EEE, MMM d');
                  const price = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.high_24h);
                  const ma10 = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.ma_10);
                  const ma50 = new Intl.NumberFormat('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(data.ma_50);

                  return `${date}\nPrice: ${price}\nMA 10: ${ma10}\nMA 50: ${ma50}`;
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
      fetchCryptoDataDebounced(activeCrypto.value, true);
    })

    return {
      smaData,
      cryptos,
      activeCrypto,
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

canvas {
  max-width: 100%;
}
</style>
