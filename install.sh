#!/bin/bash
# Based Node Installer - Version pour BF1337/basednode
# Ce script installe et configure un nœud validateur BasedAI en utilisant le fork BF1337
# Compatible avec Linux, WSL, et différents systèmes d'exploitation

# Correction du problème de fin de ligne
sed -i 's/\r$//' "$0"

# Vérification des arguments
if [ "$#" -ne 5 ]; then
    echo "Usage: $0 <WALLET_ADDRESS> <NODE_NAME> <STAKE_AMOUNT> <SERVER_TYPE> <OS>"
    exit 1
fi

WALLET_ADDRESS=$1
NODE_NAME=$2
STAKE_AMOUNT=$3
SERVER_TYPE=$4
OS=$5

# Affichage du logo Based Node
echo -e "\e[36m"
echo "░▒▓███████▓▒░ ░▒▓██████▓▒░ ░▒▓███████▓▒░▒▓████████▓▒░▒▓███████▓▒░       ░▒▓███████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░"
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓███████▓▒░░▒▓████████▓▒░░▒▓██████▓▒░░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓██████▓▒░   "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        "
echo "░▒▓███████▓▒░░▒▓█▓▒░░▒▓█▓▒░▒▓███████▓▒░░▒▓████████▓▒░▒▓███████▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░░▒▓███████▓▒░░▒▓████████▓▒░"
echo -e "\e[0m"
echo "                                                                      \e[36mNODE PROFESSIONAL INSTALLER\e[0m"
echo ""

# Détection du système d'exploitation
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
echo "🖥️  Système d'exploitation détecté: $OS_TYPE"

# Obtention d'informations détaillées sur le système d'exploitation
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
            echo "Environnement WSL"
            ;;
        "macos")
            sw_vers -productVersion
            ;;
        *)
            echo "Inconnu"
            ;;
    esac
}

OS_VERSION=$(get_detailed_os)
echo "📋 Version du système d'exploitation: $OS_VERSION"

# Vérification des privilèges root ou sudo
check_privileges() {
    if [[ $EUID -eq 0 ]]; then
        return 0  # L'utilisateur est root
    elif [[ "$OS_TYPE" == "wsl" ]] || [[ "$OS_TYPE" == "linux" ]]; then
        # Vérification si l'utilisateur a des privilèges sudo
        if sudo -n true 2>/dev/null; then
            return 0  # L'utilisateur a des privilèges sudo
        else
            echo "❌ Ce script nécessite des privilèges root. Veuillez l'exécuter avec sudo."
            echo "💡 Essayez: sudo $0 $@"
            exit 1
        fi
    else
        echo "❌ Ce script nécessite des privilèges root. Veuillez l'exécuter en tant qu'administrateur."
        exit 1
    fi
}

check_privileges

# Mise à jour du système
update_system() {
    echo "🔄 Mise à jour du système..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            sudo apt-get update
            sudo apt-get upgrade -y
            sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common gnupg2 wget jq
            ;;
        "macos")
            # Vérification si Homebrew est installé
            if ! command -v brew &> /dev/null; then
                echo "Installation de Homebrew..."
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew update
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez vous assurer que WSL est installé avec Ubuntu."
            echo "Ce script est conçu pour l'environnement Linux/WSL."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            exit 1
            ;;
    esac
}

update_system

# Installation des dépendances pour BF1337/basednode
install_dependencies() {
    echo "📦 Installation des dépendances pour BF1337/basednode..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            sudo apt-get install -y git curl wget jq software-properties-common apt-transport-https ca-certificates gnupg2 \
            build-essential clang libclang-dev llvm libudev-dev protobuf-compiler pkg-config libssl-dev \
            python3 python3-pip npm nodejs
            ;;
        "macos")
            brew install curl wget jq git clang llvm protobuf python3 npm nodejs
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez installer les dépendances manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            exit 1
            ;;
    esac
}

install_dependencies

# Création de l'utilisateur dédié (déplacé avant l'installation de Rust)
create_user() {
    echo "👤 Création de l'utilisateur 'basedai'..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            if ! id "basedai" &>/dev/null; then
                sudo useradd -m -s /bin/bash basedai
                sudo usermod -aG docker basedai 2>/dev/null || echo "Groupe docker non trouvé, ignoré"
            else
                echo "L'utilisateur 'basedai' existe déjà."
            fi
            ;;
        "macos")
            if ! id "basedai" &>/dev/null; then
                sudo sysadminctl -addUser basedai
                echo "Veuillez ajouter manuellement l'utilisateur 'basedai' au groupe docker:"
                echo "sudo dscl . append /Groups/docker GroupMembership basedai"
            else
                echo "L'utilisateur 'basedai' existe déjà."
            fi
            ;;
        "windows")
            echo "⚠️  Sur Windows, la création d'utilisateur est différente. Veuillez créer l'utilisateur manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

create_user

# Installation de Rust et Cargo pour la compilation
install_rust() {
    echo "🔧 Installation de Rust et Cargo..."
    
    # Vérifier si Rust est déjà installé pour l'utilisateur basedai
    if sudo -u basedai bash -c "source ~/.cargo/env && cargo --version" > /dev/null 2>&1; then
        echo "✅ Rust/Cargo est déjà installé pour l'utilisateur basedai"
        return 0
    fi
    
    # Installation de Rust via rustup pour l'utilisateur basedai
    sudo -u basedai bash -c "curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
    
    # Configuration de Rust pour BF1337/basednode
    sudo -u basedai bash -c "source ~/.cargo/env && rustup default stable"
    sudo -u basedai bash -c "source ~/.cargo/env && rustup update"
    sudo -u basedai bash -c "source ~/.cargo/env && rustup toolchain install nightly-2025-01-07"
    sudo -u basedai bash -c "source ~/.cargo/env && rustup target add wasm32-unknown-unknown --toolchain nightly-2025-01-07"
    
    # Ajouter le PATH au .bashrc de l'utilisateur basedai
    echo 'export PATH="$HOME/.cargo/bin:$PATH"' | sudo -u basedai tee -a /home/basedai/.bashrc > /dev/null
    
    # Vérification de l'installation
    if sudo -u basedai bash -c "source ~/.cargo/env && cargo --version" > /dev/null 2>&1; then
        echo "✅ Rust/Cargo a été installé avec succès pour l'utilisateur basedai"
    else
        echo "❌ L'installation de Rust/Cargo a échoué"
        return 1
    fi
}

install_rust

# Configuration du PATH pour Cargo
configure_cargo_path() {
    echo "🛠️  Configuration du PATH pour Cargo..."
    
    # Créer un lien symbolique dans /usr/local/bin pour que sudo puisse trouver cargo
    if [ ! -f "/usr/local/bin/cargo" ]; then
        sudo ln -sf /home/basedai/.cargo/bin/cargo /usr/local/bin/cargo
        echo "✅ Lien symbolique pour cargo créé dans /usr/local/bin"
    fi
    
    if [ ! -f "/usr/local/bin/rustc" ]; then
        sudo ln -sf /home/basedai/.cargo/bin/rustc /usr/local/bin/rustc
        echo "✅ Lien symbolique pour rustc créé dans /usr/local/bin"
    fi
    
    # Ajouter le PATH au profil système pour les sessions futures
    echo 'export PATH="/home/basedai/.cargo/bin:$PATH"' | sudo tee /etc/profile.d/cargo.sh > /dev/null
    sudo chmod +x /etc/profile.d/cargo.sh
    
    echo "✅ PATH configuré pour Cargo"
}

configure_cargo_path

# Création des répertoires
create_directories() {
    echo "📁 Création des répertoires..."
    
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
            echo "⚠️  Sur Windows, veuillez créer les répertoires manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

create_directories

# Fonction pour appliquer le fix de l'enum Message
apply_substrate_fix() {
    echo "🔧 Application du fix pour l'enum Message..."
    
    # Trouver le dossier substrate dans ~/.cargo/git/checkouts/
    CARGO_DIR="/home/basedai/.cargo/git/checkouts"
    if [ ! -d "$CARGO_DIR" ]; then
        echo "⚠️  Le dossier ~/.cargo/git/checkouts/ n'existe pas encore. Le fix sera appliqué plus tard si nécessaire."
        return 0
    fi
    
    # Trouver le premier dossier substrate (peut y en avoir plusieurs)
    SUBSTRATE_DIR=$(find "$CARGO_DIR" -type d -name "substrate-*" | head -n 1)
    if [ -z "$SUBSTRATE_DIR" ]; then
        echo "⚠️  Aucun dossier substrate trouvé. Le fix sera appliqué plus tard si nécessaire."
        return 0
    fi
    
    echo "Dossier Substrate trouvé: $SUBSTRATE_DIR"
    
    # Trouver le fichier message.rs
    MESSAGE_FILE="$SUBSTRATE_DIR"/*/client/network/src/protocol/message.rs
    if [ ! -f "$MESSAGE_FILE" ]; then
        echo "⚠️  Fichier message.rs non trouvé. Le fix sera appliqué plus tard si nécessaire."
        return 0
    fi
    
    echo "Fichier à modifier: $MESSAGE_FILE"
    
    # Faire une sauvegarde
    BACKUP_FILE="$MESSAGE_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$MESSAGE_FILE" "$BACKUP_FILE"
    echo "Sauvegarde créée: $BACKUP_FILE"
    
    # Appliquer le patch en utilisant Python pour plus de fiabilité
    python3 << EOF
import re
import sys

with open('$MESSAGE_FILE', 'r') as f:
    content = f.read()

# Pattern pour trouver et remplacer l'enum Message
pattern = r'pub enum Message<Header, Hash, Number, Extrinsic> \{.*?\}'
replacement = '''pub enum Message<Header, Hash, Number, Extrinsic> {
    /// Status packet.
    Status(Status<Hash, Number>),
    /// Block request.
    BlockRequest(BlockRequest<Hash, Number>),
    /// Block response.
    BlockResponse(BlockResponse<Header, Hash, Extrinsic>),
    /// Block announce.
    BlockAnnounce(BlockAnnounce<Header>),
    /// Consensus protocol message.
    #[codec(index = 6)]
    Consensus(ConsensusMessage),
    /// Remote method call request.
    #[codec(index = 7)]
    RemoteCallRequest(RemoteCallRequest<Hash>),
    /// Remote method call response.
    #[codec(index = 8)]
    RemoteCallResponse(RemoteCallResponse),
    /// Remote storage read request.
    #[codec(index = 9)]
    RemoteReadRequest(RemoteReadRequest<Hash>),
    /// Remote storage read response.
    #[codec(index = 10)]
    RemoteReadResponse(RemoteReadResponse),
    /// Remote header request.
    #[codec(index = 11)]
    RemoteHeaderRequest(RemoteHeaderRequest<Number>),
    /// Remote header response.
    #[codec(index = 12)]
    RemoteHeaderResponse(RemoteHeaderResponse<Header>),
    /// Remote changes request.
    #[codec(index = 13)]
    RemoteChangesRequest(RemoteChangesRequest<Hash>),
    /// Remote changes response.
    #[codec(index = 14)]
    RemoteChangesResponse(RemoteChangesResponse<Number, Hash>),
    /// Remote child storage read request.
    #[codec(index = 15)]
    RemoteReadChildRequest(RemoteReadChildRequest<Hash>),
    /// Batch of consensus protocol messages.
    #[codec(index = 17)]
    ConsensusBatch(Vec<ConsensusMessage>),
}'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('$MESSAGE_FILE', 'w') as f:
    f.write(new_content)

print("✅ Enum Message corrigée avec succès")
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Fix pour l'enum Message appliqué avec succès"
    else
        echo "❌ Échec de l'application du fix"
    fi
}

# Fonction pour appliquer le fix basednode manuellement
apply_fix_basednode_manuel() {
    echo "🔧 Application du fix basednode manuel..."
    
    # Trouver le fichier src/lib.rs dans le répertoire de compilation
    BUILD_DIR="/tmp/basednode-build"
    LIB_RS_FILE="$BUILD_DIR/src/lib.rs"
    
    if [ ! -f "$LIB_RS_FILE" ]; then
        echo "⚠️  Fichier src/lib.rs non trouvé. Le fix ne peut pas être appliqué."
        return 1
    fi
    
    # Faire une sauvegarde
    BACKUP_FILE="$LIB_RS_FILE.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$LIB_RS_FILE" "$BACKUP_FILE"
    echo "Sauvegarde créée: $BACKUP_FILE"
    
    # Appliquer le patch
    python3 << EOF
import re
import sys

with open('$LIB_RS_FILE', 'r') as f:
    content = f.read()

# Fix pour le problème de compilation
# Remplacer les imports problématiques
content = re.sub(r'use substrate::.*;', '', content)

# Ajouter les bons imports
if 'use frame_support::' not in content:
    content = 'use frame_support::{dispatch::DispatchResult, pallet_prelude::*};\n' + content

if 'use frame_system::' not in content:
    content = 'use frame_system::{pallet_prelude::*};\n' + content

with open('$LIB_RS_FILE', 'w') as f:
    f.write(content)

print("✅ Fix manuel appliqué avec succès")
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Fix manuel appliqué avec succès"
        return 0
    else
        echo "❌ Échec de l'application du fix manuel"
        return 1
    fi
}

# Téléchargement et compilation du binaire BasedAI depuis BF1337/basednode
download_and_compile_binary() {
    echo "⬇️  Téléchargement et compilation de BF1337/basednode..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            cd /opt/basedai
            
            # Créer un répertoire temporaire pour la compilation
            BUILD_DIR="/tmp/basednode-build"
            # Supprimer le répertoire s'il existe déjà
            sudo rm -rf "$BUILD_DIR"
            sudo -u basedai mkdir -p "$BUILD_DIR"
            cd "$BUILD_DIR"
            
            # Cloner le dépôt BF1337/basednode
            echo "Clonage du dépôt BF1337/basednode..."
            if sudo -u basedai git clone https://github.com/BF1337/basednode.git .; then
                echo "✅ Dépôt cloné avec succès"
                
                # Télécharger le fichier mainnet1_raw.json nécessaire
                echo "Téléchargement du fichier mainnet1_raw.json..."
                sudo -u basedai curl -o mainnet1_raw.json https://raw.githubusercontent.com/BF1337/basednode/main/mainnet1_raw.json
                
                # Compiler le binaire avec la toolchain spécifique
                echo "Compilation du binaire (cela peut prendre plusieurs minutes)..."
                
                # Première tentative de compilation
                if sudo -u basedai bash -c "source ~/.cargo/env && cargo +nightly-2025-01-07 build --release"; then
                    echo "✅ Compilation réussie!"
                    
                    # Copier le binaire compilé
                    if [ -f "target/release/basednode" ]; then
                        sudo -u basedai cp target/release/basednode /opt/basedai/based
                        echo "✅ Binaire copié avec succès"
                    else
                        echo "❌ Binaire compilé non trouvé"
                        exit 1
                    fi
                else
                    echo "❌ Échec de la compilation, tentative avec solution alternative..."
                    
                    # Solution alternative 1: Nettoyer et recompiler
                    echo "Solution alternative 1: Nettoyage et recompilation..."
                    sudo -u basedai bash -c "source ~/.cargo/env && cargo clean"
                    
                    # Solution alternative 2: Appliquer le fix manuel
                    echo "Solution alternative 2: Application du fix manuel..."
                    apply_fix_basednode_manuel
                    
                    # Solution alternative 3: Compilation avec moins de parallélisation
                    echo "Solution alternative 3: Compilation avec moins de parallélisation..."
                    if sudo -u basedai bash -c "source ~/.cargo/env && cargo +nightly-2025-01-07 build --release --jobs 1"; then
                        echo "✅ Compilation réussie avec solution alternative!"
                        
                        # Copier le binaire compilé
                        if [ -f "target/release/basednode" ]; then
                            sudo -u basedai cp target/release/basednode /opt/basedai/based
                            echo "✅ Binaire copié avec succès"
                        else
                            echo "❌ Binaire compilé non trouvé"
                            exit 1
                        fi
                    else
                        echo "❌ Échec de la compilation avec toutes les solutions alternatives"
                        echo "Veuillez vérifier les erreurs ci-dessus et consulter la documentation"
                        exit 1
                    fi
                fi
            else
                echo "❌ Échec du clonage du dépôt"
                exit 1
            fi
            
            # Copier le fichier mainnet1_raw.json dans le répertoire de config
            sudo -u basedai cp mainnet1_raw.json /opt/basedai/config/
            
            # Nettoyer le répertoire temporaire
            cd /opt/basedai
            sudo rm -rf "$BUILD_DIR"
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez compiler manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            exit 1
            ;;
    esac
}

download_and_compile_binary

# Installation de la bibliothèque de surveillance
install_monitoring_library() {
    echo "📊 Installation de la bibliothèque de surveillance..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            cd /opt/basedai/monitoring
            
            # Création d'un répertoire de surveillance
            mkdir -p basedai-monitor
            cd basedai-monitor
            
            # Création d'un package.json
            cat > package.json <<'EOF'
{
  "name": "basedai-monitor",
  "version": "1.0.0",
  "description": "BasedAI Node Monitoring",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "chart.js": "^4.4.0"
  }
}
EOF
            
            # Installation des dépendances
            sudo -u basedai npm install
            
            # Création de la configuration de surveillance
            cat > config.json <<EOF
{
  "node": {
    "name": "$NODE_NAME",
    "wallet": "$WALLET_ADDRESS",
    "stake": $STAKE_AMOUNT,
    "port": 30333,
    "rpcPort": 9933
  },
  "network": {
    "bootnodes": [
      "/ip4/108.181.3.21/tcp/30333/p2p/12D3KooWNi3e5Qs2frbfMxmHPBSHiouZgBjLzKgYejW82SUR8s59",
      "/ip4/145.14.157.152/tcp/30333/p2p/12D3KooWC6F9XVH3YPGWkEbMdJp97bdMS4jT1LCPn24yFd6FWnhE",
      "/ip4/46.202.132.238/tcp/30333/p2p/12D3KooWEdDRbhGxbbfBtcZLg3Nm6aR1o86EBgpHwEvYFh3ndjxb",
      "/ip4/46.202.178.141/tcp/30333/p2p/12D3KooWAvmfEhsNCSgeMZEMAJGF3LPT5B64fpCYpRy2ch243pG2",
      "/ip4/5.78.122.38/tcp/30333/p2p/12D3KooWMraofyeuaTdLNJDCpNHDUyv5f2yDDt2eY3T28PVxnmHC",
      "/ip4/84.32.25.204/tcp/30333/p2p/12D3KooWFebYXE8aV7eqfdo9ttTpkzSocd2za9a9omqw9mgJgznR",
      "/ip4/92.112.181.7/tcp/30333/p2p/12D3KooWC44HXrfrvJTojAS55xEPToyjatLHbhKaj1JLgCdZVEGz"
    ],
    "chain": "basedai",
    "rpcPort": 9933,
    "rpcCors": ["*"],
    "rpcMethods": ["*"],
    "rpcExternal": true
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
            
            echo "✅ Bibliothèque de surveillance installée avec succès"
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez installer la bibliothèque de surveillance manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

install_monitoring_library

# Génération du fichier de configuration
generate_config() {
    echo "⚙️  Génération de la configuration..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl"|"macos")
            sudo -u basedai mkdir -p /opt/basedai/config
            cat > /opt/basedai/config/config.json <<EOF
{
  "node": {
    "name": "$NODE_NAME",
    "wallet": "$WALLET_ADDRESS",
    "stake": $STAKE_AMOUNT,
    "port": 30333,
    "rpcPort": 9933
  },
  "network": {
    "bootnodes": [
      "/ip4/108.181.3.21/tcp/30333/p2p/12D3KooWNi3e5Qs2frbfMxmHPBSHiouZgBjLzKgYejW82SUR8s59",
      "/ip4/145.14.157.152/tcp/30333/p2p/12D3KooWC6F9XVH3YPGWkEbMdJp97bdMS4jT1LCPn24yFd6FWnhE",
      "/ip4/46.202.132.238/tcp/30333/p2p/12D3KooWEdDRbhGxbbfBtcZLg3Nm6aR1o86EBgpHwEvYFh3ndjxb",
      "/ip4/46.202.178.141/tcp/30333/p2p/12D3KooWAvmfEhsNCSgeMZEMAJGF3LPT5B64fpCYpRy2ch243pG2",
      "/ip4/5.78.122.38/tcp/30333/p2p/12D3KooWMraofyeuaTdLNJDCpNHDUyv5f2yDDt2eY3T28PVxnmHC",
      "/ip4/84.32.25.204/tcp/30333/p2p/12D3KooWFebYXE8aV7eqfdo9ttTpkzSocd2za9a9omqw9mgJgznR",
      "/ip4/92.112.181.7/tcp/30333/p2p/12D3KooWC44HXrfrvJTojAS55xEPToyjatLHbhKaj1JLgCdZVEGz"
    ],
    "chain": "basedai",
    "rpcPort": 9933,
    "rpcCors": ["*"],
    "rpcMethods": ["*"],
    "rpcExternal": true
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
            echo "⚠️  Sur Windows, veuillez créer la configuration manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

generate_config

# Configuration du pare-feu
configure_firewall() {
    echo "🔥 Configuration du pare-feu..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            if command -v ufw &> /dev/null; then
                sudo ufw allow 22/tcp
                sudo ufw allow 30333/tcp
                sudo ufw allow 30333/udp
                sudo ufw allow 8080/tcp
                sudo ufw allow 9933/tcp
                sudo ufw --force enable
            else
                echo "⚠️  UFW non trouvé. Installation d'UFW..."
                sudo apt-get install -y ufw
                sudo ufw allow 22/tcp
                sudo ufw allow 30333/tcp
                sudo ufw allow 30333/udp
                sudo ufw allow 8080/tcp
                sudo ufw allow 9933/tcp
                sudo ufw --force enable
            fi
            ;;
        "macos")
            echo "block return" | sudo tee /etc/pf.anchors/basedai
            echo "pass in proto tcp from any to any port 30333" | sudo tee -a /etc/pf.anchors/basedai
            echo "pass in proto udp from any to any port 30333" | sudo tee -a /etc/pf.anchors/basedai
            echo "pass in proto tcp from any to any port 8080" | sudo tee -a /etc/pf.anchors/basedai
            echo "pass in proto tcp from any to any port 9933" | sudo tee -a /etc/pf.anchors/basedai
            sudo pfctl -f /etc/pf.conf
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez configurer le pare-feu manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

configure_firewall

# Création du service systemd
create_service() {
    echo "📝 Création du service systemd..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            cat > /etc/systemd/system/basedai.service <<EOF
[Unit]
Description=BasedAI Validator Node (BF1337/basednode)
After=network.target
[Service]
User=basedai
WorkingDirectory=/opt/basedai
ExecStart=/opt/basedai/based --name "$NODE_NAME" --chain "/opt/basedai/config/mainnet1_raw.json" --rpc-external --unsafe-rpc-external --rpc-methods Unsafe --bootnodes /dns/mainnet.basedaibridge.com/tcp/30333/p2p/12D3KooWCQy4hiiA9tHxvQ2PPaSY3mUM6NkMnbsYf2v4FKbLAtUh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
[Install]
WantedBy=multi-user.target
EOF
            ;;
        "macos")
            # Création du service launchd pour macOS
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
        <string>--name</string>
        <string>$NODE_NAME</string>
        <string>--chain</string>
        <string>/opt/basedai/config/mainnet1_raw.json</string>
        <string>--rpc-external</string>
        <string>--unsafe-rpc-external</string>
        <string>--rpc-methods</string>
        <string>Unsafe</string>
        <string>--bootnodes</string>
        <string>/dns/mainnet.basedaibridge.com/tcp/30333/p2p/12D3KooWCQy4hiiA9tHxvQ2PPaSY3mUM6NkMnbsYf2v4FKbLAtUh</string>
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
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez créer le service manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

create_service

# Démarrage des services
start_service() {
    echo "🚀 Démarrage des services..."
    
    case "$OS_TYPE" in
        "ubuntu"|"debian"|"wsl")
            sudo systemctl daemon-reload
            sudo systemctl start basedai
            sudo systemctl enable basedai
            ;;
        "macos")
            sudo launchctl load /Library/LaunchDaemons/com.basedai.node.plist
            ;;
        "windows")
            echo "⚠️  Sur Windows, veuillez démarrer le service manuellement."
            ;;
        *)
            echo "❌ Système d'exploitation non pris en charge: $OS_TYPE"
            ;;
    esac
}

start_service

# Création d'un script de vérification adapté pour BF1337/basednode
create_check_script() {
    echo "🔍 Création du script de vérification..."
    
    cat > /opt/basedai/check-node.sh <<'EOF'
#!/bin/bash
echo "=========================================="
echo "Vérification complète du nœud BasedAI (BF1337/basednode)"
echo "=========================================="
echo ""

# Vérifier le statut des services
echo "1. Statut des services :"
echo "   Service basedai : $(systemctl is-active basedai)"
echo ""

# Vérifier les ports en écoute
echo "2. Ports en écoute :"
if ss -tlnp | grep -q ":30333 "; then
    echo "   ✅ Port 30333 (P2P) : Écoute"
else
    echo "   ❌ Port 30333 (P2P) : Non écouté"
fi
if ss -tlnp | grep -q ":9933 "; then
    echo "   ✅ Port 9933 (RPC) : Écoute"
else
    echo "   ❌ Port 9933 (RPC) : Non écouté"
fi
echo ""

# Vérifier que le binaire est bien présent et exécutable
echo "3. Vérification du binaire :"
if [ -f "/opt/basedai/based" ]; then
    if [ -x "/opt/basedai/based" ]; then
        echo "   ✅ Binaire BasedAI (BF1337/basednode) présent et exécutable"
        echo "   Chemin : /opt/basedai/based"
        echo "   Version : $(/opt/basedai/based --version 2>/dev/null || echo 'Version non disponible')"
    else
        echo "   ⚠️  Binaire BasedAI présent mais non exécutable"
        echo "   Chemin : /opt/basedai/based"
    fi
else
    echo "   ❌ Binaire BasedAI non trouvé"
    echo "   Veuillez compiler le binaire depuis : https://github.com/BF1337/basednode"
fi
echo ""

# Vérifier la présence du fichier mainnet1_raw.json
echo "4. Vérification du fichier de configuration :"
if [ -f "/opt/basedai/config/mainnet1_raw.json" ]; then
    echo "   ✅ Fichier mainnet1_raw.json présent"
    echo "   Chemin : /opt/basedai/config/mainnet1_raw.json"
else
    echo "   ❌ Fichier mainnet1_raw.json non trouvé"
fi
echo ""

# Vérifier l'espace disque
echo "5. Espace disque :"
echo "   Espace disponible : $(df -h / | tail -1 | awk '{print $4}')"
echo "   Espace utilisé : $(df -h / | tail -1 | awk '{print $5}')"
echo ""

echo "=========================================="
echo "Vérification terminée !"
echo "=========================================="
EOF
    chmod +x /opt/basedai/check-node.sh
    chown basedai:basedai /opt/basedai/check-node.sh
    
    echo "✅ Script de vérification créé"
}

create_check_script

# Création d'un script de gestion simple
create_management_script() {
    echo "🛠️  Création du script de gestion..."
    
    cat > /opt/basedai/manage.sh <<'EOF'
#!/bin/bash
# BasedAI Node Management Script pour BF1337/basednode

case "$1" in
    start)
        echo "Démarrage du nœud BasedAI..."
        sudo systemctl start basedai
        echo "Service démarré"
        ;;
    stop)
        echo "Arrêt du nœud BasedAI..."
        sudo systemctl stop basedai
        echo "Service arrêté"
        ;;
    restart)
        echo "Redémarrage du nœud BasedAI..."
        sudo systemctl restart basedai
        echo "Service redémarré"
        ;;
    status)
        echo "=== Statut du nœud BasedAI ==="
        sudo systemctl status basedai --no-pager -l
        ;;
    logs)
        echo "Affichage des logs du nœud BasedAI (Ctrl+C pour quitter)..."
        sudo journalctl -u basedai -f
        ;;
    check)
        echo "=== Vérification complète du nœud ==="
        /opt/basedai/check-node.sh
        ;;
    update)
        echo "Mise à jour du nœud BasedAI..."
        echo "Cette fonctionnalité sera disponible prochainement"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|check|update}"
        echo ""
        echo "Commandes disponibles :"
        echo "  start    - Démarrer le nœud"
        echo "  stop     - Arrêter le nœud"
        echo "  restart  - Redémarrer le nœud"
        echo "  status   - Vérifier le statut du service"
        echo "  logs     - Voir les logs en temps réel"
        echo "  check    - Vérification complète"
        echo "  update   - Mettre à jour le nœud"
        exit 1
        ;;
esac
EOF
    
    chmod +x /opt/basedai/manage.sh
    chown basedai:basedai /opt/basedai/manage.sh
    
    # Créer un alias pour l'utilisateur actuel
    echo "alias basedai='/opt/basedai/manage.sh'" >> /home/$SUDO_USER/.bashrc
    
    echo "✅ Script de gestion créé"
    echo "   Utilisez : /opt/basedai/manage.sh [start|stop|restart|status|logs|check|update]"
    echo "   Ou après reconnexion : basedai [start|stop|restart|status|logs|check|update]"
}

create_management_script

# Affichage des informations de completion
echo ""
echo -e "\e[36m✅ Installation terminée avec succès!\e[0m"
echo ""
echo "📋 Informations de votre nœud:"
echo "   Nom du nœud: $NODE_NAME"
echo "   Adresse du portefeuille: $WALLET_ADDRESS"
echo "   Montant du stake: $STAKE_AMOUNT BASED"
echo "   Type de serveur: $SERVER_TYPE"
echo "   Système d'exploitation: $OS"
echo "   Système d'exploitation détecté: $OS_TYPE"
echo "   Version du système d'exploitation: $OS_VERSION"
echo ""

# TUTORIEL COMPLET POUR GÉRER LE NŒUD
echo -e "\e[33m"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          TUTORIEL COMPLET - GESTION DU NŒUD (BF1337/basednode)      ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  COMMANDES DE BASE                                           ║"
echo "║  ----------------                                           ║"
echo "║                                                              ║"
echo "║  1. Vérifier le statut du nœud:                              ║"
echo "║     /opt/basedai/manage.sh status                            ║"
echo "║                                                              ║"
echo "║  2. Démarrer le nœud:                                         ║"
echo "║     /opt/basedai/manage.sh start                             ║"
echo "║                                                              ║"
echo "║  3. Arrêter le nœud:                                          ║"
echo "║     /opt/basedai/manage.sh stop                              ║"
echo "║                                                              ║"
echo "║  4. Redémarrer le nœud:                                       ║"
echo "║     /opt/basedai/manage.sh restart                           ║"
echo "║                                                              ║"
echo "║  5. Voir les logs du nœud en temps réel:                      ║"
echo "║     /opt/basedai/manage.sh logs                             ║"
echo "║                                                              ║"
echo "║  6. Vérification complète:                                    ║"
echo "║     /opt/basedai/manage.sh check                             ║"
echo "║                                                              ║"
echo "║  Après reconnexion au système, vous pourrez utiliser :          ║"
echo "║     basedai status                                            ║"
echo "║     basedai start                                             ║"
echo "║     basedai stop                                              ║"
echo "║     basedai restart                                           ║"
echo "║     basedai logs                                              ║"
echo "║     basedai check                                             ║"
echo "║                                                              ║"
echo "║  ACCÈS AU NŒUD                                               ║"
echo "║  -----------                                               ║"
echo "║                                                              ║"
echo "║  1. Endpoint RPC pour les portefeuilles:                     ║"
echo "║     http://localhost:9933                                    ║"
echo "║                                                              ║"
echo "║  2. Pour un accès distant au RPC (via SSH):                   ║"
echo "║     ssh -L 9933:localhost:9933 utilisateur@serveur          ║"
echo "║                                                              ║"
echo "║  DÉPANNAGE                                                    ║"
echo "║  ---------                                                    ║"
echo "║                                                              ║"
echo "║  1. Si le nœud ne démarre pas:                                ║"
echo "║     - Vérifiez les logs: journalctl -u basedai               ║"
echo "║     - Vérifiez le binaire: ls -la /opt/basedai/based        ║"
echo "║     - Vérifiez le config: ls -la /opt/basedai/config/      ║"
echo "║                                                              ║"
echo "║  2. Si vous avez des erreurs de compilation:                  ║"
echo "║     - Assurez-vous d'avoir Rust installé correctement        ║"
echo "║     - Vérifiez que la toolchain nightly-2025-01-07 est installée ║"
echo "║     - Consultez le dépôt: https://github.com/BF1337/basednode ║"
echo "║                                                              ║"
echo "║  3. Pour recompiler le nœud:                                  ║"
echo "║     cd /tmp && git clone https://github.com/BF1337/basednode ║"
echo "║     cd basednode && cargo +nightly-2025-01-07 build --release ║"
echo "║     sudo cp target/release/basednode /opt/basedai/based     ║"
echo "║     sudo systemctl restart basedai                            ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "\e[0m"