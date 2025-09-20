#!/bin/bash
# Based Node Monitor pour BF1337/basednode
# Ce script surveille votre nœud validateur BasedAI
# Fix line ending issues
sed -i 's/\r$//' "$0"

# Check if node is installed
if [ ! -d "/opt/basedai" ]; then
    echo "❌ BasedAI node is not installed. Please install it first."
    exit 1
fi

# Function to display node status
show_status() {
    echo "🔍 Checking node status..."
    
    # Check if node process is running
    if pgrep -f "basednode" > /dev/null; then
        echo "✅ Node process is running (BF1337/basednode)"
    else
        echo "❌ Node process is not running"
    fi
    
    # Check service status
    if command -v systemctl &> /dev/null; then
        echo "📋 Systemd service status:"
        sudo systemctl status basedai --no-pager -l
    elif command -v launchctl &> /dev/null; then
        echo "📋 Launchd service status:"
        sudo launchctl list | grep basedai
    fi
    
    # Check if port is open
    if netstat -tuln | grep -q ":30333 "; then
        echo "✅ Port 30333 is open and listening"
    else
        echo "❌ Port 30333 is not open"
    fi
    
    # Check RPC port
    if netstat -tuln | grep -q ":9933 "; then
        echo "✅ RPC Port 9933 is open and listening"
    else
        echo "❌ RPC Port 9933 is not open"
    fi
}

# Function to show node logs
show_logs() {
    echo "📄 Showing node logs..."
    
    if command -v journalctl &> /dev/null; then
        sudo journalctl -u basedai -f -n 100
    elif [ -f "/opt/basedai/logs/basedai.log" ]; then
        tail -f /opt/basedai/logs/basedai.log
    else
        echo "❌ No logs found"
    fi
}

# Function to show node configuration
show_config() {
    echo "⚙️  Node configuration:"
    if [ -f "/opt/basedai/config/mainnet1_raw.json" ]; then
        echo "✅ Genesis file found at /opt/basedai/config/mainnet1_raw.json"
        if [ -f "/opt/basedai/config/config.json" ]; then
            echo "✅ Configuration file found at /opt/basedai/config/config.json"
            cat /opt/basedai/config/config.json
        else
            echo "⚠️  Configuration file not found"
        fi
    else
        echo "❌ Genesis file not found"
    fi
}

# Function to restart the node
restart_node() {
    echo "🔄 Restarting node..."
    
    if command -v systemctl &> /dev/null; then
        sudo systemctl restart basedai
        echo "✅ Node restarted"
    elif command -v launchctl &> /dev/null; then
        sudo launchctl unload /Library/LaunchDaemons/com.basedai.node.plist
        sudo launchctl load /Library/LaunchDaemons/com.basedai.node.plist
        echo "✅ Node restarted"
    else
        echo "❌ Could not restart node automatically"
    fi
}

# Function to stop the node
stop_node() {
    echo "🛑 Stopping node..."
    
    if command -v systemctl &> /dev/null; then
        sudo systemctl stop basedai
        echo "✅ Node stopped"
    elif command -v launchctl &> /dev/null; then
        sudo launchctl unload /Library/LaunchDaemons/com.basedai.node.plist
        echo "✅ Node stopped"
    else
        echo "❌ Could not stop node automatically"
    fi
}

# Function to start the node
start_node() {
    echo "🚀 Starting node..."
    
    if command -v systemctl &> /dev/null; then
        sudo systemctl start basedai
        echo "✅ Node started"
    elif command -v launchctl &> /dev/null; then
        sudo launchctl load /Library/LaunchDaemons/com.basedai.node.plist
        echo "✅ Node started"
    else
        echo "❌ Could not start node automatically"
    fi
}

# Function to check blockchain sync
check_sync() {
    echo "🔗 Checking blockchain synchronization..."
    
    # Try to get sync info via RPC
    if command -v curl &> /dev/null; then
        SYNC_INFO=$(curl -s -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"system_health","params":[],"id":1}' http://localhost:9933 2>/dev/null)
        
        if [ $? -eq 0 ] && [ ! -z "$SYNC_INFO" ]; then
            echo "✅ RPC connection successful"
            echo "📊 Sync Info:"
            echo "$SYNC_INFO" | python3 -m json.tool 2>/dev/null || echo "$SYNC_INFO"
        else
            echo "❌ RPC connection failed or node not syncing"
        fi
    else
        echo "❌ curl not available for RPC check"
    fi
}

# Main menu
case "$1" in
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "config")
        show_config
        ;;
    "restart")
        restart_node
        ;;
    "stop")
        stop_node
        ;;
    "start")
        start_node
        ;;
    "sync")
        check_sync
        ;;
    *)
        echo "Based Node Monitor pour BF1337/basednode"
        echo "Usage: $0 [status|logs|config|restart|stop|start|sync]"
        echo ""
        echo "Commands:"
        echo "  status  - Show node status"
        echo "  logs    - Show node logs"
        echo "  config  - Show node configuration"
        echo "  restart - Restart the node"
        echo "  stop    - Stop the node"
        echo "  start   - Start the node"
        echo "  sync    - Check blockchain synchronization"
        ;;
esac