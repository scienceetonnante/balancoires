class ChartManager {
    constructor(maxDataPoints) {
        // Initialize chart properties
        this.accChart = null;
        this.angleChart = null;
        this.maxDataPoints = maxDataPoints;
        
        // Initialize datasets
        this.accDatasets = [
            { label: 'X', data: [], borderColor: 'rgb(255, 99, 132)', fill: false },
            { label: 'Y', data: [], borderColor: 'rgb(75, 192, 192)', fill: false },
            { label: 'Z', data: [], borderColor: 'rgb(153, 102, 255)', fill: false }
        ];
        
        this.angleDataset = [
            { label: 'Inclinaison', data: [], borderColor: 'rgb(255, 159, 64)', fill: false }
        ];
    }

    initCharts() {
        // Destroy existing charts if they exist
        if (this.accChart) {
            this.accChart.destroy();
        }
        if (this.angleChart) {
            this.angleChart.destroy();
        }

        // Reset datasets
        this.accDatasets.forEach(dataset => dataset.data = []);
        this.angleDataset[0].data = [];

        // Common chart options
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    ticks: {
                        callback: (value, index) => {
                            return (-window.app.TIME_WINDOW_SECONDS * (1 - index/this.maxDataPoints)).toFixed(1);
                        }
                    },
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    }
                }
            },
            animation: {
                duration: 0  // Disable animations for better performance
            },
            plugins: {
                legend: {
                    position: 'top',
                },
            }
        };

        // Initialize accelerometer chart
        this.initAccelerometerChart(commonOptions);

        // Initialize angle chart
        this.initAngleChart(commonOptions);
    }

    initAccelerometerChart(commonOptions) {
        const ctx = document.getElementById('accelerometerChart').getContext('2d');
        this.accChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(this.maxDataPoints).fill(''),
                datasets: this.accDatasets
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        min: -10,
                        max: 10,
                        title: {
                            display: true,
                            text: 'Accelération (m/s²)'
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Accélération au cours du temps'
                    }
                }
            }
        });
    }

    initAngleChart(commonOptions) {
        const ctx = document.getElementById('angleChart').getContext('2d');
        this.angleChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array(this.maxDataPoints).fill(''),
                datasets: this.angleDataset
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        min: -90,
                        max: 90,
                        title: {
                            display: true,
                            text: "Angle d'inclinaison (degrees)"
                        }
                    }
                },
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: "Angle d'inclinaison au cours du temps"
                    }
                }
            }
        });
    }

    updateCharts(x, y, z, angle) {
        // Update acceleration datasets
        this.accDatasets[0].data.push(x);
        this.accDatasets[1].data.push(y);
        this.accDatasets[2].data.push(z);

        // Update angle dataset
        this.angleDataset[0].data.push(angle);

        // Remove old data points if necessary
        if (this.accDatasets[0].data.length > this.maxDataPoints) {
            this.accDatasets.forEach(dataset => dataset.data.shift());
            this.angleDataset[0].data.shift();
        }

        // Update both charts
        this.accChart.update();
        this.angleChart.update();
    }

    // Method to update the maximum number of data points
    updateMaxDataPoints(newMax) {
        this.maxDataPoints = newMax;
        this.initCharts(); // Reinitialize charts with new buffer size
    }

    // Method to get the current data (useful for analysis or export)
    getCurrentData() {
        return {
            acceleration: {
                x: [...this.accDatasets[0].data],
                y: [...this.accDatasets[1].data],
                z: [...this.accDatasets[2].data]
            },
            angle: [...this.angleDataset[0].data]
        };
    }

    // Method to clear all data
    clearData() {
        this.accDatasets.forEach(dataset => dataset.data = []);
        this.angleDataset[0].data = [];
        this.accChart.update();
        this.angleChart.update();
    }

    // Method to resize charts (useful when window size changes)
    resize() {
        if (this.accChart) this.accChart.resize();
        if (this.angleChart) this.angleChart.resize();
    }
}

// Export for use in other files
window.ChartManager = ChartManager;

// Add window resize handler
window.addEventListener('resize', () => {
    if (window.app && window.app.charts) {
        window.app.charts.resize();
    }
});
