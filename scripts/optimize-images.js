/**
 * Script pour optimiser les images dans le projet DriveDeal
 * 
 * Ce script recherche tous les composants qui utilisent le composant Image de Next.js
 * et ajoute les attributs loading="lazy" et priority lorsque nécessaire.
 * 
 * Instructions d'utilisation :
 * 1. Exécutez ce script avec Node.js : node scripts/optimize-images.js
 * 2. Le script analysera les fichiers et suggérera des modifications
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const rootDir = path.resolve(__dirname, '..');
const componentsToOptimize = [
  'components/**/*.js',
  'components/**/*.jsx',
  'components/**/*.tsx',
  'pages/**/*.js',
  'pages/**/*.jsx',
  'pages/**/*.tsx'
];

// Images critiques qui devraient avoir priority=true
const criticalImages = [
  'HeroSection', // Images de héros en haut de page
  'Logo',        // Logos
  'Banner',      // Bannières importantes
  'Header'       // Images dans l'en-tête
];

// Fonction pour vérifier si un composant contient une image critique
function isImageCritical(fileContent, componentName) {
  return criticalImages.some(criticalComponent => 
    componentName.includes(criticalComponent) || 
    fileContent.includes(`className="hero`) ||
    fileContent.includes(`className="banner`) ||
    fileContent.includes(`className="logo`)
  );
}

// Fonction pour optimiser les balises Image
function optimizeImageTags(fileContent, fileName) {
  const componentName = path.basename(fileName, path.extname(fileName));
  const isCritical = isImageCritical(fileContent, componentName);
  
  // Regex pour trouver les balises Image sans loading ou priority
  const imageTagRegex = /<Image\s+([^>]*?)(?:\s*\/?>|\s*>\s*<\/Image>)/gs;
  
  return fileContent.replace(imageTagRegex, (match, attributes) => {
    // Vérifier si les attributs loading ou priority existent déjà
    const hasLoading = /loading\s*=\s*["']/.test(attributes);
    const hasPriority = /priority\s*=\s*["']/.test(attributes);
    
    // Ne pas modifier si les attributs existent déjà
    if (hasLoading && hasPriority) {
      return match;
    }
    
    // Ajouter les attributs manquants
    let newAttributes = attributes;
    
    if (!hasLoading) {
      newAttributes += ` loading="lazy"`;
    }
    
    if (!hasPriority && isCritical) {
      newAttributes += ` priority={true}`;
    } else if (!hasPriority) {
      newAttributes += ` priority={false}`;
    }
    
    // Reconstruire la balise Image
    if (match.endsWith('/>')) {
      return `<Image ${newAttributes} />`;
    } else {
      return `<Image ${newAttributes}>`;
    }
  });
}

// Fonction principale
async function main() {
  console.log('🔍 Recherche des fichiers à optimiser...');
  
  // Trouver tous les fichiers correspondant aux patterns
  const files = [];
  for (const pattern of componentsToOptimize) {
    const matches = glob.sync(pattern, { cwd: rootDir });
    files.push(...matches.map(file => path.join(rootDir, file)));
  }
  
  console.log(`📋 ${files.length} fichiers trouvés pour optimisation.`);
  
  // Optimiser chaque fichier
  let optimizedCount = 0;
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Vérifier si le fichier contient des balises Image
      if (content.includes('<Image')) {
        const optimizedContent = optimizeImageTags(content, file);
        
        // Si le contenu a été modifié
        if (optimizedContent !== content) {
          fs.writeFileSync(file, optimizedContent, 'utf8');
          console.log(`✅ Optimisé: ${path.relative(rootDir, file)}`);
          optimizedCount++;
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de l'optimisation de ${file}:`, error.message);
    }
  }
  
  console.log(`\n🎉 Optimisation terminée! ${optimizedCount} fichiers ont été optimisés.`);
  console.log('\nRecommandations supplémentaires:');
  console.log('1. Vérifiez manuellement les images critiques pour confirmer que priority={true} est utilisé correctement.');
  console.log('2. Assurez-vous que les dimensions (width et height) sont spécifiées pour toutes les images.');
  console.log('3. Considérez l'utilisation de formats d'image modernes comme WebP ou AVIF pour de meilleures performances.');
}

main().catch(console.error); 