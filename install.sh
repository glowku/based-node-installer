#!/bin/bash
# Based Node Installer
# This script installs and configures a BasedAI validator node
# Compatible with Linux, WSL, and different operating systems
# Fix line ending issues by removing carriage returns
sed -i 's/\r$//' "$0"
# Check arguments
if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <WALLET_ADDRESS> <NODE_NAME> <STAKE_AMOUNT> <SERVER_TYPE> <OS>"
    exit 1
fi
WALLET_ADDRESS=$1
NODE_NAME=$2
STAKE_AMOUNT=$3
SERVER_TYPE=$4
OS=$5
# Display Based Node logo
echo "░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓███████▓▒░▒▓████████▓▒░▒▓███████▓▒░       ░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░ "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓███████▓▒░░▒▓████████▓▒░░▒▓██████▓▒░░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░   "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓███████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░"
echo "                                                                      NODE easy INSTALLER"
echo ""
# Detect operating system with detailed information
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if grep -q Microsoft /proc/version; then
            echo "wsl"
        elif grep -q Ubuntu /etc/os-release; then
            echo "ubuntu"
        elif grep -q Debian /etc/os-release; then
            echo "debian"
        else
            echo "linux"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "cygwin" ]] || [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}
OS_TYPE=$(detect_os)
echo "🖥️  Detected OS: $OS_TYPE"
# Get detailed OS information
get_detailed_os() {
    case "$OS_TYPE" in
        "ubuntu")
            if command -v lsb_release &> /dev/null; then
                lsb_release -rs
            else
                grep -oP 'VERSION_ID="\K[^"]+' /etc/os-release
            fi
            ;;
        "debian")
            if command -v lsb_release &> /dev/null; then
                lsb_release -rs
            else
                grep -oP 'VERSION_ID="\K[^"]+' /etc/os-release
            fi
            ;;
        "wsl")
            echo "WSL Environment"
            ;;
        "macos")
            sw_vers -productVersion
            ;;
        *)
            echo "Unknown"
            ;;
    esac
}
OS_VERSION=$(get_detailed_os)
echo "📋 OS Version: $OS_VERSION"
# Check if user is root or has sudo privileges
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        return 0  # User is root
    elif [[ "$OS_TYPE" == "wsl" ]] || [[ "$OS_TYPE" == "linux" ]]; then
        # Check if user has sudo privileges
        if sudo -n true 2>/dev/null; then
            return 0  # User has sudo privileges
        else
            echo "❌ This script requires root privileges. Please run with sudo."
            echo "💡 Try: sudo $0 $@"
            exit 1
        fi
    else
        echo "❌ This script requires root privileges. Please run as administrator."
        exit 1
    fi
}
check_privileges
# Update system based on OS
update_system() {
    echo "🔄 Updating system..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            sudo apt-get update
            sudo apt-get upgrade -y
            sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg2
            ;;
        "macos")
            # Check if Homebrew is installed
            if ! command -v brew &> /dev/null; then
                echo "Installing Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew update
            ;;
        "windows")
            echo "⚠️  On Windows, please ensure you have WSL installed with Ubuntu."
            echo "This script is designed for Linux/WSL environment."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            exit 1
            ;;
    esac
}
update_system
# Install dependencies based on OS
install_dependencies() {
    echo "📦 Installing dependencies..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            sudo apt-get install -y curl wget jq software-properties-common apt-transport-https ca-certificates gnupg2 nodejs npm
            ;;
        "macos")
            brew install curl wget jq node npm
            ;;
        "windows")
            echo "⚠️  On Windows, please install dependencies manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            exit 1
            ;;
    esac
}
install_dependencies
# Install Docker based on OS
install_docker() {
    echo "🐳 Installing Docker..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            # Check if Docker is already installed
            if ! command -v docker &> /dev/null; then
                echo "Installing Docker..."
                # Install Docker using official repository
                sudo apt-get update
                sudo apt-get install -y docker.io docker-compose containerd runc
                sudo systemctl start docker
                sudo systemctl enable docker
                # Add current user to docker group
                sudo usermod -aG docker $USER
                echo "⚠️  You may need to log out and log back in for docker group changes to take effect."
            else
                echo "Docker is already installed."
                sudo systemctl start docker
                sudo systemctl enable docker
            fi
            ;;
        "macos")
            # Check if Docker Desktop is installed
            if ! command -v docker &> /dev/null; then
                echo "Please install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
            else
                echo "Docker is already installed."
                open -a Docker
            fi
            ;;
        "windows")
            echo "⚠️  On Windows, please install Docker Desktop manually from: https://www.docker.com/products/docker-desktop"
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
install_docker
# Create dedicated user for the node
create_user() {
    echo "👤 Creating 'basedai' user..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            if ! id "basedai" &>/dev/null; then
                sudo useradd -m -s /bin/bash basedai
                sudo usermod -aG docker basedai
            else
                echo "User 'basedai' already exists."
            fi
            ;;
        "macos")
            if ! id "basedai" &>/dev/null; then
                sudo sysadminctl -addUser basedai
                echo "Please add 'basedai' user to docker group manually:"
                echo "sudo dscl . append /Groups/docker GroupMembership basedai"
            else
                echo "User 'basedai' already exists."
            fi
            ;;
        "windows")
            echo "⚠️  On Windows, user creation is different. Please create user manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
create_user
# Create installation directories
create_directories() {
    echo "📁 Creating directories..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            sudo mkdir -p /opt/basedai
            sudo mkdir -p /opt/basedai/data
            sudo mkdir -p /opt/basedai/config
            sudo mkdir -p /opt/basedai/logs
            sudo mkdir -p /opt/basedai/monitoring
            sudo chown -R basedai:basedai /opt/basedai
            ;;
        "windows")
            echo "⚠️  On Windows, please create directories manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
create_directories
# Download BasedAI binary
download_binary() {
    echo "⬇️  Downloading BasedAI binary..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            cd /opt/basedai
            # Try to download with retry mechanism
            for i in {1..3}; do
                if sudo -u basedai wget -O based https://github.com/based-ai/based/releases/download/v1.0.0/based-linux-amd64; then
                    break
                else
                    echo "Download attempt $i failed. Retrying..."
                    sleep 2
                fi
            done
            
            if [ ! -f based ]; then
                echo "❌ Failed to download BasedAI binary. Please check your internet connection."
                echo "You can manually download it from: https://github.com/based-ai/based/releases"
                exit 1
            fi
            
            sudo chmod +x based
            ;;
        "windows")
            echo "⚠️  On Windows, please download binary manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
download_binary
# Install monitoring library from GitHub
install_monitoring_library() {
    echo "📊 Installing monitoring library..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            cd /opt/basedai/monitoring
            
            # Clone the monitoring library from GitHub
            if [ -d "basedai-monitor" ]; then
                echo "Monitoring library already exists. Updating..."
                cd basedai-monitor
                sudo -u basedai git pull
            else
                echo "Cloning monitoring library..."
                sudo -u basedai git clone https://github.com/based-ai/basedai-monitor.git
                cd basedai-monitor
            fi
            
            # Install Node.js dependencies
            sudo -u basedai npm install
            
            # Create monitoring configuration
            cat > config.json <<EOF
{
  "node": {
    "name": "$NODE_NAME",
    "wallet": "$WALLET_ADDRESS",
    "stake": $STAKE_AMOUNT,
    "port": 30333
  },
  "network": {
    "bootnodes": ["bootnode.basedai.network:30333"],
    "chain": "basedai"
  },
  "server": {
    "type": "$SERVER_TYPE",
    "os": "$OS",
    "detected_os": "$OS_TYPE",
    "os_version": "$OS_VERSION"
  },
  "monitoring": {
    "enabled": true,
    "interval": 30000,
    "api_port": 8080,
    "metrics": {
      "cpu": true,
      "memory": true,
      "network": true,
      "validation": true,
      "rewards": true
    }
  }
}
EOF
            
            # Create monitoring service script
            cat > /opt/basedai/monitor.sh <<'EOF'
#!/bin/bash
# BasedAI Node Monitoring Script
# This script collects and reports node metrics

NODE_DIR="/opt/basedai"
MONITOR_DIR="$NODE_DIR/monitoring/basedai-monitor"
LOG_FILE="$NODE_DIR/logs/monitor.log"
PID_FILE="$NODE_DIR/monitoring/monitor.pid"

# Check if monitoring is already running
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo "Monitoring is already running (PID: $PID)"
        exit 0
    else
        rm "$PID_FILE"
    fi
fi

echo "Starting BasedAI Node Monitoring..." >> "$LOG_FILE"
cd "$MONITOR_DIR"

# Start the monitoring service
nohup npm start >> "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "Monitoring started with PID: $(cat $PID_FILE)" >> "$LOG_FILE"
echo "Monitoring service started successfully"
EOF
            
            sudo chmod +x /opt/basedai/monitor.sh
            sudo chown -R basedai:basedai /opt/basedai/monitoring
            
            echo "✅ Monitoring library installed successfully"
            ;;
        "windows")
            echo "⚠️  On Windows, please install monitoring library manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
install_monitoring_library
# Generate configuration file
generate_config() {
    echo "⚙️  Generating configuration..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            sudo -u basedai mkdir -p /opt/basedai/config
            cat > /opt/basedai/config/config.json <<EOF
{
  "node": {
    "name": "$NODE_NAME",
    "wallet": "$WALLET_ADDRESS",
    "stake": $STAKE_AMOUNT,
    "port": 30333
  },
  "network": {
    "bootnodes": ["bootnode.basedai.network:30333"],
    "chain": "basedai"
  },
  "server": {
    "type": "$SERVER_TYPE",
    "os": "$OS",
    "detected_os": "$OS_TYPE",
    "os_version": "$OS_VERSION"
  },
  "monitoring": {
    "enabled": true,
    "api_endpoint": "http://localhost:8080/api/metrics",
    "update_interval": 30000
  }
}
EOF
            ;;
        "windows")
            echo "⚠️  On Windows, please create config manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
generate_config
# Configure firewall
configure_firewall() {
    echo "🔥 Configuring firewall..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            if command -v ufw &> /dev/null; then
                sudo ufw allow 22/tcp
                sudo ufw allow 30333/tcp
                sudo ufw allow 30333/udp
                sudo ufw allow 8080/tcp
                sudo ufw --force enable
            else
                echo "⚠️  UFW not found. Installing UFW..."
                sudo apt-get install -y ufw
                sudo ufw allow 22/tcp
                sudo ufw allow 30333/tcp
                sudo ufw allow 30333/udp
                sudo ufw allow 8080/tcp
                sudo ufw --force enable
            fi
            ;;
        "macos")
            # On macOS, we use pfctl
            echo "block return" | sudo tee /etc/pf.anchors/basedai
            echo "pass in proto tcp from any to any port 30333" | sudo tee -a /etc/pf.anchors/basedai
            echo "pass in proto udp from any to any port 30333" | sudo tee -a /etc/pf.anchors/basedai
            echo "pass in proto tcp from any to any port 8080" | sudo tee -a /etc/pf.anchors/basedai
            sudo pfctl -f /etc/pf.conf
            ;;
        "windows")
            echo "⚠️  On Windows, please configure firewall manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
configure_firewall
# Create systemd service (Linux/WSL only)
create_service() {
    echo "📝 Creating systemd service..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            cat > /etc/systemd/system/basedai.service <<EOF
[Unit]
Description=BasedAI Validator Node
After=network.target docker.service
Requires=docker.service
[Service]
User=basedai
WorkingDirectory=/opt/basedai
ExecStart=/opt/basedai/based --config /opt/basedai/config/config.json
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
[Install]
WantedBy=multi-user.target
EOF

            # Create monitoring service
            cat > /etc/systemd/system/basedai-monitor.service <<EOF
[Unit]
Description=BasedAI Node Monitoring Service
After=network.target basedai.service
Requires=basedai.service
[Service]
User=basedai
WorkingDirectory=/opt/basedai/monitoring/basedai-monitor
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
[Install]
WantedBy=multi-user.target
EOF
            ;;
        "macos")
            # Create launchd service for macOS
            cat > /tmp/com.basedai.node.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.basedai.node</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/basedai/based</string>
        <string>--config</string>
        <string>/opt/basedai/config/config.json</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/opt/basedai</string>
    <key>StandardOutPath</key>
    <string>/opt/basedai/logs/basedai.log</string>
    <key>StandardErrorPath</key>
    <string>/opt/basedai/logs/basedai.log</string>
</dict>
</plist>
EOF
            sudo cp /tmp/com.basedai.node.plist /Library/LaunchDaemons/
            
            # Create monitoring service for macOS
            cat > /tmp/com.basedai.monitor.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.basedai.monitor</string>
    <key>ProgramArguments</key>
    <array>
        <string>/opt/basedai/monitor.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>WorkingDirectory</key>
    <string>/opt/basedai</string>
    <key>StandardOutPath</key>
    <string>/opt/basedai/logs/monitor.log</string>
    <key>StandardErrorPath</key>
    <string>/opt/basedai/logs/monitor.log</string>
</dict>
</plist>
EOF
            sudo cp /tmp/com.basedai.monitor.plist /Library/LaunchDaemons/
            ;;
        "windows")
            echo "⚠️  On Windows, please create service manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
create_service
# Start service
start_service() {
    echo "🚀 Starting BasedAI service..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            sudo systemctl daemon-reload
            sudo systemctl start basedai
            sudo systemctl enable basedai
            
            # Start monitoring service
            sudo systemctl start basedai-monitor
            sudo systemctl enable basedai-monitor
            ;;
        "macos")
            sudo launchctl load /Library/LaunchDaemons/com.basedai.node.plist
            sudo launchctl load /Library/LaunchDaemons/com.basedai.monitor.plist
            ;;
        "windows")
            echo "⚠️  On Windows, please start service manually."
            ;;
        *)
            echo "❌ Unsupported operating system: $OS_TYPE"
            ;;
    esac
}
start_service
# Display completion information
echo ""
echo "✅ Installation completed successfully!"
echo ""
echo "📋 Your node information:"
echo "   Node Name: $NODE_NAME"
echo "   Wallet Address: $WALLET_ADDRESS"
echo "   Stake Amount: $STAKE_AMOUNT BASED"
echo "   Server Type: $SERVER_TYPE"
echo "   Operating System: $OS"
echo "   Detected OS: $OS_TYPE"
echo "   OS Version: $OS_VERSION"
echo ""
echo "🔍 Useful commands:"
case "$OS_TYPE" in
    "ubuntu"|"debian"|"wsl")
        echo "   Check node status: sudo systemctl status basedai"
        echo "   View node logs: sudo journalctl -u basedai -f"
        echo "   Check monitoring status: sudo systemctl status basedai-monitor"
        echo "   View monitoring logs: sudo journalctl -u basedai-monitor -f"
        echo "   Restart node: sudo systemctl restart basedai"
        echo "   Restart monitoring: sudo systemctl restart basedai-monitor"
        echo "   Stop node: sudo systemctl stop basedai"
        echo "   Stop monitoring: sudo systemctl stop basedai-monitor"
        ;;
    "macos")
        echo "   Check node status: sudo launchctl list | grep basedai"
        echo "   View node logs: tail -f /opt/basedai/logs/basedai.log"
        echo "   Check monitoring status: sudo launchctl list | grep basedai.monitor"
        echo "   View monitoring logs: tail -f /opt/basedai/logs/monitor.log"
        echo "   Restart node: sudo launchctl unload /Library/LaunchDaemons/com.basedai.node.plist && sudo launchctl load /Library/LaunchDaemons/com.basedai.node.plist"
        echo "   Restart monitoring: sudo launchctl unload /Library/LaunchDaemons/com.basedai.monitor.plist && sudo launchctl load /Library/LaunchDaemons/com.basedai.monitor.plist"
        echo "   Stop node: sudo launchctl unload /Library/LaunchDaemons/com.basedai.node.plist"
        echo "   Stop monitoring: sudo launchctl unload /Library/LaunchDaemons/com.basedai.monitor.plist"
        ;;
    "windows")
        echo "   On Windows, please manage service manually."
        ;;
esac
echo ""
echo "🌐 Your node is now synchronizing with the BasedAI network."
echo "   This may take several hours depending on your internet connection."
echo ""
echo "📊 Node Monitoring:"
echo "   Web Interface: http://localhost:8080"
echo "   API Endpoint: http://localhost:8080/api/metrics"
echo "   Command Line: /opt/basedai/monitor.sh"
echo ""
echo "📚 For more information, check the documentation: https://docs.basedlabs.net"
echo ""