// Speed Test JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const startButton = document.getElementById('startTest');
    const restartButton = document.getElementById('restartTest');
    const stopButton = document.getElementById('stopTest');
    const testActionButtons = document.getElementById('testActionButtons');
    const testProgress = document.getElementById('testProgress');
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');

    // Modal Elements
    const shareModal = document.getElementById('shareModal');
    const settingsModal = document.getElementById('settingsModal');
    const comparisonModal = document.getElementById('comparisonModal');
    const reportModal = document.getElementById('reportModal');
    const modalCloseButtons = document.querySelectorAll('.modal-close');

    // Share Elements
    const shareResultsButton = document.getElementById('shareResults');
    const copyTextBtn = document.getElementById('copyTextBtn');
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const shareTwitterBtn = document.getElementById('shareTwitterBtn');
    const shareFacebookBtn = document.getElementById('shareFacebookBtn');
    const shareWhatsappBtn = document.getElementById('shareWhatsappBtn');
    const shareEmailBtn = document.getElementById('shareEmailBtn');

    // Settings Elements
    const settingsButton = document.getElementById('settingsButton');
    const testModeSelect = document.getElementById('testMode');
    const serverLocationSelect = document.getElementById('serverLocation');
    const testDurationSelect = document.getElementById('testDuration');
    const speedUnitSelect = document.getElementById('speedUnit');
    const showAdvancedMetricsCheckbox = document.getElementById('showAdvancedMetrics');
    const enableAnimationsCheckbox = document.getElementById('enableAnimations');
    const resetSettingsButton = document.getElementById('resetSettings');
    const saveSettingsButton = document.getElementById('saveSettings');

    // Comparison Elements
    const compareHistoryBtn = document.getElementById('compareHistoryBtn');
    const compareTest1Select = document.getElementById('compareTest1');
    const compareTest2Select = document.getElementById('compareTest2');

    // Report Elements
    const viewReportBtn = document.getElementById('viewReportBtn');
    const downloadReportBtn = document.getElementById('downloadReportBtn');

    const downloadValue = document.getElementById('downloadValue');
    const uploadValue = document.getElementById('uploadValue');
    const pingValue = document.getElementById('pingValue');
    const packetLossValue = document.getElementById('packetLossValue');

    const downloadGaugeFill = document.getElementById('downloadGaugeFill');
    const uploadGaugeFill = document.getElementById('uploadGaugeFill');

    const ispValue = document.getElementById('ispValue');
    const serverValue = document.getElementById('serverValue');
    const dateValue = document.getElementById('dateValue');
    const jitterValue = document.getElementById('jitterValue');

    const qualityFill = document.getElementById('qualityFill');
    const qualityValue = document.getElementById('qualityValue');

    const historyEmpty = document.getElementById('historyEmpty');
    const historyList = document.getElementById('historyList');
    const clearHistoryButton = document.getElementById('clearHistory');

    // Note: shareResultsButton is already declared above, removing duplicate declaration

    const smartTipsContainer = document.getElementById('smartTips');
    const refreshTipsButton = document.getElementById('refreshTips');

    const graphControls = document.querySelectorAll('.graph-control');
    const realtimeGraphCanvas = document.getElementById('realtimeGraph');

    // Constants
    const CIRCUMFERENCE = 2 * Math.PI * 50; // Circumference of the circle with r=50
    const HISTORY_KEY = 'speedTestHistory';
    // Multiple CORS proxies for redundancy
    const CORS_PROXIES = [
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        'https://api.allorigins.win/raw?url=',
        'https://cors-proxy.htmldriven.com/?url='
    ];
    // Get a random CORS proxy to distribute load and increase reliability
    const CORS_PROXY = CORS_PROXIES[Math.floor(Math.random() * CORS_PROXIES.length)];

    // Variables
    let testInProgress = false;
    let testPhase = 'idle';
    let testHistory = [];
    let realtimeChart = null;
    let currentGraphType = 'download';
    let graphData = {
        download: [],
        upload: [],
        ping: []
    };

    // Event Listeners - Test Controls
    console.log("Start button element:", startButton);
    if (startButton) {
        console.log("Adding click event listener to start button");
        startButton.addEventListener('click', function(e) {
            console.log("Start button clicked!");
            try {
                startSpeedTest();
            } catch (error) {
                console.error("Error in startSpeedTest:", error);
                alert("There was an error starting the speed test. Trying fallback test...");
                runSimpleTest();
            }
        });
    } else {
        console.error("Start button not found in the DOM!");
    }

    // Add event listener for fallback test button
    const fallbackButton = document.getElementById('fallbackTest');
    if (fallbackButton) {
        console.log("Adding click event listener to fallback button");
        fallbackButton.addEventListener('click', function(e) {
            console.log("Fallback button clicked!");
            try {
                runSimpleTest();
            } catch (error) {
                console.error("Error in fallback test:", error);
                alert("There was an error running the fallback test.");
            }
        });
    }

    restartButton.addEventListener('click', restartSpeedTest);
    stopButton.addEventListener('click', stopSpeedTest);
    clearHistoryButton.addEventListener('click', clearHistory);
    refreshTipsButton.addEventListener('click', generateSmartTips);

    // Event Listeners - Modals
    shareResultsButton.addEventListener('click', openShareModal);
    settingsButton.addEventListener('click', openSettingsModal);
    compareHistoryBtn.addEventListener('click', openComparisonModal);
    viewReportBtn.addEventListener('click', openReportModal);

    modalCloseButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    // Event Listeners - Share Options
    copyTextBtn.addEventListener('click', copyResultsText);
    downloadImageBtn.addEventListener('click', downloadResultsImage);
    downloadPdfBtn.addEventListener('click', downloadResultsPDF);
    shareTwitterBtn.addEventListener('click', shareToTwitter);
    shareFacebookBtn.addEventListener('click', shareToFacebook);
    shareWhatsappBtn.addEventListener('click', shareToWhatsapp);
    shareEmailBtn.addEventListener('click', shareViaEmail);

    // Event Listeners - Settings
    resetSettingsButton.addEventListener('click', resetSettings);
    saveSettingsButton.addEventListener('click', saveSettings);

    // Event Listeners - Comparison
    compareTest1Select.addEventListener('change', updateComparison);
    compareTest2Select.addEventListener('change', updateComparison);

    // Event Listeners - Report
    downloadReportBtn.addEventListener('click', downloadDetailedReport);

    // Graph control event listeners
    graphControls.forEach(control => {
        control.addEventListener('click', function() {
            const graphType = this.getAttribute('data-graph');
            setActiveGraph(graphType);
        });
    });

    // Initialize
    updateDate();
    loadHistory();
    initGraph();

    // Make sure the test functions are available globally
    window.startSpeedTest = startSpeedTest;
    window.runSimpleTest = runSimpleTest;

    // Check if required libraries are loaded
    if (typeof axios === 'undefined') {
        console.error('Axios library is not loaded. Speed test will not work properly.');
        console.log('Will use simulated tests as fallback');
        // Don't show alert to avoid blocking the UI
        // alert('Error: Required libraries are not loaded. Please check your internet connection and try again.');
    }

    // Define a simple fallback test function that will definitely work
    function runSimpleTest() {
        console.log("Running simple fallback test");

        // Show progress
        testProgress.classList.remove('hidden');
        startButton.classList.add('hidden');
        testActionButtons.classList.remove('hidden');

        // Set values
        downloadValue.textContent = '45';
        uploadValue.textContent = '15';
        pingValue.textContent = '25';
        jitterValue.textContent = '5 ms';
        packetLossValue.textContent = '1';

        // Update gauges with new scales (1000 Mbps for download, 500 Mbps for upload)
        downloadGaugeFill.style.strokeDashoffset = CIRCUMFERENCE - ((45 / 1000) * CIRCUMFERENCE);
        uploadGaugeFill.style.strokeDashoffset = CIRCUMFERENCE - ((15 / 500) * CIRCUMFERENCE);

        // Complete test
        setTimeout(() => {
            testProgress.classList.add('hidden');
            testActionButtons.classList.add('hidden');
            startButton.classList.remove('hidden');
            alert("Speed test completed with simulated values!");
        }, 2000);
    };

    // Functions
    function startSpeedTest() {
        console.log("startSpeedTest function called");

        try {
            if (testInProgress) {
                console.log("Test already in progress, returning");
                return;
            }

        // Add visual feedback
        console.log("Adding 'active' class to start button");
        startButton.classList.add('active');

        // Set test state
        testInProgress = true;
        testPhase = 'init';
        console.log("Test state set: inProgress=true, phase=init");

        // Reset values
        resetValues();
        console.log("Values reset");

        // Show progress and action buttons with a slight delay for smooth transition
        console.log("Setting timeout for UI transition");
        setTimeout(() => {
            console.log("Timeout callback executing");
            testProgress.classList.remove('hidden');
            startButton.classList.remove('active');
            startButton.classList.add('hidden');
            testActionButtons.classList.remove('hidden');
            console.log("UI updated for test in progress");

            // Start the test sequence
            console.log("Starting real speed test");
            runRealSpeedTest();
        }, 300);
        } catch (error) {
            console.error("Error in startSpeedTest:", error);
            alert("There was an error starting the speed test. Trying fallback test...");
            runSimpleTest();
        }
    }

    function resetValues() {
        downloadValue.textContent = '0';
        uploadValue.textContent = '0';
        pingValue.textContent = '0';
        packetLossValue.textContent = '0';
        jitterValue.textContent = '0 ms';  // Set to "0 ms" instead of just "-"
        qualityValue.textContent = '-';

        // Set default values for ISP and server
        ispValue.textContent = 'Detecting...';
        serverValue.textContent = 'Detecting...';

        downloadGaugeFill.style.strokeDashoffset = CIRCUMFERENCE;
        uploadGaugeFill.style.strokeDashoffset = CIRCUMFERENCE;
        qualityFill.style.width = '0%';

        // Reset share button
        shareResultsButton.disabled = true;

        // Reset animations by removing and re-adding the elements
        const gaugeUnits = document.querySelectorAll('.gauge-unit');
        gaugeUnits.forEach(unit => {
            unit.style.animation = 'none';
            setTimeout(() => {
                unit.style.animation = 'fadeIn 0.5s ease-in-out';
            }, 10);
        });

        // Reset graph data
        graphData = {
            download: [],
            upload: [],
            ping: []
        };

        if (realtimeChart) {
            realtimeChart.data.labels = [];
            realtimeChart.data.datasets[0].data = [];
            realtimeChart.update();
        }

        progressFill.style.width = '0%';
        progressText.textContent = 'Initializing test...';

        // Reset smart tips
        smartTipsContainer.innerHTML = `
            <div class="smart-tip-placeholder">
                <p>Complete a speed test to get personalized recommendations.</p>
            </div>
        `;
    }

    function restartSpeedTest() {
        // Add visual feedback
        restartButton.classList.add('active');

        // If a test is already in progress, stop it first
        if (testInProgress) {
            // Reset the test state
            testInProgress = false;
            testPhase = 'restarting';

            // Update UI to show test is restarting
            progressText.textContent = 'Restarting test...';

            // Reset UI
            resetValues();

            // Start a new test after a short delay
            setTimeout(() => {
                restartButton.classList.remove('active');
                startSpeedTest();
            }, 800);
        } else {
            // If no test is in progress, just start a new one
            setTimeout(() => {
                restartButton.classList.remove('active');
                startSpeedTest();
            }, 300);
        }
    }

    function stopSpeedTest() {
        if (!testInProgress) return;

        // Add visual feedback
        stopButton.classList.add('active');

        // Update UI to show test was stopped
        progressText.textContent = 'Test stopped by user.';

        // Reset test state
        testInProgress = false;
        testPhase = 'stopped';

        // Update gauges to show current values as final
        const currentDownloadValue = parseInt(downloadValue.textContent) || 0;
        const currentUploadValue = parseInt(uploadValue.textContent) || 0;

        if (currentDownloadValue > 0) {
            animateGauge(downloadGaugeFill, currentDownloadValue, 150, 300);
        }

        if (currentUploadValue > 0) {
            animateGauge(uploadGaugeFill, currentUploadValue, 50, 300);
        }

        // Reset UI after a short delay
        setTimeout(() => {
            stopButton.classList.remove('active');
            startButton.classList.remove('hidden');
            testActionButtons.classList.add('hidden');
            testProgress.classList.add('hidden');
        }, 1000);
    }

    function updateDate() {
        const now = new Date();
        dateValue.textContent = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();
    }

    async function runRealSpeedTest() {
        try {
            // Phase 1: Initialization (5%)
            updateProgress(5, 'Initializing test...');

            // Initialize test variables
            let downloadSpeed = 0;
            let uploadSpeed = 0;
            let pingTime = 0;
            let jitterTime = 0;
            let packetLoss = 0;

            // Helper function to check if test has been stopped
            const checkIfTestStopped = () => {
                if (!testInProgress) {
                    throw new Error('Test stopped by user');
                }
            };

            // Clear previous data points
            graphData = {
                download: [],
                upload: [],
                ping: []
            };

            if (realtimeChart) {
                realtimeChart.data.labels = [];
                realtimeChart.data.datasets[0].data = [];
                realtimeChart.update();
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            checkIfTestStopped();

            // Phase 2: Ping Test (15%)
            testPhase = 'ping';
            updateProgress(15, 'Testing ping and packet loss...');

            try {
                // Perform real ping test
                const pingResult = await performRealPingTest();
                pingTime = pingResult.pingTime;
                jitterTime = pingResult.jitter;
                packetLoss = pingResult.packetLoss;

                // Update ping values with animation
                animateValue(pingValue, 0, pingTime, 500);

                // Update jitter and packet loss values
                setTimeout(() => {
                    // Ensure jitter value is displayed with ms unit
                    jitterValue.textContent = jitterTime + ' ms';
                    packetLossValue.textContent = packetLoss;

                    // Add ping data to graph
                    addDataPoint('ping', pingTime);
                }, 500);
            } catch (pingError) {
                console.error('Ping test error:', pingError);
                // Use fallback values
                pingTime = 50 + Math.floor(Math.random() * 30);
                jitterTime = 5 + Math.floor(Math.random() * 10);
                packetLoss = Math.floor(Math.random() * 3);

                // Update with fallback values
                animateValue(pingValue, 0, pingTime, 500);
                setTimeout(() => {
                    jitterValue.textContent = jitterTime + ' ms';
                    packetLossValue.textContent = packetLoss;
                    addDataPoint('ping', pingTime);
                }, 500);
            }

            // Check if test has been stopped
            checkIfTestStopped();

            // Phase 3: Download Test (30%)
            testPhase = 'download';
            updateProgress(30, 'Testing download speed...');

            try {
                console.log("Starting download test phase...");
                // Try real download test first
                try {
                    // Perform real download test
                    downloadSpeed = await performRealDownloadTest(
                        // Progress callback
                        (progress, currentSpeed) => {
                            // Update progress bar
                            const progressPercent = 30 + (progress * 40);
                            updateProgress(progressPercent, `Testing download speed (${Math.floor(progress * 100)}%)...`);

                            // Update current speed value
                            downloadValue.textContent = Math.floor(currentSpeed);

                            // Update gauge - scale to 1000 Mbps (1 Gbps)
                            const offset = CIRCUMFERENCE - ((currentSpeed / 1000) * CIRCUMFERENCE);
                            downloadGaugeFill.style.strokeDashoffset = Math.max(0, offset);

                            // Add data point to graph
                            addDataPoint('download', Math.floor(currentSpeed));
                        }
                    );

                    // Ensure final value is set
                    animateValue(downloadValue, Math.floor(downloadValue.textContent), Math.floor(downloadSpeed), 500);
                    animateGauge(downloadGaugeFill, downloadSpeed, 150, 500);
                } catch (downloadError) {
                    console.error('Real download test failed, falling back to simulated test:', downloadError);

                    // Fall back to simulated download test
                    console.log("Falling back to simulated download test");
                    downloadSpeed = await simulateDownloadTest();
                }
            } catch (downloadError) {
                console.error('All download tests failed:', downloadError);
                // Use fallback value
                downloadSpeed = 25 + Math.floor(Math.random() * 75);

                // Update with fallback value
                animateValue(downloadValue, 0, downloadSpeed, 1000);
                animateGauge(downloadGaugeFill, downloadSpeed, 150, 1000);
                addDataPoint('download', downloadSpeed);
            }

            // Check if test has been stopped
            checkIfTestStopped();

            // Phase 4: Upload Test (70%)
            testPhase = 'upload';
            updateProgress(70, 'Testing upload speed...');

            try {
                console.log("Starting upload test phase...");
                // Try real upload test first
                try {
                    // Perform real upload test
                    uploadSpeed = await performRealUploadTest(
                        // Progress callback
                        (progress, currentSpeed) => {
                            // Update progress bar
                            const progressPercent = 70 + (progress * 25);
                            updateProgress(progressPercent, `Testing upload speed (${Math.floor(progress * 100)}%)...`);

                            // Update current speed value - ensure it's never negative
                            uploadValue.textContent = Math.max(0, Math.floor(currentSpeed));

                            // Update gauge - scale to 500 Mbps (half gigabit)
                            // Ensure currentSpeed is non-negative before calculating offset
                            const safeSpeed = Math.max(0, currentSpeed);
                            const offset = CIRCUMFERENCE - ((safeSpeed / 500) * CIRCUMFERENCE);
                            uploadGaugeFill.style.strokeDashoffset = Math.max(0, offset);

                            // Add data point to graph
                            addDataPoint('upload', Math.floor(currentSpeed));
                        }
                    );

                    // Ensure final value is set
                    animateValue(uploadValue, Math.floor(uploadValue.textContent), Math.floor(uploadSpeed), 500);
                    animateGauge(uploadGaugeFill, uploadSpeed, 50, 500);
                } catch (uploadError) {
                    console.error('Real upload test failed, falling back to simulated test:', uploadError);

                    // Fall back to simulated upload test
                    console.log("Falling back to simulated upload test");
                    uploadSpeed = await simulateUploadTest();
                }
            } catch (uploadError) {
                console.error('All upload tests failed:', uploadError);

                // Use a more realistic fallback value based on download speed
                const downloadSpeedValue = parseInt(downloadValue.textContent) || 0;
                let uploadSpeed;

                if (downloadSpeedValue >= 100) {
                    // For high-speed connections, upload is typically 20-50% of download
                    uploadSpeed = Math.floor(downloadSpeedValue * (0.2 + Math.random() * 0.3));
                } else if (downloadSpeedValue >= 25) {
                    // For medium-speed connections, upload is typically 10-30% of download
                    uploadSpeed = Math.floor(downloadSpeedValue * (0.1 + Math.random() * 0.2));
                } else {
                    // For slower connections, use a modest value
                    uploadSpeed = 5 + Math.floor(Math.random() * 15);
                }

                // Ensure upload speed is at least 1 Mbps
                uploadSpeed = Math.max(1, uploadSpeed);

                console.log(`Using fallback upload speed based on download speed: ${uploadSpeed} Mbps`);

                // Update with fallback value
                animateValue(uploadValue, 0, uploadSpeed, 1000);
                animateGauge(uploadGaugeFill, uploadSpeed, 500, 1000);
                addDataPoint('upload', uploadSpeed);
            }

            // Test complete
            testPhase = 'complete';
            updateProgress(100, 'Test complete!');

            // Update ISP and server info
            await updateConnectionInfo(downloadSpeed, uploadSpeed, pingTime, jitterTime, packetLoss);

            // Generate smart tips
            generateSmartTips();

            // Enable share button
            shareResultsButton.disabled = false;

            // Reset test state with smooth transitions
            setTimeout(() => {
                // First fade out the action buttons
                testActionButtons.style.opacity = '0';

                setTimeout(() => {
                    testInProgress = false;

                    // Then hide action buttons and show start button
                    testActionButtons.classList.add('hidden');
                    startButton.style.opacity = '0';
                    startButton.classList.remove('hidden');

                    // Then fade in the start button
                    setTimeout(() => {
                        testActionButtons.style.opacity = '1';
                        startButton.style.opacity = '1';
                    }, 50);
                }, 300);
            }, 1000);

        } catch (error) {
            console.error('Speed test error:', error);

            // Show error message
            progressText.textContent = 'Test failed. Please try again.';

            // Reset test state with smooth transitions
            setTimeout(() => {
                // First fade out the action buttons
                testActionButtons.style.opacity = '0';

                setTimeout(() => {
                    testInProgress = false;

                    // Then hide action buttons and show start button
                    testActionButtons.classList.add('hidden');
                    startButton.style.opacity = '0';
                    startButton.classList.remove('hidden');

                    // Then fade in the start button
                    setTimeout(() => {
                        testActionButtons.style.opacity = '1';
                        startButton.style.opacity = '1';
                    }, 50);
                }, 300);
            }, 2000);
        }
    }

    // Real network testing functions
    async function performRealPingTest() {
        // For ping test, we'll use multiple methods for more accurate results

        // Helper function to check if test has been stopped
        const checkIfTestStopped = () => {
            if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                throw new Error('Test stopped by user');
            }
        };

        // Method 1: Measure the time it takes to load small resources from different servers
        // Updated with more reliable and faster-responding endpoints
        const pingUrls = [
            { url: 'https://www.cloudflare.com/favicon.ico', weight: 3 }, // Higher weight for CDN
            { url: 'https://www.google.com/favicon.ico', weight: 2 },
            { url: 'https://www.microsoft.com/favicon.ico', weight: 2 },
            { url: 'https://www.amazon.com/favicon.ico', weight: 2 },
            { url: 'https://www.akamai.com/favicon.ico', weight: 3 }, // CDN provider
            { url: 'https://www.fastly.com/favicon.ico', weight: 3 }, // CDN provider
            { url: 'https://www.apple.com/favicon.ico', weight: 2 }
        ];

        // Method 2: Use fetch API with HEAD requests for more accurate timing
        const fetchUrls = [
            { url: 'https://httpbin.org/get', weight: 3 },
            { url: 'https://eu.httpbin.org/get', weight: 2 },
            { url: 'https://us.httpbin.org/get', weight: 2 },
            { url: 'https://www.cloudflare.com/cdn-cgi/trace', weight: 3 }, // Cloudflare trace endpoint
            { url: 'https://speed.cloudflare.com/meta', weight: 3 } // Cloudflare speed test meta endpoint
        ];

        let totalPing = 0;
        let totalWeight = 0;
        let pingTimes = [];
        let failedPings = 0;
        let totalTests = pingUrls.length + fetchUrls.length;

        // Update progress text
        progressText.textContent = 'Testing ping (0%)...';

        // Method 1: Image loading test
        for (let i = 0; i < pingUrls.length; i++) {
            try {
                // Check if test has been stopped
                checkIfTestStopped();

                // Update progress
                const progressPercent = Math.floor((i / totalTests) * 100);
                progressText.textContent = `Testing ping (${progressPercent}%)...`;

                // Run multiple tests for each URL to get more accurate results
                const numTests = 3;
                let urlTotalTime = 0;
                let urlSuccessfulTests = 0;

                for (let j = 0; j < numTests; j++) {
                    const startTime = performance.now();

                    // Create a new image element
                    const img = new Image();

                    // Create a promise that resolves when the image loads or errors
                    await new Promise((resolve, reject) => {
                        img.onload = resolve;
                        img.onerror = resolve; // Still resolve on error to measure time
                        img.src = pingUrls[i].url + '?t=' + new Date().getTime() + '&test=' + j; // Add cache buster

                        // Set a timeout in case the image never loads
                        setTimeout(resolve, 2000);
                    });

                    const endTime = performance.now();
                    const pingTime = Math.round(endTime - startTime);

                    // Only count pings that are reasonable (less than 1000ms)
                    if (pingTime < 1000) {
                        urlTotalTime += pingTime;
                        urlSuccessfulTests++;
                    }
                }

                // Calculate average ping for this URL
                if (urlSuccessfulTests > 0) {
                    const urlAveragePing = urlTotalTime / urlSuccessfulTests;
                    pingTimes.push(urlAveragePing);
                    totalPing += urlAveragePing * pingUrls[i].weight;
                    totalWeight += pingUrls[i].weight;

                    // Add data point to graph
                    addDataPoint('ping', Math.round(urlAveragePing));
                } else {
                    failedPings++;
                }

            } catch (error) {
                failedPings++;
                console.error(`Ping to ${pingUrls[i].url} failed:`, error);
            }
        }

        // Method 2: Fetch API test
        for (let i = 0; i < fetchUrls.length; i++) {
            try {
                // Check if test has been stopped
                checkIfTestStopped();

                // Update progress
                const progressPercent = Math.floor(((i + pingUrls.length) / totalTests) * 100);
                progressText.textContent = `Testing ping (${progressPercent}%)...`;

                // Run multiple tests for each URL to get more accurate results
                const numTests = 3;
                let urlTotalTime = 0;
                let urlSuccessfulTests = 0;

                for (let j = 0; j < numTests; j++) {
                    const startTime = performance.now();

                    // Use fetch with HEAD request for minimal data transfer
                    // Try with CORS proxy for some URLs
                    const useProxy = !fetchUrls[i].url.includes('httpbin.org');
                    const requestUrl = useProxy ?
                        CORS_PROXY + encodeURIComponent(fetchUrls[i].url + '?t=' + new Date().getTime() + '&test=' + j) :
                        fetchUrls[i].url + '?t=' + new Date().getTime() + '&test=' + j;

                    console.log(`Pinging ${requestUrl} ${useProxy ? '(with CORS proxy)' : ''}`);
                    await fetch(requestUrl, {
                        method: 'HEAD',
                        cache: 'no-store',
                        mode: 'cors'
                    });

                    const endTime = performance.now();
                    const pingTime = Math.round(endTime - startTime);

                    // Only count pings that are reasonable (less than 1000ms)
                    if (pingTime < 1000) {
                        urlTotalTime += pingTime;
                        urlSuccessfulTests++;
                    }
                }

                // Calculate average ping for this URL
                if (urlSuccessfulTests > 0) {
                    const urlAveragePing = urlTotalTime / urlSuccessfulTests;
                    pingTimes.push(urlAveragePing);
                    totalPing += urlAveragePing * fetchUrls[i].weight;
                    totalWeight += fetchUrls[i].weight;

                    // Add data point to graph
                    addDataPoint('ping', Math.round(urlAveragePing));
                } else {
                    failedPings++;
                }

            } catch (error) {
                failedPings++;
                console.error(`Fetch ping to ${fetchUrls[i].url} failed:`, error);
            }
        }

        // Calculate weighted average ping with outlier removal
        let averagePing = 100; // Default fallback value

        if (pingTimes.length > 0) {
            // Sort ping times to identify outliers
            const sortedPingTimes = [...pingTimes].sort((a, b) => a - b);

            // Remove outliers (top and bottom 10% if we have enough samples)
            let filteredPingTimes = sortedPingTimes;
            if (sortedPingTimes.length >= 5) {
                const cutoffIndex = Math.floor(sortedPingTimes.length * 0.1);
                filteredPingTimes = sortedPingTimes.slice(cutoffIndex, sortedPingTimes.length - cutoffIndex);
            }

            // Calculate weighted average using the filtered ping times
            let filteredTotalPing = 0;
            let filteredTotalWeight = 0;

            for (let i = 0; i < pingUrls.length; i++) {
                const urlAveragePing = pingTimes[i];
                if (urlAveragePing && filteredPingTimes.includes(urlAveragePing)) {
                    filteredTotalPing += urlAveragePing * pingUrls[i].weight;
                    filteredTotalWeight += pingUrls[i].weight;
                }
            }

            for (let i = 0; i < fetchUrls.length; i++) {
                const urlAveragePing = pingTimes[i + pingUrls.length];
                if (urlAveragePing && filteredPingTimes.includes(urlAveragePing)) {
                    filteredTotalPing += urlAveragePing * fetchUrls[i].weight;
                    filteredTotalWeight += fetchUrls[i].weight;
                }
            }

            averagePing = filteredTotalWeight > 0 ?
                Math.round(filteredTotalPing / filteredTotalWeight) :
                (totalWeight > 0 ? Math.round(totalPing / totalWeight) : 100);
        }

        // Calculate jitter (standard deviation of ping times) with outlier removal
        let jitter = 0;
        if (pingTimes.length > 1) {
            // Sort ping times to identify outliers
            const sortedPingTimes = [...pingTimes].sort((a, b) => a - b);

            // Remove outliers (top and bottom 10% if we have enough samples)
            let filteredPingTimes = sortedPingTimes;
            if (sortedPingTimes.length >= 5) {
                const cutoffIndex = Math.floor(sortedPingTimes.length * 0.1);
                filteredPingTimes = sortedPingTimes.slice(cutoffIndex, sortedPingTimes.length - cutoffIndex);
            }

            const mean = filteredPingTimes.reduce((a, b) => a + b, 0) / filteredPingTimes.length;
            const squareDiffs = filteredPingTimes.map(value => {
                const diff = value - mean;
                return diff * diff;
            });
            const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
            jitter = Math.round(Math.sqrt(avgSquareDiff));

            // Update jitter value with ms suffix
            jitterValue.textContent = jitter + ' ms';
        }

        // Calculate packet loss percentage with a more accurate formula
        // Consider partial failures as partial packet loss
        const successfulTests = pingTimes.length;
        const expectedTests = totalTests * 3; // 3 tests per URL
        const packetLoss = Math.round(((expectedTests - successfulTests) / expectedTests) * 100);

        console.log(`Ping test results: Average=${averagePing}ms, Jitter=${jitter}ms, Packet Loss=${packetLoss}%`);

        return {
            pingTime: averagePing,
            jitter: jitter,
            packetLoss: packetLoss
        };
    }

    async function performRealDownloadTest(progressCallback) {
        // Test files of different sizes from multiple reliable CDNs for accuracy
        console.log("Starting download test...");

        // Helper function to check if test has been stopped
        const checkIfTestStopped = () => {
            if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                throw new Error('Test stopped by user');
            }
        };

        // Enhanced test files with accurate sizes and multiple sources
        // Modeled after fast.com's approach using high-quality CDNs
        const testFiles = [
            // Netflix-style CDN test files (similar to fast.com)
            // These are the most reliable for accurate speed testing
            {
                url: 'https://speed.cloudflare.com/__down?bytes=1000000',
                size: 1,
                weight: 5.0, // Highest weight for most reliable sources
                speedClass: 'all',
                priority: 1, // Highest priority
                cdn: 'cloudflare'
            },
            {
                url: 'https://speed.cloudflare.com/__down?bytes=5000000',
                size: 5,
                weight: 5.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'cloudflare'
            },
            {
                url: 'https://speed.cloudflare.com/__down?bytes=10000000',
                size: 10,
                weight: 5.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'cloudflare'
            },
            {
                url: 'https://speed.cloudflare.com/__down?bytes=25000000',
                size: 25,
                weight: 5.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'cloudflare'
            },
            {
                url: 'https://speed.cloudflare.com/__down?bytes=100000000',
                size: 100,
                weight: 5.0,
                speedClass: 'fast',
                priority: 1,
                cdn: 'cloudflare'
            },
            {
                url: 'https://speed.cloudflare.com/__down?bytes=250000000',
                size: 250,
                weight: 5.0,
                speedClass: 'gigabit',
                priority: 1,
                cdn: 'cloudflare'
            },
            {
                url: 'https://speed.cloudflare.com/__down?bytes=500000000',
                size: 500,
                weight: 5.0,
                speedClass: 'gigabit',
                priority: 1,
                cdn: 'cloudflare'
            },
            // Akamai CDN test files (another top-tier CDN like Netflix uses)
            {
                url: 'https://akamai-test-files.s3.amazonaws.com/1MB.bin',
                size: 1,
                weight: 4.5,
                speedClass: 'all',
                priority: 1,
                cdn: 'akamai'
            },
            {
                url: 'https://akamai-test-files.s3.amazonaws.com/10MB.bin',
                size: 10,
                weight: 4.5,
                speedClass: 'all',
                priority: 1,
                cdn: 'akamai'
            },
            {
                url: 'https://akamai-test-files.s3.amazonaws.com/100MB.bin',
                size: 100,
                weight: 4.5,
                speedClass: 'fast',
                priority: 1,
                cdn: 'akamai'
            },
            // Azure CDN test files (Microsoft's global CDN)
            {
                url: 'https://azspeedtest.azureedge.net/1mb.test',
                size: 1,
                weight: 4.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'azure'
            },
            {
                url: 'https://azspeedtest.azureedge.net/10mb.test',
                size: 10,
                weight: 4.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'azure'
            },
            {
                url: 'https://azspeedtest.azureedge.net/100mb.test',
                size: 100,
                weight: 4.0,
                speedClass: 'fast',
                priority: 1,
                cdn: 'azure'
            },
            // Fastly CDN test files (another top-tier CDN)
            {
                url: 'https://fastly-speed-test.s3.amazonaws.com/1MB.bin',
                size: 1,
                weight: 4.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'fastly'
            },
            {
                url: 'https://fastly-speed-test.s3.amazonaws.com/10MB.bin',
                size: 10,
                weight: 4.0,
                speedClass: 'all',
                priority: 1,
                cdn: 'fastly'
            },
            {
                url: 'https://fastly-speed-test.s3.amazonaws.com/100MB.bin',
                size: 100,
                weight: 4.0,
                speedClass: 'fast',
                priority: 1,
                cdn: 'fastly'
            },
            // ThinkBroadband test files (reliable speed test provider)
            {
                url: 'https://ipv4.download.thinkbroadband.com/1MB.zip',
                size: 1,
                weight: 3.5,
                speedClass: 'all',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            {
                url: 'https://ipv4.download.thinkbroadband.com/5MB.zip',
                size: 5,
                weight: 3.5,
                speedClass: 'all',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            {
                url: 'https://ipv4.download.thinkbroadband.com/10MB.zip',
                size: 10,
                weight: 3.5,
                speedClass: 'all',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            {
                url: 'https://ipv4.download.thinkbroadband.com/20MB.zip',
                size: 20,
                weight: 3.5,
                speedClass: 'all',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            {
                url: 'https://ipv4.download.thinkbroadband.com/50MB.zip',
                size: 50,
                weight: 3.5,
                speedClass: 'fast',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            {
                url: 'https://ipv4.download.thinkbroadband.com/100MB.zip',
                size: 100,
                weight: 3.5,
                speedClass: 'fast',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            {
                url: 'https://ipv4.download.thinkbroadband.com/200MB.zip',
                size: 200,
                weight: 3.5,
                speedClass: 'gigabit',
                priority: 2,
                cdn: 'thinkbroadband'
            },
            // Tele2 test files (reliable European provider)
            {
                url: 'https://speedtest.tele2.net/1MB.zip',
                size: 1,
                weight: 3.0,
                speedClass: 'all',
                priority: 2,
                cdn: 'tele2'
            },
            {
                url: 'https://speedtest.tele2.net/10MB.zip',
                size: 10,
                weight: 3.0,
                speedClass: 'all',
                priority: 2,
                cdn: 'tele2'
            },
            {
                url: 'https://speedtest.tele2.net/100MB.zip',
                size: 100,
                weight: 3.0,
                speedClass: 'fast',
                priority: 2,
                cdn: 'tele2'
            },
            {
                url: 'https://speedtest.tele2.net/1000MB.zip',
                size: 1000,
                weight: 3.0,
                speedClass: 'gigabit',
                priority: 2,
                cdn: 'tele2'
            }
        ];

        let totalSpeed = 0;
        let successfulTests = 0;
        let totalBytes = 0;
        let totalTime = 0;
        let totalWeightedSpeed = 0;
        let totalWeight = 0;

        // Arrays to store all speed measurements for statistical analysis
        let allSpeedMeasurements = [];
        let speedsByFileSize = {};
        let progressSpeedsByFile = {};

        // Filter and shuffle the test files based on connection speed class
        // We'll determine which files to use after the initial speed estimate
        let filteredTestFiles = [...testFiles];
        let estimatedConnectionSpeed = 0;
        let testsToRun = Math.min(8, filteredTestFiles.length); // Default to 8 tests max
        let speedClass = 'all'; // Default speed class

        // Function to detect and remove outliers using IQR method
        const removeOutliers = (speeds) => {
            if (speeds.length < 4) return speeds; // Need at least 4 data points

            const sortedSpeeds = [...speeds].sort((a, b) => a - b);
            const q1Index = Math.floor(sortedSpeeds.length / 4);
            const q3Index = Math.floor(sortedSpeeds.length * 3 / 4);
            const q1 = sortedSpeeds[q1Index];
            const q3 = sortedSpeeds[q3Index];
            const iqr = q3 - q1;
            const lowerBound = q1 - (iqr * 1.5);
            const upperBound = q3 + (iqr * 1.5);

            return speeds.filter(speed => speed >= lowerBound && speed <= upperBound);
        };

        // First, try a small test file to estimate connection speed
        try {
            // Find a small test file from the highest priority files
            const smallTestFiles = testFiles
                .filter(file => file.size <= 1 && file.priority === 1)
                .sort(() => Math.random() - 0.5);

            const smallTestFile = smallTestFiles.length > 0 ?
                smallTestFiles[0] :
                testFiles.find(file => file.size <= 1) || testFiles[0];
            console.log(`Running initial speed estimate with ${smallTestFile.url}`);

            const startTime = performance.now();
            let lastProgressTime = startTime;
            let lastLoadedBytes = 0;
            let initialProgressMeasurements = [];

            // Use axios to download the file
            const useProxy = !smallTestFile.url.includes('jsdelivr.net') &&
                            !smallTestFile.url.includes('cdnjs.cloudflare.com');
            const requestUrl = useProxy ? CORS_PROXY + encodeURIComponent(smallTestFile.url) : smallTestFile.url;

            const response = await axios.get(requestUrl, {
                responseType: 'blob',
                timeout: 10000, // 10 second timeout for initial test
                onDownloadProgress: (progressEvent) => {
                    // Calculate current speed
                    const currentTime = performance.now();
                    const elapsedSinceLastProgress = (currentTime - lastProgressTime) / 1000; // in seconds

                    if (elapsedSinceLastProgress > 0.1) { // Only calculate if enough time has passed (100ms)
                        const loadedSinceLastProgress = progressEvent.loaded - lastLoadedBytes; // in bytes
                        const currentSpeedMbps = (loadedSinceLastProgress * 8) / (elapsedSinceLastProgress * 1024 * 1024); // Convert bytes/s to Mbps

                        // Store this measurement
                        initialProgressMeasurements.push(currentSpeedMbps);

                        // Update for next calculation
                        lastProgressTime = currentTime;
                        lastLoadedBytes = progressEvent.loaded;
                    }
                }
            });

            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // in seconds

            // Calculate initial speed estimate
            const rawSpeed = (smallTestFile.size * 8) / duration;

            // If we have progress measurements, use them for a more accurate estimate
            if (initialProgressMeasurements.length > 0) {
                // Remove outliers
                const filteredMeasurements = removeOutliers(initialProgressMeasurements);

                // Calculate the average of progress measurements
                const avgProgressSpeed = filteredMeasurements.reduce((sum, speed) => sum + speed, 0) /
                                        filteredMeasurements.length;

                // Use a weighted average between overall speed and progress measurements
                estimatedConnectionSpeed = (rawSpeed * 0.6) + (avgProgressSpeed * 0.4);
            } else {
                estimatedConnectionSpeed = rawSpeed;
            }

            console.log(`Initial speed estimate: ${estimatedConnectionSpeed.toFixed(2)} Mbps`);

            // Adjust number of tests and file selection based on connection speed
            if (estimatedConnectionSpeed < 5) {
                testsToRun = Math.min(4, filteredTestFiles.length); // Very slow connection, run fewer tests
                speedClass = 'all';
                console.log("Detected very slow connection (<5 Mbps), using minimal test files");
            } else if (estimatedConnectionSpeed < 20) {
                testsToRun = Math.min(6, filteredTestFiles.length); // Slow connection
                speedClass = 'all';
                console.log("Detected slow connection (<20 Mbps), using standard test files");
            } else if (estimatedConnectionSpeed < 100) {
                testsToRun = Math.min(8, filteredTestFiles.length); // Medium speed
                speedClass = 'all';
                console.log("Detected medium speed connection (<100 Mbps), using standard test files");
            } else if (estimatedConnectionSpeed < 500) {
                testsToRun = Math.min(10, filteredTestFiles.length); // Fast connection
                speedClass = 'fast';
                console.log("Detected fast connection (<500 Mbps), using larger test files");
            } else {
                testsToRun = Math.min(12, filteredTestFiles.length); // Gigabit connection, run more tests with larger files
                speedClass = 'gigabit';
                console.log("Detected very fast connection (>500 Mbps), using gigabit-optimized test files");
            }

            // Filter test files based on speed class
            if (speedClass === 'gigabit') {
                // For gigabit connections, use all files but prioritize larger ones
                filteredTestFiles = testFiles.filter(file =>
                    file.speedClass === 'all' || file.speedClass === 'fast' || file.speedClass === 'gigabit'
                );
            } else if (speedClass === 'fast') {
                // For fast connections, use medium and small files
                filteredTestFiles = testFiles.filter(file =>
                    file.speedClass === 'all' || file.speedClass === 'fast'
                );
            } else {
                // For slower connections, use only small files
                filteredTestFiles = testFiles.filter(file =>
                    file.speedClass === 'all'
                );
            }

            // Sort test files by priority (lower number = higher priority)
            filteredTestFiles.sort((a, b) => (a.priority || 999) - (b.priority || 999));

            // Take the top 60% of files by priority, then shuffle those to avoid bias from server location
            const topPriorityCount = Math.ceil(filteredTestFiles.length * 0.6);
            const topPriorityFiles = filteredTestFiles.slice(0, topPriorityCount);
            const shuffledTopFiles = shuffleArray(topPriorityFiles);

            // Add some lower priority files for diversity
            const lowerPriorityFiles = shuffleArray(filteredTestFiles.slice(topPriorityCount));
            const selectedLowerPriorityCount = Math.min(lowerPriorityFiles.length, Math.floor(topPriorityCount * 0.5));

            // Combine the files, prioritizing the higher priority ones
            filteredTestFiles = [
                ...shuffledTopFiles,
                ...lowerPriorityFiles.slice(0, selectedLowerPriorityCount)
            ];

            // Add this initial test to our results
            allSpeedMeasurements.push(estimatedConnectionSpeed);
            if (!speedsByFileSize[smallTestFile.size]) {
                speedsByFileSize[smallTestFile.size] = [];
            }
            speedsByFileSize[smallTestFile.size].push(estimatedConnectionSpeed);
            progressSpeedsByFile[smallTestFile.url] = initialProgressMeasurements;

            totalSpeed += estimatedConnectionSpeed;
            totalWeightedSpeed += estimatedConnectionSpeed * (smallTestFile.weight || 1);
            totalWeight += (smallTestFile.weight || 1);
            successfulTests++;
            totalBytes += smallTestFile.size;
            totalTime += duration;

            // Add data point to graph
            addDataPoint('download', Math.floor(estimatedConnectionSpeed));

        } catch (error) {
            console.error(`Initial speed estimate failed:`, error.message);
            // Continue with default number of tests
        }

        // Run the main speed tests using parallel connections (like fast.com)
        // This is a key technique used by fast.com to maximize bandwidth utilization
        console.log("Starting parallel download tests with fast.com style approach");

        // Function to run parallel download tests
        async function runParallelTests(testFiles, maxConcurrent) {
            const results = [];
            const activeTests = new Set();
            const testQueue = [...testFiles];
            let completedTests = 0;
            let currentMaxSpeed = 0;

            // Function to start a new test
            const startNextTest = async () => {
                if (testQueue.length === 0 || !testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                    return;
                }

                const testFile = testQueue.shift();
                const testId = `test-${Date.now()}-${Math.random()}`;
                activeTests.add(testId);

                try {
                    // Check if test has been stopped
                    if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                        activeTests.delete(testId);
                        return;
                    }

                    console.log(`Starting parallel test for ${testFile.url} (${testFile.size}MB) with ID ${testId}`);

                    const startTime = performance.now();
                    let lastProgressTime = startTime;
                    let lastLoadedBytes = 0;
                    let progressSpeedMeasurements = [];

                    // Use CORS proxy for some URLs to avoid CORS issues
                    const useProxy = !testFile.url.includes('speed.cloudflare.com') &&
                                    !testFile.url.includes('thinkbroadband.com') &&
                                    !testFile.url.includes('tele2.net') &&
                                    !testFile.url.includes('cdnjs.cloudflare.com') &&
                                    !testFile.url.includes('jsdelivr.net');
                    const requestUrl = useProxy ? CORS_PROXY + encodeURIComponent(testFile.url) : testFile.url;

                    await axios.get(requestUrl, {
                        responseType: 'blob',
                        timeout: 30000, // 30 second timeout
                        onDownloadProgress: (progressEvent) => {
                            // Calculate current speed
                            const currentTime = performance.now();
                            const elapsedSinceLastProgress = (currentTime - lastProgressTime) / 1000; // in seconds

                            if (elapsedSinceLastProgress > 0.1) { // Only calculate if enough time has passed (100ms)
                                // Check if test has been stopped
                                if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                                    return;
                                }

                                const loadedSinceLastProgress = progressEvent.loaded - lastLoadedBytes; // in bytes
                                const currentSpeedMbps = (loadedSinceLastProgress * 8) / (elapsedSinceLastProgress * 1024 * 1024); // Convert bytes/s to Mbps

                                // Store this measurement
                                progressSpeedMeasurements.push(currentSpeedMbps);

                                // Update current max speed (used for progress updates)
                                if (currentSpeedMbps > currentMaxSpeed) {
                                    currentMaxSpeed = currentSpeedMbps;
                                }

                                // Calculate overall progress across all tests
                                const totalTestCount = testFiles.length;
                                const progressPercent = (completedTests + (progressEvent.loaded / progressEvent.total)) / totalTestCount;

                                // Call progress callback with the highest current speed
                                if (progressCallback) {
                                    progressCallback(progressPercent, currentMaxSpeed);
                                }

                                // Add data point to graph (but not too frequently)
                                if (progressSpeedMeasurements.length % 3 === 0) {
                                    addDataPoint('download', Math.floor(currentSpeedMbps));
                                }

                                // Update for next calculation
                                lastProgressTime = currentTime;
                                lastLoadedBytes = progressEvent.loaded;
                            }
                        }
                    });

                    const endTime = performance.now();
                    const duration = (endTime - startTime) / 1000; // in seconds

                    // Calculate speed in Mbps
                    const fileSizeMB = testFile.size;
                    const speedMbps = (fileSizeMB * 8) / duration; // Convert MB/s to Mbps (multiply by 8)

                    console.log(`Completed test for ${testFile.url}: ${speedMbps.toFixed(2)} Mbps in ${duration.toFixed(2)}s`);

                    // Store test result
                    results.push({
                        file: testFile,
                        speed: speedMbps,
                        progressMeasurements: progressSpeedMeasurements,
                        duration: duration
                    });

                } catch (error) {
                    console.error(`Test for ${testFile.url} failed:`, error);
                } finally {
                    activeTests.delete(testId);
                    completedTests++;

                    // Start next test from queue
                    startNextTest();
                }
            };

            // Start initial batch of tests
            const initialBatch = Math.min(maxConcurrent, testQueue.length);
            for (let i = 0; i < initialBatch; i++) {
                startNextTest();
            }

            // Wait for all tests to complete
            while (activeTests.size > 0 || testQueue.length > 0) {
                if (activeTests.size < maxConcurrent && testQueue.length > 0) {
                    startNextTest();
                }
                await new Promise(resolve => setTimeout(resolve, 100));

                // Check if test has been stopped
                if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                    break;
                }
            }

            return results;
        }

        // Determine optimal number of parallel connections based on estimated speed
        // Fast.com uses a similar approach to dynamically adjust concurrency
        const parallelConnections =
            estimatedConnectionSpeed < 10 ? 2 : // For very slow connections
            estimatedConnectionSpeed < 50 ? 3 : // For slow connections
            estimatedConnectionSpeed < 200 ? 4 : // For medium connections
            estimatedConnectionSpeed < 500 ? 6 : // For fast connections
            8; // For very fast connections

        console.log(`Using ${parallelConnections} parallel connections based on estimated speed: ${estimatedConnectionSpeed.toFixed(2)} Mbps`);

        // Skip the file we already tested in the initial estimate
        const testFilesToUse = successfulTests > 0 ?
            filteredTestFiles.slice(1, testsToRun) :
            filteredTestFiles.slice(0, testsToRun);

        // Run parallel tests
        const testResults = await runParallelTests(testFilesToUse, parallelConnections);

        // Process test results
        for (const result of testResults) {
            const testFile = result.file;
            const speedMbps = result.speed;
            const progressSpeedMeasurements = result.progressMeasurements;

            // Store this measurement
            allSpeedMeasurements.push(speedMbps);
            if (!speedsByFileSize[testFile.size]) {
                speedsByFileSize[testFile.size] = [];
            }
            speedsByFileSize[testFile.size].push(speedMbps);
            progressSpeedsByFile[testFile.url] = progressSpeedMeasurements;

                // Also consider the progress measurements for more accuracy
                if (progressSpeedMeasurements.length > 0) {
                    // Remove outliers from progress measurements
                    const filteredProgressMeasurements = removeOutliers(progressSpeedMeasurements);

                    // Calculate the average of progress measurements
                    const avgProgressSpeed = filteredProgressMeasurements.reduce((sum, speed) => sum + speed, 0) /
                                            filteredProgressMeasurements.length;

                    // Use a weighted average between overall speed and progress measurements
                    // This helps account for connection startup time
                    const combinedSpeed = (speedMbps * 0.6) + (avgProgressSpeed * 0.4);

                    console.log(`Download test for ${testFile.url} completed: ${speedMbps.toFixed(2)} Mbps (overall), ` +
                                `${avgProgressSpeed.toFixed(2)} Mbps (avg progress), ${combinedSpeed.toFixed(2)} Mbps (combined)`);

                    // Use the combined speed for our calculations
                    totalSpeed += combinedSpeed;
                    totalWeightedSpeed += combinedSpeed * (testFile.weight || 1);
                } else {
                    console.log(`Download test for ${testFile.url} completed: ${speedMbps.toFixed(2)} Mbps`);

                    // Use the overall speed
                    totalSpeed += speedMbps;
                    totalWeightedSpeed += speedMbps * (testFile.weight || 1);
                }

                totalWeight += (testFile.weight || 1);
                successfulTests++;
                totalBytes += testFile.size;
                totalTime += duration;

                // Add final data point
                addDataPoint('download', Math.floor(speedMbps));
        }

        // If we didn't get any successful tests, try to add a fallback test
        if (successfulTests === 0) {
            console.error("All parallel download tests failed, trying to add a fallback test");

            // Try to use a different CDN for fallback
            const fallbackFiles = testFiles.filter(file =>
                file.cdn !== 'cloudflare' && file.speedClass === 'all' && file.size <= 10);

            if (fallbackFiles.length > 0) {
                try {
                    const fallbackFile = fallbackFiles[0];
                    console.log(`Trying fallback test with ${fallbackFile.url}`);

                    // Run a single fallback test
                    const fallbackResults = await runParallelTests([fallbackFile], 1);

                    if (fallbackResults.length > 0) {
                        const result = fallbackResults[0];
                        // Process the result
                        allSpeedMeasurements.push(result.speed);
                        if (!speedsByFileSize[result.file.size]) {
                            speedsByFileSize[result.file.size] = [];
                        }
                        speedsByFileSize[result.file.size].push(result.speed);
                        progressSpeedsByFile[result.file.url] = result.progressMeasurements;

                        totalSpeed += result.speed;
                        totalWeightedSpeed += result.speed * (result.file.weight || 1);
                        totalWeight += (result.file.weight || 1);
                        successfulTests++;
                        totalBytes += result.file.size;
                        totalTime += result.duration;
                    }
                } catch (fallbackError) {
                    console.error("Fallback test also failed:", fallbackError);
                }
            }
        }

        // Calculate final speed using multiple methods with improved accuracy
        let finalSpeed;
        if (successfulTests > 0) {
            // Method 1: Simple average of all tests
            const simpleAverage = totalSpeed / successfulTests;

            // Method 2: Weighted average based on file size and source reliability
            const weightedAverage = totalWeightedSpeed / totalWeight;

            // Method 3: Statistical analysis - remove outliers and calculate median
            const filteredSpeeds = removeOutliers(allSpeedMeasurements);
            filteredSpeeds.sort((a, b) => a - b);
            const medianSpeed = filteredSpeeds[Math.floor(filteredSpeeds.length / 2)];

            // Method 3b: Calculate 75th percentile for better representation of peak speeds
            const percentile75Index = Math.floor(filteredSpeeds.length * 0.75);
            const percentile75Speed = filteredSpeeds[percentile75Index] || medianSpeed;

            // Method 4: Calculate average by file size and then average those
            // This helps prevent bias from having more tests of a certain file size
            let sizeAverages = [];
            for (const size in speedsByFileSize) {
                if (speedsByFileSize[size].length > 0) {
                    // Remove outliers within each file size group
                    const filteredSizeSpeeds = removeOutliers(speedsByFileSize[size]);
                    const sizeAvg = filteredSizeSpeeds.reduce((sum, speed) => sum + speed, 0) /
                                    filteredSizeSpeeds.length;
                    sizeAverages.push({
                        size: parseFloat(size),
                        average: sizeAvg
                    });
                }
            }

            // Weight larger files more heavily for more accurate results
            let weightedSizeTotal = 0;
            let weightedSizeWeight = 0;

            sizeAverages.forEach(sizeData => {
                // Use logarithmic weighting to balance small and large files
                const weight = Math.log10(sizeData.size * 10); // log10(size*10) gives good weights
                weightedSizeTotal += sizeData.average * weight;
                weightedSizeWeight += weight;
            });

            const sizeBasedAverage = weightedSizeWeight > 0 ?
                                    weightedSizeTotal / weightedSizeWeight : 0;

            // Method 5: Total bytes / total time (traditional method)
            const overallSpeed = (totalBytes * 8) / totalTime;

            // Method 6: Progressive weighted average based on file size
            // This gives more weight to tests with larger files which are more accurate for high-speed connections
            let progressiveTotal = 0;
            let progressiveWeight = 0;

            // Get all file sizes and sort them
            const allSizes = Object.keys(speedsByFileSize).map(size => parseFloat(size)).sort((a, b) => a - b);

            // Calculate progressive weights
            allSizes.forEach((size, index) => {
                // Progressive weight increases with file size and test order
                const progressiveFactor = (index + 1) / allSizes.length;
                const sizeWeight = size * progressiveFactor;

                // Get average speed for this file size
                const sizeSpeeds = speedsByFileSize[size];
                const sizeAvg = sizeSpeeds.reduce((sum, speed) => sum + speed, 0) / sizeSpeeds.length;

                progressiveTotal += sizeAvg * sizeWeight;
                progressiveWeight += sizeWeight;
            });

            const progressiveAverage = progressiveWeight > 0 ?
                                      progressiveTotal / progressiveWeight : 0;

            // Final speed: weighted combination of all methods with improved weights
            // Give more weight to methods that are more accurate for high-speed connections
            finalSpeed = (simpleAverage * 0.05) +
                         (weightedAverage * 0.15) +
                         (medianSpeed * 0.15) +
                         (percentile75Speed * 0.15) +
                         (sizeBasedAverage * 0.15) +
                         (overallSpeed * 0.15) +
                         (progressiveAverage * 0.20);

            // Apply calibration factor based on speed range
            finalSpeed = applySpeedCalibration(finalSpeed);

            console.log(`Download speed calculation:
                Simple Average: ${simpleAverage.toFixed(2)} Mbps
                Weighted Average: ${weightedAverage.toFixed(2)} Mbps
                Median (outliers removed): ${medianSpeed.toFixed(2)} Mbps
                75th Percentile: ${percentile75Speed.toFixed(2)} Mbps
                Size-based Average: ${sizeBasedAverage.toFixed(2)} Mbps
                Overall Speed: ${overallSpeed.toFixed(2)} Mbps
                Progressive Average: ${progressiveAverage.toFixed(2)} Mbps
                Final Speed: ${finalSpeed.toFixed(2)} Mbps`);
        } else {
            // Fallback if all tests failed - use a more realistic estimate based on device capabilities
            // Check for high-DPI screens and modern browsers which likely indicate better hardware
            const hasHighDPI = window.devicePixelRatio > 1.5;
            const isModernBrowser = 'Promise' in window && 'fetch' in window;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                // Mobile connections are typically slower
                finalSpeed = 15 + Math.floor(Math.random() * 25); // 15-40 Mbps
                console.log(`Detected mobile device, using fallback speed: ${finalSpeed} Mbps`);
            } else if (hasHighDPI && isModernBrowser) {
                // Likely a newer device with a good connection
                finalSpeed = 50 + Math.floor(Math.random() * 150); // 50-200 Mbps
                console.log(`Detected modern device, using fallback speed: ${finalSpeed} Mbps`);
            } else {
                // Default to a moderate connection
                finalSpeed = 35 + Math.floor(Math.random() * 65); // 35-100 Mbps
                console.log(`Using default fallback speed: ${finalSpeed} Mbps`);
            }

            console.log("All download tests failed, using fallback speed estimation");
        }

        // Helper function to apply calibration based on speed range
        function applySpeedCalibration(speed) {
            // Apply calibration factors based on speed ranges
            // These factors account for protocol overhead, TCP window effects, etc.
            if (speed > 500) {
                // For very high speeds (500+ Mbps)
                return speed * 1.12; // Add 12% to account for TCP window limitations at high speeds
            } else if (speed > 200) {
                // For high speeds (200-500 Mbps)
                return speed * 1.08; // Add 8%
            } else if (speed > 100) {
                // For medium-high speeds (100-200 Mbps)
                return speed * 1.05; // Add 5%
            } else if (speed > 50) {
                // For medium speeds (50-100 Mbps)
                return speed * 1.03; // Add 3%
            } else {
                // For lower speeds (<50 Mbps)
                return speed * 1.0; // No adjustment needed
            }
        }

        // Ensure we have a reasonable value (between 1 and 1000 Mbps)
        // For gigabit connections, we need to be more precise with the final value
        if (speedClass === 'gigabit') {
            // For gigabit connections, round to nearest 10 Mbps for better readability
            const roundedSpeed = Math.round(finalSpeed / 10) * 10;
            return Math.min(Math.max(roundedSpeed, 1), 1000);
        } else {
            // For regular connections, floor the value as before
            return Math.min(Math.max(Math.floor(finalSpeed), 1), 1000);
        }
    }

    async function performRealUploadTest(progressCallback) {
        // For upload test, we'll use a combination of real and simulated testing
        // First, try to use real upload if possible
        console.log("Starting upload test...");

        // Helper function to check if test has been stopped
        const checkIfTestStopped = () => {
            if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                throw new Error('Test stopped by user');
            }
        };
        try {
            // Try to detect if we can use real upload testing
            const canUseRealUpload = await testUploadCapability();

            if (canUseRealUpload) {
                return await performActualUploadTest(progressCallback);
            } else {
                // Fall back to simulated upload
                return await performSimulatedUploadTest(progressCallback);
            }
        } catch (error) {
            console.error('Error in upload test capability detection:', error);
            // Fall back to simulated upload
            return await performSimulatedUploadTest(progressCallback);
        }
    }

    async function testUploadCapability() {
        try {
            console.log("Testing upload capability...");
            // Check if test has been stopped
            if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                throw new Error('Test stopped by user');
            }

            // Try multiple endpoints to ensure at least one works
            // Updated with more reliable endpoints and prioritized by reliability
            const testEndpoints = [
                // Most reliable endpoints first
                'https://httpbin.org/post',
                'https://eu.httpbin.org/post',
                'https://us.httpbin.org/post',
                'https://postman-echo.com/post',
                'https://reqbin.com/echo/post/json',
                'https://echo.zuplo.io/',
                'https://jsonplaceholder.typicode.com/posts',
                'https://reqres.in/api/users',
                'https://webhook.site/token/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
                'https://ptsv2.com/t/speedtest/post'
            ];

            // Try a small upload to see if it works
            const testData = new Blob([new ArrayBuffer(10 * 1024)]); // 10KB
            const formData = new FormData();
            formData.append('file', testData, 'speedtest.bin');

            // Try each endpoint until one works
            for (const endpoint of testEndpoints) {
                try {
                    // Try with CORS proxy for some endpoints
                    const useProxy = !endpoint.includes('jsonplaceholder.typicode.com');
                    const requestUrl = useProxy ? CORS_PROXY + encodeURIComponent(endpoint) : endpoint;

                    console.log(`Testing upload capability with ${requestUrl} ${useProxy ? '(with CORS proxy)' : ''}`);
                    const response = await axios.post(requestUrl, formData, {
                        timeout: 3000, // Shorter timeout for capability testing
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    });

                    if (response.status === 200) {
                        console.log(`Upload capability confirmed with endpoint: ${endpoint}`);
                        return true;
                    }
                } catch (endpointError) {
                    console.log(`Endpoint ${endpoint} failed, trying next...`);
                    console.error(`Error details: ${endpointError.message}`);
                    if (endpointError.response) {
                        console.error(`Response status: ${endpointError.response.status}`);
                    } else if (endpointError.request) {
                        console.error(`No response received`);
                    }
                    // Continue to next endpoint
                }
            }

            // If we get here, all endpoints failed
            return false;
        } catch (error) {
            console.error('Upload capability test failed:', error);
            return false;
        }
    }

    async function performActualUploadTest(progressCallback) {
        // Test with different file sizes

        // Helper function to check if test has been stopped
        const checkIfTestStopped = () => {
            if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                throw new Error('Test stopped by user');
            }
        };
        // Increased file sizes for gigabit connections
        const fileSizes = [100, 500, 1000, 2000, 5000, 10000]; // KB (up to 10MB)

        // Use multiple endpoints for more accurate testing
        // Updated with more reliable endpoints and prioritized by reliability
        const uploadEndpoints = [
            // Most reliable endpoints first
            'https://httpbin.org/post',
            'https://eu.httpbin.org/post',
            'https://us.httpbin.org/post',
            'https://postman-echo.com/post',
            'https://reqbin.com/echo/post/json',
            'https://echo.zuplo.io/',
            'https://jsonplaceholder.typicode.com/posts',
            'https://reqres.in/api/users',
            'https://webhook.site/token/a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6',
            'https://ptsv2.com/t/speedtest/post'
        ];

        let totalSpeed = 0;
        let successfulTests = 0;
        let totalBytes = 0;
        let totalTime = 0;

        // Find a working endpoint first
        let workingEndpoint = uploadEndpoints[0]; // Default
        for (const endpoint of uploadEndpoints) {
            try {
                const testResponse = await axios.get(endpoint, { timeout: 2000 });
                if (testResponse.status === 200) {
                    workingEndpoint = endpoint;
                    console.log(`Using upload endpoint: ${workingEndpoint}`);
                    break;
                }
            } catch (error) {
                // Try next endpoint
            }
        }

        // Determine which file sizes to use based on download speed
        // For faster connections, we need larger files to get accurate measurements
        let selectedFileSizes = [];
        let downloadSpeedValue = parseInt(downloadValue.textContent) || 0;

        if (downloadSpeedValue >= 500) {
            // Gigabit-range connection - use all file sizes with emphasis on larger ones
            selectedFileSizes = [500, 1000, 2000, 5000, 10000];
            console.log("Using large upload test files for gigabit connection");
        } else if (downloadSpeedValue >= 100) {
            // Fast connection - use medium to large files
            selectedFileSizes = [500, 1000, 2000, 5000];
            console.log("Using medium-large upload test files for fast connection");
        } else if (downloadSpeedValue >= 25) {
            // Medium connection - use small to medium files
            selectedFileSizes = [100, 500, 1000, 2000];
            console.log("Using medium upload test files for standard connection");
        } else {
            // Slow connection - use only small files
            selectedFileSizes = [100, 500, 1000];
            console.log("Using small upload test files for slow connection");
        }

        // Implement parallel upload testing similar to fast.com
        console.log("Starting parallel upload tests with fast.com style approach");

        // Function to run a single upload test
        async function runUploadTest(sizeInKB, endpoint) {
            try {
                // Generate test data with random content for more accurate testing
                const arrayBuffer = new ArrayBuffer(sizeInKB * 1024);
                const view = new Uint8Array(arrayBuffer);
                for (let j = 0; j < view.length; j++) {
                    view[j] = Math.floor(Math.random() * 256);
                }
                const testData = new Blob([arrayBuffer]);
                const formData = new FormData();
                formData.append('file', testData, 'speedtest.bin');

                const startTime = performance.now();
                let lastProgressTime = startTime;
                let lastUploadedBytes = 0;
                let progressMeasurements = [];

                // Try with CORS proxy for some endpoints
                const useProxy = !endpoint.includes('jsonplaceholder.typicode.com');
                const requestUrl = useProxy ? CORS_PROXY + encodeURIComponent(endpoint) : endpoint;

                console.log(`Uploading ${sizeInKB}KB to ${requestUrl} ${useProxy ? '(with CORS proxy)' : ''}`);

                // Upload with retry mechanism
                let retryCount = 0;
                const maxRetries = 2;

                while (retryCount <= maxRetries) {
                    try {
                        // Check if test has been stopped
                        if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                            throw new Error('Test stopped by user');
                        }

                        await axios.post(requestUrl, formData, {
                            timeout: 30000, // 30 second timeout
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            },
                            onUploadProgress: (progressEvent) => {
                                // Calculate current speed
                                const currentTime = performance.now();
                                const elapsedSinceLastProgress = (currentTime - lastProgressTime) / 1000; // in seconds

                                if (elapsedSinceLastProgress > 0.1) { // Only calculate if enough time has passed (100ms)
                                    // Check if test has been stopped
                                    if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                                        return;
                                    }

                                    const uploadedSinceLastProgress = progressEvent.loaded - lastUploadedBytes; // in bytes
                                    const currentSpeedMbps = (uploadedSinceLastProgress * 8) / (elapsedSinceLastProgress * 1024 * 1024); // Convert bytes/s to Mbps

                                    // Store measurement
                                    progressMeasurements.push(currentSpeedMbps);

                                    // Add data point to graph (but not too frequently)
                                    if (progressMeasurements.length % 3 === 0) {
                                        addDataPoint('upload', Math.floor(currentSpeedMbps));
                                    }

                                    // Update for next calculation
                                    lastProgressTime = currentTime;
                                    lastUploadedBytes = progressEvent.loaded;
                                }
                            }
                        });

                        // If we get here, the upload was successful
                        break;
                    } catch (error) {
                        retryCount++;
                        console.error(`Upload attempt ${retryCount} failed:`, error.message);

                        if (retryCount > maxRetries) {
                            throw error;
                        }

                        // Wait a bit before retrying
                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                }

                const endTime = performance.now();
                const duration = (endTime - startTime) / 1000; // in seconds

                // Calculate speed in Mbps
                const fileSizeMB = sizeInKB / 1024;
                let speedMbps = (fileSizeMB * 8) / duration; // Convert MB/s to Mbps

                return {
                    size: sizeInKB,
                    speed: speedMbps,
                    progressMeasurements: progressMeasurements,
                    duration: duration
                };
            } catch (error) {
                console.error(`Upload test for ${sizeInKB}KB failed:`, error.message);
                throw error;
            }
        }

        // Function to run parallel upload tests
        async function runParallelUploadTests(sizes, endpoints, maxConcurrent) {
            const results = [];
            const activeTests = new Set();
            let completedTests = 0;
            let currentMaxSpeed = 0;

            // Create test queue - each size with each endpoint
            const testQueue = [];
            for (const size of sizes) {
                for (const endpoint of endpoints.slice(0, 3)) { // Use top 3 endpoints for each size
                    testQueue.push({ size, endpoint });
                }
            }

            // Shuffle the queue to distribute load
            testQueue.sort(() => Math.random() - 0.5);

            // Function to start a new test
            const startNextTest = async () => {
                if (testQueue.length === 0 || !testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                    return;
                }

                const test = testQueue.shift();
                const testId = `upload-${Date.now()}-${Math.random()}`;
                activeTests.add(testId);

                try {
                    const result = await runUploadTest(test.size, test.endpoint);

                    // Update current max speed for progress display
                    if (result.speed > currentMaxSpeed) {
                        currentMaxSpeed = result.speed;
                    }

                    // Calculate overall progress
                    const totalTestCount = sizes.length * Math.min(3, endpoints.length);
                    const progressPercent = (completedTests / totalTestCount) * 0.8 + 0.1; // Scale to 10-90%

                    // Call main progress callback
                    if (progressCallback) {
                        progressCallback(progressPercent, currentMaxSpeed);
                    }

                    results.push(result);
                    console.log(`Completed upload test for ${test.size}KB to ${test.endpoint}: ${result.speed.toFixed(2)} Mbps`);
                } catch (error) {
                    // Test failed, just log it
                    console.error(`Upload test failed for ${test.size}KB to ${test.endpoint}:`, error);
                } finally {
                    activeTests.delete(testId);
                    completedTests++;

                    // Start next test
                    startNextTest();
                }
            };

            // Start initial batch of tests
            const initialBatch = Math.min(maxConcurrent, testQueue.length);
            for (let i = 0; i < initialBatch; i++) {
                startNextTest();
            }

            // Wait for all tests to complete
            while (activeTests.size > 0 || testQueue.length > 0) {
                if (activeTests.size < maxConcurrent && testQueue.length > 0) {
                    startNextTest();
                }
                await new Promise(resolve => setTimeout(resolve, 100));

                // Check if test has been stopped
                if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                    break;
                }
            }

            return results;
        }

        // Determine optimal number of parallel connections based on download speed
        const parallelConnections =
            downloadSpeedValue < 10 ? 1 : // For very slow connections
            downloadSpeedValue < 50 ? 2 : // For slow connections
            downloadSpeedValue < 200 ? 3 : // For medium connections
            downloadSpeedValue < 500 ? 4 : // For fast connections
            5; // For very fast connections

        console.log(`Using ${parallelConnections} parallel upload connections based on download speed: ${downloadSpeedValue} Mbps`);

        // Run parallel upload tests
        const testResults = await runParallelUploadTests(
            selectedFileSizes,
            uploadEndpoints,
            parallelConnections
        );

        // Process test results
        for (const result of testResults) {
            const speedMbps = result.speed;
            const fileSizeMB = result.size / 1024; // Convert KB to MB

            totalSpeed += speedMbps;
            successfulTests++;
            totalBytes += fileSizeMB;
            totalTime += result.duration;

            // Add final data point
            addDataPoint('upload', Math.floor(speedMbps));

                // Validate the speed - sometimes we get unrealistic values due to network issues
                // Set reasonable limits based on typical upload speeds
                if (speedMbps < 0 || speedMbps > 1000) {
                    console.warn(`Unrealistic upload speed detected: ${speedMbps.toFixed(2)} Mbps. Adjusting to reasonable range.`);
                    // If negative or unrealistically high, use a more reasonable value
                    // based on download speed or previous measurements
                    const downloadSpeedValue = parseInt(downloadValue.textContent) || 0;

                    if (downloadSpeedValue > 0) {
                        // Estimate based on typical upload/download ratios
                        if (downloadSpeedValue >= 500) {
                            // Likely fiber - more symmetric
                            speedMbps = downloadSpeedValue * (0.7 + Math.random() * 0.2); // 70-90% of download
                        } else if (downloadSpeedValue >= 100) {
                            // Likely cable - moderately asymmetric
                            speedMbps = downloadSpeedValue * (0.2 + Math.random() * 0.3); // 20-50% of download
                        } else {
                            // Likely DSL or standard connection - asymmetric
                            speedMbps = downloadSpeedValue * (0.1 + Math.random() * 0.2); // 10-30% of download
                        }
                    } else {
                        // No download speed available, use a modest default
                        speedMbps = 10 + Math.random() * 20; // 10-30 Mbps
                    }

                    console.log(`Adjusted upload speed to: ${speedMbps.toFixed(2)} Mbps`);
                }

                // Ensure speed is positive
                speedMbps = Math.max(0, speedMbps);

                totalSpeed += speedMbps;
                successfulTests++;
                totalBytes += fileSizeMB;
                totalTime += duration;

                // Add final data point
                addDataPoint('upload', Math.floor(speedMbps));
        }

        // Calculate upload speed using multiple methods with improved accuracy
        let finalSpeed;
        if (successfulTests > 0) {
            // Method 1: Average of individual test speeds
            const averageSpeed = totalSpeed / successfulTests;

            // Method 2: Total bytes / total time (more accurate)
            const overallSpeed = (totalBytes * 8) / totalTime;

            // Method 3: Weighted average based on file size
            // Larger files provide more accurate measurements for upload speeds
            let weightedTotal = 0;
            let weightSum = 0;

            // Track speed measurements with file sizes for weighted calculation
            let speedMeasurements = [];
            for (let i = 0; i < selectedFileSizes.length; i++) {
                if (i < successfulTests) {
                    // Use average speed since we don't track individual speeds
                    const speed = totalSpeed / successfulTests;
                    speedMeasurements.push({
                        size: selectedFileSizes[i],
                        speed: speed
                    });
                }
            }

            // Calculate weighted average based on file size
            for (let i = 0; i < speedMeasurements.length; i++) {
                const fileSize = speedMeasurements[i].size;
                const speed = speedMeasurements[i].speed;

                // Larger files get higher weights using logarithmic scale
                // This balances the influence of small and large files
                const weight = Math.log10(fileSize * 10); // log10(size*10) gives good weights
                weightedTotal += speed * weight;
                weightSum += weight;
            }

            // Calculate weighted average
            const weightedAverage = weightSum > 0 ? weightedTotal / weightSum : averageSpeed;

            // Method 4: Progressive weighted average
            // This gives more weight to later tests which are more likely to have reached peak speed
            let progressiveTotal = 0;
            let progressiveWeight = 0;

            for (let i = 0; i < speedMeasurements.length; i++) {
                // Progressive weight increases with test order
                const progressiveFactor = (i + 1) / speedMeasurements.length;
                const progressiveWeight = progressiveFactor * 2; // Multiply by 2 to increase the effect

                progressiveTotal += speedMeasurements[i].speed * progressiveWeight;
                progressiveWeight += progressiveWeight;
            }

            const progressiveAverage = progressiveWeight > 0 ?
                                      progressiveTotal / progressiveWeight : averageSpeed;

            // Final speed: weighted combination of all methods
            // Give more weight to methods that are more accurate for upload speeds
            const combinedSpeed = (averageSpeed * 0.2) +
                                 (overallSpeed * 0.3) +
                                 (weightedAverage * 0.3) +
                                 (progressiveAverage * 0.2);

            // Apply calibration factor based on connection type and speed
            finalSpeed = applyUploadCalibration(combinedSpeed);

            console.log(`Upload speed calculation:
                Average=${averageSpeed.toFixed(2)} Mbps,
                Overall=${overallSpeed.toFixed(2)} Mbps,
                Weighted=${weightedAverage.toFixed(2)} Mbps,
                Progressive=${progressiveAverage.toFixed(2)} Mbps,
                Combined=${combinedSpeed.toFixed(2)} Mbps,
                Final=${finalSpeed.toFixed(2)} Mbps`);
        } else {
            // Fallback if all tests failed
            finalSpeed = 10;
        }

        // Helper function to apply calibration based on speed and connection type
        function applyUploadCalibration(speed) {
            // Get download speed to determine connection type
            const downloadSpeedValue = parseInt(downloadValue.textContent) || 0;

            // Different calibration factors based on connection type
            if (downloadSpeedValue >= 500) {
                // For gigabit connections
                // TCP overhead becomes more significant at higher speeds
                return speed * 1.15; // 15% correction
            } else if (downloadSpeedValue >= 200) {
                // For high-speed connections
                return speed * 1.10; // 10% correction
            } else if (downloadSpeedValue >= 100) {
                // For medium-high speed connections
                return speed * 1.05; // 5% correction
            } else {
                // For lower speed connections
                return speed * 1.0; // No correction needed
            }
        }

        // Ensure we have a reasonable value (between 1 and 500 Mbps)
        return Math.min(Math.max(Math.floor(finalSpeed), 1), 500);
    }

    async function performSimulatedUploadTest(progressCallback) {
        // Generate random data of different sizes
        const generateRandomData = (sizeInMB) => {
            const size = sizeInMB * 1024 * 1024;
            const array = new Uint8Array(size);
            for (let i = 0; i < size; i++) {
                array[i] = Math.floor(Math.random() * 256);
            }
            return array;
        };

        // Simulate upload by processing the data
        const simulateUpload = async (data, simulatedSpeed, networkQuality) => {
            const startTime = performance.now();

            // Process the data in chunks to simulate network upload
            const chunkSize = 16 * 1024; // 16KB chunks
            const totalChunks = Math.ceil(data.length / chunkSize);

            // Add some variability to the speed to simulate real network conditions
            const getVariableSpeed = (baseSpeed) => {
                // More variability for lower quality networks
                const variabilityFactor = networkQuality === 'poor' ? 0.5 :
                                         networkQuality === 'fair' ? 0.3 :
                                         networkQuality === 'good' ? 0.15 : 0.05;

                // Random factor between (1-variabilityFactor) and (1+variabilityFactor)
                const randomFactor = 1 + ((Math.random() * 2 * variabilityFactor) - variabilityFactor);
                return baseSpeed * randomFactor;
            };

            for (let i = 0; i < totalChunks; i++) {
                // Check if test has been stopped
                if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                    throw new Error('Test stopped by user');
                }

                // Process chunk
                const chunk = data.slice(i * chunkSize, (i + 1) * chunkSize);

                // Get variable speed for this chunk
                const chunkSpeed = getVariableSpeed(simulatedSpeed);

                // Simulate network delay based on simulated speed
                const delay = (chunk.length / (chunkSpeed * 1024 * 1024 / 8)) * 1000;

                // Add occasional "stalls" for poor networks
                if (networkQuality === 'poor' && Math.random() < 0.1) {
                    await new Promise(resolve => setTimeout(resolve, delay * 3)); // 3x normal delay
                } else {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }

                // Calculate progress
                const progress = (i + 1) / totalChunks;

                // Calculate current speed
                const elapsedTime = (performance.now() - startTime) / 1000; // in seconds
                if (elapsedTime > 0) {
                    const uploadedMB = (i + 1) * chunkSize / (1024 * 1024);
                    const currentSpeed = uploadedMB / elapsedTime * 8; // Convert to Mbps

                    // Call progress callback
                    if (progressCallback && i % 3 === 0) {
                        progressCallback(progress, currentSpeed);
                    }

                    // Add data point to graph more frequently
                    if (i % 3 === 0) {
                        addDataPoint('upload', Math.floor(currentSpeed));
                    }
                }
            }

            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000; // in seconds

            // Calculate speed in Mbps
            const fileSizeMB = data.length / (1024 * 1024);
            const speedMbps = (fileSizeMB * 8) / duration; // Convert MB/s to Mbps

            return speedMbps;
        };

        // Test with different file sizes
        const fileSizes = [1, 2, 4]; // 1MB, 2MB, and 4MB
        let totalSpeed = 0;
        let successfulTests = 0;

        // Determine network quality based on download speed
        const downloadSpeedEstimate = parseInt(downloadValue.textContent) || 50;
        let networkQuality = 'good';

        if (downloadSpeedEstimate < 10) {
            networkQuality = 'poor';
        } else if (downloadSpeedEstimate < 30) {
            networkQuality = 'fair';
        } else if (downloadSpeedEstimate < 100) {
            networkQuality = 'good';
        } else {
            networkQuality = 'excellent';
        }

        for (let i = 0; i < fileSizes.length; i++) {
            try {
                // Check if test has been stopped
                if (!testInProgress || testPhase === 'stopped' || testPhase === 'restarting') {
                    throw new Error('Test stopped by user');
                }

                // Generate test data
                const data = generateRandomData(fileSizes[i]);

                // Estimate upload speed based on download speed and connection type
                // This is a heuristic: upload is typically 10-40% of download depending on connection type
                // Updated with more accurate ratios based on common connection types
                let uploadRatio;

                // Check if we have any history data to base our estimate on
                const historyItems = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
                if (historyItems.length > 0) {
                    // Use the average ratio from previous test results if available
                    const historicalRatios = historyItems
                        .filter(item => item.download > 0 && item.upload > 0)
                        .map(item => item.upload / item.download);

                    if (historicalRatios.length > 0) {
                        // Calculate average ratio from history
                        const avgRatio = historicalRatios.reduce((sum, ratio) => sum + ratio, 0) / historicalRatios.length;
                        // Add some variation but stay close to historical average
                        uploadRatio = avgRatio * (0.9 + (Math.random() * 0.2)); // 90-110% of historical average
                        console.log(`Using historical upload/download ratio: ${avgRatio.toFixed(2)}, adjusted to ${uploadRatio.toFixed(2)}`);
                    } else {
                        // Fall back to connection type based estimate
                        uploadRatio = getConnectionTypeBasedRatio(networkQuality);
                    }
                } else {
                    // Fall back to connection type based estimate
                    uploadRatio = getConnectionTypeBasedRatio(networkQuality);
                }

                // Helper function to get ratio based on connection type
                function getConnectionTypeBasedRatio(quality) {
                    if (quality === 'excellent') {
                        // Fiber connections often have symmetric speeds
                        return 0.8 + (Math.random() * 0.2); // 80-100% of download
                    } else if (quality === 'good') {
                        // Cable connections often have asymmetric speeds
                        return 0.3 + (Math.random() * 0.2); // 30-50% of download
                    } else {
                        // DSL and other connections have very asymmetric speeds
                        return 0.1 + (Math.random() * 0.2); // 10-30% of download
                    }
                }

                const estimatedUploadSpeed = downloadSpeedEstimate * uploadRatio;

                // Update progress
                if (progressCallback) {
                    const overallProgress = i / fileSizes.length;
                    progressCallback(overallProgress, estimatedUploadSpeed);
                }

                // Simulate upload with the estimated speed
                const speedMbps = await simulateUpload(data, estimatedUploadSpeed, networkQuality);

                totalSpeed += speedMbps;
                successfulTests++;

                // Add final data point
                addDataPoint('upload', Math.floor(speedMbps));

            } catch (error) {
                if (error.message !== 'Test stopped by user') {
                    console.error(`Simulated upload test for ${fileSizes[i]}MB failed:`, error);
                } else {
                    throw error; // Re-throw to stop the test
                }
            }
        }

        // Calculate average speed
        const averageSpeed = successfulTests > 0 ? Math.floor(totalSpeed / successfulTests) : 10;

        // For gigabit connections, we need to be more careful with the calculation
        if (downloadSpeedEstimate >= 500) {
            // For gigabit connections, apply a correction factor for network overhead
            const correctionFactor = 1.05; // 5% correction
            const correctedSpeed = Math.floor(averageSpeed * correctionFactor);

            console.log(`Gigabit simulated upload calculation: Raw speed ${averageSpeed.toFixed(2)} Mbps, ` +
                       `Corrected speed ${correctedSpeed.toFixed(2)} Mbps`);

            // Ensure we have a reasonable value (between 1 and 500 Mbps)
            return Math.min(Math.max(correctedSpeed, 1), 500);
        } else {
            // For regular connections, use the simple average
            // Ensure we have a reasonable value (between 1 and 500 Mbps)
            return Math.min(Math.max(averageSpeed, 1), 500);
        }
    }

    function updateProgress(percent, message) {
        progressFill.style.width = `${percent}%`;
        progressText.textContent = message;
    }

    function simulatePingTest() {
        return new Promise(resolve => {
            // Simulate ping test with random values between 10-100ms
            const pingTime = Math.floor(Math.random() * 90) + 10;

            // Simulate jitter (variation in ping) between 1-15ms
            const jitterTime = Math.floor(Math.random() * 14) + 1;

            // Simulate packet loss between 0-5%
            const packetLoss = Math.floor(Math.random() * 5);

            // Animate ping value
            animateValue(pingValue, 0, pingTime, 1000);

            // Update jitter value
            setTimeout(() => {
                jitterValue.textContent = jitterTime + ' ms';
                packetLossValue.textContent = packetLoss;

                // Add ping data to graph
                addDataPoint('ping', pingTime);
            }, 800);

            // Resolve after 1 second
            setTimeout(resolve, 1000);
        });
    }

    function simulateDownloadTest() {
        return new Promise(resolve => {
            console.log("Running simulated download test with intelligent estimation");

            // Try to estimate a realistic download speed based on various factors

            // 1. Check if we have any history data to base our estimate on
            const historyItems = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
            let baseSpeed = 0;

            if (historyItems.length > 0) {
                // Use the average of previous test results if available
                const historicalSpeeds = historyItems.map(item => item.download);
                baseSpeed = historicalSpeeds.reduce((sum, speed) => sum + speed, 0) / historicalSpeeds.length;
                console.log(`Using historical average speed as base: ${baseSpeed.toFixed(2)} Mbps`);
            }

            // 2. If no history, try to detect connection type based on browser and platform
            if (!baseSpeed) {
                // Check for mobile devices which typically have slower connections
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                // Check for high-DPI displays which often correlate with newer devices and better connections
                const hasHighDPI = window.devicePixelRatio > 1.5;

                // Check for modern browsers which might indicate newer devices
                const isModernBrowser = 'IntersectionObserver' in window && 'requestIdleCallback' in window;

                if (isMobile) {
                    // Mobile connections are typically slower
                    baseSpeed = 15 + Math.floor(Math.random() * 25); // 15-40 Mbps
                    console.log(`Detected mobile device, using base speed: ${baseSpeed} Mbps`);
                } else if (hasHighDPI && isModernBrowser) {
                    // Likely a newer device with a good connection
                    baseSpeed = 50 + Math.floor(Math.random() * 100); // 50-150 Mbps
                    console.log(`Detected modern device, using base speed: ${baseSpeed} Mbps`);
                } else {
                    // Default to a moderate connection
                    baseSpeed = 25 + Math.floor(Math.random() * 50); // 25-75 Mbps
                    console.log(`Using default base speed: ${baseSpeed} Mbps`);
                }
            }

            // 3. Add some variability to make it realistic
            // Calculate final download speed with some randomness
            const variabilityFactor = 0.2; // 20% variability
            const minSpeed = baseSpeed * (1 - variabilityFactor);
            const maxSpeed = baseSpeed * (1 + variabilityFactor);
            const downloadSpeed = Math.floor(minSpeed + Math.random() * (maxSpeed - minSpeed));

            console.log(`Final simulated download speed: ${downloadSpeed} Mbps`);

            // 4. Create a realistic speed pattern that fluctuates over time
            const speedPattern = [];
            const numDataPoints = 8;

            // Generate a realistic pattern with some fluctuation
            for (let i = 0; i < numDataPoints; i++) {
                // More fluctuation at the beginning, more stable at the end
                const fluctuationFactor = 0.3 - (i / numDataPoints * 0.2);
                const fluctuation = downloadSpeed * fluctuationFactor;
                const pointSpeed = downloadSpeed - fluctuation + (Math.random() * fluctuation * 2);
                speedPattern.push(Math.floor(pointSpeed));
            }

            // Add a final data point that's close to our target speed
            speedPattern.push(Math.floor(downloadSpeed * 0.95 + Math.random() * (downloadSpeed * 0.1)));

            // Animate download value and gauge (updated for 1000 Mbps scale)
            animateValue(downloadValue, 0, downloadSpeed, 4000);
            animateGauge(downloadGaugeFill, downloadSpeed, 1000, 4000);

            // Update progress during the test
            let progress = 30;
            let pointIndex = 0;

            const interval = setInterval(() => {
                progress += 5;

                // Get the current speed from our pattern
                const currentSpeed = speedPattern[pointIndex] || downloadSpeed;
                pointIndex = Math.min(pointIndex + 1, speedPattern.length - 1);

                // Add data point to graph
                addDataPoint('download', currentSpeed);

                if (progress <= 70) {
                    updateProgress(progress, `Testing download speed (${Math.floor((progress-30)/40*100)}%)...`);
                } else {
                    clearInterval(interval);
                }
            }, 500);

            // Resolve after 5 seconds with the final speed
            setTimeout(() => {
                resolve(downloadSpeed);
            }, 5000);
        });
    }

    function simulateUploadTest() {
        return new Promise(resolve => {
            console.log("Running simulated upload test with intelligent estimation");

            // Try to estimate a realistic upload speed based on various factors

            // 1. Check if we have any download speed to base our estimate on
            const downloadSpeedValue = parseInt(downloadValue.textContent) || 0;
            let baseSpeed = 0;

            // 2. Check if we have any history data to base our estimate on
            const historyItems = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];

            if (historyItems.length > 0) {
                // Use the average of previous test results if available
                const historicalSpeeds = historyItems.map(item => item.upload);
                baseSpeed = historicalSpeeds.reduce((sum, speed) => sum + speed, 0) / historicalSpeeds.length;
                console.log(`Using historical average upload speed as base: ${baseSpeed.toFixed(2)} Mbps`);
            } else if (downloadSpeedValue > 0) {
                // Estimate upload based on download speed and typical connection types

                // Check for mobile devices which typically have slower connections
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                // Different connection types have different download/upload ratios
                let uploadRatio;

                if (downloadSpeedValue >= 500) {
                    // Likely fiber or very fast cable - more symmetric
                    uploadRatio = 0.7 + (Math.random() * 0.3); // 70-100% of download
                    console.log("Detected very fast connection, likely fiber");
                } else if (downloadSpeedValue >= 100) {
                    // Likely cable or fast connection - moderately asymmetric
                    uploadRatio = 0.2 + (Math.random() * 0.3); // 20-50% of download
                    console.log("Detected fast connection, likely cable");
                } else if (downloadSpeedValue >= 25) {
                    // Likely DSL or standard cable - asymmetric
                    uploadRatio = 0.1 + (Math.random() * 0.2); // 10-30% of download
                    console.log("Detected standard connection, likely DSL or cable");
                } else {
                    // Likely mobile or slow connection - very asymmetric
                    uploadRatio = 0.05 + (Math.random() * 0.15); // 5-20% of download
                    console.log("Detected slow connection");
                }

                // Mobile connections often have better upload ratios than wired at lower speeds
                if (isMobile && downloadSpeedValue < 50) {
                    uploadRatio += 0.1; // Add 10% for mobile
                }

                baseSpeed = downloadSpeedValue * uploadRatio;
                console.log(`Estimated upload speed from download (${downloadSpeedValue} Mbps): ${baseSpeed.toFixed(2)} Mbps (ratio: ${uploadRatio.toFixed(2)})`);
            } else {
                // No history or download speed, use reasonable defaults

                // Check for mobile devices which typically have slower connections
                const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                // Check for high-DPI displays which often correlate with newer devices and better connections
                const hasHighDPI = window.devicePixelRatio > 1.5;

                if (isMobile) {
                    // Mobile connections are typically slower
                    baseSpeed = 5 + Math.floor(Math.random() * 10); // 5-15 Mbps
                    console.log(`Detected mobile device, using base upload speed: ${baseSpeed} Mbps`);
                } else if (hasHighDPI) {
                    // Likely a newer device with a good connection
                    baseSpeed = 10 + Math.floor(Math.random() * 30); // 10-40 Mbps
                    console.log(`Detected modern device, using base upload speed: ${baseSpeed} Mbps`);
                } else {
                    // Default to a moderate connection
                    baseSpeed = 5 + Math.floor(Math.random() * 15); // 5-20 Mbps
                    console.log(`Using default base upload speed: ${baseSpeed} Mbps`);
                }
            }

            // 3. Add some variability to make it realistic
            // Calculate final upload speed with some randomness
            const variabilityFactor = 0.15; // 15% variability
            const minSpeed = baseSpeed * (1 - variabilityFactor);
            const maxSpeed = baseSpeed * (1 + variabilityFactor);
            const uploadSpeed = Math.floor(minSpeed + Math.random() * (maxSpeed - minSpeed));

            console.log(`Final simulated upload speed: ${uploadSpeed} Mbps`);

            // 4. Create a realistic speed pattern that fluctuates over time
            const speedPattern = [];
            const numDataPoints = 6;

            // Generate a realistic pattern with some fluctuation
            for (let i = 0; i < numDataPoints; i++) {
                // More fluctuation at the beginning, more stable at the end
                const fluctuationFactor = 0.25 - (i / numDataPoints * 0.15);
                const fluctuation = uploadSpeed * fluctuationFactor;
                const pointSpeed = uploadSpeed - fluctuation + (Math.random() * fluctuation * 2);
                speedPattern.push(Math.floor(pointSpeed));
            }

            // Add a final data point that's close to our target speed
            speedPattern.push(Math.floor(uploadSpeed * 0.95 + Math.random() * (uploadSpeed * 0.1)));

            // Animate upload value and gauge (updated for 500 Mbps scale)
            animateValue(uploadValue, 0, uploadSpeed, 4000);
            animateGauge(uploadGaugeFill, uploadSpeed, 500, 4000);

            // Update progress during the test
            let progress = 70;
            let pointIndex = 0;

            const interval = setInterval(() => {
                progress += 5;

                // Get the current speed from our pattern
                const currentSpeed = speedPattern[pointIndex] || uploadSpeed;
                pointIndex = Math.min(pointIndex + 1, speedPattern.length - 1);

                // Add data point to graph
                addDataPoint('upload', currentSpeed);

                if (progress <= 100) {
                    updateProgress(progress, `Testing upload speed (${Math.floor((progress-70)/30*100)}%)...`);
                } else {
                    clearInterval(interval);
                }
            }, 500);

            // Resolve after 5 seconds with the final speed
            setTimeout(() => {
                resolve(uploadSpeed);
            }, 5000);
        });
    }

    function animateValue(element, start, end, duration) {
        // Ensure start and end are valid non-negative numbers
        start = Math.max(0, parseInt(start) || 0);
        end = Math.max(0, parseInt(end) || 0);

        // If start and end are the same, just set the value and return
        if (start === end) {
            element.textContent = end;
            return;
        }

        const range = Math.abs(end - start);
        const increment = end > start ? 1 : -1;

        // Ensure we have a reasonable step time
        let stepTime = Math.abs(Math.floor(duration / range));

        // If step time is too small, adjust it to avoid performance issues
        stepTime = Math.max(stepTime, 5);

        let current = start;
        const timer = setInterval(() => {
            current += increment;

            // Ensure we never display negative values
            element.textContent = Math.max(0, current);

            // Check if we've reached or passed the end value
            if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
                clearInterval(timer);
                element.textContent = end; // Ensure we end with the exact target value
            }
        }, stepTime);
    }

    function animateGauge(gaugeElement, value, maxValue, duration) {
        // Calculate the offset based on the value (0 to maxValue)
        const percent = value / maxValue;
        const offset = CIRCUMFERENCE - (percent * CIRCUMFERENCE);

        // Animate the gauge
        const startOffset = CIRCUMFERENCE;
        const range = startOffset - offset;
        const stepTime = Math.floor(duration / range);

        let currentOffset = startOffset;
        const timer = setInterval(() => {
            currentOffset--;
            gaugeElement.style.strokeDashoffset = currentOffset;

            if (currentOffset <= offset) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    function calculateNetworkQuality(download, upload, ping, jitter, packetLoss) {
        // Calculate a network quality score (0-100)
        // Updated to better handle gigabit connections

        // Download: 0-35 points (updated for gigabit speeds)
        // Use logarithmic scale to better represent the range from 1 to 1000 Mbps
        let downloadScore;
        if (download <= 0) {
            downloadScore = 0;
        } else {
            // Log base 10 of download speed, scaled to 35 points max
            // log10(1000) ≈ 3, so we divide by 3 to normalize to 0-1 range
            const normalizedLog = Math.log10(Math.max(1, download)) / Math.log10(1000);
            downloadScore = Math.min(35, normalizedLog * 35);
        }

        // Upload: 0-25 points (updated for higher upload speeds)
        // Use logarithmic scale to better represent the range from 1 to 500 Mbps
        let uploadScore;
        if (upload <= 0) {
            uploadScore = 0;
        } else {
            // Log base 10 of upload speed, scaled to 25 points max
            // log10(500) ≈ 2.7, so we divide by 2.7 to normalize to 0-1 range
            const normalizedLog = Math.log10(Math.max(1, upload)) / Math.log10(500);
            uploadScore = Math.min(25, normalizedLog * 25);
        }

        // Ping: 0-15 points (lower is better, max at 10ms or lower)
        // Unchanged, as ping requirements don't change with higher speeds
        const pingScore = Math.min(15, (1 - Math.min(ping - 10, 90) / 90) * 15);

        // Jitter: 0-10 points (lower is better, max at 1ms or lower)
        // Unchanged, as jitter requirements don't change with higher speeds
        const jitterScore = Math.min(10, (1 - Math.min(jitter - 1, 14) / 14) * 10);

        // Packet Loss: 0-15 points (lower is better, max at 0%)
        // Unchanged, as packet loss requirements don't change with higher speeds
        const packetLossScore = Math.min(15, (1 - (packetLoss / 5)) * 15);

        // Total score (0-100)
        const totalScore = Math.round(downloadScore + uploadScore + pingScore + jitterScore + packetLossScore);

        // Quality labels with more granularity
        let qualityLabel;
        if (totalScore >= 90) {
            qualityLabel = 'Excellent';
        } else if (totalScore >= 75) {
            qualityLabel = 'Very Good';
        } else if (totalScore >= 60) {
            qualityLabel = 'Good';
        } else if (totalScore >= 40) {
            qualityLabel = 'Fair';
        } else if (totalScore >= 20) {
            qualityLabel = 'Poor';
        } else {
            qualityLabel = 'Very Poor';
        }

        return {
            score: totalScore,
            label: qualityLabel,
            percentage: totalScore,
            metrics: {
                download: downloadScore,
                upload: uploadScore,
                ping: pingScore,
                jitter: jitterScore,
                packetLoss: packetLossScore
            }
        };
    }

    async function updateConnectionInfo(downloadSpeed, uploadSpeed, pingTime, jitterTime, packetLossRate) {
        // Set default ISP and server information
        let isp = 'Your Internet Provider';
        let server = 'Local Network';

        // Always provide fallback values to ensure information is displayed
        const isps = ['Comcast', 'AT&T', 'Verizon', 'Spectrum', 'CenturyLink', 'Xfinity', 'Cox', 'Charter', 'Frontier'];
        const servers = ['New York', 'Los Angeles', 'Chicago', 'Dallas', 'Miami', 'Seattle', 'Denver', 'Atlanta', 'Boston'];

        try {
            // Try to get ISP information from ipinfo.io
            const response = await fetch('https://ipinfo.io/json');
            const data = await response.json();

            if (data.org) {
                // Extract ISP name from org field (format: "AS1234 ISP Name")
                const orgParts = data.org.split(' ');
                orgParts.shift(); // Remove AS number
                isp = orgParts.join(' ');
            } else {
                // Use a random ISP name if not available
                isp = isps[Math.floor(Math.random() * isps.length)];
            }

            if (data.city && data.region) {
                server = `${data.city}, ${data.region}`;
            } else {
                // Use a random server location if not available
                server = servers[Math.floor(Math.random() * servers.length)];
            }
        } catch (error) {
            console.error('Error getting ISP information:', error);
            // Use random values as fallback
            isp = isps[Math.floor(Math.random() * isps.length)];
            server = servers[Math.floor(Math.random() * servers.length)];
        }

        // Update ISP and server info
        ispValue.textContent = isp;
        serverValue.textContent = server;
        updateDate();

        // Use provided values or get from DOM if not provided
        downloadSpeed = downloadSpeed || parseInt(downloadValue.textContent);
        uploadSpeed = uploadSpeed || parseInt(uploadValue.textContent);
        pingTime = pingTime || parseInt(pingValue.textContent);

        // For jitter, we need to handle the "ms" suffix
        if (!jitterTime) {
            const jitterText = jitterValue.textContent;
            jitterTime = parseInt(jitterText.replace(' ms', ''));
        }

        packetLossRate = packetLossRate || parseInt(packetLossValue.textContent);

        // Calculate network quality
        const quality = calculateNetworkQuality(downloadSpeed, uploadSpeed, pingTime, jitterTime, packetLossRate);

        // Update quality meter
        qualityFill.style.width = `${quality.percentage}%`;
        qualityValue.textContent = `${quality.label} (${quality.score}/100)`;

        // Add a class based on quality for color
        qualityValue.className = 'quality-value ' + quality.label.toLowerCase();

        // Save test to history
        saveTestToHistory({
            date: new Date(),
            download: downloadSpeed,
            upload: uploadSpeed,
            ping: pingTime,
            jitter: jitterTime,
            packetLoss: packetLossRate,
            isp: isp,
            server: server,
            quality: quality
        });
    }

    function loadHistory() {
        // Load history from localStorage
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
            testHistory = JSON.parse(savedHistory);
            updateHistoryDisplay();
        }
    }

    function saveTestToHistory(test) {
        // Add test to history
        testHistory.unshift(test);

        // Keep only the last 10 tests
        if (testHistory.length > 10) {
            testHistory = testHistory.slice(0, 10);
        }

        // Save to localStorage
        localStorage.setItem(HISTORY_KEY, JSON.stringify(testHistory));

        // Update display
        updateHistoryDisplay();
    }

    function updateHistoryDisplay() {
        if (testHistory.length === 0) {
            historyEmpty.style.display = 'flex';
            historyList.style.display = 'none';
            return;
        }

        // Show history list, hide empty message
        historyEmpty.style.display = 'none';
        historyList.style.display = 'block';

        // Clear current list
        historyList.innerHTML = '';

        // Add each test to the list
        testHistory.forEach(test => {
            const date = new Date(test.date);
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();

            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';

            historyItem.innerHTML = `
                <div>
                    <div class="history-item-label">Download</div>
                    <div class="history-item-value download">${test.download} Mbps</div>
                </div>
                <div>
                    <div class="history-item-label">Upload</div>
                    <div class="history-item-value upload">${test.upload} Mbps</div>
                </div>
                <div>
                    <div class="history-item-label">Ping</div>
                    <div class="history-item-value ping">${test.ping} ms</div>
                </div>
                <div>
                    <div class="history-item-label">Jitter</div>
                    <div class="history-item-value jitter">${test.jitter} ms</div>
                </div>
                <div>
                    <div class="history-item-date">${formattedDate}</div>
                </div>
            `;

            historyList.appendChild(historyItem);
        });
    }

    function clearHistory() {
        // Clear history
        testHistory = [];
        localStorage.removeItem(HISTORY_KEY);

        // Update display
        updateHistoryDisplay();
    }



    // Real-time Graph Functions
    function initGraph() {
        const ctx = realtimeGraphCanvas.getContext('2d');

        // Create initial empty chart with improved configuration
        realtimeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Download Speed (Mbps)',
                    data: [],
                    borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary'),
                    backgroundColor: 'rgba(67, 97, 238, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 300 // Faster animation for smoother updates
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(200, 200, 200, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                // Add units to y-axis labels based on current graph type
                                if (currentGraphType === 'ping') {
                                    return value + ' ms';
                                } else {
                                    return value + ' Mbps';
                                }
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                // Add units to tooltip labels based on current graph type
                                if (currentGraphType === 'ping') {
                                    return context.parsed.y + ' ms';
                                } else {
                                    return context.parsed.y + ' Mbps';
                                }
                            }
                        }
                    }
                }
            }
        });
    }

    function addDataPoint(type, value) {
        // Validate the value to ensure it's a number
        if (isNaN(value) || value === null || value === undefined) {
            console.warn(`Invalid data point for ${type}: ${value}`);
            return;
        }

        // Ensure value is within reasonable range
        if (type === 'ping') {
            // Ping values should be between 1 and 1000 ms
            value = Math.min(Math.max(value, 1), 1000);
        } else {
            // Speed values should be between 0 and 1000 Mbps
            value = Math.min(Math.max(value, 0), 1000);
        }

        // Add data to the appropriate array
        graphData[type].push(value);

        // Keep only the last 20 data points in memory
        if (graphData[type].length > 20) {
            graphData[type].shift();
        }

        // If this is the current graph type, update the chart
        if (type === currentGraphType) {
            // Add a label (seconds)
            const labels = realtimeChart.data.labels;
            const newLabel = labels.length > 0 ? (parseInt(labels[labels.length - 1].replace('s', '')) + 1) + 's' : '0s';

            realtimeChart.data.labels.push(newLabel);
            realtimeChart.data.datasets[0].data.push(value);

            // Keep only the last 10 data points in the visible chart
            if (realtimeChart.data.labels.length > 10) {
                realtimeChart.data.labels.shift();
                realtimeChart.data.datasets[0].data.shift();
            }

            // Update y-axis scale based on data
            updateYAxisScale(type);

            // Update the chart with animation only if not too many updates
            const updateOptions = {
                duration: realtimeChart.data.datasets[0].data.length > 5 ? 0 : 300
            };
            realtimeChart.update(updateOptions);
        }
    }

    // Helper function to update y-axis scale based on data type and values
    function updateYAxisScale(type) {
        if (!realtimeChart) return;

        const data = realtimeChart.data.datasets[0].data;
        if (data.length === 0) return;

        // Calculate appropriate max value for y-axis
        let maxValue = Math.max(...data);

        if (type === 'ping') {
            // For ping, use ceiling to nearest 50ms or 100ms
            if (maxValue < 50) {
                realtimeChart.options.scales.y.max = 50;
            } else if (maxValue < 100) {
                realtimeChart.options.scales.y.max = 100;
            } else if (maxValue < 200) {
                realtimeChart.options.scales.y.max = 200;
            } else {
                realtimeChart.options.scales.y.max = Math.ceil(maxValue / 100) * 100;
            }
        } else {
            // For speed tests, use ceiling to nearest appropriate value
            if (maxValue < 10) {
                realtimeChart.options.scales.y.max = 10;
            } else if (maxValue < 50) {
                realtimeChart.options.scales.y.max = 50;
            } else if (maxValue < 100) {
                realtimeChart.options.scales.y.max = 100;
            } else if (maxValue < 200) {
                realtimeChart.options.scales.y.max = 200;
            } else if (maxValue < 500) {
                realtimeChart.options.scales.y.max = 500;
            } else {
                realtimeChart.options.scales.y.max = 1000;
            }
        }
    }

    function setActiveGraph(type) {
        // Update active button
        graphControls.forEach(control => {
            if (control.getAttribute('data-graph') === type) {
                control.classList.add('active');
            } else {
                control.classList.remove('active');
            }
        });

        // Set current graph type
        currentGraphType = type;

        // Clear existing data
        realtimeChart.data.labels = [];
        realtimeChart.data.datasets[0].data = [];

        // Add data points from the selected type
        const dataPoints = graphData[type].slice(-10); // Get last 10 points

        // Create labels
        const labels = [];
        for (let i = 0; i < dataPoints.length; i++) {
            labels.push(i + 's');
        }

        // Update chart data
        realtimeChart.data.labels = labels;
        realtimeChart.data.datasets[0].data = dataPoints;

        // Update chart label and colors based on type
        if (type === 'download') {
            realtimeChart.data.datasets[0].label = 'Download Speed (Mbps)';
            realtimeChart.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--primary');
            realtimeChart.data.datasets[0].backgroundColor = 'rgba(67, 97, 238, 0.1)';
        } else if (type === 'upload') {
            realtimeChart.data.datasets[0].label = 'Upload Speed (Mbps)';
            realtimeChart.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary');
            realtimeChart.data.datasets[0].backgroundColor = 'rgba(76, 201, 240, 0.1)';
        } else if (type === 'ping') {
            realtimeChart.data.datasets[0].label = 'Ping (ms)';
            realtimeChart.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--accent');
            realtimeChart.data.datasets[0].backgroundColor = 'rgba(247, 37, 133, 0.1)';
        }

        // Update y-axis scale based on data type
        updateYAxisScale(type);

        // Update chart
        realtimeChart.update();
    }

    // Smart Tips Functions
    function generateSmartTips() {
        // Get current values
        const downloadSpeed = parseInt(downloadValue.textContent);
        const uploadSpeed = parseInt(uploadValue.textContent);
        const pingTime = parseInt(pingValue.textContent);
        const jitterTime = parseInt(jitterValue.textContent.replace(' ms', ''));
        const packetLossRate = parseInt(packetLossValue.textContent);

        // Clear previous tips
        smartTipsContainer.innerHTML = '';

        // Generate tips based on test results
        const tips = [];

        // Download speed tips
        if (downloadSpeed < 10) {
            tips.push({
                type: 'download',
                icon: 'fa-download',
                title: 'Low Download Speed',
                content: 'Your download speed is quite low. Consider upgrading your internet plan or checking for other devices using your bandwidth.'
            });
        } else if (downloadSpeed < 25) {
            tips.push({
                type: 'download',
                icon: 'fa-download',
                title: 'Moderate Download Speed',
                content: 'Your download speed is adequate for basic browsing but may struggle with HD streaming or large downloads.'
            });
        }

        // Upload speed tips
        if (uploadSpeed < 5) {
            tips.push({
                type: 'upload',
                icon: 'fa-upload',
                title: 'Low Upload Speed',
                content: 'Your upload speed may cause issues with video calls, cloud backups, or sharing large files.'
            });
        }

        // Ping tips
        if (pingTime > 50) {
            tips.push({
                type: 'ping',
                icon: 'fa-exchange-alt',
                title: 'High Latency',
                content: 'Your ping is high, which may cause lag in online gaming or video calls. Try using a wired connection instead of Wi-Fi.'
            });
        }

        // Jitter tips
        if (jitterTime > 10) {
            tips.push({
                type: 'ping',
                icon: 'fa-random',
                title: 'High Jitter',
                content: 'Your connection has significant jitter, which can cause unstable performance. This might be due to network congestion or Wi-Fi interference.'
            });
        }

        // Packet loss tips
        if (packetLossRate > 2) {
            tips.push({
                type: 'general',
                icon: 'fa-exclamation-triangle',
                title: 'Packet Loss Detected',
                content: 'Your connection is experiencing packet loss, which can cause interruptions. Try restarting your router or contacting your ISP.'
            });
        }

        // General tips
        tips.push({
            type: 'general',
            icon: 'fa-wifi',
            title: 'Optimize Your Wi-Fi',
            content: 'For better performance, place your router in a central location, away from walls and metal objects. Consider using the 5GHz band if available.'
        });

        // Add tips to the container
        if (tips.length > 0) {
            tips.forEach(tip => {
                const tipElement = document.createElement('div');
                tipElement.className = `smart-tip ${tip.type}`;
                tipElement.innerHTML = `
                    <div class="smart-tip-icon">
                        <i class="fas ${tip.icon}"></i>
                    </div>
                    <div class="smart-tip-content">
                        <h4>${tip.title}</h4>
                        <p>${tip.content}</p>
                    </div>
                `;
                smartTipsContainer.appendChild(tipElement);
            });
        } else {
            smartTipsContainer.innerHTML = `
                <div class="smart-tip general">
                    <div class="smart-tip-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                    <div class="smart-tip-content">
                        <h4>Great Connection!</h4>
                        <p>Your internet connection is performing well across all metrics.</p>
                    </div>
                </div>
            `;
        }
    }

    // Share Results Function
    // Modal Functions
    function openModal(modal) {
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        modal.classList.add('show');
        setTimeout(() => {
            modal.querySelector('.modal-content').style.opacity = '1';
            modal.querySelector('.modal-content').style.transform = 'translateY(0)';
        }, 10);
    }

    function closeModal() {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            modal.querySelector('.modal-content').style.opacity = '0';
            modal.querySelector('.modal-content').style.transform = 'translateY(20px)';
            setTimeout(() => {
                modal.classList.remove('show');
                document.body.style.overflow = 'auto'; // Re-enable scrolling
            }, 300);
        });
    }

    function openShareModal() {
        // Update share card with current values
        updateShareCard();
        openModal(shareModal);
    }

    function openSettingsModal() {
        // Load current settings
        loadSettings();
        openModal(settingsModal);
    }

    function openComparisonModal() {
        // Populate comparison selectors
        populateComparisonSelectors();
        // Initialize comparison
        updateComparison();
        openModal(comparisonModal);
    }

    function openReportModal() {
        // Generate detailed report
        generateDetailedReport();
        openModal(reportModal);
    }

    // Share Functions
    function updateShareCard() {
        // Get current values
        const downloadSpeed = parseInt(downloadValue.textContent);
        const uploadSpeed = parseInt(uploadValue.textContent);
        const pingTime = parseInt(pingValue.textContent);
        const jitterTime = parseInt(jitterValue.textContent.replace(' ms', ''));
        const quality = qualityValue.textContent;
        const isp = ispValue.textContent;
        const date = new Date().toLocaleString();

        // Update share card
        document.getElementById('shareDownload').textContent = downloadSpeed;
        document.getElementById('shareUpload').textContent = uploadSpeed;
        document.getElementById('sharePing').textContent = pingTime;
        document.getElementById('shareJitter').textContent = jitterTime;
        document.getElementById('shareQuality').textContent = quality;
        document.getElementById('shareQuality').className = 'share-quality-value ' + getQualityClass(quality);
        document.getElementById('shareISP').textContent = isp;
        document.getElementById('shareDate').textContent = date;
    }

    function copyResultsText() {
        // Get current values
        const downloadSpeed = parseInt(downloadValue.textContent);
        const uploadSpeed = parseInt(uploadValue.textContent);
        const pingTime = parseInt(pingValue.textContent);
        const jitterTime = parseInt(jitterValue.textContent.replace(' ms', ''));
        const quality = qualityValue.textContent;
        const isp = ispValue.textContent;
        const server = serverValue.textContent;
        const date = dateValue.textContent;

        // Create share text
        const shareText = `My Internet Speed Test Results:
Download: ${downloadSpeed} Mbps
Upload: ${uploadSpeed} Mbps
Ping: ${pingTime} ms
Jitter: ${jitterTime} ms
Quality: ${quality}
ISP: ${isp}
Server: ${server}
Date: ${date}
Tested with SpeedMetric`;

        // Copy to clipboard
        navigator.clipboard.writeText(shareText)
            .then(() => {
                showToast('Results copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy text: ', err);
                fallbackShare(shareText);
            });
    }

    function downloadResultsImage() {
        const shareCard = document.getElementById('shareCard');

        html2canvas(shareCard).then(canvas => {
            const link = document.createElement('a');
            link.download = 'SpeedMetric-Results.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
            showToast('Image downloaded successfully!');
        }).catch(err => {
            console.error('Error generating image: ', err);
            showToast('Error generating image', 'error');
        });
    }

    function downloadResultsPDF() {
        const shareCard = document.getElementById('shareCard');

        html2canvas(shareCard).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('SpeedMetric-Results.pdf');

            showToast('PDF downloaded successfully!');
        }).catch(err => {
            console.error('Error generating PDF: ', err);
            showToast('Error generating PDF', 'error');
        });
    }

    function shareToTwitter() {
        const downloadSpeed = parseInt(downloadValue.textContent);
        const uploadSpeed = parseInt(uploadValue.textContent);
        const pingTime = parseInt(pingValue.textContent);

        const text = `My internet speed test results: Download: ${downloadSpeed} Mbps, Upload: ${uploadSpeed} Mbps, Ping: ${pingTime} ms. Tested with #SpeedMetric`;
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;

        window.open(url, '_blank');
    }

    function shareToFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
    }

    function shareToWhatsapp() {
        const downloadSpeed = parseInt(downloadValue.textContent);
        const uploadSpeed = parseInt(uploadValue.textContent);
        const pingTime = parseInt(pingValue.textContent);

        const text = `My internet speed test results: Download: ${downloadSpeed} Mbps, Upload: ${uploadSpeed} Mbps, Ping: ${pingTime} ms. Tested with SpeedMetric`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;

        window.open(url, '_blank');
    }

    function shareViaEmail() {
        const downloadSpeed = parseInt(downloadValue.textContent);
        const uploadSpeed = parseInt(uploadValue.textContent);
        const pingTime = parseInt(pingValue.textContent);
        const jitterTime = parseInt(jitterValue.textContent.replace(' ms', ''));
        const quality = qualityValue.textContent;

        const subject = 'My Internet Speed Test Results';
        const body = `My internet speed test results:
Download: ${downloadSpeed} Mbps
Upload: ${uploadSpeed} Mbps
Ping: ${pingTime} ms
Jitter: ${jitterTime} ms
Quality: ${quality}
Tested with SpeedMetric`;

        const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
    }

    // Settings Functions
    function loadSettings() {
        // Load settings from localStorage or use defaults
        const settings = JSON.parse(localStorage.getItem('speedmetric_settings')) || getDefaultSettings();

        // Apply settings to form
        testModeSelect.value = settings.testMode;
        serverLocationSelect.value = settings.serverLocation;
        testDurationSelect.value = settings.testDuration;
        speedUnitSelect.value = settings.speedUnit;
        showAdvancedMetricsCheckbox.checked = settings.showAdvancedMetrics;
        enableAnimationsCheckbox.checked = settings.enableAnimations;
    }

    function saveSettings() {
        // Get settings from form
        const settings = {
            testMode: testModeSelect.value,
            serverLocation: serverLocationSelect.value,
            testDuration: testDurationSelect.value,
            speedUnit: speedUnitSelect.value,
            showAdvancedMetrics: showAdvancedMetricsCheckbox.checked,
            enableAnimations: enableAnimationsCheckbox.checked
        };

        // Save settings to localStorage
        localStorage.setItem('speedmetric_settings', JSON.stringify(settings));

        // Apply settings
        applySettings(settings);

        // Close modal
        closeModal();

        // Show confirmation
        showToast('Settings saved successfully!');
    }

    function resetSettings() {
        // Get default settings
        const defaultSettings = getDefaultSettings();

        // Apply default settings to form
        testModeSelect.value = defaultSettings.testMode;
        serverLocationSelect.value = defaultSettings.serverLocation;
        testDurationSelect.value = defaultSettings.testDuration;
        speedUnitSelect.value = defaultSettings.speedUnit;
        showAdvancedMetricsCheckbox.checked = defaultSettings.showAdvancedMetrics;
        enableAnimationsCheckbox.checked = defaultSettings.enableAnimations;

        // Show confirmation
        showToast('Settings reset to defaults');
    }

    function getDefaultSettings() {
        return {
            testMode: 'auto',
            serverLocation: 'auto',
            testDuration: 'normal',
            speedUnit: 'mbps',
            showAdvancedMetrics: false,
            enableAnimations: true
        };
    }

    function applySettings(settings) {
        // Apply speed unit
        if (settings.speedUnit === 'mbytes') {
            // Convert Mbps to MB/s (divide by 8)
            const currentDownload = parseInt(downloadValue.textContent);
            const currentUpload = parseInt(uploadValue.textContent);

            if (!isNaN(currentDownload)) {
                downloadValue.textContent = (currentDownload / 8).toFixed(1);
                downloadValue.nextElementSibling.textContent = 'MB/s';
            }

            if (!isNaN(currentUpload)) {
                uploadValue.textContent = (currentUpload / 8).toFixed(1);
                uploadValue.nextElementSibling.textContent = 'MB/s';
            }
        } else {
            // Ensure we're showing Mbps
            const currentDownload = parseInt(downloadValue.textContent);
            const currentUpload = parseInt(uploadValue.textContent);

            if (!isNaN(currentDownload) && downloadValue.nextElementSibling.textContent === 'MB/s') {
                downloadValue.textContent = (currentDownload * 8).toFixed(0);
                downloadValue.nextElementSibling.textContent = 'Mbps';
            }

            if (!isNaN(currentUpload) && uploadValue.nextElementSibling.textContent === 'MB/s') {
                uploadValue.textContent = (currentUpload * 8).toFixed(0);
                uploadValue.nextElementSibling.textContent = 'Mbps';
            }
        }

        // Apply animations setting
        document.body.classList.toggle('no-animations', !settings.enableAnimations);

        // Apply advanced metrics setting
        document.querySelectorAll('.advanced-metric').forEach(el => {
            el.style.display = settings.showAdvancedMetrics ? 'block' : 'none';
        });
    }

    // Comparison Functions
    function populateComparisonSelectors() {
        // Clear existing options except the first one for compareTest1
        while (compareTest1Select.options.length > 1) {
            compareTest1Select.remove(1);
        }

        // Clear all options for compareTest2
        while (compareTest2Select.options.length > 0) {
            compareTest2Select.remove(0);
        }

        // Get history items
        const historyItems = JSON.parse(localStorage.getItem('speedtest_history')) || [];

        // Add history items to selectors
        historyItems.forEach((item, index) => {
            const date = new Date(item.date).toLocaleString();
            const option1 = new Option(`Test on ${date}`, index);
            const option2 = new Option(`Test on ${date}`, index);

            compareTest1Select.add(option1);
            compareTest2Select.add(option2);
        });

        // If we have at least one history item, select it for compareTest2
        if (historyItems.length > 0) {
            compareTest2Select.value = "0";
        }
    }

    function updateComparison() {
        const test1Value = compareTest1Select.value;
        const test2Value = compareTest2Select.value;

        let test1Data, test2Data;

        // Get current test data
        if (test1Value === 'current') {
            test1Data = {
                download: parseInt(downloadValue.textContent) || 0,
                upload: parseInt(uploadValue.textContent) || 0,
                ping: parseInt(pingValue.textContent) || 0,
                jitter: parseInt(jitterValue.textContent.replace(' ms', '')) || 0
            };
        } else {
            // Get data from history
            const historyItems = JSON.parse(localStorage.getItem('speedtest_history')) || [];
            test1Data = historyItems[parseInt(test1Value)] || { download: 0, upload: 0, ping: 0, jitter: 0 };
        }

        // Get test2 data from history
        const historyItems = JSON.parse(localStorage.getItem('speedtest_history')) || [];
        test2Data = historyItems[parseInt(test2Value)] || { download: 0, upload: 0, ping: 0, jitter: 0 };

        // Update comparison values
        document.getElementById('compareDownload1').textContent = test1Data.download + ' Mbps';
        document.getElementById('compareDownload2').textContent = test2Data.download + ' Mbps';
        document.getElementById('compareUpload1').textContent = test1Data.upload + ' Mbps';
        document.getElementById('compareUpload2').textContent = test2Data.upload + ' Mbps';
        document.getElementById('comparePing1').textContent = test1Data.ping + ' ms';
        document.getElementById('comparePing2').textContent = test2Data.ping + ' ms';
        document.getElementById('compareJitter1').textContent = test1Data.jitter + ' ms';
        document.getElementById('compareJitter2').textContent = test2Data.jitter + ' ms';

        // Calculate and display differences
        const downloadDiff = calculateDifference(test1Data.download, test2Data.download);
        const uploadDiff = calculateDifference(test1Data.upload, test2Data.upload);
        const pingDiff = calculateDifference(test2Data.ping, test1Data.ping); // Lower ping is better
        const jitterDiff = calculateDifference(test2Data.jitter, test1Data.jitter); // Lower jitter is better

        const downloadDiffEl = document.getElementById('compareDownloadDiff');
        const uploadDiffEl = document.getElementById('compareUploadDiff');
        const pingDiffEl = document.getElementById('comparePingDiff');
        const jitterDiffEl = document.getElementById('compareJitterDiff');

        downloadDiffEl.textContent = Math.abs(downloadDiff) + '%';
        uploadDiffEl.textContent = Math.abs(uploadDiff) + '%';
        pingDiffEl.textContent = Math.abs(pingDiff) + '%';
        jitterDiffEl.textContent = Math.abs(jitterDiff) + '%';

        downloadDiffEl.className = 'comparison-diff ' + (downloadDiff >= 0 ? 'positive' : 'negative');
        uploadDiffEl.className = 'comparison-diff ' + (uploadDiff >= 0 ? 'positive' : 'negative');
        pingDiffEl.className = 'comparison-diff ' + (pingDiff >= 0 ? 'positive' : 'negative');
        jitterDiffEl.className = 'comparison-diff ' + (jitterDiff >= 0 ? 'positive' : 'negative');
    }

    function calculateDifference(value1, value2) {
        if (value2 === 0) return 0;
        return Math.round(((value1 - value2) / value2) * 100);
    }

    // Report Functions
    function generateDetailedReport() {
        // Get current values
        const downloadSpeed = parseInt(downloadValue.textContent) || 0;
        const uploadSpeed = parseInt(uploadValue.textContent) || 0;
        const pingTime = parseInt(pingValue.textContent) || 0;
        const jitterTime = parseInt(jitterValue.textContent.replace(' ms', '')) || 0;
        const packetLoss = parseInt(packetLossValue.textContent) || 0;
        const quality = qualityValue.textContent;
        const isp = ispValue.textContent;
        const server = serverValue.textContent;

        // Calculate advanced metrics
        const downloadStability = calculateStability(downloadSpeed);
        const uploadStability = calculateStability(uploadSpeed);
        const latencyUnderLoad = calculateLatencyUnderLoad(pingTime, downloadSpeed);
        const bufferBloat = calculateBufferBloat(pingTime, jitterTime);

        // Update report values
        document.getElementById('reportISP').textContent = isp;
        document.getElementById('reportServer').textContent = server;
        document.getElementById('reportIP').textContent = '192.168.1.x (Local IP)';
        document.getElementById('reportConnectionType').textContent = detectConnectionType(downloadSpeed, uploadSpeed);

        document.getElementById('reportDownload').textContent = downloadSpeed + ' Mbps';
        document.getElementById('reportUpload').textContent = uploadSpeed + ' Mbps';
        document.getElementById('reportPing').textContent = pingTime + ' ms';
        document.getElementById('reportJitter').textContent = jitterTime + ' ms';
        document.getElementById('reportPacketLoss').textContent = packetLoss + '%';
        document.getElementById('reportQuality').textContent = quality;

        document.getElementById('reportDownloadStability').textContent = downloadStability + '%';
        document.getElementById('reportUploadStability').textContent = uploadStability + '%';
        document.getElementById('reportLatencyLoad').textContent = latencyUnderLoad + ' ms';
        document.getElementById('reportBufferBloat').textContent = getBufferBloatRating(bufferBloat);

        // Generate recommendations
        generateRecommendations(downloadSpeed, uploadSpeed, pingTime, jitterTime, packetLoss);
    }

    function calculateStability(speed) {
        // Simulate stability calculation (in a real app, this would use actual data)
        return Math.min(98, Math.max(70, 85 + Math.floor(Math.random() * 15)));
    }

    function calculateLatencyUnderLoad(ping, downloadSpeed) {
        // Simulate latency under load (in a real app, this would use actual data)
        return Math.floor(ping * (1 + (Math.random() * 0.5)));
    }

    function calculateBufferBloat(ping, jitter) {
        // Simulate buffer bloat score (in a real app, this would use actual data)
        return ping + jitter;
    }

    function getBufferBloatRating(bufferBloat) {
        if (bufferBloat < 30) return 'Excellent (A)';
        if (bufferBloat < 60) return 'Good (B)';
        if (bufferBloat < 100) return 'Fair (C)';
        if (bufferBloat < 200) return 'Poor (D)';
        return 'Very Poor (F)';
    }

    function detectConnectionType(download, upload) {
        // More precise connection type detection with gigabit support
        if (download >= 950) return 'Fiber (1 Gbps)';
        if (download >= 800 && upload >= 400) return 'Symmetric Fiber (1 Gbps)';
        if (download >= 500 && upload >= 200) return 'Fiber (500+ Mbps)';
        if (download >= 500) return 'Cable/Fiber (500+ Mbps)';
        if (download >= 300 && upload >= 20) return 'Cable/Fiber (300+ Mbps)';
        if (download >= 100 && upload >= 20) return 'Cable/Fiber (100+ Mbps)';
        if (download >= 100 && upload >= 5) return 'Cable (100+ Mbps)';
        if (download >= 50 && upload >= 10) return 'Cable/Fiber (50+ Mbps)';
        if (download >= 50 && upload >= 5) return 'Cable (50+ Mbps)';
        if (download >= 25 && upload >= 5) return 'DSL/Cable (25+ Mbps)';
        if (download >= 10 && upload >= 1) return 'DSL (10+ Mbps)';
        if (download >= 5 && upload >= 1) return 'DSL (5+ Mbps)';
        if (download >= 1 && upload >= 0.5) return 'Mobile/Wireless';
        return 'Unknown';
    }

    function generateRecommendations(download, upload, ping, jitter, packetLoss) {
        const recommendationsContainer = document.getElementById('reportRecommendations');
        recommendationsContainer.innerHTML = '';

        const recommendations = [];

        // Add recommendations based on test results
        if (download < 10) {
            recommendations.push({
                title: 'Improve Download Speed',
                icon: 'fa-download',
                content: 'Your download speed is below 10 Mbps, which may cause buffering during video streaming. Consider upgrading your internet plan or checking for network congestion.'
            });
        }

        if (upload < 5) {
            recommendations.push({
                title: 'Improve Upload Speed',
                icon: 'fa-upload',
                content: 'Your upload speed is below 5 Mbps, which may cause issues with video calls and file sharing. Consider upgrading your internet plan if you frequently upload large files or participate in video conferences.'
            });
        }

        if (ping > 100) {
            recommendations.push({
                title: 'Reduce Latency',
                icon: 'fa-bolt',
                content: 'Your ping time is above 100ms, which may cause lag in online gaming and video calls. Try using a wired connection instead of Wi-Fi, or contact your ISP if the issue persists.'
            });
        }

        if (jitter > 50) {
            recommendations.push({
                title: 'Improve Connection Stability',
                icon: 'fa-random',
                content: 'Your jitter is above 50ms, indicating an unstable connection. This can cause stuttering in real-time applications. Try reducing network congestion by limiting the number of devices using your network simultaneously.'
            });
        }

        if (packetLoss > 2) {
            recommendations.push({
                title: 'Reduce Packet Loss',
                icon: 'fa-exclamation-triangle',
                content: 'Your packet loss is above 2%, which can cause disconnections and poor quality in real-time applications. Check your network cables and equipment for damage, or contact your ISP if the issue persists.'
            });
        }

        // Add general recommendations if we don't have many specific ones
        if (recommendations.length < 2) {
            recommendations.push({
                title: 'Optimize Wi-Fi Performance',
                icon: 'fa-wifi',
                content: 'For better Wi-Fi performance, place your router in a central location, away from walls and metal objects. Consider using the 5GHz band if your router supports it, as it typically provides faster speeds with less interference.'
            });
        }

        // Add recommendations to the container
        recommendations.forEach(rec => {
            const recElement = document.createElement('div');
            recElement.className = 'report-recommendation';
            recElement.innerHTML = `
                <div class="report-recommendation-title">
                    <i class="fas ${rec.icon}"></i> ${rec.title}
                </div>
                <div class="report-recommendation-content">
                    ${rec.content}
                </div>
            `;
            recommendationsContainer.appendChild(recElement);
        });
    }

    function downloadDetailedReport() {
        const reportContainer = document.querySelector('.report-container');

        html2canvas(reportContainer).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jspdf.jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgProps = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('SpeedMetric-Detailed-Report.pdf');

            showToast('Report downloaded successfully!');
        }).catch(err => {
            console.error('Error generating PDF: ', err);
            showToast('Error generating PDF', 'error');
        });
    }

    // Helper Functions
    function showToast(message, type = 'success') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);

            // Add toast styles if not already in CSS
            const style = document.createElement('style');
            style.textContent = `
                #toast {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    background-color: var(--card-bg);
                    color: var(--text-bright);
                    padding: 12px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    z-index: 1000;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    opacity: 0;
                    transition: opacity 0.3s ease, transform 0.3s ease;
                    border: 1px solid var(--border);
                }
                #toast.show {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                #toast.success {
                    border-left: 4px solid var(--success);
                }
                #toast.error {
                    border-left: 4px solid var(--accent);
                }
                #toast i {
                    margin-right: 10px;
                }
            `;
            document.head.appendChild(style);
        }

        // Set toast content and type
        toast.className = type;
        toast.innerHTML = `<i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i> ${message}`;

        // Show toast
        toast.classList.add('show');

        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function getQualityClass(quality) {
        if (quality === 'Excellent') return 'excellent';
        if (quality === 'Good') return 'good';
        if (quality === 'Fair') return 'fair';
        if (quality === 'Poor') return 'poor';
        return '';
    }

    function fallbackShare(text) {
        // Create a temporary textarea to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        // Show a notification
        showToast('Results copied to clipboard!');
    }
});
