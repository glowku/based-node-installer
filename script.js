    document.addEventListener('DOMContentLoaded', function() {
        // Initialize Three.js background with particles and rotating cube
        initThreeJSBackground();
        
        const installForm = document.getElementById('install-form');
        const commandSection = document.getElementById('command-section');
        const commandSteps = document.getElementById('command-steps');
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        // Navigation buttons
        document.getElementById('monitor-button').addEventListener('click', function() {
            window.location.href = 'monitor.html';
        });
        
        document.getElementById('status-button').addEventListener('click', function() {
            window.open('https://tools-status-serverbasedai.onrender.com/', '_blank');
        });
        
        // Form submission handler
        installForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const walletAddress = document.getElementById('wallet-address').value;
            const nodeName = document.getElementById('node-name').value;
            const stakeAmount = document.getElementById('stake-amount').value;
            const serverType = document.getElementById('server-type').value;
            const operatingSystem = document.getElementById('operating-system').value;
            
            // Generate installation commands
            const commands = [
                {
                    description: "Download the script",
                    command: "curl -sSL https://raw.githubusercontent.com/glowku/based-node-installer/main/install.sh -o install.sh"
                },
                {
                    description: "Convert Windows line endings to Linux",
                    command: "sed -i 's/\\r$//' install.sh"
                },
                {
                    description: "Make the script executable",
                    command: "chmod +x install.sh"
                },
                {
                    description: "Run it with your parameters",
                    command: `./install.sh "${walletAddress}" "${nodeName}" "${stakeAmount}" "${serverType}" "${operatingSystem}"`
                }
            ];
            
            // Display commands with animation
            animateCommandGeneration(commands);
            
            // Show command section
            commandSection.classList.remove('hidden');
            
            // Scroll to command section
            commandSection.scrollIntoView({ behavior: 'smooth' });
            
            // Show notification
            showNotification('Commands generated successfully!', 'success');
        });
        
        // Tab switching functionality
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const targetTab = this.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                this.classList.add('active');
                document.getElementById(`${targetTab}-tab`).classList.add('active');
                
                // Re-add copy buttons after tab switch
                setTimeout(initializeCopyButtons, 100);
            });
        });
        
        // Animate command generation
        function animateCommandGeneration(commands) {
            // Clear existing commands
            commandSteps.innerHTML = '';
            
            // Animate cube during command generation
            animateCubeDuringGeneration();
            
            // Create command steps with animation
            commands.forEach((cmd, index) => {
                setTimeout(() => {
                    const stepElement = createCommandStep(cmd);
                    commandSteps.appendChild(stepElement);
                    
                    // Initialize copy buttons for this step
                    initializeStepCopyButtons(stepElement);
                    
                    // Stop cube animation after last command
                    if (index === commands.length - 1) {
                        setTimeout(stopCubeAnimation, 500);
                    }
                }, index * 300); // Stagger animation
            });
        }
        
        // Initialize copy buttons for a specific step
        function initializeStepCopyButtons(stepElement) {
            const copyBtn = stepElement.querySelector('.copy-terminal-btn');
            if (copyBtn) {
                // Remove existing event listeners
                const newCopyBtn = copyBtn.cloneNode(true);
                copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
                
                // Add event listener
                newCopyBtn.addEventListener('click', function() {
                    const command = this.getAttribute('data-command');
                    if (command) {
                        navigator.clipboard.writeText(command).then(() => {
                            // Show success feedback
                            const originalHTML = this.innerHTML;
                            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                            this.classList.add('copied');
                            
                            showNotification('Command copied to clipboard!', 'success');
                            
                            // Reset button after 2 seconds
                            setTimeout(() => {
                                this.innerHTML = originalHTML;
                                this.classList.remove('copied');
                            }, 2000);
                        }).catch(err => {
                            showNotification('Error copying command: ' + err, 'error');
                        });
                    }
                });
            }
        }
        
        // Create command step element
        function createCommandStep(cmd) {
            const step = document.createElement('div');
            step.className = 'command-step';
            
            // Create description
            const descriptionDiv = document.createElement('div');
            descriptionDiv.className = 'step-description';
            descriptionDiv.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>${cmd.description}</span>
            `;
            step.appendChild(descriptionDiv);
            
            // Create command wrapper
            const commandWrapper = document.createElement('div');
            commandWrapper.className = 'command-wrapper';
            
            // Create terminal
            const terminal = document.createElement('div');
            terminal.className = 'command-terminal';
            terminal.innerHTML = `
                <div class="terminal-header">
                    <div class="terminal-controls">
                        <span class="terminal-dot terminal-red"></span>
                        <span class="terminal-dot terminal-yellow"></span>
                        <span class="terminal-dot terminal-green"></span>
                    </div>
                    <div class="terminal-title">terminal</div>
                </div>
                <div class="terminal-body">
                    <div class="terminal-line">
                        <span class="terminal-prompt">$</span>
                        <code class="terminal-command">${escapeHtml(cmd.command)}</code>
                    </div>
                </div>
            `;
            commandWrapper.appendChild(terminal);
            
            // Create copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'copy-terminal-btn';
            copyBtn.setAttribute('data-command', cmd.command);
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copy';
            commandWrapper.appendChild(copyBtn);
            
            step.appendChild(commandWrapper);
            
            return step;
        }
        
        // Escape HTML to prevent issues with special characters
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Initialize copy buttons for terminal commands
        function initializeCopyButtons() {
            const copyButtons = document.querySelectorAll('.copy-terminal-btn');
            
            copyButtons.forEach(button => {
                // Remove existing event listener to prevent duplicates
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);
                
                // Add event listener to the new button
                newButton.addEventListener('click', function() {
                    const command = this.getAttribute('data-command');
                    if (command) {
                        navigator.clipboard.writeText(command).then(() => {
                            // Show success feedback
                            const originalHTML = this.innerHTML;
                            this.innerHTML = '<i class="fas fa-check"></i> Copied!';
                            this.classList.add('copied');
                            
                            showNotification('Command copied to clipboard!', 'success');
                            
                            // Reset button after 2 seconds
                            setTimeout(() => {
                                this.innerHTML = originalHTML;
                                this.classList.remove('copied');
                            }, 2000);
                        }).catch(err => {
                            showNotification('Error copying command: ' + err, 'error');
                        });
                    }
                });
            });
        }
        
        // Initialize copy buttons on page load
        initializeCopyButtons();
        
        let cubeAnimationInterval;
        
        function animateCubeDuringGeneration() {
            // This function will be called from the Three.js animation loop
            window.isGeneratingCommand = true;
        }
        
        function stopCubeAnimation() {
            // This function will be called from the Three.js animation loop
            window.isGeneratingCommand = false;
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
            
            // Create rotating cube - 20% smaller and positioned optimally
            const cubeGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8); // 20% smaller
            const cubeMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ffff,
                wireframe: true,
                transparent: true,
                opacity: 0.7
            });
            const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
            
            // Position cube lower in the viewport
            cube.position.y = 1;  // Lowered position
            cube.position.z = 2;   // Move cube closer to camera
            
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
                
                // Add floating animation to cube
                cube.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.2;
                
                // Special animation during command generation
                if (window.isGeneratingCommand) {
                    // Change cube color to green with smooth transition
                    const time = Date.now() * 0.001;
                    const colorIntensity = (Math.sin(time) + 1) / 2; // Value between 0 and 1
                    cube.material.color.setRGB(0, colorIntensity, 0);
                    
                    // Increase rotation speed
                    targetRotationSpeed = baseRotationSpeed * 3; // 3x faster
                    targetParticleSpeed = baseParticleSpeed * 5; // 5x faster
                    
                    // Add pulsing effect
                    cube.material.opacity = 0.7 + Math.sin(time * 3) * 0.2;
                } else {
                    // Reset to normal
                    cube.material.color.set(0x00ffff);
                    cube.material.opacity = 0.7;
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