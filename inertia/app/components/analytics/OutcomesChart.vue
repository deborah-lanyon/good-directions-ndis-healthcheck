<template>
  <Bar :data="chartData" :options="chartOptions" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface OutcomeStats {
  welcomed: number
  packLeft: number
  reschedule: number
  notInterested: number
  notHome: number
  notVisited: number
}

const props = defineProps<{
  data: OutcomeStats
}>()

const chartData = computed(() => ({
  labels: ['Welcomed', 'Pack Left', 'Reschedule', 'Not Interested', 'Not Home', 'Not Visited'],
  datasets: [
    {
      label: 'Count',
      data: [
        props.data.welcomed,
        props.data.packLeft,
        props.data.reschedule,
        props.data.notInterested,
        props.data.notHome,
        props.data.notVisited,
      ],
      backgroundColor: [
        '#4CAF50', // green - welcomed
        '#3b82f6', // blue - pack left
        '#f59e0b', // amber - reschedule
        '#ef4444', // red - not interested
        '#8b5cf6', // purple - not home
        '#9ca3af', // gray - not visited
      ],
      borderRadius: 4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (context: { parsed: { y: number } }) => {
          return `${context.parsed.y} properties`
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        precision: 0,
      },
    },
    x: {
      ticks: {
        maxRotation: 45,
        minRotation: 45,
      },
    },
  },
}
</script>
