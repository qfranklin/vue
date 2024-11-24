<template>
  <div>
    <h2>Bitcoin Monthly Max Price Chart</h2>
    <div class="month-selector">
      <button @click="prevMonth" :disabled="!hasPrevMonth">Previous</button>
      <select v-model="selectedMonth" @change="fetchMonthlyData">
        <option v-for="month in months" :key="month.value" :value="month.value">{{ month.text }}</option>
      </select>
      <button @click="nextMonth" :disabled="!hasNextMonth">Next</button>
    </div>
    <div class="chart-container">
      <canvas id="smaChart"></canvas>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import debounce from 'lodash/debounce';

Chart.register(...registerables);

interface BitcoinData {
  date: string;
  max_price: number;
}

export default {
  name: 'SMAChart',
  setup() {
    const bitcoinData = ref<BitcoinData[]>([]);
    const chartInstance = ref<Chart<'line', any[], any> | null>(null);
    const selectedMonth = ref(`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`);
    const months = ref<{ value: string; text: string }[]>([]);

    const fetchAvailableMonths = async () => {
      try {
        const response = await axios.get('/api/bitcoin/available-months');
        const { minMonth, maxMonth } = response.data;

        const startDate = new Date(minMonth + '-01');
        const endDate = new Date(maxMonth + '-01');
        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(0); // Set to the last day of the previous month

        const monthList = [];

        while (startDate <= endDate) {
          const yearMonth = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`;
          monthList.push({ value: yearMonth, text: startDate.toLocaleString('default', { month: 'long', year: 'numeric' }) });
          startDate.setMonth(startDate.getMonth() + 1);
        }

        months.value = monthList;
      } catch (error) {
        console.error('Failed to fetch available months:', error);
      }
    };

    const fetchMonthlyData = debounce(async () => {
      const [year, month] = selectedMonth.value.split('-');
      try {
        const response = await axios.get(`/api/bitcoin/monthly/${year}/${month}`);
        bitcoinData.value = response.data;
        renderChart();
      } catch (error) {
        console.error('Failed to fetch Bitcoin data:', error);
      }
    }, 300);

    const renderChart = () => {
      const ctx = document.getElementById('smaChart') as HTMLCanvasElement | null;
      if (!ctx) {
        console.error('Failed to get canvas context');
        return;
      }
      if (chartInstance.value) {
        chartInstance.value.destroy();
      }
      chartInstance.value = new Chart(ctx.getContext('2d')!, {
        type: 'line',
        data: {
          labels: bitcoinData.value.map(item => item.date),
          datasets: [
            {
              label: 'Max Price',
              data: bitcoinData.value.map(item => item.max_price),
              borderColor: 'blue',
              fill: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'time',
              time: {
                unit: 'day'
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
                  const data = bitcoinData.value[context.dataIndex];
                  return [
                    `Date: ${data.date}`,
                    `Max Price: ${data.max_price}`
                  ];
                }
              }
            }
          }
        }
      });
    };

    const prevMonth = () => {
      const date = new Date(selectedMonth.value + '-01T00:00:00Z');
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() - 1);
      selectedMonth.value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      fetchMonthlyData();
    };

    const nextMonth = () => {
      const date = new Date(selectedMonth.value + '-01T00:00:00Z');
      date.setUTCDate(1);
      date.setUTCMonth(date.getUTCMonth() + 1);
      selectedMonth.value = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      fetchMonthlyData();
    };

    const hasPrevMonth = computed(() => {
      const currentIndex = months.value.findIndex(month => month.value === selectedMonth.value);
      return currentIndex > 0;
    });

    const hasNextMonth = computed(() => {
      const currentIndex = months.value.findIndex(month => month.value === selectedMonth.value);
      return currentIndex < months.value.length - 1;
    });

    onMounted(() => {
      fetchAvailableMonths();
      fetchMonthlyData();
    });

    return {
      bitcoinData,
      selectedMonth,
      months,
      prevMonth,
      nextMonth,
      fetchMonthlyData,
      hasPrevMonth,
      hasNextMonth
    };
  }
};
</script>

<style scoped>
.month-selector {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}
.month-selector button {
  margin: 0 10px;
}
.chart-container {
  position: relative;
  width: 100%;
  height: 400px;
}
canvas {
  max-width: 100%;
}
</style>
