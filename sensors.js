class SensorManager {
    constructor(onDataCallback) {
        // Store the callback that will be called with sensor data
        this.onDataCallback = onDataCallback;
        
        // Bind methods to maintain proper 'this' context
        this.handleMotion = this.handleMotion.bind(this);
        
        // Initialize state
        this.isMonitoring = false;
        this.hasPermission = false;
    }

    async requestPermission() {
        // Check if we need to request permission (iOS requires this)
        if (typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permission = await DeviceMotionEvent.requestPermission();
                this.hasPermission = (permission === 'granted');
                return this.hasPermission;
            } catch (error) {
                console.error('Error requesting motion permission:', error);
                throw new Error('Motion permission denied');
            }
        } else {
            // Permission not required (Android, desktop)
            this.hasPermission = true;
            return true;
        }
    }

    async startMonitoring() {
        // Check if we're already monitoring
        if (this.isMonitoring) {
            this.stopMonitoring();
        }

        try {
            // Request permission if we don't have it
            if (!this.hasPermission) {
                await this.requestPermission();
            }

            // Add the event listener
            window.addEventListener('devicemotion', this.handleMotion);
            this.isMonitoring = true;

            // Basic check for sensor availability
            this.checkSensorAvailability();

        } catch (error) {
            console.error('Failed to start sensor monitoring:', error);
            throw new Error('Could not initialize sensors');
        }
    }

    stopMonitoring() {
        window.removeEventListener('devicemotion', this.handleMotion);
        this.isMonitoring = false;
    }

    handleMotion(event) {
        // Check if we have acceleration data
        if (!event.accelerationIncludingGravity) {
            console.warn('No acceleration data available');
            return;
        }

        // Call the callback with the event data
        this.onDataCallback(event);
    }

    checkSensorAvailability() {
        // Set up a timeout to check if we're receiving sensor data
        let dataReceived = false;
        
        const timeoutId = setTimeout(() => {
            if (!dataReceived) {
                console.warn('No sensor data received within 1 second');
                alert('No accelerometer data detected. Please ensure your device has motion sensors and they are enabled.');
            }
        }, 1000);

        // Create one-time event listener to clear the timeout
        const checkData = () => {
            dataReceived = true;
            clearTimeout(timeoutId);
            window.removeEventListener('devicemotion', checkData);
        };

        window.addEventListener('devicemotion', checkData);
    }

    // Utility method to check if device motion is supported
    static isSupported() {
        return 'DeviceMotionEvent' in window;
    }

    // Utility method to get sensor update frequency (if available)
    getSensorFrequency() {
        // Note: This is not supported in all browsers/devices
        if (DeviceMotionEvent.interval) {
            return 1000 / DeviceMotionEvent.interval; // Convert to Hz
        }
        return null;
    }

    // Method to check if high precision sensors are available
    async checkHighPrecisionAvailable() {
        // This is a future-proofing method for when more browsers support 
        // the Sensor APIs directly
        if ('Accelerometer' in window) {
            try {
                const sensor = new Accelerometer();
                return true;
            } catch (error) {
                return false;
            }
        }
        return false;
    }

    // Get current monitoring status
    getStatus() {
        return {
            isMonitoring: this.isMonitoring,
            hasPermission: this.hasPermission,
            sensorFrequency: this.getSensorFrequency(),
        };
    }
}

// Export for use in other files
window.SensorManager = SensorManager;
