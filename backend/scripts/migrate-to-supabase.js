const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const supabasePlanetService = require('../services/supabasePlanetService');

async function migratePlanetsToSupabase() {
  console.log('Démarrage de la migration vers Supabase...\n');
  
  try {
    // Tester la connexion Supabase
    console.log('Test de connexion à Supabase...');
    const isConnected = await supabasePlanetService.testConnection();
    
    if (!isConnected) {
      throw new Error('Impossible de se connecter à Supabase. Vérifiez vos variables d\'environnement.');
    }
    
    // Charger les données JSON existantes
    console.log('Chargement des données JSON existantes...');
    const jsonPath = path.join(__dirname, '../data/planets.json');
    const jsonData = await fs.readFile(jsonPath, 'utf8');
    const { planets: jsonPlanets } = JSON.parse(jsonData);
    
    console.log(`${jsonPlanets.length} planètes trouvées dans le fichier JSON\n`);
    
    // Vérifier si des planètes existent déjà dans Supabase
    console.log('Vérification des données existantes dans Supabase...');
    const existingPlanets = await supabasePlanetService.getAllPlanets();
    
    if (existingPlanets.length > 0) {
      console.log(`ATTENTION: ${existingPlanets.length} planètes déjà présentes dans Supabase`);
      console.log('Souhaitez-vous continuer ? Cette migration va créer des doublons.\n');
      
      // En production, vous pourriez ajouter une confirmation ici
      // Pour ce script, on continue quand même
    }
    
    // Migrer chaque planète
    let successCount = 0;
    let errorCount = 0;
    
    for (const planet of jsonPlanets) {
      try {
        console.log(`Migration de ${planet.name}...`);
        
        // Convertir les données au bon format
        const planetData = {
          name: planet.name,
          type: planet.type,
          distance: planet.distance,
          diameter: planet.diameter,
          description: planet.description,
          position: planet.position,
          color: planet.color,
          size: planet.size,
          image: planet.image,
          discoveryDate: planet.discoveryDate,
          moons: planet.moons,
          orbitalPeriod: planet.orbitalPeriod,
          temperature: planet.temperature,
          composition: planet.composition
        };
        
        await supabasePlanetService.createPlanet(planetData);
        console.log(`  SUCCÈS: ${planet.name} migrée avec succès`);
        successCount++;
        
      } catch (error) {
        console.log(`  ERREUR: ${planet.name}: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\nRésultats de la migration:');
    console.log(`Réussies: ${successCount}`);
    console.log(`Échouées: ${errorCount}`);
    console.log(`Total: ${successCount + errorCount}`);
    
    if (successCount === jsonPlanets.length) {
      console.log('\nMigration terminée avec succès !');
      console.log('Vous pouvez maintenant utiliser Supabase comme source de données.');
    } else {
      console.log('\nMigration partiellement réussie. Vérifiez les erreurs ci-dessus.');
    }
    
    // Vérification finale
    console.log('\nVérification finale...');
    const finalPlanets = await supabasePlanetService.getAllPlanets();
    console.log(`${finalPlanets.length} planètes maintenant dans Supabase`);
    
  } catch (error) {
    console.error('Erreur lors de la migration:', error.message);
    process.exit(1);
  }
}

// Fonction pour afficher l'aide
function showHelp() {
  console.log(`
Script de migration SpaceMap vers Supabase

Usage: node migrate-to-supabase.js

Ce script migre les données de planets.json vers votre base de données Supabase.

Prérequis:
1. Avoir un projet Supabase configuré
2. Avoir exécuté le script SQL supabase-setup.sql
3. Avoir configuré les variables d'environnement dans .env:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY

Le script va:
1. Tester la connexion à Supabase
2. Charger les données JSON existantes
3. Migrer chaque planète vers Supabase
4. Afficher un rapport de migration
  `);
}

// Point d'entrée principal
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    process.exit(0);
  }
  
  migratePlanetsToSupabase()
    .then(() => {
      console.log('\nMigration terminée !');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nErreur fatale:', error);
      process.exit(1);
    });
}

module.exports = { migratePlanetsToSupabase };