const mongoose = require('mongoose');

const passwordResetCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    length: 6
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    index: { expireAfterSeconds: 0 } // MongoDB supprimera automatiquement après expiration
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Maximum 5 tentatives
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index composé pour recherches efficaces
passwordResetCodeSchema.index({ email: 1, code: 1 });
passwordResetCodeSchema.index({ userId: 1, isUsed: 1 });

// Méthode statique pour générer un code
passwordResetCodeSchema.statics.generateCode = function() {
  // Génère un code de 6 chiffres aléatoire
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Méthode statique pour créer un nouveau code
passwordResetCodeSchema.statics.createResetCode = async function(userId, email) {
  // Invalider tous les codes existants pour cet utilisateur
  await this.updateMany(
    { userId, isUsed: false },
    { isUsed: true }
  );

  // Générer un nouveau code
  const code = this.generateCode();
  
  // Créer l'entrée
  const resetCode = new this({
    email,
    code,
    userId,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  });

  await resetCode.save();
  return code;
};

// Méthode statique pour valider un code
passwordResetCodeSchema.statics.validateCode = async function(email, code) {
  const resetCode = await this.findOne({
    email: email.toLowerCase(),
    code,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  }).populate('userId');

  if (!resetCode) {
    return { success: false, error: 'Code invalide ou expiré' };
  }

  // Incrémenter les tentatives
  resetCode.attempts += 1;
  await resetCode.save();

  // Vérifier le nombre de tentatives
  if (resetCode.attempts > 5) {
    resetCode.isUsed = true;
    await resetCode.save();
    return { success: false, error: 'Trop de tentatives. Demandez un nouveau code.' };
  }

  return { 
    success: true, 
    userId: resetCode.userId._id,
    user: resetCode.userId,
    codeId: resetCode._id
  };
};

// Méthode statique pour marquer un code comme utilisé
passwordResetCodeSchema.statics.markAsUsed = async function(codeId) {
  await this.findByIdAndUpdate(codeId, { isUsed: true });
};

// Méthode pour vérifier si le code a expiré
passwordResetCodeSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Méthode pour obtenir le temps restant en minutes
passwordResetCodeSchema.methods.getTimeRemaining = function() {
  const remaining = this.expiresAt - new Date();
  return Math.max(0, Math.ceil(remaining / (1000 * 60)));
};

const PasswordResetCode = mongoose.model('PasswordResetCode', passwordResetCodeSchema);

module.exports = PasswordResetCode; 