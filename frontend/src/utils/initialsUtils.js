/**
 * Utilitaires pour générer les initiales des noms
 */

/**
 * Génère les initiales à partir d'un nom complet
 * @param {string} fullName - Le nom complet (ex: "NASSIM BOULAMIZAT")
 * @returns {string} - Les initiales (ex: "NB")
 */
export const generateInitials = (fullName) => {
  if (!fullName || typeof fullName !== 'string') {
    return 'U'; // Default pour "User"
  }

  // Nettoyer le nom et le diviser en mots
  const words = fullName.trim().split(/\s+/);
  
  if (words.length === 0) {
    return 'U';
  }

  // Si un seul mot, prendre les 2 premiers caractères
  if (words.length === 1) {
    const word = words[0];
    return word.length >= 2 ? word.substring(0, 2).toUpperCase() : word.toUpperCase();
  }

  // Si plusieurs mots, prendre la première lettre de chaque mot (max 2)
  const initials = words
    .slice(0, 2) // Prendre seulement les 2 premiers mots
    .map(word => word.charAt(0).toUpperCase())
    .join('');

  return initials || 'U';
};

/**
 * Génère les initiales à partir du prénom et nom séparés
 * @param {string} firstName - Le prénom
 * @param {string} lastName - Le nom de famille
 * @returns {string} - Les initiales
 */
export const generateInitialsFromParts = (firstName, lastName) => {
  const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
  const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
  
  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }
  
  if (firstInitial) {
    return firstInitial;
  }
  
  if (lastInitial) {
    return lastInitial;
  }
  
  return 'U';
};

/**
 * Obtient la couleur de fond pour les initiales basée sur le nom
 * @param {string} name - Le nom pour générer une couleur
 * @returns {string} - La couleur hexadécimale
 */
export const getInitialsBackgroundColor = (name) => {
  if (!name) return '#64748b'; // Couleur par défaut

  // Couleurs disponibles pour les avatars
  const colors = [
    '#ef4444', // Rouge
    '#f97316', // Orange
    '#eab308', // Jaune
    '#22c55e', // Vert
    '#06b6d4', // Cyan
    '#3b82f6', // Bleu
    '#8b5cf6', // Violet
    '#ec4899', // Rose
    '#84cc16', // Lime
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#a855f7', // Purple
    '#d946ef', // Fuchsia
    '#14b8a6', // Teal
  ];

  // Générer un index basé sur le nom pour une couleur consistante
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

/**
 * Composant d'avatar avec initiales
 * @param {Object} props - Les propriétés
 * @param {string} props.name - Le nom complet
 * @param {string} props.firstName - Le prénom (optionnel)
 * @param {string} props.lastName - Le nom de famille (optionnel)
 * @param {number} props.size - La taille de l'avatar (défaut: 40)
 * @param {string} props.backgroundColor - Couleur de fond personnalisée (optionnel)
 * @param {Object} props.style - Styles additionnels (optionnel)
 * @returns {Object} - Objet avec les propriétés pour l'avatar
 */
export const getAvatarProps = ({ 
  name, 
  firstName, 
  lastName, 
  size = 40, 
  backgroundColor, 
  style = {} 
}) => {
  const initials = firstName && lastName 
    ? generateInitialsFromParts(firstName, lastName)
    : generateInitials(name);
  
  const bgColor = backgroundColor || getInitialsBackgroundColor(name || initials);
  
  return {
    initials,
    backgroundColor: bgColor,
    size,
    style: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: bgColor,
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }
  };
};
