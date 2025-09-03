const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const Event = require('../models/Event');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

const router = express.Router();

/**
 * @route   POST /api/events/:id/notify-participants
 * @desc    Envoyer une notification à tous les participants d'un événement
 * @access  Private (Organisateur seulement)
 */
router.post('/:id/notify-participants', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, message, type = 'info' } = req.body;
    const userId = req.userId;

    // Validation
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Le sujet et le message sont requis'
      });
    }

    // Récupérer l'événement
    const event = await Event.findById(id)
      .populate('organizer', 'name email')
      .populate('participants.user', 'name email profile.notifications');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    // Vérifier que l'utilisateur est l'organisateur
    if (event.organizer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'organisateur peut envoyer des notifications'
      });
    }

    // Préparer la liste des destinataires
    const recipients = event.participants
      .filter(participant => 
        participant.user.profile?.notifications?.events !== false
      )
      .map(participant => ({
        email: participant.user.email,
        name: participant.user.name
      }));

    if (recipients.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Aucun participant n\'a activé les notifications',
        sentCount: 0
      });
    }

    // Préparer le template d'email
    const emailTemplate = {
      subject: `[TeamUp] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">TeamUp</h1>
            <h2 style="color: white; margin: 10px 0 0 0; font-weight: normal;">Notification d'événement</h2>
          </div>
          
          <div style="padding: 30px; background-color: #f8f9fa;">
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">${event.title}</h2>
              
              <div style="background: #${type === 'warning' ? 'fff3cd' : type === 'error' ? 'f8d7da' : 'e7f3ff'}; 
                          border-left: 4px solid #${type === 'warning' ? 'ffc107' : type === 'error' ? 'dc3545' : '007bff'}; 
                          padding: 15px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #333;">${subject}</h3>
                <p style="margin: 0; color: #666; line-height: 1.6;">${message}</p>
              </div>
              
              <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
                <h4 style="margin: 0 0 15px 0; color: #333;">Détails de l'événement :</h4>
                <p style="margin: 5px 0; color: #666;"><strong>📅 Date :</strong> ${event.date.toLocaleDateString('fr-FR')}</p>
                <p style="margin: 5px 0; color: #666;"><strong>⏰ Heure :</strong> ${event.time}</p>
                <p style="margin: 5px 0; color: #666;"><strong>📍 Lieu :</strong> ${event.location.address}</p>
                <p style="margin: 5px 0; color: #666;"><strong>🏃 Sport :</strong> ${event.sport}</p>
                <p style="margin: 5px 0; color: #666;"><strong>👥 Participants :</strong> ${event.currentParticipants}/${event.maxParticipants}</p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Voir l'événement
                </a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
                Organisé par ${event.organizer.name} • TeamUp<br>
                <a href="#" style="color: #667eea;">Se désabonner des notifications</a>
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Envoyer les emails
    let sentCount = 0;
    const errors = [];

    for (const recipient of recipients) {
      try {
        await sendEmail({
          to: recipient.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html
        });
        sentCount++;
      } catch (error) {
        console.error(`Erreur envoi email à ${recipient.email}:`, error);
        errors.push({
          email: recipient.email,
          error: error.message
        });
      }
    }

    // Enregistrer la notification dans l'événement
    if (!event.notifications) {
      event.notifications = [];
    }
    
    event.notifications.push({
      subject,
      message,
      type,
      sentAt: new Date(),
      sentBy: userId,
      recipientCount: sentCount
    });
    
    await event.save();

    res.json({
      success: true,
      message: `Notification envoyée à ${sentCount} participant(s)`,
      sentCount,
      totalRecipients: recipients.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Erreur lors de l\'envoi des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi des notifications'
    });
  }
});

/**
 * @route   POST /api/events/:id/remind-participants
 * @desc    Envoyer un rappel automatique aux participants
 * @access  Private (Organisateur seulement)
 */
router.post('/:id/remind-participants', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id)
      .populate('organizer', 'name email')
      .populate('participants.user', 'name email profile.notifications');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    if (event.organizer._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'organisateur peut envoyer des rappels'
      });
    }

    // Vérifier que l'événement est dans les prochaines 24h
    const now = new Date();
    const eventDateTime = new Date(`${event.date.toISOString().split('T')[0]}T${event.time}`);
    const hoursUntilEvent = (eventDateTime - now) / (1000 * 60 * 60);

    if (hoursUntilEvent > 24) {
      return res.status(400).json({
        success: false,
        message: 'Les rappels ne peuvent être envoyés que dans les 24h précédant l\'événement'
      });
    }

    if (hoursUntilEvent < 0) {
      return res.status(400).json({
        success: false,
        message: 'Impossible d\'envoyer un rappel pour un événement passé'
      });
    }

    // Utiliser la route de notification avec un message de rappel
    const reminderSubject = `Rappel : ${event.title} dans ${Math.round(hoursUntilEvent)}h`;
    const reminderMessage = `
      N'oubliez pas votre participation à l'événement "${event.title}" qui aura lieu ${
        hoursUntilEvent < 1 ? 'dans moins d\'une heure' : 
        hoursUntilEvent < 2 ? 'dans environ 1 heure' :
        `dans environ ${Math.round(hoursUntilEvent)} heures`
      }.
      
      Assurez-vous d'arriver à l'heure et d'apporter l'équipement nécessaire.
      
      À bientôt sur le terrain ! 🏃‍♂️
    `;

    // Réutiliser la logique de notification
    req.body = {
      subject: reminderSubject,
      message: reminderMessage,
      type: 'warning'
    };

    // Appeler la fonction de notification
    return router.stack[0].route.stack[0].handle(req, res);

  } catch (error) {
    console.error('Erreur lors de l\'envoi du rappel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'envoi du rappel'
    });
  }
});

/**
 * @route   GET /api/events/:id/notifications
 * @desc    Récupérer l'historique des notifications d'un événement
 * @access  Private (Organisateur seulement)
 */
router.get('/:id/notifications', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id)
      .populate('notifications.sentBy', 'name email')
      .select('notifications organizer');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement non trouvé'
      });
    }

    if (event.organizer.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Seul l\'organisateur peut voir les notifications'
      });
    }

    res.json({
      success: true,
      notifications: event.notifications || []
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des notifications'
    });
  }
});

module.exports = router;
