#!/usr/bin/env node

/**
 * Script de déploiement automatisé pour DriveDeal
 * Ce script automatise le processus de déploiement des correctifs d'alignement et d'espacement.
 * 
 * Utilisation:
 * 1. Assurez-vous que Node.js est installé
 * 2. Rendez le script exécutable: chmod +x deploy.js
 * 3. Exécutez le script: ./deploy.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Configuration
const CONFIG = {
  cssFiles: [
    { source: 'styles/alignment-fixes.css', required: true },
    { source: 'styles/listings-fixes.css', required: true }
  ],
  appFile: 'pages/_app.js',
  listingsFiles: [
    'pages/listings.js',
    'pages/vehicles.js',
    'pages/cars.js'
  ],
  backupDir: '.backup',
  gitBranch: 'fix/spacing-alignment'
};

// Interface pour les interactions utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Fonction principale
async function main() {
  console.log('\n🚀 Démarrage du déploiement automatisé des correctifs DriveDeal\n');
  
  try {
    // Étape 1: Vérification de l'environnement
    checkEnvironment();
    
    // Étape 2: Création des sauvegardes
    await createBackups();
    
    // Étape 3: Vérification des fichiers CSS
    checkCssFiles();
    
    // Étape 4: Mise à jour de _app.js
    updateAppFile();
    
    // Étape 5: Recherche et mise à jour des fichiers de listings
    await updateListingsFiles();
    
    // Étape 6: Construction et déploiement
    await buildAndDeploy();
    
    console.log('\n✅ Déploiement terminé avec succès!\n');
    console.log('📋 Prochaines étapes recommandées:');
    console.log('1. Vérifiez le site en production');
    console.log('2. Testez sur différents appareils et navigateurs');
    console.log('3. Surveillez les performances avec Lighthouse ou PageSpeed Insights\n');
    
  } catch (error) {
    console.error(`\n❌ Erreur: ${error.message}`);
    console.log('\n🔄 Restauration des sauvegardes...');
    
    try {
      restoreBackups();
      console.log('✅ Restauration terminée');
    } catch (backupError) {
      console.error(`❌ Erreur lors de la restauration: ${backupError.message}`);
      console.log('⚠️ Vous devrez peut-être restaurer manuellement vos fichiers depuis le dossier .backup');
    }
  } finally {
    rl.close();
  }
}

// Vérification de l'environnement
function checkEnvironment() {
  console.log('🔍 Vérification de l\'environnement...');
  
  // Vérifier si nous sommes dans un projet Next.js
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json non trouvé. Assurez-vous d\'exécuter ce script à la racine de votre projet Next.js');
  }
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (!packageJson.dependencies || (!packageJson.dependencies.next && !packageJson.devDependencies?.next)) {
    throw new Error('Ce ne semble pas être un projet Next.js. Vérifiez que next est listé dans les dépendances');
  }
  
  console.log('✅ Environnement valide');
}

// Création des sauvegardes
async function createBackups() {
  console.log('💾 Création des sauvegardes...');
  
  // Demander confirmation
  const answer = await askQuestion('Voulez-vous créer une branche Git pour les modifications? (O/n): ');
  const useGit = answer.toLowerCase() !== 'n';
  
  if (useGit) {
    try {
      // Vérifier si Git est initialisé
      execSync('git status', { stdio: 'ignore' });
      
      // Créer une nouvelle branche
      execSync(`git checkout -b ${CONFIG.gitBranch}`, { stdio: 'inherit' });
      console.log(`✅ Branche Git '${CONFIG.gitBranch}' créée`);
      
    } catch (error) {
      console.log('⚠️ Git n\'est pas disponible ou n\'est pas initialisé. Utilisation de sauvegardes de fichiers à la place.');
      useGit = false;
    }
  }
  
  if (!useGit) {
    // Créer le répertoire de sauvegarde s'il n'existe pas
    if (!fs.existsSync(CONFIG.backupDir)) {
      fs.mkdirSync(CONFIG.backupDir, { recursive: true });
    }
    
    // Sauvegarder _app.js
    if (fs.existsSync(CONFIG.appFile)) {
      const backupPath = path.join(CONFIG.backupDir, path.basename(CONFIG.appFile));
      fs.copyFileSync(CONFIG.appFile, backupPath);
    }
    
    // Sauvegarder les fichiers de listings
    for (const file of CONFIG.listingsFiles) {
      if (fs.existsSync(file)) {
        const backupPath = path.join(CONFIG.backupDir, path.basename(file));
        fs.copyFileSync(file, backupPath);
      }
    }
    
    console.log(`✅ Sauvegardes créées dans le dossier '${CONFIG.backupDir}'`);
  }
}

// Vérification des fichiers CSS
function checkCssFiles() {
  console.log('🔍 Vérification des fichiers CSS...');
  
  for (const file of CONFIG.cssFiles) {
    if (!fs.existsSync(file.source)) {
      if (file.required) {
        throw new Error(`Fichier CSS requis non trouvé: ${file.source}`);
      } else {
        console.log(`⚠️ Fichier CSS optionnel non trouvé: ${file.source}`);
      }
    }
  }
  
  console.log('✅ Fichiers CSS vérifiés');
}

// Mise à jour de _app.js
function updateAppFile() {
  console.log('🔄 Mise à jour de _app.js...');
  
  if (!fs.existsSync(CONFIG.appFile)) {
    throw new Error(`Fichier ${CONFIG.appFile} non trouvé`);
  }
  
  let appContent = fs.readFileSync(CONFIG.appFile, 'utf8');
  let modified = false;
  
  // Vérifier et ajouter les imports CSS manquants
  for (const file of CONFIG.cssFiles) {
    const importStatement = `import '../${file.source}';`;
    if (!appContent.includes(importStatement)) {
      // Trouver la dernière ligne d'import
      const importLines = appContent.match(/import.*from.*|import\s+['"].*['"]/g) || [];
      
      if (importLines.length > 0) {
        const lastImport = importLines[importLines.length - 1];
        appContent = appContent.replace(lastImport, `${lastImport}\n${importStatement}`);
      } else {
        // Ajouter au début du fichier
        appContent = `${importStatement}\n${appContent}`;
      }
      
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(CONFIG.appFile, appContent);
    console.log(`✅ ${CONFIG.appFile} mis à jour avec les imports CSS`);
  } else {
    console.log(`ℹ️ ${CONFIG.appFile} contient déjà tous les imports nécessaires`);
  }
}

// Recherche et mise à jour des fichiers de listings
async function updateListingsFiles() {
  console.log('🔍 Recherche des fichiers de listings...');
  
  let listingsFile = null;
  
  // Chercher parmi les fichiers connus
  for (const file of CONFIG.listingsFiles) {
    if (fs.existsSync(file)) {
      listingsFile = file;
      break;
    }
  }
  
  // Si aucun fichier trouvé, demander à l'utilisateur
  if (!listingsFile) {
    console.log('⚠️ Aucun fichier de listings trouvé automatiquement');
    const customPath = await askQuestion('Veuillez entrer le chemin du fichier de listings (ou "skip" pour ignorer): ');
    
    if (customPath.toLowerCase() === 'skip') {
      console.log('ℹ️ Mise à jour des fichiers de listings ignorée');
      return;
    }
    
    if (!fs.existsSync(customPath)) {
      throw new Error(`Fichier ${customPath} non trouvé`);
    }
    
    listingsFile = customPath;
  }
  
  console.log(`🔄 Mise à jour du fichier de listings: ${listingsFile}`);
  
  // Lire le contenu du fichier
  let content = fs.readFileSync(listingsFile, 'utf8');
  
  // Vérifier si le fichier contient déjà les classes CSS
  const hasMainContainer = content.includes('listings-main-container');
  const hasPageLayout = content.includes('page-layout');
  const hasFiltersWrapper = content.includes('filters-wrapper');
  const hasFiltersSticky = content.includes('filters-sticky');
  
  if (hasMainContainer && hasPageLayout && hasFiltersWrapper && hasFiltersSticky) {
    console.log('ℹ️ Le fichier de listings contient déjà les classes CSS nécessaires');
    return;
  }
  
  // Demander confirmation avant de modifier
  const answer = await askQuestion('Le fichier de listings doit être mis à jour. Voulez-vous procéder? (O/n): ');
  if (answer.toLowerCase() === 'n') {
    console.log('ℹ️ Mise à jour du fichier de listings ignorée');
    return;
  }
  
  // Analyser le contenu pour identifier la structure
  let modified = false;
  
  // Rechercher le conteneur principal
  const mainContainerRegex = /<div\s+className=["']([^"']*container[^"']*)["']/;
  const mainContainerMatch = content.match(mainContainerRegex);
  
  if (mainContainerMatch) {
    const originalClassName = mainContainerMatch[1];
    if (!originalClassName.includes('listings-main-container')) {
      const newClassName = `${originalClassName} listings-main-container`;
      content = content.replace(
        `className="${originalClassName}"`, 
        `className="${newClassName}"`
      );
      modified = true;
    }
  }
  
  // Rechercher la structure de mise en page
  const layoutRegex = /<div\s+className=["']([^"']*(?:layout|grid|flex)[^"']*)["']/;
  const layoutMatch = content.match(layoutRegex);
  
  if (layoutMatch) {
    const originalClassName = layoutMatch[1];
    if (!originalClassName.includes('page-layout') || !originalClassName.includes('no-bottom-space')) {
      const newClassName = `${originalClassName} page-layout no-bottom-space`;
      content = content.replace(
        `className="${originalClassName}"`, 
        `className="${newClassName}"`
      );
      modified = true;
    }
  }
  
  // Rechercher le conteneur de filtres
  const filtersRegex = /<div\s+className=["']([^"']*(?:filter|sidebar)[^"']*)["']/;
  const filtersMatch = content.match(filtersRegex);
  
  if (filtersMatch) {
    // Ajouter les classes pour le wrapper de filtres si nécessaire
    if (!content.includes('filters-wrapper')) {
      const originalFiltersDiv = filtersMatch[0];
      const wrappedFiltersDiv = `<div className="filters-wrapper">\n        ${originalFiltersDiv}`;
      content = content.replace(originalFiltersDiv, wrappedFiltersDiv);
      
      // Ajouter la div de fermeture
      const closingDivIndex = findClosingDivIndex(content, content.indexOf(wrappedFiltersDiv) + wrappedFiltersDiv.length);
      if (closingDivIndex !== -1) {
        content = content.slice(0, closingDivIndex) + '\n      </div>' + content.slice(closingDivIndex);
      }
      
      modified = true;
    }
    
    // Ajouter les classes pour les filtres sticky si nécessaire
    const originalClassName = filtersMatch[1];
    if (!originalClassName.includes('filters-sticky') || !originalClassName.includes('no-bottom-space')) {
      const newClassName = `${originalClassName} filters-sticky no-bottom-space`;
      content = content.replace(
        `className="${originalClassName}"`, 
        `className="${newClassName}"`
      );
      modified = true;
    }
  }
  
  if (modified) {
    fs.writeFileSync(listingsFile, content);
    console.log(`✅ ${listingsFile} mis à jour avec les classes CSS nécessaires`);
  } else {
    console.log(`⚠️ Impossible de mettre à jour automatiquement ${listingsFile}`);
    console.log('ℹ️ Veuillez consulter le guide de déploiement pour les instructions manuelles');
  }
}

// Construction et déploiement
async function buildAndDeploy() {
  console.log('🏗️ Préparation du déploiement...');
  
  // Demander la méthode de déploiement
  const deployMethod = await askQuestion(
    'Choisissez la méthode de déploiement:\n' +
    '1. Git (push vers un dépôt distant)\n' +
    '2. Build manuel (npm run build)\n' +
    '3. Ignorer le déploiement\n' +
    'Votre choix (1-3): '
  );
  
  switch (deployMethod) {
    case '1':
      // Déploiement via Git
      console.log('🔄 Déploiement via Git...');
      
      try {
        // Ajouter les fichiers modifiés
        execSync('git add .', { stdio: 'inherit' });
        
        // Commit des changements
        execSync('git commit -m "Fix: Correction des problèmes d\'alignement et d\'espacement"', { stdio: 'inherit' });
        
        // Demander si on doit fusionner avec main
        const shouldMerge = await askQuestion('Voulez-vous fusionner avec la branche principale? (O/n): ');
        
        if (shouldMerge.toLowerCase() !== 'n') {
          const mainBranch = await askQuestion('Nom de la branche principale (main/master): ') || 'main';
          execSync(`git checkout ${mainBranch}`, { stdio: 'inherit' });
          execSync(`git merge ${CONFIG.gitBranch}`, { stdio: 'inherit' });
        }
        
        // Demander si on doit push
        const shouldPush = await askQuestion('Voulez-vous pousser les changements vers le dépôt distant? (O/n): ');
        
        if (shouldPush.toLowerCase() !== 'n') {
          execSync('git push', { stdio: 'inherit' });
          console.log('✅ Changements poussés vers le dépôt distant');
        }
      } catch (error) {
        throw new Error(`Erreur lors du déploiement Git: ${error.message}`);
      }
      break;
      
    case '2':
      // Build manuel
      console.log('🔄 Construction de l\'application...');
      
      try {
        // Détecter le gestionnaire de paquets
        const useYarn = fs.existsSync('yarn.lock');
        const buildCmd = useYarn ? 'yarn build' : 'npm run build';
        
        // Exécuter la commande de build
        execSync(buildCmd, { stdio: 'inherit' });
        console.log('✅ Build terminé avec succès');
        
        console.log('\nℹ️ Pour déployer manuellement:');
        console.log('1. Copiez le dossier .next ou out sur votre serveur');
        console.log('2. Ou utilisez la méthode de déploiement spécifique à votre hébergeur');
      } catch (error) {
        throw new Error(`Erreur lors du build: ${error.message}`);
      }
      break;
      
    case '3':
      console.log('ℹ️ Déploiement ignoré');
      break;
      
    default:
      console.log('⚠️ Option non valide, déploiement ignoré');
  }
}

// Restauration des sauvegardes
function restoreBackups() {
  // Vérifier si nous utilisons Git
  try {
    execSync('git status', { stdio: 'ignore' });
    
    // Annuler les modifications non validées
    execSync('git reset --hard HEAD', { stdio: 'inherit' });
    
    // Revenir à la branche précédente
    const branches = execSync('git branch', { encoding: 'utf8' });
    const currentBranch = branches.split('\n').find(b => b.startsWith('*')).substring(2);
    
    if (currentBranch === CONFIG.gitBranch) {
      // Trouver la branche précédente
      const otherBranches = branches.split('\n')
        .filter(b => b && !b.startsWith('*'))
        .map(b => b.trim());
      
      if (otherBranches.length > 0) {
        const mainBranch = otherBranches.find(b => ['main', 'master'].includes(b)) || otherBranches[0];
        execSync(`git checkout ${mainBranch}`, { stdio: 'inherit' });
        
        // Supprimer la branche de correctifs
        execSync(`git branch -D ${CONFIG.gitBranch}`, { stdio: 'inherit' });
      }
    }
    
    return;
  } catch (error) {
    // Git n'est pas disponible, utiliser les sauvegardes de fichiers
  }
  
  // Restaurer depuis les sauvegardes de fichiers
  if (fs.existsSync(CONFIG.backupDir)) {
    // Restaurer _app.js
    const appBackup = path.join(CONFIG.backupDir, path.basename(CONFIG.appFile));
    if (fs.existsSync(appBackup)) {
      fs.copyFileSync(appBackup, CONFIG.appFile);
    }
    
    // Restaurer les fichiers de listings
    for (const file of CONFIG.listingsFiles) {
      const backupFile = path.join(CONFIG.backupDir, path.basename(file));
      if (fs.existsSync(backupFile) && fs.existsSync(file)) {
        fs.copyFileSync(backupFile, file);
      }
    }
  }
}

// Fonction utilitaire pour poser une question
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Fonction utilitaire pour trouver la div de fermeture correspondante
function findClosingDivIndex(content, startIndex) {
  let openCount = 1;
  let index = startIndex;
  
  while (index < content.length && openCount > 0) {
    // Rechercher la prochaine balise d'ouverture ou de fermeture
    const openTag = content.indexOf('<div', index);
    const closeTag = content.indexOf('</div>', index);
    
    // Si aucune balise n'est trouvée, sortir
    if (openTag === -1 && closeTag === -1) break;
    
    // Déterminer quelle balise vient en premier
    if (openTag !== -1 && (closeTag === -1 || openTag < closeTag)) {
      openCount++;
      index = openTag + 1;
    } else {
      openCount--;
      index = closeTag + 1;
      
      if (openCount === 0) {
        return closeTag;
      }
    }
  }
  
  return -1;
}

// Exécuter le script
main().catch(error => {
  console.error(`\n❌ Erreur fatale: ${error.message}`);
  process.exit(1);
}); 