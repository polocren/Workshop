#!/usr/bin/env node

require('dotenv').config();

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

async function testSupabaseSetup() {
  console.log(`${colors.blue} Test de configuration Supabase${colors.reset}\n`);
  
  // Vérifier les variables d'environnement
  console.log('1. Vérification des variables d\'environnement...');
  
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  let allVarsPresent = true;
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      console.log(`   ${varName} : configurée`);
    } else {
      console.log(`   ${varName} : manquante`);
      allVarsPresent = false;
    }
  }
  
  if (!allVarsPresent) {
    console.log(`\n${colors.red} Variables d'environnement manquantes${colors.reset}`);
    console.log(`${colors.yellow} Vérifiez votre fichier .env${colors.reset}`);
    return false;
  }
  
  // Tester la connexion Supabase
  console.log('\n2. Test de connexion Supabase...');
  
  try {
    const supabaseConfig = require('../config/supabase');
    const isConnected = await supabaseConfig.testConnection();
    
    if (isConnected) {
      console.log(`   Connexion Supabase réussie`);
    } else {
      console.log(`   Connexion Supabase échouée`);
      return false;
    }
  } catch (error) {
    console.log(`   Erreur de connexion: ${error.message}`);
    return false;
  }
  
  // Tester le service
  console.log('\n3. Test du service Supabase...');
  
  try {
    const supabasePlanetService = require('../services/supabasePlanetService');
    const planets = await supabasePlanetService.getAllPlanets();
    
    console.log(`   Service fonctionnel (${planets.length} planètes trouvées)`);
    
    if (planets.length === 0) {
      console.log(`  ${colors.yellow}  Aucune planète dans la base. Lancez la migration:${colors.reset}`);
      console.log(`     node scripts/migrate-to-supabase.js`);
    }
    
  } catch (error) {
    console.log(`   Erreur service: ${error.message}`);
    return false;
  }
  
  // Test de création/lecture/suppression
  console.log('\n4. Test CRUD...');
  
  try {
    const supabasePlanetService = require('../services/supabasePlanetService');
    
    // Créer une planète de test
    const testPlanet = {
      name: 'Test Planet ' + Date.now(),
      type: 'Test',
      distance: '1 UA',
      diameter: '1000 km',
      description: 'Planète de test créée automatiquement',
      position: { x: 0, y: 0, z: 0 },
      color: '0xFFFFFF',
      size: 1
    };
    
    const created = await supabasePlanetService.createPlanet(testPlanet);
    console.log(`   Création réussie (ID: ${created.id})`);
    
    // Lire la planète
    const read = await supabasePlanetService.getPlanetById(created.id);
    console.log(`   Lecture réussie (${read.name})`);
    
    // Supprimer la planète de test
    await supabasePlanetService.deletePlanet(created.id);
    console.log(`   Suppression réussie`);
    
  } catch (error) {
    console.log(`   Erreur CRUD: ${error.message}`);
    return false;
  }
  
  console.log(`\n${colors.green} Configuration Supabase parfaitement fonctionnelle !${colors.reset}`);
  console.log(`${colors.blue}Pour utiliser Supabase, changez DATABASE_TYPE=supabase dans .env${colors.reset}`);
  
  return true;
}

// Point d'entrée
if (require.main === module) {
  testSupabaseSetup()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(`\n${colors.red}ERREUR FATALE:${colors.reset}`, error);
      process.exit(1);
    });
}

module.exports = { testSupabaseSetup };
