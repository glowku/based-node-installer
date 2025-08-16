#!/bin/bash

# BasedAI Node Installer Script
# This script installs and configures a BasedAI validator node

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

# Display BasedAI logo
echo "██████╗ ███████╗████████╗██████╗  ██████╗      ██████╗ ██████╗  █████╗ ████████╗"
echo "██╔══██╗██╔════╝╚══██╔══╝██╔══██╗██╔═══██╗    ██╔════╝ ██╔══██╗██╔══██╗╚══██╔══╝"
echo "██████╔╝█████╗     ██║   ██████╔╝██║   ██║    ██║  ███╗██████╔╝███████║   ██║   "
echo "██╔══██╗██╔══╝     ██║   ██╔══██╗██║   ██║    ██║   ██║██╔══██╗██╔══██║   ██║   "
echo "██║  ██║███████╗   ██║   ██║  ██║╚██████╔╝    ╚██████╔╝██║  ██║██║  ██║   ██║   "
echo "╚═╝  ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝      ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   "
echo "                                                                      NODE INSTALLER"
echo ""

# Check if user is root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use sudo)" 
   exit 1
fi

# Update system
echo "🔄 Updating system..."
apt-get update && apt-get upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
apt-get install -y curl wget jq docker.io docker-compose ufw

# Start Docker
echo "🐳 Starting Docker..."
systemctl start docker
systemctl enable docker

# Create dedicated user for the node
echo "👤 Creating 'basedai' user..."
useradd -m -s /bin/bash basedai
usermod -aG docker basedai

# Create installation directories
echo "📁 Creating directories..."
mkdir -p /opt/basedai
mkdir -p /opt/basedai/data
mkdir -p /opt/basedai/config
chown -R basedai:basedai /opt/basedai

# Download BasedAI binary
echo "⬇️ Downloading BasedAI binary..."
cd /opt/basedai
sudo -u basedai wget -O based https://github.com/based-ai/based/releases/download/v1.0.0/based-linux-amd64
chmod +x based

# Generate configuration file
echo "⚙️ Generating configuration..."
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
    "os": "$OS"
  }
}
EOF

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 30333/tcp
ufw allow 30333/udp
ufw --force enable

# Create systemd service
echo "📝 Creating systemd service..."
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

# Start service
echo "🚀 Starting BasedAI service..."
systemctl daemon-reload
systemctl start basedai
systemctl enable basedai

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
echo ""
echo "🔍 Useful commands:"
echo "   Check status: sudo systemctl status basedai"
echo "   View logs: sudo journalctl -u basedai -f"
echo "   Restart: sudo systemctl restart basedai"
echo "   Stop: sudo systemctl stop basedai"
echo ""
echo "🌐 Your node is now synchronizing with the BasedAI network."
echo "   This may take several hours depending on your internet connection."
echo ""
echo "📚 For more information, check the documentation: https://docs.basedlabs.net"
echo ""