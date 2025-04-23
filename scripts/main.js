document.addEventListener('DOMContentLoaded', () => {
    const lightEffect = document.querySelector('.light-effect');
    const permissionBtn = document.getElementById('permission-btn');
    let gyroscopeEnabled = false;

    // Check if device has gyroscope
    if (window.DeviceOrientationEvent) {
        permissionBtn.addEventListener('click', requestPermission);
    } else {
        permissionBtn.textContent = 'Gyroscope not available';
        permissionBtn.disabled = true;
    }

    // Request permission for iOS 13+ devices
    function requestPermission() {
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ requires permission
            DeviceOrientationEvent.requestPermission()
                .then(permissionState => {
                    if (permissionState === 'granted') {
                        enableGyroscope();
                    } else {
                        alert('Permission to use gyroscope was denied');
                    }
                })
                .catch(console.error);
        } else {
            // Non-iOS 13+ devices don't need permission
            enableGyroscope();
        }
    }

    function enableGyroscope() {
        gyroscopeEnabled = true;
        permissionBtn.textContent = 'Gyroscope Enabled';
        permissionBtn.disabled = true;
        window.addEventListener('deviceorientation', handleOrientation);
    }

    function handleOrientation(event) {
        if (!gyroscopeEnabled) return;

        // Get the orientation data
        const beta = event.beta;  // -180 to 180 (front/back tilt)
        const gamma = event.gamma; // -90 to 90 (left/right tilt)

        // Calculate position based on device orientation
        // Limit the movement range to keep the light on screen
        const maxOffset = 40; // Maximum percentage offset from center

        // Convert tilt to percentage offset (limited range)
        const xOffset = clamp((gamma / 45) * maxOffset, -maxOffset, maxOffset);
        const yOffset = clamp((beta / 45) * maxOffset, -maxOffset, maxOffset);

        // Apply the transform to move the light
        lightEffect.style.transform = `translate(${xOffset}%, ${yOffset}%)`;
    }

    // Helper function to clamp values between min and max
    function clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    // Fallback for desktop testing - mouse movement controls light
    if (!window.DeviceOrientationEvent || window.DeviceOrientationEvent && !window.DeviceOrientationEvent.requestPermission) {
        document.addEventListener('mousemove', (e) => {
            if (!gyroscopeEnabled) {
                // Enable with first mouse move if no gyroscope
                gyroscopeEnabled = true;
                permissionBtn.textContent = 'Mouse Control Enabled';
                permissionBtn.disabled = true;
            }

            // Calculate mouse position relative to center of screen
            const xPos = ((e.clientX / window.innerWidth) - 0.5) * 100;
            const yPos = ((e.clientY / window.innerHeight) - 0.5) * 100;

            // Apply the transform to move the light
            lightEffect.style.transform = `translate(${xPos}%, ${yPos}%)`;
        });
    }
});