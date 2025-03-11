/**
 * Chart theme configuration specifically optimized for dashboard charts
 */
export const dashboardChartTheme = {
  // Base theme for all charts in dashboards
  base: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: "12px",
    animation: {
      duration: 0, // Disable animations in dashboards for better performance
    },
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
    },
    elements: {
      line: {
        tension: 0.2, // Slight curve for smoother appearance
        borderWidth: 2,
      },
      point: {
        radius: 2, // Smaller points for cleaner look
        hoverRadius: 4,
      },
      bar: {
        borderWidth: 0,
      },
    },
    plugins: {
      legend: {
        display: false, // Hide legend by default to save space
        position: "bottom",
        labels: {
          boxWidth: 12,
          usePointStyle: true,
          padding: 10,
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          size: 11,
        },
        bodyFont: {
          size: 10,
        },
        padding: 8,
        cornerRadius: 4,
        displayColors: true,
      },
      title: {
        display: false, // Hide title as it's shown in the card header
      },
    },
    scales: {
      x: {
        grid: {
          display: false, // Hide grid lines for cleaner look
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          maxRotation: 0, // Prevent label rotation
          padding: 5,
          autoSkip: true,
          maxTicksLimit: 6, // Limit number of labels for readability
        },
      },
      y: {
        grid: {
          display: true,
          color: "rgba(0,0,0,0.05)",
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 10,
          },
          padding: 5,
          maxTicksLimit: 5, // Limit number of ticks for cleaner look
        },
        beginAtZero: true,
      },
    },
  },

  // Type-specific overrides
  bar: {
    borderRadius: 2,
    maxBarThickness: 40,
  },

  line: {
    fill: false,
    spanGaps: true,
  },

  pie: {
    cutout: "0%",
  },

  doughnut: {
    cutout: "70%",
  },

  // Color schemes
  colors: {
    primary: [
      "rgba(79, 70, 229, 1)",
      "rgba(45, 212, 191, 1)",
      "rgba(249, 115, 22, 1)",
      "rgba(139, 92, 246, 1)",
      "rgba(236, 72, 153, 1)",
      "rgba(14, 165, 233, 1)",
      "rgba(168, 85, 247, 1)",
      "rgba(245, 158, 11, 1)",
    ],
  },
};
