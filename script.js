document.addEventListener('DOMContentLoaded', function() {
    const installForm = document.getElementById('install-form');
    const commandSection = document.getElementById('command-section');
    const installCommand = document.getElementById('install-command');
    const copyBtn = document.getElementById('copy-btn');
    const step2 = document.getElementById('step-2');
    const step3 = document.getElementById('step-3');
    
    installForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Récupérer les valeurs du formulaire
        const walletAddress = document.getElementById('wallet-address').value;
        const nodeName = document.getElementById('node-name').value;
        const stakeAmount = document.getElementById('stake-amount').value;
        const serverType = document.getElementById('server-type').value;
        const operatingSystem = document.getElementById('operating-system').value;
        
        // Générer la commande d'installation
        const command = `curl -sSL https://raw.githubusercontent.com/glowku/based-node-installer/main/install.sh | bash -s -- "${walletAddress}" "${nodeName}" "${stakeAmount}" "${serverType}" "${operatingSystem}"`;
        
        // Afficher la commande
        installCommand.textContent = command;
        
        // Afficher la section de commande
        commandSection.classList.remove('hidden');
        
        // Mettre à jour les étapes
        document.querySelector('.step').classList.add('completed');
        step2.classList.add('active');
        
        // Faire défiler jusqu'à la section de commande
        commandSection.scrollIntoView({ behavior: 'smooth' });
        
        // Afficher une notification
        showNotification('Commande générée avec succès!', 'success');
    });
    
    copyBtn.addEventListener('click', function() {
        // Copier la commande dans le presse-papiers
        navigator.clipboard.writeText(installCommand.textContent).then(function() {
            // Mettre à jour les étapes
            step2.classList.add('completed');
            step3.classList.add('active');
            
            // Afficher une notification
            showNotification('Commande copiée dans le presse-papiers!', 'success');
        }).catch(function(err) {
            // Afficher une notification d'erreur
            showNotification('Erreur lors de la copie: ' + err, 'error');
        });
    });
    
    function showNotification(message, type) {
        // Créer l'élément de notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Ajouter la notification au DOM
        document.body.appendChild(notification);
        
        // Afficher la notification
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Masquer et supprimer la notification après 3 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
});