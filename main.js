// Main application class to coordinate all swing monitoring functionality
class SwingMonitor {
    constructor() {
        // Constants that were previously controls
        this.TIME_WINDOW_SECONDS = 30;
        this.SAMPLE_INTERVAL_MS = 100;

        // Initialize class properties
        this.sampleCount = 0;
        this.monitoringStartTime = 0;
        this.lastUpdateTime = 0;
        this.isMonitoring = false;

        // Bind methods to maintain proper 'this' context
        this.handleSensorData = this.handleSensorData.bind(this);
        this.startMonitoring = this.startMonitoring.bind(this);
        
        // Store DOM element references
        this.elements = {
            startButton: document.getElementById('startButton'),
            actualRate: document.getElementById('actualRate'),
            bufferSize: document.getElementById('bufferSize'),
            accX: document.getElementById('acc-x'),
            accY: document.getElementById('acc-y'),
            accZ: document.getElementById('acc-z'),
            tilt: document.getElementById('tilt')
        };
    }

    init() {
        // Create instances of our core components
        this.analysis = new SwingAnalysis();
        this.charts = new ChartManager(this.calculateBufferSize());
        this.sensors = new SensorManager(this.handleSensorData);

        // Set up event listeners
        this.setupEventListeners();

        // Initialize charts
        this.charts.initCharts();
    }

    setupEventListeners() {
        // Button events
        this.elements.startButton.addEventListener('click', this.startMonitoring);

        // Control changes
        this.elements.timeWindow.addEventListener('change', this.handleTimeWindowChange);
        this.elements.sampleInterval.addEventListener('change', this.handleSampleIntervalChange);
    }

    calculateBufferSize() {
        return Math.ceil((this.TIME_WINDOW_SECONDS * 1000) / this.SAMPLE_INTERVAL_MS);
    }

    async startMonitoring() {
        try {
            // Reset monitoring state
            this.sampleCount = 0;
            this.monitoringStartTime = performance.now();
            this.lastUpdateTime = this.monitoringStartTime;
            this.isMonitoring = true;

            // Initialize new charts
            this.charts.initCharts();

            // Start sensor monitoring
            await this.sensors.startMonitoring();

            // Update button text
            this.elements.startButton.textContent = 'Restart';
        } catch (error) {
            console.error('Failed to start monitoring:', error);
            alert('Failed to start monitoring. Please check if your device supports accelerometer access.');
        }
    }

    handleSensorData(event) {
        if (!this.isMonitoring) return;

        const now = performance.now();

        // Check if we should process this sample based on our desired interval
        if (now - this.lastUpdateTime < this.SAMPLE_INTERVAL_MS) {
            return;
        }

        // Extract acceleration data
        const x = event.accelerationIncludingGravity.x;
        const y = event.accelerationIncludingGravity.y;
        const z = event.accelerationIncludingGravity.z;

        // Skip if we don't have valid data
        if (x === null || y === null || z === null) return;

        // Update display values
        this.updateDisplayValues(x, y, z);

        // Calculate tilt angle
        const angle = this.analysis.calculateTiltAngle(y, z);

        // Update charts
        this.charts.updateCharts(x, y, z, angle);

        // Update statistics
        this.updateStats(now);

        this.lastUpdateTime = now;
    }

    updateDisplayValues(x, y, z) {
        this.elements.accX.textContent = x.toFixed(2);
        this.elements.accY.textContent = y.toFixed(2);
        this.elements.accZ.textContent = z.toFixed(2);
        
        const angle = this.analysis.calculateTiltAngle(y, z);
        this.elements.tilt.textContent = angle.toFixed(1);
    }

    updateStats(now) {
        this.sampleCount++;
        const elapsedTime = (now - this.monitoringStartTime) / 1000;
        const actualRate = this.sampleCount / elapsedTime;
        
        this.elements.actualRate.textContent = actualRate.toFixed(1);
        this.elements.bufferSize.textContent = this.calculateBufferSize();
    }

    stop() {
        this.isMonitoring = false;
        this.sensors.stopMonitoring();
    }
}

// Initialize the application when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance
    window.app = new SwingMonitor();
    window.app.init();
});
