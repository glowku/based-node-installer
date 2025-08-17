#!/bin/bash
# Script de déploiement sur Render

# Créer la structure des dossiers
mkdir -p templates/static/css templates/static/js

# Copier les fichiers
cp app.py .
cp -r templates .
cp -r static .

# Créer le fichier requirements.txt
cat > requirements.txt << EOF
flask
flask-cors
requests
EOF

# Créer le fichier render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: basedai-monitor
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      PYTHON_VERSION: 3.9.6
EOF

echo "Déploiement prêt pour Render !"
echo "Instructions :"
echo "1. Créer un nouveau service web sur Render"
echo "2. Connecter votre dépôt GitHub"
echo "3. Le service sera automatiquement détecté"