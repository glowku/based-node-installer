#!/bin/bash

# Script pour appliquer le fix de l'enum Message dans Substrate pour basednode

set -e  # Arrête le script en cas d'erreur

echo "=== Script de fix pour basednode ==="

# 1. Vérifier si on est dans le dossier basednode
if [ ! -f "Cargo.toml" ] || ! grep -q "basednode" Cargo.toml; then
    echo "Erreur: Ce script doit être exécuté depuis le dossier racine de basednode"
    exit 1
fi

# 2. Trouver le dossier substrate dans ~/.cargo/git/checkouts/
CARGO_DIR="$HOME/.cargo/git/checkouts"
if [ ! -d "$CARGO_DIR" ]; then
    echo "Erreur: Le dossier ~/.cargo/git/checkouts/ n'existe pas"
    exit 1
fi

# Trouver le premier dossier substrate (peut y en avoir plusieurs)
SUBSTRATE_DIR=$(find "$CARGO_DIR" -type d -name "substrate-*" | head -n 1)
if [ -z "$SUBSTRATE_DIR" ]; then
    echo "Erreur: Aucun dossier substrate trouvé dans ~/.cargo/git/checkouts/"
    exit 1
fi

echo "Dossier Substrate trouvé: $SUBSTRATE_DIR"

# 3. Trouver le fichier message.rs
MESSAGE_FILE="$SUBSTRATE_DIR"/*/client/network/src/protocol/message.rs
if [ ! -f "$MESSAGE_FILE" ]; then
    echo "Erreur: Fichier message.rs non trouvé dans $SUBSTRATE_DIR"
    exit 1
fi

echo "Fichier à modifier: $MESSAGE_FILE"

# 4. Faire une sauvegarde
BACKUP_FILE="$MESSAGE_FILE.backup.$(date +%Y%m%d_%H%M%S)"
cp "$MESSAGE_FILE" "$BACKUP_FILE"
echo "Sauvegarde créée: $BACKUP_FILE"

# 5. Appliquer le patch
cat > /tmp/message_fix.rs << 'EOF'
#[derive(Debug, PartialEq, Eq, Clone, Encode, Decode)]
pub enum Message<Header, Hash, Number, Extrinsic> {
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
}
EOF

# Remplacer l'enum dans le fichier
python3 << EOF
import re
import sys

with open('$MESSAGE_FILE', 'r') as f:
    content = f.read()

# Pattern pour trouver et remplacer l'enum Message
pattern = r'pub enum Message<Header, Hash, Number, Extrinsic> \{.*?\}'
with open('/tmp/message_fix.rs', 'r') as f:
    replacement = f.read()

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open('$MESSAGE_FILE', 'w') as f:
    f.write(new_content)

print("Enum Message remplacée avec succès")
EOF

echo "Fix appliqué avec succès !"

# 6. Demander si on veut recompiler
read -p "Voulez-vous recompiler basednode maintenant ? (o/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Oo]$ ]]; then
    echo "Recompilation de basednode..."
    cargo build --release
    echo "Compilation terminée ! Le binaire est dans ./target/release/basednode"
else
    echo "Vous pouvez recompiler manuellement avec: cargo build --release"
fi

echo "=== Terminé ==="