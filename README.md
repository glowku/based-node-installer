88""Yb    db    .dP"Y8 888888 8888b.      88b 88  dP"Yb  8888b.  888888 
88__dP   dPYb   `Ybo." 88__    8I  Yb     88Yb88 dP   Yb  8I  Yb 88__   
88""Yb  dP__Yb  o.`Y8b 88""    8I  dY     88 Y88 Yb   dP  8I  dY 88""   
88oodP dP""""Yb 8bodP' 888888 8888Y"      88  Y8  YbodP  8888Y"  888888 


             8b    d8  dP"Yb  88b 88 88 888888  dP"Yb  88""Yb     88b 88  dP"Yb  8888b.  888888 .dP"Y8 
________     88b  d88 dP   Yb 88Yb88 88   88   dP   Yb 88__dP     88Yb88 dP   Yb  8I  Yb 88__   `Ybo." 
""""""""     88YbdP88 Yb   dP 88 Y88 88   88   Yb   dP 88"Yb      88 Y88 Yb   dP  8I  dY 88""   o.`Y8b 
             88 YY 88  YbodP  88  Y8 88   88    YbodP  88  Yb     88  Y8  YbodP  8888Y"  888888 8bodP' 

(beta)
https://based-node-installer.onrender.com/



# BasedAI Node Installer & Monitor

A comprehensive solution for installing and monitoring BasedAI validator nodes with animated Three.js background

## Installation Instructions

### Linux / WSL / macOS

The recommended way to install the node is to download and run the script manually:

```bash
# Download the script
curl -sSL https://raw.githubusercontent.com/glowku/based-node-installer/main/install.sh -o install.sh

# Convert line endings from Windows to Linux
sed -i 's/\r$//' install.sh

# Make the script executable
chmod +x install.sh

# Run the script with your parameters

./install.sh "YOUR_WALLET_ADDRESS" "YOUR_NODE_NAME" "STAKE_AMOUNT" "SERVER_TYPE" "OS"
