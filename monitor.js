document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js background with particles and rotating cube
    initThreeJSBackground();
    
    // DOM Elements
    const serverStatus = document.getElementById('server-status');
    const serverStatusText = document.getElementById('server-status-text');
    const syncIndicator = document.getElementById('sync-indicator');
    const syncStatus = document.getElementById('sync-status');
    
    const totalNodesEl = document.getElementById('total-nodes');
    const onlineNodesEl = document.getElementById('online-nodes');
    const offlineNodesEl = document.getElementById('offline-nodes');
    const issuesNodesEl = document.getElementById('issues-nodes');
    
    const nodesList = document.getElementById('nodes-list');
    const emptyState = document.getElementById('empty-state');
    const addNodeForm = document.getElementById('add-node-form');
    const nodeForm = document.getElementById('node-form');
    
    const searchInput = document.getElementById('node-search');
    const searchBtn = document.getElementById('search-btn');
    const refreshBtn = document.getElementById('refresh-btn');
    const checkAllBtn = document.getElementById('check-all-btn');
    const addNodeBtn = document.getElementById('add-node-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    
    const viewBtns = document.querySelectorAll('.view-btn');
    
    // Node details section
    const nodeDetailsSection = document.getElementById('node-details-section');
    const detailsNodeName = document.getElementById('details-node-name');
    const detailsStatus = document.getElementById('details-status');
    const detailsWallet = document.getElementById('details-wallet');
    const detailsIp = document.getElementById('details-ip');
    const detailsPort = document.getElementById('details-port');
    const detailsUptime = document.getElementById('details-uptime');
    const detailsLastChecked = document.getElementById('details-last-checked');
    const detailsLogs = document.getElementById('details-logs');
    const closeDetailsBtn = document.getElementById('close-details-btn');
    const refreshDetailsBtn = document.getElementById('refresh-details-btn');
    const removeDetailsBtn = document.getElementById('remove-details-btn');
    
    // Chart elements
    const cpuChart = document.getElementById('cpu-chart');
    const memoryChart = document.getElementById('memory-chart');
    const networkChart = document.getElementById('network-chart');
    const diskChart = document.getElementById('disk-chart');
    
    // Chart instances
    let cpuChartInstance = null;
    let memoryChartInstance = null;
    let networkChartInstance = null;
    let diskChartInstance = null;
    
    // Navigation buttons
    document.getElementById('easy-node-button').addEventListener('click', function() {
        window.location.href = 'index.html';
    });
    
    document.getElementById('status-button').addEventListener('click', function() {
        window.open('https://tools-status-serverbasedai.onrender.com/', '_blank');
    });
    
    // Initialize nodes from localStorage
    let nodes = JSON.parse(localStorage.getItem('basedai-nodes')) || [];
    let currentView = 'cards';
    let currentNodeId = null;
    let chartUpdateActive = false;
    let chartUpdateRetryCount = 0;
    const MAX_CHART_RETRIES = 3;
    
    // Initialize the monitor
    function initMonitor() {
        updateStats();
        renderNodes();
        
        // Check all nodes on load
        if (nodes.length > 0) {
            checkAllNodes();
        } else {
            updateSyncStatus('Ready');
            updateServerStatus('Ready', 'ready');
        }
    }

    // Fonction pour vérifier la compatibilité avec BF1337/basednode
function checkBF1337Compatibility() {
    console.log("Vérification de la compatibilité avec BF1337/basednode...");
    
    // Vérifier si le endpoint RPC est accessible
    fetch('http://localhost:9933', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "method": "system_health",
            "params": [],
            "id": 1
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.result) {
            console.log("✅ BF1337/basednode RPC accessible");
            updateServerStatus('Online', 'online');
        } else {
            console.log("❌ BF1337/basednode RPC non accessible");
            updateServerStatus('Offline', 'offline');
        }
    })
    .catch(error => {
        console.error("Erreur lors de la vérification BF1337/basednode:", error);
        updateServerStatus('Offline', 'offline');
    });
}

// Appeler la fonction de compatibilité au chargement
document.addEventListener('DOMContentLoaded', function() {
    // ... code existant ...
    
    // Ajouter cette ligne
    checkBF1337Compatibility();
    
    // ... reste du code ...
});
    
    // Update statistics
    function updateStats() {
        const totalNodes = nodes.length;
        const onlineNodes = nodes.filter(node => node.status === 'online').length;
        const offlineNodes = nodes.filter(node => node.status === 'offline').length;
        const issuesNodes = nodes.filter(node => node.status === 'issues').length;
        
        totalNodesEl.textContent = totalNodes;
        onlineNodesEl.textContent = onlineNodes;
        offlineNodesEl.textContent = offlineNodes;
        issuesNodesEl.textContent = issuesNodes;
    }
    
    // Render nodes based on current view
    function renderNodes(filteredNodes = nodes) {
        nodesList.innerHTML = '';
        
        if (filteredNodes.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        if (currentView === 'cards') {
            renderCardsView(filteredNodes);
        } else {
            renderTableView(filteredNodes);
        }
    }
    
    // Render cards view
    function renderCardsView(nodesToRender) {
        nodesToRender.forEach(node => {
            const nodeCard = document.createElement('div');
            nodeCard.className = 'node-card';
            nodeCard.dataset.nodeId = node.id;
            
            const statusClass = node.status || 'unknown';
            const statusIcon = getStatusIcon(node.status);
            const statusText = getStatusText(node.status);
            
            // Determine node type icon
            const nodeTypeIcon = node.type === 'miner' ? 'fa-hammer' : 'fa-shield-alt';
            const nodeTypeText = node.type === 'miner' ? 'Miner' : 'Validator';
            
            nodeCard.innerHTML = `
                <div class="node-header">
                    <div class="node-name">${node.name}</div>
                    <div class="node-type ${node.type || 'validator'}">
                        <i class="fas ${nodeTypeIcon}"></i>
                        <span>${nodeTypeText}</span>
                    </div>
                    <div class="node-status ${statusClass}">
                        <i class="fas ${statusIcon}"></i>
                        <span>${statusText}</span>
                    </div>
                </div>
                
                <div class="node-info">
                    <div class="info-item">
                        <div class="info-label">Wallet:</div>
                        <div class="info-value">${truncateAddress(node.wallet)}</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Address:</div>
                        <div class="info-value">${node.ip}:${node.port}</div>
                    </div>
                    
                    <div class="info-item">
                        <div class="info-label">Last Checked:</div>
                        <div class="info-value">${node.lastChecked || 'Never'}</div>
                    </div>
                </div>
                
                <div class="node-actions">
                    <button class="node-action-btn check-btn" data-node-id="${node.id}">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                    <button class="node-action-btn details-btn" data-node-id="${node.id}">
                        <i class="fas fa-chart-line"></i>
                    </button>
                    <button class="node-action-btn remove-btn" data-node-id="${node.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            nodesList.appendChild(nodeCard);
        });
        
        // Add event listeners to the buttons
        document.querySelectorAll('.check-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.getAttribute('data-node-id');
                checkNode(nodeId);
            });
        });
        
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.getAttribute('data-node-id');
                showNodeDetails(nodeId);
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.getAttribute('data-node-id');
                removeNode(nodeId);
            });
        });
        
        // Add click event to node card to show details
        document.querySelectorAll('.node-card').forEach(card => {
            card.addEventListener('click', function() {
                const nodeId = this.getAttribute('data-node-id');
                showNodeDetails(nodeId);
            });
        });
    }
    
    // Render table view
    function renderTableView(nodesToRender) {
        const table = document.createElement('table');
        table.className = 'nodes-table';
        
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Node Name</th>
                    <th>Type</th>
                    <th>Wallet Address</th>
                    <th>Address</th>
                    <th>Status</th>
                    <th>Last Checked</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${nodesToRender.map(node => {
                    const statusClass = node.status || 'unknown';
                    const statusIcon = getStatusIcon(node.status);
                    const statusText = getStatusText(node.status);
                    
                    // Determine node type icon
                    const nodeTypeIcon = node.type === 'miner' ? 'fa-hammer' : 'fa-shield-alt';
                    const nodeTypeText = node.type === 'miner' ? 'Miner' : 'Validator';
                    
                    return `
                        <tr data-node-id="${node.id}">
                            <td>${node.name}</td>
                            <td>
                                <div class="node-type ${node.type || 'validator'}">
                                    <i class="fas ${nodeTypeIcon}"></i>
                                    <span>${nodeTypeText}</span>
                                </div>
                            </td>
                            <td>${truncateAddress(node.wallet)}</td>
                            <td>${node.ip}:${node.port}</td>
                            <td>
                                <div class="node-status ${statusClass}">
                                    <i class="fas ${statusIcon}"></i>
                                    <span>${statusText}</span>
                                </div>
                            </td>
                            <td>${node.lastChecked || 'Never'}</td>
                            <td>
                                <div class="table-actions">
                                    <button class="table-action-btn check-btn" data-node-id="${node.id}" title="Check">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                    <button class="table-action-btn details-btn" data-node-id="${node.id}" title="Details">
                                        <i class="fas fa-chart-line"></i>
                                    </button>
                                    <button class="table-action-btn remove-btn" data-node-id="${node.id}" title="Remove">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        `;
        
        nodesList.appendChild(table);
        
        // Add event listeners to the buttons
        document.querySelectorAll('.check-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.getAttribute('data-node-id');
                checkNode(nodeId);
            });
        });
        
        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.getAttribute('data-node-id');
                showNodeDetails(nodeId);
            });
        });
        
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const nodeId = this.getAttribute('data-node-id');
                removeNode(nodeId);
            });
        });
        
        // Add click event to table row to show details
        document.querySelectorAll('.nodes-table tbody tr').forEach(row => {
            row.addEventListener('click', function() {
                const nodeId = this.getAttribute('data-node-id');
                showNodeDetails(nodeId);
            });
        });
    }
    
    // Check all nodes
    function checkAllNodes() {
        updateSyncStatus('Checking all nodes...');
        updateServerStatus('Checking', 'checking');
        animateCubeDuringCheck();
        
        if (nodes.length === 0) {
            updateSyncStatus('No nodes to check');
            updateServerStatus('Ready', 'ready');
            stopCubeAnimation();
            return;
        }
        
        let checkedCount = 0;
        
        nodes.forEach(node => {
            checkNode(node.id, () => {
                checkedCount++;
                
                if (checkedCount === nodes.length) {
                    updateSyncStatus('All nodes checked');
                    updateServerStatus('Ready', 'ready');
                    stopCubeAnimation();
                    
                    // Update stats and render nodes after all checks
                    updateStats();
                    renderNodes();
                }
            });
        });
    }
    
    // Test connectivity to a specific port - IMPROVED with better error handling
    async function testPortConnectivity(ip, port, timeout = 5000) {
        try {
            // For local connections, use a more direct approach
            if (ip === 'localhost' || ip === '127.0.0.1') {
                try {
                    const response = await fetch(`http://${ip}:${port}`, {
                        method: 'HEAD',
                        signal: AbortSignal.timeout(timeout)
                    });
                    return { success: true, status: response.status };
                } catch (error) {
                    // Try a simple TCP connection if HTTP fails
                    return testTcpConnection(ip, port, timeout);
                }
            } else {
                // For remote connections, try HTTP first, then fall back to TCP
                try {
                    const response = await fetch(`http://${ip}:${port}`, {
                        method: 'HEAD',
                        signal: AbortSignal.timeout(timeout)
                    });
                    return { success: true, status: response.status };
                } catch (error) {
                    return testTcpConnection(ip, port, timeout);
                }
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    // Test TCP connection directly
    async function testTcpConnection(ip, port, timeout = 5000) {
        return new Promise((resolve) => {
            const socket = new WebSocket(`ws://${ip}:${port}`, [], {
                timeout: timeout
            });
            
            const timeoutId = setTimeout(() => {
                socket.close();
                resolve({ success: false, error: 'Connection timeout' });
            }, timeout);
            
            socket.addEventListener('open', () => {
                clearTimeout(timeoutId);
                socket.close();
                resolve({ success: true });
            });
            
            socket.addEventListener('error', (error) => {
                clearTimeout(timeoutId);
                resolve({ success: false, error: error.message });
            });
        });
    }
    
    // Check RPC accessibility - IMPROVED with better error handling
    async function checkRpcAccessibility(ip, rpcPort = 9933) {
        try {
            const rpcUrl = `http://${ip}:${rpcPort}`;
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "jsonrpc": "2.0",
                    "method": "system_health",
                    "params": [],
                    "id": 1
                }),
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                return { accessible: false, error: `HTTP error: ${response.status}` };
            }
            
            const data = await response.json();
            return { accessible: true, data };
        } catch (error) {
            return { accessible: false, error: error.message };
        }
    }
    
    // Check monitoring API accessibility - IMPROVED with better error handling
    async function checkMonitoringApi(ip, apiPort = 8080) {
        try {
            const apiUrl = `http://${ip}:${apiPort}/api/metrics`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                signal: AbortSignal.timeout(5000)
            });
            
            if (!response.ok) {
                return { accessible: false, error: `HTTP error: ${response.status}` };
            }
            
            const data = await response.json();
            return { accessible: true, data };
        } catch (error) {
            return { accessible: false, error: error.message };
        }
    }
    
    // Check a single node - IMPROVED VERSION with better error handling
    async function checkNode(nodeId, callback) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        // Update UI to show checking
        const nodeCard = document.querySelector(`.node-card[data-node-id="${nodeId}"]`);
        const nodeRow = document.querySelector(`tr[data-node-id="${nodeId}"]`);
        
        if (nodeCard) {
            const statusEl = nodeCard.querySelector('.node-status');
            statusEl.className = 'node-status checking';
            statusEl.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Checking...</span>';
        }
        
        if (nodeRow) {
            const statusEl = nodeRow.querySelector('.node-status');
            statusEl.className = 'node-status checking';
            statusEl.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Checking...</span>';
        }
        
        let status = 'offline';
        let statusMessage = 'Node is offline';
        let nodeData = null;
        
        try {
            // First try to check the monitoring API (port 8080)
            const monitoringCheck = await checkMonitoringApi(node.ip, node.monitoringPort || 8080);
            
            if (monitoringCheck.accessible) {
                status = 'online';
                statusMessage = 'Node is online and monitoring API is accessible';
                nodeData = monitoringCheck.data;
            } else {
                // If monitoring API is not accessible, try RPC (port 9933)
                const rpcCheck = await checkRpcAccessibility(node.ip, node.rpcPort || 9933);
                
                if (rpcCheck.accessible) {
                    status = 'online';
                    statusMessage = 'Node is online and RPC is accessible';
                } else {
                    // If RPC is not accessible, try the node API (port 9944)
                    const apiPort = node.port || 9944;
                    const portTest = await testPortConnectivity(node.ip, apiPort);
                    
                    if (portTest.success) {
                        status = 'issues';
                        statusMessage = 'Node is accessible but services may not be fully functional';
                    } else {
                        status = 'offline';
                        statusMessage = `Node is offline: ${monitoringCheck.error}, ${rpcCheck.error}, ${portTest.error}`;
                    }
                }
            }
            
            // Process node data
            const uptime = nodeData && nodeData.metrics ? 
                formatUptime(nodeData.metrics.uptime || 0) : 'N/A';
            const cpu = nodeData && nodeData.metrics ? 
                `${nodeData.metrics.cpu || 0}%` : 'N/A';
            const memory = nodeData && nodeData.metrics ? 
                `${nodeData.metrics.memory || 0}%` : 'N/A';
            const network = nodeData && nodeData.metrics ? 
                `${nodeData.metrics.network || 0}%` : 'N/A';
            const disk = nodeData && nodeData.metrics ? 
                `${nodeData.metrics.disk || 0}%` : 'N/A';
            
            // Additional data
            const lastBlock = nodeData && nodeData.node ? 
                nodeData.node.lastBlock || 'N/A' : 'N/A';
            const contributionRewards = nodeData && nodeData.node ? 
                nodeData.node.contributionRewards || '0 BASED' : '0 BASED';
            const miningRewards = nodeData && nodeData.node ? 
                nodeData.node.miningRewards || '0 BASED' : '0 BASED';
            
            // Create logs
            const logs = [{
                timestamp: new Date().toLocaleTimeString(),
                level: status === 'online' ? 'info' : 'warning',
                message: statusMessage
            }];
            
            // Update node data
            node.status = status;
            node.lastChecked = new Date().toLocaleString();
            node.uptime = uptime;
            node.cpu = cpu;
            node.memory = memory;
            node.network = network;
            node.disk = disk;
            node.logs = logs;
            node.lastBlock = lastBlock;
            node.contributionRewards = contributionRewards;
            node.miningRewards = miningRewards;
            
            // Store connectivity info
            node.monitoringAccessible = monitoringCheck.accessible;
            node.rpcAccessible = status === 'online';
            node.apiPortAccessible = status === 'online' || status === 'issues';
            
            // Save to localStorage
            localStorage.setItem('basedai-nodes', JSON.stringify(nodes));
            
            // Update UI
            updateNodeUI(nodeCard, nodeRow, status);
            
            // Update stats
            updateStats();
            
            // If details section is open for this node, update it
            if (currentNodeId === nodeId) {
                updateNodeDetails(nodeId);
            }
            
            // Execute callback if provided
            if (callback) callback();
        } catch (error) {
            console.error('Error checking node:', error);
            
            // Set node as offline
            node.status = 'offline';
            node.lastChecked = new Date().toLocaleString();
            node.uptime = 'N/A';
            node.cpu = 'N/A';
            node.memory = 'N/A';
            node.network = 'N/A';
            node.disk = 'N/A';
            node.logs = [{
                timestamp: new Date().toLocaleTimeString(),
                level: 'error',
                message: `Error checking node: ${error.message}`
            }];
            node.lastBlock = 'N/A';
            node.contributionRewards = '0 BASED';
            node.miningRewards = '0 BASED';
            
            // Reset connectivity info
            node.monitoringAccessible = false;
            node.rpcAccessible = false;
            node.apiPortAccessible = false;
            
            // Save to localStorage
            localStorage.setItem('basedai-nodes', JSON.stringify(nodes));
            
            // Update UI
            updateNodeUI(nodeCard, nodeRow, 'offline');
            
            // Update stats
            updateStats();
            
            // If details section is open for this node, update it
            if (currentNodeId === nodeId) {
                updateNodeDetails(nodeId);
            }
            
            // Execute callback if provided
            if (callback) callback();
        }
    }
    
    // Update node UI
    function updateNodeUI(nodeCard, nodeRow, status) {
        const statusClass = status;
        const statusIcon = getStatusIcon(status);
        const statusText = getStatusText(status);
        
        if (nodeCard) {
            const statusEl = nodeCard.querySelector('.node-status');
            statusEl.className = `node-status ${statusClass}`;
            statusEl.innerHTML = `<i class="fas ${statusIcon}"></i><span>${statusText}</span>`;
            
            const lastCheckedEl = nodeCard.querySelector('.info-value:last-child');
            lastCheckedEl.textContent = new Date().toLocaleString();
        }
        
        if (nodeRow) {
            const statusEl = nodeRow.querySelector('.node-status');
            statusEl.className = `node-status ${statusClass}`;
            statusEl.innerHTML = `<i class="fas ${statusIcon}"></i><span>${statusText}</span>`;
            
            const lastCheckedEl = nodeRow.querySelector('td:nth-child(6)');
            lastCheckedEl.textContent = new Date().toLocaleString();
        }
    }
    
    // Format uptime in a human-readable way
    function formatUptime(seconds) {
        if (seconds < 60) {
            return `${seconds} seconds`;
        } else if (seconds < 3600) {
            return `${Math.floor(seconds / 60)} minutes`;
        } else if (seconds < 86400) {
            return `${Math.floor(seconds / 3600)} hours`;
        } else {
            return `${Math.floor(seconds / 86400)} days`;
        }
    }
    
    // Show node details in the details section
    function showNodeDetails(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        currentNodeId = nodeId;
        
        // Reset chart retry count when viewing a new node
        chartUpdateRetryCount = 0;
        
        // Stop any existing chart updates
        chartUpdateActive = false;
        
        // Highlight selected node
        document.querySelectorAll('.node-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelectorAll('.nodes-table tbody tr').forEach(row => {
            row.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.node-card[data-node-id="${nodeId}"]`);
        const selectedRow = document.querySelector(`tr[data-node-id="${nodeId}"]`);
        
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        if (selectedRow) {
            selectedRow.classList.add('selected');
        }
        
        // Show details section
        nodeDetailsSection.style.display = 'block';
        
        // Scroll to details section
        nodeDetailsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update details
        detailsNodeName.textContent = node.name;
        detailsWallet.textContent = node.wallet;
        detailsIp.textContent = node.ip;
        detailsPort.textContent = node.port;
        
        updateNodeDetails(nodeId);
        updateCharts(nodeId);
    }
    
    // Update node details in the details section
    function updateNodeDetails(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const statusClass = node.status || 'unknown';
        const statusIcon = getStatusIcon(node.status);
        const statusText = getStatusText(node.status);
        
        detailsStatus.className = 'node-detail-value';
        detailsStatus.innerHTML = `
            <span class="status-indicator ${statusClass}"></span>
            <span class="status-text">${statusText}</span>
        `;
        
        detailsUptime.textContent = node.uptime || '--';
        detailsLastChecked.textContent = node.lastChecked || '--';
        
        // Update logs
        detailsLogs.innerHTML = '';
        if (node.logs && node.logs.length > 0) {
            node.logs.forEach(log => {
                const logLine = document.createElement('div');
                logLine.className = `log-line ${log.level}`;
                logLine.textContent = `[${log.timestamp}] ${log.message}`;
                detailsLogs.appendChild(logLine);
            });
        } else {
            detailsLogs.innerHTML = '<div class="log-line">No logs available</div>';
        }
        
        // Update additional info if elements exist
        const lastBlockEl = document.getElementById('details-last-block');
        const contributionRewardsEl = document.getElementById('details-contribution-rewards');
        const miningRewardsEl = document.getElementById('details-mining-rewards');
        
        if (lastBlockEl) {
            lastBlockEl.textContent = node.lastBlock || '--';
        }
        
        if (contributionRewardsEl) {
            contributionRewardsEl.textContent = node.contributionRewards || '0 BASED';
        }
        
        if (miningRewardsEl) {
            miningRewardsEl.textContent = node.miningRewards || '0 BASED';
        }
        
        // Update connectivity info
        updateConnectivityInfo(node);
    }
    
    // Update connectivity information in details
    function updateConnectivityInfo(node) {
        // Check if connectivity info section exists, create if not
        let connectivitySection = document.getElementById('connectivity-info');
        
        if (!connectivitySection) {
            connectivitySection = document.createElement('div');
            connectivitySection.className = 'connectivity-info';
            connectivitySection.id = 'connectivity-info';
            connectivitySection.innerHTML = `
                <h4>Connectivity Information</h4>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">Monitoring API (${node.monitoringPort || 8080})</div>
                        <div class="info-value" id="monitoring-status">--</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">RPC Port (${node.rpcPort || 9933})</div>
                        <div class="info-value" id="rpc-status">--</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">Node API (${node.port || 9944})</div>
                        <div class="info-value" id="api-status">--</div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-label">RPC Endpoint</div>
                    <div class="info-value" id="rpc-endpoint">--</div>
                </div>
                <div class="connectivity-actions">
                    <button class="btn-test-connection" id="test-connection-btn">
                        <i class="fas fa-network-wired"></i> Test Connection
                    </button>
                    <button class="btn-diagnose" id="diagnose-btn">
                        <i class="fas fa-stethoscope"></i> Diagnose Issues
                    </button>
                </div>
            `;
            
            // Insert after metrics section
            const metricsSection = document.querySelector('.node-metrics');
            if (metricsSection) {
                metricsSection.parentNode.insertBefore(connectivitySection, metricsSection.nextSibling);
            }
        }
        
        // Update monitoring status
        const monitoringStatusEl = document.getElementById('monitoring-status');
        if (monitoringStatusEl) {
            if (node.monitoringAccessible !== undefined) {
                monitoringStatusEl.innerHTML = node.monitoringAccessible ? 
                    '<span class="status-online">Accessible</span>' : 
                    '<span class="status-offline">Not Accessible</span>';
            } else {
                monitoringStatusEl.textContent = '--';
            }
        }
        
        // Update RPC status
        const rpcStatusEl = document.getElementById('rpc-status');
        if (rpcStatusEl) {
            if (node.rpcAccessible !== undefined) {
                rpcStatusEl.innerHTML = node.rpcAccessible ? 
                    '<span class="status-online">Accessible</span>' : 
                    '<span class="status-offline">Not Accessible</span>';
            } else {
                rpcStatusEl.textContent = '--';
            }
        }
        
        // Update API status
        const apiStatusEl = document.getElementById('api-status');
        if (apiStatusEl) {
            if (node.apiPortAccessible !== undefined) {
                apiStatusEl.innerHTML = node.apiPortAccessible ? 
                    '<span class="status-online">Accessible</span>' : 
                    '<span class="status-offline">Not Accessible</span>';
            } else {
                apiStatusEl.textContent = '--';
            }
        }
        
        // Update RPC endpoint
        const rpcEndpointEl = document.getElementById('rpc-endpoint');
        if (rpcEndpointEl) {
            const rpcPort = node.rpcPort || 9933;
            rpcEndpointEl.textContent = `http://${node.ip}:${rpcPort}`;
            
            // Add copy button
            if (!rpcEndpointEl.querySelector('.copy-rpc-btn')) {
                const copyBtn = document.createElement('button');
                copyBtn.className = 'wallet-action-btn copy-rpc-btn';
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                copyBtn.addEventListener('click', function() {
                    navigator.clipboard.writeText(`http://${node.ip}:${rpcPort}`).then(() => {
                        showNotification('RPC endpoint copied to clipboard!', 'success');
                    }).catch(err => {
                        showNotification('Failed to copy RPC endpoint', 'error');
                    });
                });
                rpcEndpointEl.appendChild(copyBtn);
            }
        }
        
        // Add event listeners for test buttons
        const testConnectionBtn = document.getElementById('test-connection-btn');
        if (testConnectionBtn) {
            // Remove existing event listener to avoid duplicates
            testConnectionBtn.replaceWith(testConnectionBtn.cloneNode(true));
            const newTestConnectionBtn = document.getElementById('test-connection-btn');
            newTestConnectionBtn.onclick = function() {
                testNodeConnection(node.id);
            };
        }
        
        const diagnoseBtn = document.getElementById('diagnose-btn');
        if (diagnoseBtn) {
            // Remove existing event listener to avoid duplicates
            diagnoseBtn.replaceWith(diagnoseBtn.cloneNode(true));
            const newDiagnoseBtn = document.getElementById('diagnose-btn');
            newDiagnoseBtn.onclick = function() {
                diagnoseNodeIssues(node.id);
            };
        }
    }
    
    // Test node connection with detailed diagnostics
    async function testNodeConnection(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        showNotification('Testing connection to node...', 'info');
        
        // Test monitoring API port
        const monitoringPort = node.monitoringPort || 8080;
        const monitoringTest = await testPortConnectivity(node.ip, monitoringPort);
        
        // Test RPC port
        const rpcPort = node.rpcPort || 9933;
        const rpcTest = await testPortConnectivity(node.ip, rpcPort);
        
        // Test API port
        const apiPort = node.port || 9944;
        const apiTest = await testPortConnectivity(node.ip, apiPort);
        
        // Test RPC functionality
        const rpcCheck = await checkRpcAccessibility(node.ip, rpcPort);
        
        // Test monitoring API functionality
        const monitoringCheck = await checkMonitoringApi(node.ip, monitoringPort);
        
        // Create diagnostic report
        let report = `=== CONNECTION TEST RESULTS ===\n`;
        report += `Node: ${node.name} (${node.ip})\n`;
        report += `Timestamp: ${new Date().toLocaleString()}\n\n`;
        
        report += `Monitoring API Port (${monitoringPort}): ${monitoringTest.success ? 'SUCCESS' : 'FAILED'}\n`;
        if (!monitoringTest.success) {
            report += `  Error: ${monitoringTest.error}\n`;
        }
        
        report += `\nRPC Port (${rpcPort}): ${rpcTest.success ? 'SUCCESS' : 'FAILED'}\n`;
        if (!rpcTest.success) {
            report += `  Error: ${rpcTest.error}\n`;
        }
        
        report += `\nAPI Port (${apiPort}): ${apiTest.success ? 'SUCCESS' : 'FAILED'}\n`;
        if (!apiTest.success) {
            report += `  Error: ${apiTest.error}\n`;
        }
        
        report += `\nRPC Functionality: ${rpcCheck.accessible ? 'WORKING' : 'NOT WORKING'}\n`;
        if (!rpcCheck.accessible) {
            report += `  Error: ${rpcCheck.error}\n`;
        }
        
        report += `\nMonitoring API Functionality: ${monitoringCheck.accessible ? 'WORKING' : 'NOT WORKING'}\n`;
        if (!monitoringCheck.accessible) {
            report += `  Error: ${monitoringCheck.error}\n`;
        }
        
        // Add to logs
        node.logs.unshift({
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: 'Connection test performed'
        });
        
        node.logs.unshift({
            timestamp: new Date().toLocaleTimeString(),
            level: (monitoringCheck.accessible || rpcCheck.accessible) ? 'info' : 'error',
            message: report
        });
        
        // Save to localStorage
        localStorage.setItem('basedai-nodes', JSON.stringify(nodes));
        
        // Update details if viewing this node
        if (currentNodeId === nodeId) {
            updateNodeDetails(nodeId);
        }
        
        // Show notification
        if (monitoringCheck.accessible || rpcCheck.accessible) {
            showNotification('Connection test successful!', 'success');
        } else {
            showNotification('Connection test failed. Check logs for details.', 'error');
        }
    }
    
    // Diagnose node issues
    async function diagnoseNodeIssues(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        showNotification('Diagnosing node issues...', 'info');
        
        let diagnosis = `=== NODE DIAGNOSIS ===\n`;
        diagnosis += `Node: ${node.name} (${node.ip})\n`;
        diagnosis += `Timestamp: ${new Date().toLocaleString()}\n\n`;
        
        // Test different ports
        const portsToTest = [
            { name: 'Monitoring API', port: node.monitoringPort || 8080 },
            { name: 'RPC', port: node.rpcPort || 9933 },
            { name: 'Node API', port: node.port || 9944 },
            { name: 'P2P', port: 30333 }
        ];
        
        diagnosis += `PORT CONNECTIVITY TEST:\n`;
        for (const portInfo of portsToTest) {
            const test = await testPortConnectivity(node.ip, portInfo.port);
            diagnosis += `  ${portInfo.name} (${portInfo.port}): ${test.success ? 'OPEN' : 'CLOSED'}\n`;
            if (!test.success) {
                diagnosis += `    Error: ${test.error}\n`;
            }
        }
        
        // Test RPC functionality
        diagnosis += `\nRPC FUNCTIONALITY TEST:\n`;
        const rpcCheck = await checkRpcAccessibility(node.ip, node.rpcPort || 9933);
        diagnosis += `  Status: ${rpcCheck.accessible ? 'WORKING' : 'NOT WORKING'}\n`;
        if (!rpcCheck.accessible) {
            diagnosis += `  Error: ${rpcCheck.error}\n`;
        }
        
        // Test monitoring API functionality
        diagnosis += `\nMONITORING API FUNCTIONALITY TEST:\n`;
        const monitoringCheck = await checkMonitoringApi(node.ip, node.monitoringPort || 8080);
        diagnosis += `  Status: ${monitoringCheck.accessible ? 'WORKING' : 'NOT WORKING'}\n`;
        if (!monitoringCheck.accessible) {
            diagnosis += `  Error: ${monitoringCheck.error}\n`;
        }
        
        // Add recommendations
        diagnosis += `\nRECOMMENDATIONS:\n`;
        
        if (!monitoringCheck.accessible) {
            diagnosis += `  - Check if the monitoring port (${node.monitoringPort || 8080}) is open in your firewall\n`;
            diagnosis += `  - Verify that the monitoring service is running\n`;
        }
        
        if (!rpcCheck.accessible) {
            diagnosis += `  - Check if the RPC port (${node.rpcPort || 9933}) is open in your firewall\n`;
            diagnosis += `  - Verify that RPC is enabled in your node configuration\n`;
        }
        
        if (!portsToTest.some(p => p.port === (node.port || 9944) && testPortConnectivity(node.ip, p.port).success)) {
            diagnosis += `  - Check if the API port (${node.port || 9944}) is open in your firewall\n`;
            diagnosis += `  - Verify that the BasedAI node is configured to serve the API\n`;
        }
        
        diagnosis += `  - Ensure your node is properly connected to the network\n`;
        diagnosis += `  - Check your node logs for any errors\n`;
        
        // Add to logs
        node.logs.unshift({
            timestamp: new Date().toLocaleTimeString(),
            level: 'info',
            message: 'Diagnosis performed'
        });
        
        node.logs.unshift({
            timestamp: new Date().toLocaleTimeString(),
            level: 'warning',
            message: diagnosis
        });
        
        // Save to localStorage
        localStorage.setItem('basedai-nodes', JSON.stringify(nodes));
        
        // Update details if viewing this node
        if (currentNodeId === nodeId) {
            updateNodeDetails(nodeId);
        }
        
        showNotification('Diagnosis complete. Check logs for details.', 'info');
    }
    
    // Update charts for the node with real data
    function updateCharts(nodeId) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        // Stop any existing chart updates
        chartUpdateActive = false;
        
        // Reset retry count
        chartUpdateRetryCount = 0;
        
        // Destroy existing charts
        if (cpuChartInstance) {
            cpuChartInstance.destroy();
            cpuChartInstance = null;
        }
        
        if (memoryChartInstance) {
            memoryChartInstance.destroy();
            memoryChartInstance = null;
        }
        
        if (networkChartInstance) {
            networkChartInstance.destroy();
            networkChartInstance = null;
        }
        
        if (diskChartInstance) {
            diskChartInstance.destroy();
            diskChartInstance = null;
        }
        
        // Chart options
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        };
        
        // Create CPU chart
        cpuChartInstance = new Chart(cpuChart, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: Array(20).fill(0),
                    borderColor: '#00ffff',
                    backgroundColor: 'rgba(0, 255, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });
        
        // Create Memory chart
        memoryChartInstance = new Chart(memoryChart, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: Array(20).fill(0),
                    borderColor: '#ff00ff',
                    backgroundColor: 'rgba(255, 0, 255, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });
        
        // Create Network chart
        networkChartInstance = new Chart(networkChart, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: Array(20).fill(0),
                    borderColor: '#00ff00',
                    backgroundColor: 'rgba(0, 255, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });
        
        // Create Disk chart
        diskChartInstance = new Chart(diskChart, {
            type: 'line',
            data: {
                labels: Array(20).fill(''),
                datasets: [{
                    data: Array(20).fill(0),
                    borderColor: '#ffff00',
                    backgroundColor: 'rgba(255, 255, 0, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: chartOptions
        });
        
        // Start updating charts with real data from API
        startChartUpdates(nodeId);
    }
    
    // Start chart updates with proper error handling
    function startChartUpdates(nodeId) {
        if (chartUpdateActive) return; // Prevent multiple update cycles
        
        chartUpdateActive = true;
        updateChartsWithRealData(nodeId);
    }
    
    // Update charts with real data from API - improved version
    function updateChartsWithRealData(nodeId) {
        if (!chartUpdateActive || currentNodeId !== nodeId) {
            return; // Stop updates if no longer viewing this node
        }
        
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        // Try monitoring API first, then RPC as fallback
        const apiUrl = `http://${node.ip}:${node.monitoringPort || 8080}/api/metrics`;
        
        // Set timeout for the fetch request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
        
        fetch(apiUrl, { signal: controller.signal })
            .then(response => {
                clearTimeout(timeoutId);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Reset retry count on successful fetch
                chartUpdateRetryCount = 0;
                
                // Extract real values from API response
                const cpuValue = data.metrics && data.metrics.cpu ? data.metrics.cpu : 0;
                const memoryValue = data.metrics && data.metrics.memory ? data.metrics.memory : 0;
                const networkValue = data.metrics && data.metrics.network ? data.metrics.network : 0;
                const diskValue = data.metrics && data.metrics.disk ? data.metrics.disk : 0;
                
                // Update CPU chart
                if (cpuChartInstance) {
                    cpuChartInstance.data.datasets[0].data.shift();
                    cpuChartInstance.data.datasets[0].data.push(cpuValue);
                    cpuChartInstance.update('none');
                }
                
                // Update Memory chart
                if (memoryChartInstance) {
                    memoryChartInstance.data.datasets[0].data.shift();
                    memoryChartInstance.data.datasets[0].data.push(memoryValue);
                    memoryChartInstance.update('none');
                }
                
                // Update Network chart
                if (networkChartInstance) {
                    networkChartInstance.data.datasets[0].data.shift();
                    networkChartInstance.data.datasets[0].data.push(networkValue);
                    networkChartInstance.update('none');
                }
                
                // Update Disk chart
                if (diskChartInstance) {
                    diskChartInstance.data.datasets[0].data.shift();
                    diskChartInstance.data.datasets[0].data.push(diskValue);
                    diskChartInstance.update('none');
                }
                
                // Schedule next update only if still active
                if (chartUpdateActive && currentNodeId === nodeId) {
                    setTimeout(() => updateChartsWithRealData(nodeId), 1000);
                }
            })
            .catch(error => {
                clearTimeout(timeoutId);
                console.error('Error fetching real-time data:', error);
                
                // Increment retry count
                chartUpdateRetryCount++;
                
                // If API call fails, show error in charts
                if (cpuChartInstance) {
                    cpuChartInstance.data.datasets[0].data.shift();
                    cpuChartInstance.data.datasets[0].data.push(null);
                    cpuChartInstance.update('none');
                }
                
                if (memoryChartInstance) {
                    memoryChartInstance.data.datasets[0].data.shift();
                    memoryChartInstance.data.datasets[0].data.push(null);
                    memoryChartInstance.update('none');
                }
                
                if (networkChartInstance) {
                    networkChartInstance.data.datasets[0].data.shift();
                    networkChartInstance.data.datasets[0].data.push(null);
                    networkChartInstance.update('none');
                }
                
                if (diskChartInstance) {
                    diskChartInstance.data.datasets[0].data.shift();
                    diskChartInstance.data.datasets[0].data.push(null);
                    diskChartInstance.update('none');
                }
                
                // Stop updates after max retries
                if (chartUpdateRetryCount >= MAX_CHART_RETRIES) {
                    console.log(`Stopping chart updates after ${MAX_CHART_RETRIES} failed attempts`);
                    chartUpdateActive = false;
                    return;
                }
                
                // Schedule next update only if still active and under max retries
                if (chartUpdateActive && currentNodeId === nodeId) {
                    // Use exponential backoff for retries
                    const retryDelay = Math.min(1000 * Math.pow(2, chartUpdateRetryCount), 30000);
                    setTimeout(() => updateChartsWithRealData(nodeId), retryDelay);
                }
            });
    }
    
    // Remove a node
    function removeNode(nodeId) {
        if (confirm('Are you sure you want to remove this node?')) {
            // Stop chart updates if removing the current node
            if (currentNodeId === nodeId) {
                chartUpdateActive = false;
            }
            
            nodes = nodes.filter(n => n.id !== nodeId);
            localStorage.setItem('basedai-nodes', JSON.stringify(nodes));
            
            updateStats();
            renderNodes();
            
            // Close details section if it's open for this node
            if (currentNodeId === nodeId) {
                nodeDetailsSection.style.display = 'none';
                currentNodeId = null;
            }
            
            showNotification('Node removed successfully', 'success');
        }
    }
    
    // Add a new node
    function addNode(nodeData) {
        const newNode = {
            id: Date.now().toString(),
            name: nodeData.name,
            wallet: nodeData.wallet,
            ip: nodeData.ip,
            port: nodeData.port,
            rpcPort: nodeData.rpcPort || 9933,
            monitoringPort: nodeData.monitoringPort || 8080,
            type: nodeData.type || 'validator',
            status: 'unknown',
            lastChecked: null,
            uptime: null,
            cpu: null,
            memory: null,
            network: null,
            disk: null,
            logs: [],
            lastBlock: null,
            contributionRewards: '0 BASED',
            miningRewards: '0 BASED',
            monitoringAccessible: false,
            rpcAccessible: false,
            apiPortAccessible: false
        };
        
        nodes.push(newNode);
        localStorage.setItem('basedai-nodes', JSON.stringify(nodes));
        
        updateStats();
        renderNodes();
        
        // Check the newly added node
        setTimeout(() => {
            checkNode(newNode.id);
        }, 500);
        
        showNotification('Node added successfully', 'success');
    }
    
    // Search nodes
    function searchNodes(query) {
        if (!query.trim()) {
            renderNodes();
            return;
        }
        
        const filteredNodes = nodes.filter(node => {
            return node.name.toLowerCase().includes(query.toLowerCase()) ||
                   node.wallet.toLowerCase().includes(query.toLowerCase()) ||
                   node.ip.toLowerCase().includes(query.toLowerCase());
        });
        
        renderNodes(filteredNodes);
    }
    
    // Update sync status
    function updateSyncStatus(status) {
        syncStatus.textContent = status;
    }
    
    // Update server status
    function updateServerStatus(status, className) {
        serverStatusText.textContent = status;
        serverStatus.className = `server-status ${className}`;
    }
    
    // Get status icon
    function getStatusIcon(status) {
        switch (status) {
            case 'online': return 'fa-check-circle';
            case 'offline': return 'fa-times-circle';
            case 'issues': return 'fa-exclamation-triangle';
            default: return 'fa-question-circle';
        }
    }
    
    // Get status text
    function getStatusText(status) {
        switch (status) {
            case 'online': return 'Online';
            case 'offline': return 'Offline';
            case 'issues': return 'Issues';
            default: return 'Unknown';
        }
    }
    
    // Truncate address for display
    function truncateAddress(address) {
        if (!address) return '';
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
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
            .notification.info {
                border-color: rgba(33, 150, 243, 0.5);
                box-shadow: 0 0 20px rgba(33, 150, 243, 0.3);
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
            .notification.info i {
                color: #2196f3;
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
    
    // Event Listeners
    refreshBtn.addEventListener('click', checkAllNodes);
    
    checkAllBtn.addEventListener('click', checkAllNodes);
    
    addNodeBtn.addEventListener('click', function() {
        addNodeForm.classList.remove('hidden');
        emptyState.classList.add('hidden');
    });
    
    cancelAddBtn.addEventListener('click', function() {
        addNodeForm.classList.add('hidden');
        nodeForm.reset();
        
        if (nodes.length === 0) {
            emptyState.classList.remove('hidden');
        }
    });
    
    nodeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nodeData = {
            name: document.getElementById('node-name').value,
            wallet: document.getElementById('wallet-address').value,
            ip: document.getElementById('node-ip').value,
            port: document.getElementById('node-port').value,
            rpcPort: document.getElementById('rpc-port').value,
            monitoringPort: document.getElementById('monitoring-port').value,
            type: document.getElementById('node-type').value
        };
        
        addNode(nodeData);
        
        addNodeForm.classList.add('hidden');
        nodeForm.reset();
    });
    
    searchInput.addEventListener('input', function() {
        searchNodes(this.value);
    });
    
    searchBtn.addEventListener('click', function() {
        searchNodes(searchInput.value);
    });
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentView = this.getAttribute('data-view');
            renderNodes();
        });
    });
    
    // Details section event listeners
    closeDetailsBtn.addEventListener('click', function() {
        nodeDetailsSection.style.display = 'none';
        currentNodeId = null;
        chartUpdateActive = false; // Stop chart updates
        
        // Remove selection from nodes
        document.querySelectorAll('.node-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        document.querySelectorAll('.nodes-table tbody tr').forEach(row => {
            row.classList.remove('selected');
        });
    });
    
    refreshDetailsBtn.addEventListener('click', function() {
        if (currentNodeId) {
            checkNode(currentNodeId);
        }
    });
    
    removeDetailsBtn.addEventListener('click', function() {
        if (currentNodeId) {
            removeNode(currentNodeId);
        }
    });
    
    // Initialize Three.js background
    function initThreeJSBackground() {
        // Get container element
        const container = document.getElementById('three-container');
        if (!container) return;
        
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
        
        // Create rotating cube with Icosahedron geometry for monitor page - 20% smaller
        const cubeGeometry = new THREE.IcosahedronGeometry(0.8, 0); // Reduced size by 20%
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff, // Cyan color to match index.html
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        
        // Position cube
        cube.position.y = 1;
        cube.position.z = 2;
        
        scene.add(cube);
        
        // Create animated gradient background - same as index.html
        const gradientTexture = createGradientTexture();
        scene.background = gradientTexture;
        
        // Handle window resize
        window.addEventListener('resize', function() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Animation variables
        let baseRotationSpeed = 0.01;
        let baseParticleSpeed = 0.001;
        let currentRotationSpeed = baseRotationSpeed;
        let currentParticleSpeed = baseParticleSpeed;
        let targetRotationSpeed = baseRotationSpeed;
        let targetParticleSpeed = baseParticleSpeed;
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Smooth transition for rotation speed
            currentRotationSpeed += (targetRotationSpeed - currentRotationSpeed) * 0.1;
            currentParticleSpeed += (targetParticleSpeed - currentParticleSpeed) * 0.1;
            
            // Rotate cube with current speed
            cube.rotation.x += currentRotationSpeed;
            cube.rotation.y += currentRotationSpeed;
            cube.rotation.z += currentRotationSpeed * 0.5; // Add Z-axis rotation
            
            // Add floating animation to cube
            cube.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.2;
            
            // Special animation during node checking
            if (window.isCheckingNodes) {
                // Change cube color to blue with smooth transition
                const time = Date.now() * 0.001;
                const colorIntensity = (Math.sin(time) + 1) / 2; // Value between 0 and 1
                cube.material.color.setRGB(colorIntensity, 0, 1 - colorIntensity);
                
                // Increase rotation speed
                targetRotationSpeed = baseRotationSpeed * 4; // 4x faster
                targetParticleSpeed = baseParticleSpeed * 6; // 6x faster
                
                // Add pulsing effect
                cube.material.opacity = 0.7 + Math.sin(time * 4) * 0.3;
                
                // Scale animation
                const scale = 1 + Math.sin(time * 5) * 0.1;
                cube.scale.set(scale, scale, scale);
            } else {
                // Reset to normal
                cube.material.color.set(0x00ffff); // Cyan to match index.html
                cube.material.opacity = 0.7;
                cube.scale.set(1, 1, 1);
                targetRotationSpeed = baseRotationSpeed;
                targetParticleSpeed = baseParticleSpeed;
            }
            
            // Rotate particles with current speed
            particlesMesh.rotation.y += currentParticleSpeed;
            
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
        
        // Same gradient colors as index.html
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
        
        // Animate gradient colors - same as index.html
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
    
    function animateCubeDuringCheck() {
        window.isCheckingNodes = true;
    }
    
    function stopCubeAnimation() {
        window.isCheckingNodes = false;
    }
    
    // Add CSS for node type and details section
    const nodeTypeStyle = document.createElement('style');
    nodeTypeStyle.textContent = `
        body {
            padding-top: 600px; /* Increased padding as requested */
        }
        
        /* Increase menu buttons size by 20% */
        .menu-button {
            padding: 12px 24px !important; /* Increased from 10px 20px */
            font-size: 1.1rem !important; /* Increased font size */
        }
        
        .node-type {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 500;
            margin-right: 10px;
        }
        
        .node-type.validator {
            background: rgba(0, 255, 255, 0.2);
            color: #00ffff;
        }
        
        .node-type.miner {
            background: rgba(255, 165, 0, 0.2);
            color: #ffa500;
        }
        
        .node-card.selected, .nodes-table tbody tr.selected {
            border: 2px solid var(--primary-color);
            box-shadow: 0 0 15px rgba(0, 255, 255, 0.5);
        }
        
        .node-details-section {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 15px;
            padding: 30px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 255, 255, 0.1);
            margin-bottom: 40px;
            display: none;
            animation: fadeIn 1s ease-out;
        }
        
        .details-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--border-color);
        }
        
        .details-header h3 {
            font-size: 1.5rem;
            color: var(--primary-color);
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        
        .details-actions {
            display: flex;
            gap: 10px;
        }
        
        .node-charts {
            margin-bottom: 30px;
        }
        
        .node-charts h4 {
            font-size: 1.1rem;
            color: var(--primary-color);
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .chart-container {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            height: 200px;
        }
        
        .chart-container canvas {
            width: 100%;
            height: 100%;
        }
        
        /* Improved wallet display */
        .detail-value {
            word-break: break-all;
            font-size: 0.9rem;
            max-width: 100%;
        }
        
        /* Clean and proper wallet display */
        .wallet-display {
            position: relative;
            margin: 15px 0;
        }
        
        .wallet-label {
            position: absolute;
            top: -10px;
            left: 15px;
            background: var(--card-bg);
            padding: 0 8px;
            font-size: 0.7rem;
            color: var(--secondary-color);
            z-index: 1;
        }
        
        .wallet-content {
            background: rgba(0, 0, 0, 0.3);
            border: 1px solid var(--border-color);
            border-radius: 8px;
            padding: 15px;
            font-family: 'Courier New', monospace;
            color: #00ffff;
            font-size: 0.9rem;
            line-height: 1.4;
            word-break: break-all;
            position: relative;
            overflow: hidden;
        }
        
        .wallet-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 8px;
        }
        
        .wallet-action-btn {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 4px 8px;
            color: var(--text-color);
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: 5px;
        }
        
        .wallet-action-btn:hover {
            background: rgba(0, 255, 255, 0.2);
            color: var(--primary-color);
        }
        
        /* Additional info styling */
        .additional-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        
        .additional-info h4 {
            color: var(--primary-color);
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        
        .info-label {
            font-size: 0.8rem;
            color: var(--secondary-color);
        }
        
        .info-value {
            font-size: 1rem;
            color: var(--text-color);
            font-weight: 500;
        }
        
        .reward-value {
            color: #00ff00;
            font-weight: 700;
        }
        
        /* Connectivity info styling */
        .connectivity-info {
            margin-top: 20px;
            padding: 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        
        .connectivity-info h4 {
            color: var(--primary-color);
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .connectivity-actions {
            display: flex;
            gap: 10px;
            margin-top: 15px;
        }
        
        .btn-test-connection, .btn-diagnose {
            background: rgba(0, 255, 255, 0.1);
            border: 1px solid var(--border-color);
            border-radius: 4px;
            padding: 8px 15px;
            color: var(--text-color);
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-test-connection:hover, .btn-diagnose:hover {
            background: rgba(0, 255, 255, 0.2);
            color: var(--primary-color);
        }
        
        .status-online {
            color: #4caf50;
            font-weight: 700;
        }
        
        .status-offline {
            color: #f44336;
            font-weight: 700;
        }
        
        .status-warning {
            color: #ff9800;
            font-weight: 700;
        }
    `;
    document.head.appendChild(nodeTypeStyle);
    
    // Add node type field to form
    const nodeTypeField = document.createElement('div');
    nodeTypeField.className = 'form-group';
    nodeTypeField.innerHTML = `
        <label for="node-type">
            <i class="fas fa-cogs"></i> Node Type
        </label>
        <select id="node-type" name="node-type" required>
            <option value="validator">Validator</option>
            <option value="miner">Miner</option>
        </select>
        <div class="input-info">Select whether this node is a validator or miner</div>
    `;
    
    // Insert before port field
    const portField = document.getElementById('node-port').closest('.form-group');
    if (portField) {
        portField.parentNode.insertBefore(nodeTypeField, portField);
    }
    
    // Add RPC port field to form
    const rpcPortField = document.createElement('div');
    rpcPortField.className = 'form-group';
    rpcPortField.innerHTML = `
        <label for="rpc-port">
            <i class="fas fa-plug"></i> RPC Port
        </label>
        <input type="number" id="rpc-port" name="rpc-port" value="9933" min="1" max="65535">
        <div class="input-info">Port for RPC access (default: 9933)</div>
    `;
    
    // Insert after port field
    if (portField) {
        portField.parentNode.insertBefore(rpcPortField, portField.nextSibling);
    }
    
    // Add monitoring port field to form
    const monitoringPortField = document.createElement('div');
    monitoringPortField.className = 'form-group';
    monitoringPortField.innerHTML = `
        <label for="monitoring-port">
            <i class="fas fa-chart-line"></i> Monitoring Port
        </label>
        <input type="number" id="monitoring-port" name="monitoring-port" value="8080" min="1" max="65535">
        <div class="input-info">Port for monitoring API (default: 8080)</div>
    `;
    
    // Insert after RPC port field
    if (rpcPortField) {
        rpcPortField.parentNode.insertBefore(monitoringPortField, rpcPortField.nextSibling);
    }
    
    // Replace wallet display with a cleaner version
    const walletDisplay = document.createElement('div');
    walletDisplay.className = 'wallet-display';
    walletDisplay.innerHTML = `
        <div class="wallet-label">Wallet Address</div>
        <div class="wallet-content" id="details-wallet"></div>
        <div class="wallet-actions">
            <button class="wallet-action-btn" id="copy-wallet-btn">
                <i class="fas fa-copy"></i> Copy
            </button>
            <button class="wallet-action-btn" id="view-wallet-btn">
                <i class="fas fa-external-link-alt"></i> View
            </button>
        </div>
    `;
    
    // Find the wallet detail item and replace it
    const walletDetailItem = Array.from(document.querySelectorAll('.detail-item')).find(item => {
        const label = item.querySelector('.detail-label');
        return label && label.textContent === 'Wallet Address:';
    });
    
    if (walletDetailItem) {
        const walletValue = walletDetailItem.querySelector('.detail-value');
        if (walletValue && walletValue.id === 'details-wallet') {
            walletDetailItem.replaceWith(walletDisplay);
        }
    }
    
    // Add event listeners for wallet actions
    document.addEventListener('click', function(e) {
        if (e.target.closest('#copy-wallet-btn')) {
            const walletAddress = document.getElementById('details-wallet').textContent;
            navigator.clipboard.writeText(walletAddress).then(() => {
                showNotification('Wallet address copied to clipboard!', 'success');
            }).catch(err => {
                showNotification('Failed to copy wallet address', 'error');
            });
        }
        
        if (e.target.closest('#view-wallet-btn')) {
            const walletAddress = document.getElementById('details-wallet').textContent;
            window.open(`https://etherscan.io/address/${walletAddress}`, '_blank');
        }
    });
    
    // Add additional info section to details
    const additionalInfoSection = document.createElement('div');
    additionalInfoSection.className = 'additional-info';
    additionalInfoSection.innerHTML = `
        <h4>Additional Information</h4>
        <div class="info-grid">
            <div class="info-item">
                <div class="info-label">Last Block</div>
                <div class="info-value" id="details-last-block">--</div>
            </div>
            <div class="info-item">
                <div class="info-label">Contribution Rewards</div>
                <div class="info-value reward-value" id="details-contribution-rewards">--</div>
            </div>
            <div class="info-item">
                <div class="info-label">Mining Rewards</div>
                <div class="info-value reward-value" id="details-mining-rewards">--</div>
            </div>
        </div>
    `;
    
    // Insert after metrics section
    const metricsSection = document.querySelector('.node-metrics');
    if (metricsSection) {
        metricsSection.parentNode.insertBefore(additionalInfoSection, metricsSection.nextSibling);
    }
    
    // Initialize the monitor
    initMonitor();
});