#!/bin/bash
# Based Node Monitor
# This script monitors your BasedAI validator node
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
    if pgrep -f "based --config" > /dev/null; then
        echo "✅ Node process is running"
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
    if [ -f "/opt/basedai/config/config.json" ]; then
        cat /opt/basedai/config/config.json
    else
        echo "❌ Configuration file not found"
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
    *)
        echo "Based Node Monitor"
        echo "Usage: $0 [status|logs|config|restart|stop|start]"
        echo ""
        echo "Commands:"
        echo "  status  - Show node status"
        echo "  logs    - Show node logs"
        echo "  config  - Show node configuration"
        echo "  restart - Restart the node"
        echo "  stop    - Stop the node"
        echo "  start   - Start the node"
        ;;
esac