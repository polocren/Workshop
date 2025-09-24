-- Script de création de la table planets pour Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprime la table si elle existe déjà (pour reset)
-- DROP TABLE IF EXISTS planets;

-- Création de la table planets
CREATE TABLE planets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(50) NOT NULL,
    distance VARCHAR(50) NOT NULL,
    diameter VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    position_x DECIMAL(10,2) DEFAULT 0,
    position_y DECIMAL(10,2) DEFAULT 0,
    position_z DECIMAL(10,2) DEFAULT 0,
    color VARCHAR(20) NOT NULL,
    size DECIMAL(5,2) NOT NULL,
    image VARCHAR(255),
    discovery_date VARCHAR(50),
    moons INTEGER DEFAULT 0,
    orbital_period VARCHAR(100),
    temperature VARCHAR(100),
    composition TEXT,
    -- Nouveaux champs pour e-commerce
    price NUMERIC(10,2) DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    owner_id UUID NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Index pour améliorer les performances de recherche
CREATE INDEX idx_planets_name ON planets(name);
CREATE INDEX idx_planets_type ON planets(type);

-- Politique RLS (Row Level Security) - optionnel selon vos besoins
-- ALTER TABLE planets ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre la lecture publique (ajustez selon vos besoins)
-- CREATE POLICY "Enable read access for all users" ON planets FOR SELECT USING (true);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour updated_at automatiquement
CREATE TRIGGER update_planets_updated_at BEFORE UPDATE ON planets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insertion des données initiales du système solaire
INSERT INTO planets (
    name, type, distance, diameter, description,
    position_x, position_y, position_z, color, size, image,
    discovery_date, moons, orbital_period, temperature, composition
) VALUES 
(
    'Soleil', 'Étoile', '0 UA', '1,392,700 km',
    'Le Soleil est l''étoile centrale de notre système solaire. Il contient 99,86% de la masse du système solaire.',
    0, 0, 0, '0xFFAA00', 3, '/images/planets/soleil.svg',
    NULL, 0, NULL, '5778 K', 'Hydrogène (73%), Hélium (25%)'
),
(
    'Mercure', 'Planète rocheuse', '0,39 UA', '4,879 km',
    'Mercure est la planète la plus proche du Soleil et la plus petite du système solaire.',
    6, 1, 2, '0x8C6239', 0.8, '/images/planets/mercure.svg',
    'Antiquité', 0, '88 jours terrestres', '167°C (moyenne)', 'Fer, Nickel, Roches'
),
(
    'Vénus', 'Planète rocheuse', '0,72 UA', '12,104 km',
    'Vénus est la deuxième planète du système solaire. Elle est souvent appelée ''l''étoile du berger''.',
    -7, -2, -5, '0xFFCC33', 1.0, '/images/planets/venus.svg',
    'Antiquité', 0, '225 jours terrestres', '464°C', 'Roches, Atmosphère de CO2'
),
(
    'Terre', 'Planète rocheuse', '1 UA', '12,756 km',
    'La Terre est notre planète natale, la seule connue à abriter la vie dans l''univers.',
    9, 3, 8, '0x2E8B57', 1.1, '/images/planets/terre.svg',
    NULL, 1, '365,25 jours', '15°C (moyenne)', 'Roches, Eau, Atmosphère N2/O2'
),
(
    'Mars', 'Planète rocheuse', '1,52 UA', '6,792 km',
    'Mars est surnommée la ''planète rouge'' en raison de l''oxyde de fer présent à sa surface.',
    -12, -1, 11, '0xCD5C5C', 0.9, '/images/planets/mars.svg',
    'Antiquité', 2, '687 jours terrestres', '-65°C (moyenne)', 'Roches, Oxyde de fer'
),
(
    'Jupiter', 'Géante gazeuse', '5,20 UA', '142,984 km',
    'Jupiter est la plus grande planète du système solaire, une géante gazeuse avec plus de 80 lunes.',
    18, 4, -15, '0xD2691E', 2.2, '/images/planets/jupiter.svg',
    'Antiquité', 95, '11,86 années terrestres', '-110°C', 'Hydrogène, Hélium'
),
(
    'Saturne', 'Géante gazeuse', '9,58 UA', '120,536 km',
    'Saturne est célèbre pour son système d''anneaux spectaculaire composé de glace et de roche.',
    -25, -3, 20, '0xFAD5A5', 2.0, '/images/planets/saturne.svg',
    'Antiquité', 146, '29,46 années terrestres', '-140°C', 'Hydrogène, Hélium, Anneaux de glace'
),
(
    'Uranus', 'Géante de glace', '19,18 UA', '51,118 km',
    'Uranus est une planète unique qui tourne sur le côté, probablement à cause d''une collision ancienne.',
    35, 2, 25, '0x00FFFF', 1.5, '/images/planets/uranus.svg',
    '1781', 28, '84 années terrestres', '-195°C', 'Eau, Méthane, Ammoniac'
),
(
    'Neptune', 'Géante de glace', '30,07 UA', '49,528 km',
    'Neptune est la planète la plus éloignée du Soleil, avec des vents atteignant 2,100 km/h.',
    -40, -4, -35, '0x0000FF', 1.4, '/images/planets/neptune.svg',
    '1846', 16, '165 années terrestres', '-200°C', 'Eau, Méthane, Ammoniac'
);

-- Vérification des données insérées
SELECT id, name, type, position_x, position_y, position_z FROM planets ORDER BY name;

-- -----------------------------
-- Achats: table purchases
-- -----------------------------
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    planet_id UUID NOT NULL REFERENCES planets(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchases_planet ON purchases(planet_id);

-- Facultatif: si vous voulez référencer auth.users
-- ALTER TABLE planets ADD CONSTRAINT planets_owner_fkey FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL;
-- ALTER TABLE purchases ADD CONSTRAINT purchases_buyer_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;
