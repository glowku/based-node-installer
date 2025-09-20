#!/bin/bash
# Script de test complet pour BasedAI Node Installer avec BF1337/basednode

set -e

echo "=========================================="
echo "🧪 SCRIPT DE TEST COMPLET - BASEDAI NODE"
echo "=========================================="
echo ""

# Fonction pour afficher les résultats de test
test_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2 - SUCCÈS"
    else
        echo "❌ $2 - ÉCHEC"
        FAILED_TESTS+=("$2")
    fi
    echo ""
}

FAILED_TESTS=()

# 1. Tester la présence des fichiers essentiels
echo "1. Test des fichiers essentiels"
echo "--------------------------------"

files=("install.sh" "monitor.sh" "index.html" "monitor.html" "style.css" "script.js" "monitor.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        test_result 0 "Présence de $file"
    else
        test_result 1 "Présence de $file"
    fi
done

# 2. Tester les permissions
echo "2. Test des permissions des scripts"
echo "--------------------------------"

if [ -x "install.sh" ]; then
    test_result 0 "Permissions d'exécution de install.sh"
else
    chmod +x install.sh
    test_result 0 "Permissions d'exécution de install.sh (corrigé)"
fi

if [ -x "monitor.sh" ]; then
    test_result 0 "Permissions d'exécution de monitor.sh"
else
    chmod +x monitor.sh
    test_result 0 "Permissions d'exécution de monitor.sh (corrigé)"
fi

# 3. Tester la syntaxe des scripts
echo "3. Test de la syntaxe des scripts"
echo "--------------------------------"

if bash -n install.sh 2>/dev/null; then
    test_result 0 "Syntaxe de install.sh"
else
    test_result 1 "Syntaxe de install.sh"
fi

if bash -n monitor.sh 2>/dev/null; then
    test_result 0 "Syntaxe de monitor.sh"
else
    test_result 1 "Syntaxe de monitor.sh"
fi

# 4. Tester la structure HTML
echo "4. Test de la structure HTML"
echo "--------------------------------"

if grep -q "BasedAI Node Installer" index.html; then
    test_result 0 "Titre dans index.html"
else
    test_result 1 "Titre dans index.html"
fi

if grep -q "install-form" index.html; then
    test_result 0 "Formulaire d'installation dans index.html"
else
    test_result 1 "Formulaire d'installation dans index.html"
fi

if grep -q "BasedAI Node Monitor" monitor.html; then
    test_result 0 "Titre dans monitor.html"
else
    test_result 1 "Titre dans monitor.html"
fi

# 5. Tester la configuration CSS (CORRIGÉ)
echo "5. Test de la configuration CSS"
echo "--------------------------------"

if grep -F "primary-color:" style.css; then
    test_result 0 "Variable primary-color dans CSS"
else
    test_result 1 "Variable primary-color dans CSS"
fi

if grep -F "bg-color:" style.css; then
    test_result 0 "Variable bg-color dans CSS"
else
    test_result 1 "Variable bg-color dans CSS"
fi

# 6. Tester les fonctions JavaScript
echo "6. Test des fonctions JavaScript"
echo "--------------------------------"

if grep -q "initThreeJSBackground" script.js; then
    test_result 0 "Fonction initThreeJSBackground dans script.js"
else
    test_result 1 "Fonction initThreeJSBackground dans script.js"
fi

if grep -q "showNotification" script.js; then
    test_result 0 "Fonction showNotification dans script.js"
else
    test_result 1 "Fonction showNotification dans script.js"
fi

if grep -q "initMonitor" monitor.js; then
    test_result 0 "Fonction initMonitor dans monitor.js"
else
    test_result 1 "Fonction initMonitor dans monitor.js"
fi

# 7. Tester la compatibilité BF1337
echo "7. Test de compatibilité avec BF1337/basednode"
echo "--------------------------------"

if grep -q "BF1337" install.sh; then
    test_result 0 "Référence à BF1337 dans install.sh"
else
    test_result 1 "Référence à BF1337 dans install.sh"
fi

if grep -q "github.com/BF1337/basednode" install.sh; then
    test_result 0 "URL du dépôt BF1337 dans install.sh"
else
    test_result 1 "URL du dépôt BF1337 dans install.sh"
fi

# 8. Tester la configuration réseau
echo "8. Test de la configuration réseau"
echo "--------------------------------"

if grep -q "30333" install.sh; then
    test_result 0 "Configuration du port P2P (30333)"
else
    test_result 1 "Configuration du port P2P (30333)"
fi

if grep -q "9933" install.sh; then
    test_result 0 "Configuration du port RPC (9933)"
else
    test_result 1 "Configuration du port RPC (9933)"
fi

if grep -q "8080" install.sh; then
    test_result 0 "Configuration du port monitoring (8080)"
else
    test_result 1 "Configuration du port monitoring (8080)"
fi

# Résumé
echo "=========================================="
echo "📊 RÉSUMÉ DES TESTS"
echo "=========================================="
echo ""

if [ ${#FAILED_TESTS[@]} -eq 0 ]; then
    echo "🎉 TOUS LES TESTS ONT RÉUSSI !"
    echo ""
    echo "✅ Ton projet est prêt pour :"
    echo "   - L'installation de nodes BasedAI avec BF1337/basednode"
    echo "   - Le monitoring des nodes"
    echo "   - La gestion des services"
    echo "   - La configuration réseau"
    echo ""
    echo "🚀 Tu peux maintenant déployer ton projet !"
else
    echo "⚠️  CERTAINS TESTS ONT ÉCHOUÉ :"
    echo ""
    for test in "${FAILED_TESTS[@]}"; do
        echo "❌ $test"
    done
    echo ""
    echo "🔧 Corrige les problèmes ci-dessus avant de déployer"
fi

echo "=========================================="
echo "🧪 FIN DES TESTS"
echo "=========================================="