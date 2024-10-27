class SwingAnalysis {
    constructor() {
        // Configuration for analysis
        this.config = {
            // Buffer size for frequency analysis
            frequencyBufferSize: 128,
            // Minimum peak height for oscillation detection (in degrees)
            minPeakHeight: 5,
            // Minimum time between peaks (in ms)
            minPeakDistance: 500
        };

        // Initialize buffers for analysis
        this.angleBuffer = [];
        this.timeBuffer = [];
        this.peakTimes = [];
        
        // Analysis results
        this.frequency = null;
        this.amplitude = null;
        this.energy = null;
    }

    calculateTiltAngle(y, z) {
        // Calculate tilt angle from accelerometer data
        // Using atan2 to get angle in range [-π, π]
        const angleRad = Math.atan2(z, -y);
        return angleRad * (180 / Math.PI); // Convert to degrees
    }

    updateAnalysis(timestamp, x, y, z) {
        // Calculate current angle
        const angle = this.calculateTiltAngle(y, z);
        
        // Update buffers
        this.angleBuffer.push(angle);
        this.timeBuffer.push(timestamp);

        // Keep buffer size limited
        if (this.angleBuffer.length > this.config.frequencyBufferSize) {
            this.angleBuffer.shift();
            this.timeBuffer.shift();
        }

        // Perform analysis if we have enough data
        if (this.angleBuffer.length >= this.config.frequencyBufferSize) {
            this.detectOscillations();
            this.calculateEnergy(x, y, z);
        }

        return {
            angle,
            frequency: this.frequency,
            amplitude: this.amplitude,
            energy: this.energy
        };
    }

    detectOscillations() {
        // Find peaks in angle data
        const peaks = this.findPeaks();
        
        if (peaks.length >= 2) {
            // Calculate frequency from peak times
            const peakIntervals = [];
            for (let i = 1; i < peaks.length; i++) {
                const interval = this.timeBuffer[peaks[i]] - this.timeBuffer[peaks[i-1]];
                peakIntervals.push(interval);
            }
            
            // Average interval between peaks
            const avgInterval = peakIntervals.reduce((a, b) => a + b, 0) / peakIntervals.length;
            this.frequency = 1000 / avgInterval; // Convert to Hz

            // Calculate amplitude from average peak height
            const peakValues = peaks.map(i => Math.abs(this.angleBuffer[i]));
            this.amplitude = peakValues.reduce((a, b) => a + b, 0) / peakValues.length;
        }
    }

    findPeaks() {
        const peaks = [];
        
        // Simple peak detection algorithm
        for (let i = 1; i < this.angleBuffer.length - 1; i++) {
            const prev = this.angleBuffer[i - 1];
            const curr = this.angleBuffer[i];
            const next = this.angleBuffer[i + 1];
            
            // Check if current point is a peak
            if (curr > prev && curr > next && Math.abs(curr) > this.config.minPeakHeight) {
                // Check minimum distance from last peak
                if (peaks.length === 0 || 
                    (this.timeBuffer[i] - this.timeBuffer[peaks[peaks.length - 1]]) > this.config.minPeakDistance) {
                    peaks.push(i);
                }
            }
        }
        
        return peaks;
    }

    calculateEnergy(x, y, z) {
        if (!this.frequency || !this.amplitude) return;

        // Calculate approximate kinetic and potential energy
        // This is a simplified model assuming simple pendulum motion
        
        // Constants
        const g = 9.81; // gravity in m/s²
        const L = 1.0;  // assumed pendulum length in meters (can be calibrated)
        
        // Maximum potential energy at peak amplitude
        const maxPotentialEnergy = g * L * (1 - Math.cos(this.amplitude * Math.PI / 180));
        
        // Current kinetic energy from accelerometer readings
        const velocity = Math.sqrt(x*x + y*y + z*z);
        const kineticEnergy = 0.5 * velocity * velocity;

        // Total mechanical energy (simplified)
        this.energy = maxPotentialEnergy + kineticEnergy;
    }

    // Utility method to get moving average of angle
    getSmoothedAngle(windowSize = 5) {
        if (this.angleBuffer.length < windowSize) return null;
        
        const sum = this.angleBuffer.slice(-windowSize)
            .reduce((a, b) => a + b, 0);
        return sum / windowSize;
    }

    // Method to get current swing state
    getSwingState() {
        return {
            frequency: this.frequency ? this.frequency.toFixed(2) : null,
            amplitude: this.amplitude ? this.amplitude.toFixed(1) : null,
            energy: this.energy ? this.energy.toFixed(2) : null,
            periodSeconds: this.frequency ? (1 / this.frequency).toFixed(2) : null
        };
    }

    // Method to reset analysis
    reset() {
        this.angleBuffer = [];
        this.timeBuffer = [];
        this.peakTimes = [];
        this.frequency = null;
        this.amplitude = null;
        this.energy = null;
    }

    // Method to update configuration
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.reset(); // Reset analysis with new configuration
    }

    // Method to get frequency spectrum (for debugging)
    getFrequencySpectrum() {
        if (this.angleBuffer.length < this.config.frequencyBufferSize) return null;
        
        // Implement FFT analysis here if needed
        // This would be useful for more detailed frequency analysis
        return {
            dominantFrequency: this.frequency,
            confidence: this.calculateConfidence()
        };
    }

    // Calculate confidence in frequency measurement
    calculateConfidence() {
        if (!this.frequency || this.peakTimes.length < 3) return 0;
        
        // Calculate variance in peak intervals
        const intervals = [];
        for (let i = 1; i < this.peakTimes.length; i++) {
            intervals.push(this.peakTimes[i] - this.peakTimes[i-1]);
        }
        
        const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((a, b) => a + (b - mean) ** 2, 0) / intervals.length;
        
        // Convert variance to confidence score (0-1)
        return Math.exp(-variance / (mean * mean));
    }
}

// Export for use in other files
window.SwingAnalysis = SwingAnalysis;
