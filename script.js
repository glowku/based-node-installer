document.addEventListener('DOMContentLoaded', function() {
    // Initialize Three.js background with particles and rotating cube
    initThreeJSBackground();
    
    const installForm = document.getElementById('install-form');
    const commandSection = document.getElementById('command-section');
    const installCommand = document.getElementById('install-command');
    const copyBtn = document.getElementById('copy-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Form submission handler
    installForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const walletAddress = document.getElementById('wallet-address').value;
        const nodeName = document.getElementById('node-name').value;
        const stakeAmount = document.getElementById('stake-amount').value;
        const serverType = document.getElementById('server-type').value;
        const operatingSystem = document.getElementById('operating-system').value;
        
        // Generate installation command
        const command = `curl -sSL https://raw.githubusercontent.com/glowku/based-node-installer/main/install.sh | bash -s -- "${walletAddress}" "${nodeName}" "${stakeAmount}" "${serverType}" "${operatingSystem}"`;
        
        // Display command with animation
        animateCommandGeneration(command);
        
        // Show command section
        commandSection.classList.remove('hidden');
        
        // Scroll to command section
        commandSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show notification
        showNotification('Command generated successfully!', 'success');
    });
    
    // Copy button handler
    copyBtn.addEventListener('click', function() {
        // Copy command to clipboard
        navigator.clipboard.writeText(installCommand.textContent).then(function() {
            // Show notification
            showNotification('Command copied to clipboard!', 'success');
        }).catch(function(err) {
            // Show error notification
            showNotification('Error copying command: ' + err, 'error');
        });
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
        });
    });
    
    function animateCommandGeneration(command) {
        // Clear existing command
        installCommand.textContent = '';
        
        // Create typing animation
        let i = 0;
        const typeWriter = setInterval(() => {
            if (i < command.length) {
                installCommand.textContent += command.charAt(i);
                i++;
                
                // Add random color changes during typing
                if (i % 10 === 0) {
                    const colors = ['#00ff00', '#00ffff', '#ff00ff', '#ffff00', '#ff6600'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    installCommand.style.color = randomColor;
                }
            } else {
                clearInterval(typeWriter);
                // Final color
                installCommand.style.color = '#00ff00';
                
                // Add glow effect
                installCommand.style.textShadow = '0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 30px #00ff00';
                
                // Create particle explosion effect
                createParticleExplosion();
            }
        }, 20);
    }
    
    function createParticleExplosion() {
        const commandBox = document.querySelector('.command-box');
        const rect = commandBox.getBoundingClientRect();
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'command-particle';
            particle.style.left = rect.left + rect.width / 2 + 'px';
            particle.style.top = rect.top + rect.height / 2 + 'px';
            particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            
            document.body.appendChild(particle);
            
            // Animate particle
            const angle = (Math.PI * 2 * i) / 30;
            const velocity = 5 + Math.random() * 10;
            const lifetime = 1000 + Math.random() * 1000;
            
            let posX = 0;
            let posY = 0;
            let opacity = 1;
            
            const animateParticle = () => {
                posX += Math.cos(angle) * velocity;
                posY += Math.sin(angle) * velocity;
                opacity -= 0.02;
                
                particle.style.transform = `translate(${posX}px, ${posY}px)`;
                particle.style.opacity = opacity;
                
                if (opacity > 0) {
                    requestAnimationFrame(animateParticle);
                } else {
                    document.body.removeChild(particle);
                }
            };
            
            requestAnimationFrame(animateParticle);
        }
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
            .command-particle {
                position: fixed;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
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
        
        // Create rotating cube - positioned lower in the viewport
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            wireframe: true,
            transparent: true,
            opacity: 0.7
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        
        // Position cube lower in the viewport (moved down by 200px equivalent)
        cube.position.y = 1;  // Lowered from 3 to 1
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
        
        // Animation loop
        function animate() {
            requestAnimationFrame(animate);
            
            // Rotate cube
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            
            // Add floating animation to cube
            cube.position.y = 1 + Math.sin(Date.now() * 0.001) * 0.2;
            
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