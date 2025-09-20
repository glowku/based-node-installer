cat > cleanup.sh << 'EOF'
#!/bin/bash
# Script de nettoyage complet pour BasedAI Node (BF1337/basednode)

echo "🧹 Nettoyage complet de l'installation BasedAI..."

# Arrêter le service s'il existe
if systemctl is-active --quiet basedai; then
    sudo systemctl stop basedai
    sudo systemctl disable basedai
    echo "✅ Service basedai arrêté et désactivé"
fi

# Supprimer le service systemd
if [ -f "/etc/systemd/system/basedai.service" ]; then
    sudo rm -f /etc/systemd/system/basedai.service
    sudo systemctl daemon-reload
    echo "✅ Service systemd supprimé"
fi

# Supprimer l'utilisateur et ses fichiers
if id "basedai" &>/dev/null; then
    sudo userdel -r basedai 2>/dev/null || echo "⚠️ L'utilisateur basedai n'a pas pu être supprimé complètement"
    echo "✅ Utilisateur basedai supprimé"
fi

# Supprimer les répertoires
sudo rm -rf /opt/basedai /tmp/basednode-build /home/basedai
echo "✅ Répertoires supprimés"

# Supprimer les liens symboliques
sudo rm -f /usr/local/bin/cargo /usr/local/bin/rustc /etc/profile.d/cargo.sh
echo "✅ Liens symboliques supprimés"

# Supprimer les alias dans le .bashrc de l'utilisateur courant
if [ -f "/home/$SUDO_USER/.bashrc" ]; then
    sed -i '/alias basedai=/d' /home/$SUDO_USER/.bashrc
    echo "✅ Alias supprimé du .bashrc"
fi

echo ""
echo "🎉 Nettoyage terminé! Vous pouvez maintenant réinstaller proprement."
EOF