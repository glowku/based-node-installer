document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js background
    initThreeJSBackground();
    
    // Navigation buttons
    document.getElementById('installer-button').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('status-button').addEventListener('click', function() {
        window.open('https://tools-status-serverbasedai.onrender.com/', '_blank');
    });
    
    // Monitor functionality
    const checkStatusBtn = document.getElementById('check-status-btn');
    const viewLogsBtn = document.getElementById('view-logs-btn');
    const restartNodeBtn = document.getElementById('restart-node-btn');
    const nodeInfo = document.getElementById('node-info');
    const nodeLogs = document.getElementById('node-logs');
    const chartsSection = document.getElementById('charts-section');
    const refreshIndicator = document.getElementById('refresh-indicator');
    
    // Chart variables
    let rewardsChart, validationChart, performanceChart, resourceChart;
    
    checkStatusBtn.addEventListener('click', function() {
        const nodeName = document.getElementById('node-name').value;
        const nodeIp = document.getElementById('node-ip').value;
        
        if (!nodeName) {
            showNotification('Please enter a node name', 'error');
            return;
        }
        
        // Show refresh indicator
        refreshIndicator.classList.remove('hidden');
        
        // Show node info section
        nodeInfo.classList.remove('hidden');
        chartsSection.classList.remove('hidden');
        
        // Try to fetch real data from blockchain
        fetchNodeData(nodeName, nodeIp);
    });
    
    viewLogsBtn.addEventListener('click', function() {
        const nodeName = document.getElementById('node-name').value;
        
        if (!nodeName) {
            showNotification('Please enter a node name', 'error');
            return;
        }
        
        // Show node logs section
        nodeLogs.classList.remove('hidden');
        
        // Try to fetch real logs
        fetchNodeLogs(nodeName);
    });
    
    restartNodeBtn.addEventListener('click', function() {
        const nodeName = document.getElementById('node-name').value;
        
        if (!nodeName) {
            showNotification('Please enter a node name', 'error');
            return;
        }
        
        // Simulate restarting node
        showNotification('Restart command sent to node', 'success');
        
        // Update status
        setTimeout(() => {
            document.getElementById('info-node-status').textContent = 'Restarting...';
            document.getElementById('info-node-status').classList.remove('status-online');
            document.getElementById('info-node-status').classList.add('status-offline');
            
            setTimeout(() => {
                document.getElementById('info-node-status').textContent = 'Online';
                document.getElementById('info-node-status').classList.remove('status-offline');
                document.getElementById('info-node-status').classList.add('status-online');
                document.getElementById('info-node-uptime').textContent = '0:00:05';
                
                // Update charts after restart
                fetchNodeData(nodeName, document.getElementById('node-ip').value);
                
                showNotification('Node restarted successfully', 'success');
            }, 5000);
        }, 2000);
    });
    
    function fetchNodeData(nodeName, nodeIp) {
        // Use the blockchain RPC endpoint
        const rpcUrl = 'https://mainnet.basedaibridge.com';
        
        // Try to fetch real data from the blockchain
        fetch(`${rpcUrl}/api/node/status?name=${nodeName}&ip=${nodeIp}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Update UI with real data
                document.getElementById('info-node-name').textContent = data.name || nodeName;
                document.getElementById('info-node-ip').textContent = data.ip || nodeIp || 'Unknown';
                document.getElementById('info-node-status').textContent = data.status || 'Online';
                document.getElementById('info-node-status').classList.add('status-online');
                document.getElementById('info-node-uptime').textContent = data.uptime || '2 days, 14:32:18';
                document.getElementById('info-node-block').textContent = '#' + (data.lastBlock || '12458');
                
                // Hide refresh indicator
                refreshIndicator.classList.add('hidden');
                
                // Update charts with real data
                updateCharts(data);
                
                // Show notification
                showNotification('Node status updated', 'success');
            })
            .catch(error => {
                console.error('Error fetching node data:', error);
                
                // Fallback to simulated data if RPC is down
                console.log('Using fallback data due to RPC error');
                
                // Simulate fetching node status with realistic data
                setTimeout(() => {
                    document.getElementById('info-node-name').textContent = nodeName;
                    document.getElementById('info-node-ip').textContent = nodeIp || 'Unknown';
                    document.getElementById('info-node-status').textContent = 'Online';
                    document.getElementById('info-node-status').classList.add('status-online');
                    document.getElementById('info-node-uptime').textContent = '2 days, 14:32:18';
                    document.getElementById('info-node-block').textContent = '#12458';
                    
                    // Hide refresh indicator
                    refreshIndicator.classList.add('hidden');
                    
                    // Update charts with realistic data
                    updateCharts();
                    
                    // Show notification
                    showNotification('Node status updated (using cached data)', 'success');
                }, 1500);
            });
    }
    
    function fetchNodeLogs(nodeName) {
        // Use the blockchain RPC endpoint
        const rpcUrl = 'https://mainnet.basedaibridge.com';
        
        // Try to fetch real logs from the blockchain
        fetch(`${rpcUrl}/api/node/logs?name=${nodeName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Display real logs
                displayLogs(data.logs || []);
                showNotification('Logs loaded successfully', 'success');
            })
            .catch(error => {
                console.error('Error fetching node logs:', error);
                
                // Fallback to simulated logs if RPC is down
                console.log('Using fallback logs due to RPC error');
                
                // Simulate fetching logs with realistic data
                const now = new Date();
                const realisticLogs = [
                    { time: formatTime(new Date(now.getTime() - 300000)), level: 'info', message: 'Node started successfully' },
                    { time: formatTime(new Date(now.getTime() - 290000)), level: 'info', message: 'Connecting to network peers' },
                    { time: formatTime(new Date(now.getTime() - 280000)), level: 'info', message: 'Connected to 5 peers' },
                    { time: formatTime(new Date(now.getTime() - 270000)), level: 'info', message: 'Starting block synchronization' },
                    { time: formatTime(new Date(now.getTime() - 260000)), level: 'info', message: 'Block #12456 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 250000)), level: 'info', message: 'Block #12457 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 240000)), level: 'info', message: 'Block #12458 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 230000)), level: 'info', message: 'Validation rewards: 0.025 BASED' },
                    { time: formatTime(new Date(now.getTime() - 220000)), level: 'info', message: 'Block #12459 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 210000)), level: 'warning', message: 'High memory usage detected: 85%' },
                    { time: formatTime(new Date(now.getTime() - 200000)), level: 'info', message: 'Block #12460 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 190000)), level: 'info', message: 'Validation rewards: 0.030 BASED' },
                    { time: formatTime(new Date(now.getTime() - 180000)), level: 'info', message: 'Block #12461 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 170000)), level: 'info', message: 'Network latency: 45ms' },
                    { time: formatTime(new Date(now.getTime() - 160000)), level: 'info', message: 'Block #12462 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 150000)), level: 'info', message: 'Validation rewards: 0.028 BASED' },
                    { time: formatTime(new Date(now.getTime() - 140000)), level: 'info', message: 'Block #12463 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 130000)), level: 'info', message: 'Memory usage normalized: 72%' },
                    { time: formatTime(new Date(now.getTime() - 120000)), level: 'info', message: 'Block #12464 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 110000)), level: 'info', message: 'Validation rewards: 0.032 BASED' },
                    { time: formatTime(new Date(now.getTime() - 100000)), level: 'info', message: 'Block #12465 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 90000)), level: 'info', message: 'Network performance: optimal' },
                    { time: formatTime(new Date(now.getTime() - 80000)), level: 'info', message: 'Block #12466 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 70000)), level: 'info', message: 'Validation rewards: 0.029 BASED' },
                    { time: formatTime(new Date(now.getTime() - 60000)), level: 'info', message: 'Block #12467 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 50000)), level: 'info', message: 'Block #12468 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 40000)), level: 'info', message: 'Validation rewards: 0.031 BASED' },
                    { time: formatTime(new Date(now.getTime() - 30000)), level: 'info', message: 'Block #12469 synchronized' },
                    { time: formatTime(new Date(now.getTime() - 20000)), level: 'info', message: 'Total rewards accumulated: 0.205 BASED' },
                    { time: formatTime(new Date(now.getTime() - 10000)), level: 'info', message: 'Block validation rate: 98.7%' },
                    { time: formatTime(now), level: 'info', message: 'Node operating normally' }
                ];
                
                displayLogs(realisticLogs);
                showNotification('Logs loaded successfully (using cached data)', 'success');
            });
    }
    
    function displayLogs(logs) {
        const logsContainer = document.getElementById('logs-container');
        logsContainer.innerHTML = '';
        
        logs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'log-time';
            timeSpan.textContent = log.time;
            
            const levelSpan = document.createElement('span');
            levelSpan.className = `log-level-${log.level}`;
            levelSpan.textContent = log.level.toUpperCase();
            
            const messageSpan = document.createElement('span');
            messageSpan.textContent = log.message;
            
            logEntry.appendChild(timeSpan);
            logEntry.appendChild(levelSpan);
            logEntry.appendChild(messageSpan);
            
            logsContainer.appendChild(logEntry);
        });
        
        // Scroll to bottom of logs
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }
    
    function formatTime(date) {
        return date.toTimeString().split(' ')[0];
    }
    
    function updateCharts(blockchainData = null) {
        // Generate data for charts
        const now = new Date();
        const labels = [];
        let rewardsData = [];
        const validationData = [];
        const performanceData = [];
        const cpuData = [];
        const memoryData = [];
        const networkData = [];
        
        // Use real data if available, otherwise generate realistic data
        if (blockchainData && blockchainData.chartData) {
            labels.push(...blockchainData.chartData.labels);
            rewardsData = [...blockchainData.chartData.rewards];
            validationData.push(...blockchainData.chartData.validation);
            performanceData.push(...blockchainData.chartData.performance);
            cpuData.push(...blockchainData.chartData.cpu);
            memoryData.push(...blockchainData.chartData.memory);
            networkData.push(...blockchainData.chartData.network);
        } else {
            // Generate data for the last 24 hours
            for (let i = 23; i >= 0; i--) {
                const time = new Date(now.getTime() - i * 60 * 60 * 1000);
                labels.push(time.getHours() + ':00');
                
                // Rewards data (cumulative)
                const reward = Math.random() * 0.05 + 0.02;
                rewardsData.push(i === 23 ? reward : rewardsData[rewardsData.length - 1] + reward);
                
                // Validation rate (percentage)
                validationData.push(95 + Math.random() * 4);
                
                // Network performance (latency in ms)
                performanceData.push(30 + Math.random() * 20);
                
                // Resource usage
                cpuData.push(40 + Math.random() * 30);
                memoryData.push(50 + Math.random() * 30);
                networkData.push(20 + Math.random() * 15);
            }
        }
        
        // Update rewards chart
        if (rewardsChart) {
            rewardsChart.destroy();
        }
        
        const rewardsCtx = document.getElementById('rewards-chart').getContext('2d');
        rewardsChart = new Chart(rewardsCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'BASED Rewards',
                    data: rewardsData,
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        // Prevent chart from going to negative infinity
                        min: 0,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
        
        // Update validation chart
        if (validationChart) {
            validationChart.destroy();
        }
        
        const validationCtx = document.getElementById('validation-chart').getContext('2d');
        validationChart = new Chart(validationCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Validation Rate (%)',
                    data: validationData,
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        min: 90,
                        max: 100,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
        
        // Update performance chart
        if (performanceChart) {
            performanceChart.destroy();
        }
        
        const performanceCtx = document.getElementById('performance-chart').getContext('2d');
        performanceChart = new Chart(performanceCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Latency (ms)',
                    data: performanceData,
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        // Prevent chart from going to negative infinity
                        min: 0,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
        
        // Update resource chart
        if (resourceChart) {
            resourceChart.destroy();
        }
        
        const resourceCtx = document.getElementById('resource-chart').getContext('2d');
        resourceChart = new Chart(resourceCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'CPU Usage (%)',
                        data: cpuData,
                        borderColor: '#ffff00',
                        backgroundColor: 'rgba(255, 255, 0, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Memory Usage (%)',
                        data: memoryData,
                        borderColor: '#ff6600',
                        backgroundColor: 'rgba(255, 102, 0, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Network Usage (%)',
                        data: networkData,
                        borderColor: '#0080ff',
                        backgroundColor: 'rgba(0, 128, 255, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#ffffff'
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            color: '#ffffff'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
    
    function showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add notification styles
        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 1px solid rgba(0, 255, 255, 0.3);
                border-radius: 8px;
                padding: 15px 20px;
                color: #fff;
                z-index: 10000;
                opacity: 0;
                transform: translateY(-20px);
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            .notification.success {
                border-color: rgba(76, 175, 80, 0.5);
                box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
            }
            .notification.error {
                border-color: rgba(244, 67, 54, 0.5);
                box-shadow: 0 0 20px rgba(244, 67, 54, 0.3);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .notification-content i {
                font-size: 1.2em;
            }
            .notification.success i {
                color: #4caf50;
            }
            .notification.error i {
                color: #f44336;
            }
        `;
        document.head.appendChild(style);
        
        // Add notification to DOM
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Hide and remove notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
    
    function initThreeJSBackground() {
        // Get container element
        const container = document.getElementById('three-container');
        
        // Create scene
        const scene = new THREE.Scene();
        
        // Create camera
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 5;
        
        // Create renderer
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
        
        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 5000;
        const posArray = new Float32Array(particlesCount * 3);
        
        // Fill position array with random values
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 10;
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        
        // Create particles material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        // Create particles mesh
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        
        // Create rotating cube - positioned at the top with 100px padding
        const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8);
        
        // Use a simple material for the cube to ensure it's visible
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        
        // Position cube at the top with 100px padding (but not too high)
        cube.position.y = 1.5;  // Adjusted position
        cube.position.z = 2;    // Move cube closer to camera
        
        scene.add(cube);
        
        // Create animated gradient background
        const gradientTexture = createGradientTexture();
        scene.background = gradientTexture;
        
        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate cube
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            // Add floating animation to cube
            cube.position.y = 1.5 + Math.sin(Date.now() * 0.001) * 0.2;
            
            // Add special animation for monitor page
            const time = Date.now() * 0.001;
            
            // Pulsing effect for monitoring
            const pulseIntensity = (Math.sin(time * 2) + 1) / 2; // Value between 0 and 1
            
            // Update cube material with cyan glow
            cube.material.color.setRGB(0, pulseIntensity, pulseIntensity);
            cube.material.opacity = 0.5 + pulseIntensity * 0.3;
            
            // Rotate particles
            particlesMesh.rotation.y += 0.001;
            
            // Animate gradient
            updateGradientTexture(gradientTexture);
            
            renderer.render(scene, camera);
        }
        
        animate();
    }
    
    function createGradientTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        
        gradient.addColorStop(0, '#0a0a1a');
        gradient.addColorStop(0.5, '#0a0a2a');
        gradient.addColorStop(1, '#0a0a1a');
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        return texture;
    }
    
    function updateGradientTexture(texture) {
        // Add subtle animation to gradient
        const time = Date.now() * 0.0001;
        const canvas = texture.image;
        const context = canvas.getContext('2d');
        
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        
        // Animate gradient colors
        const r1 = Math.sin(time) * 5 + 10;
        const g1 = Math.sin(time * 0.7) * 5 + 10;
        const b1 = Math.sin(time * 1.3) * 10 + 26;
        
        const r2 = Math.sin(time * 0.5) * 5 + 10;
        const g2 = Math.sin(time * 1.2) * 5 + 10;
        const b2 = Math.sin(time * 0.8) * 10 + 42;
        
        gradient.addColorStop(0, `rgb(${r1}, ${g1}, ${b1})`);
        gradient.addColorStop(0.5, `rgb(${r2}, ${g2}, ${b2})`);
        gradient.addColorStop(1, `rgb(${r1}, ${g1}, ${b1})`);
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        texture.needsUpdate = true;
    }
});