//  8""""                                      
//  8     eeeee eeeee e    e                   
//  8eeee 8   8 8   " 8    8                   
//  88    8eee8 8eeee 8eeee8                   
//  88    88  8    88   88                     
//  88eee 88  8 8ee88   88                     
//                                             
//  8""""8                                     
//  8    8   eeeee eeeee eeee eeeee            
//  8eeee8ee 8   8 8   " 8    8   8            
//  88     8 8eee8 8eeee 8eee 8e  8            
//  88     8 88  8    88 88   88  8            
//  88eeeee8 88  8 8ee88 88ee 88ee8            
//                                             
//                                             
//                                             
//                                             
//                                             
//                                             
//  88 88 88                                   
//                                             
//                                             
//                                             
//                                             
//                                             
//                                             
//                                             
//                                             
//  8""8""8                                    
//  8  8  8 eeeee eeeee e eeeee eeeee eeeee    
//  8e 8  8 8  88 8   8 8   8   8  88 8   8    
//  88 8  8 8   8 8e  8 8e  8e  8   8 8eee8e   
//  88 8  8 8   8 88  8 88  88  8   8 88   8   
//  88 8  8 8eee8 88  8 88  88  8eee8 88   8   
//                                             
//                                             
//  eeeee eeeee eeeee eeee eeeee               
//  8   8 8  88 8   8 8    8   "               
//  8e  8 8   8 8e  8 8eee 8eeee               
//  88  8 8   8 88  8 88      88               
//  88  8 8eee8 88ee8 88ee 8ee88               
//                                                                                                                                                                                           
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




