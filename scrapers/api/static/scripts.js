/**
 * scripts.js - Fonctionnalités JavaScript pour DriveDeal
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialisation des composants
    initializeTooltips();
    initializeDropdowns();
    initializeAlerts();
    
    // Gestion des formulaires
    setupForms();
    
    // Gestion des événements
    setupEventListeners();
});

/**
 * Initialise les infobulles
 */
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function() {
            const tooltipText = this.getAttribute('data-tooltip');
            const tooltipEl = document.createElement('div');
            tooltipEl.className = 'tooltip';
            tooltipEl.textContent = tooltipText;
            
            document.body.appendChild(tooltipEl);
            
            const rect = this.getBoundingClientRect();
            tooltipEl.style.top = rect.bottom + 10 + 'px';
            tooltipEl.style.left = rect.left + (rect.width / 2) - (tooltipEl.offsetWidth / 2) + 'px';
            
            setTimeout(() => tooltipEl.classList.add('visible'), 10);
        });
        
        tooltip.addEventListener('mouseleave', function() {
            const tooltipEl = document.querySelector('.tooltip');
            if (tooltipEl) {
                tooltipEl.classList.remove('visible');
                setTimeout(() => tooltipEl.remove(), 300);
            }
        });
    });
}

/**
 * Initialise les menus déroulants
 */
function initializeDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.dropdown-trigger');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        if (trigger && menu) {
            trigger.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                menu.classList.toggle('active');
                
                // Fermer les autres menus déroulants
                dropdowns.forEach(otherDropdown => {
                    if (otherDropdown !== dropdown) {
                        const otherMenu = otherDropdown.querySelector('.dropdown-menu');
                        if (otherMenu) otherMenu.classList.remove('active');
                    }
                });
            });
        }
    });
    
    // Fermer les menus déroulants lors d'un clic à l'extérieur
    document.addEventListener('click', function() {
        dropdowns.forEach(dropdown => {
            const menu = dropdown.querySelector('.dropdown-menu');
            if (menu) menu.classList.remove('active');
        });
    });
}

/**
 * Initialise les alertes avec fermeture
 */
function initializeAlerts() {
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        // Ajouter un bouton de fermeture s'il n'existe pas déjà
        if (!alert.querySelector('.alert-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'alert-close';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', function() {
                alert.classList.add('fade-out');
                setTimeout(() => alert.remove(), 300);
            });
            
            alert.appendChild(closeBtn);
        }
    });
}

/**
 * Configure les formulaires avec validation
 */
function setupForms() {
    const forms = document.querySelectorAll('form[data-validate]');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const isValid = validateForm(this);
            
            if (!isValid) {
                e.preventDefault();
                return false;
            }
        });
    });
}

/**
 * Valide un formulaire
 * @param {HTMLFormElement} form - Le formulaire à valider
 * @returns {boolean} - True si le formulaire est valide, sinon False
 */
function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Réinitialiser les messages d'erreur
    form.querySelectorAll('.error-message').forEach(el => el.remove());
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.classList.add('is-invalid');
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Ce champ est requis';
            
            field.parentNode.appendChild(errorMessage);
        }
    });
    
    // Validation des emails
    const emailFields = form.querySelectorAll('input[type="email"]');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    emailFields.forEach(field => {
        if (field.value.trim() && !emailRegex.test(field.value)) {
            isValid = false;
            field.classList.add('is-invalid');
            
            const errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            errorMessage.textContent = 'Adresse email invalide';
            
            field.parentNode.appendChild(errorMessage);
        }
    });
    
    return isValid;
}

/**
 * Configure les écouteurs d'événements
 */
function setupEventListeners() {
    // Exemple : Basculer le thème clair/sombre
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-theme');
            
            // Enregistrer la préférence dans localStorage
            const isDarkTheme = document.body.classList.contains('dark-theme');
            localStorage.setItem('dark-theme', isDarkTheme);
        });
        
        // Appliquer le thème enregistré
        const savedTheme = localStorage.getItem('dark-theme');
        if (savedTheme === 'true') {
            document.body.classList.add('dark-theme');
        }
    }
    
    // Exemple : Gestion de la navigation mobile
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuToggle && mobileMenu) {
        mobileMenuToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            mobileMenuToggle.classList.toggle('active');
        });
    }
}

/**
 * Fonction utilitaire pour créer des éléments DOM avec des attributs
 * @param {string} tag - Le tag HTML de l'élément à créer
 * @param {Object} attributes - Les attributs à ajouter à l'élément
 * @param {string|HTMLElement} content - Le contenu de l'élément
 * @returns {HTMLElement} - L'élément créé
 */
function createElement(tag, attributes = {}, content = '') {
    const element = document.createElement(tag);
    
    // Ajouter les attributs
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
    
    // Ajouter le contenu
    if (typeof content === 'string') {
        element.textContent = content;
    } else if (content instanceof HTMLElement) {
        element.appendChild(content);
    }
    
    return element;
}

/**
 * Fonction pour effectuer des requêtes API
 * @param {string} url - L'URL de l'API
 * @param {Object} options - Les options de la requête
 * @returns {Promise} - Une promesse avec les données de la réponse
 */
async function fetchAPI(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
} 