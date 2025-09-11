const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Vérifier les variables d'environnement email
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('⚠️ Variables d\'environnement EMAIL_USER ou EMAIL_PASSWORD manquantes');
      console.warn('⚠️ Le service email ne fonctionnera pas correctement');
      return;
    }

    // Configuration pour Gmail (vous pouvez changer pour un autre service)
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Votre email Gmail
        pass: process.env.EMAIL_PASSWORD, // Mot de passe d'application Gmail
      },
    });

    // Alternative avec configuration SMTP personnalisée
    /*
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true pour 465, false pour les autres ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    */
  }

  async sendPasswordResetCode(userEmail, resetCode, userName = '') {
    try {
      // Template HTML de l'email avec le code
      const htmlTemplate = this.getPasswordResetCodeTemplate(userName, resetCode, userEmail);

      // Options de l'email
      const mailOptions = {
        from: {
          name: 'TeamUp',
          address: process.env.EMAIL_USER || 'noreply@teamup.com'
        },
        to: userEmail,
        subject: '🔑 Code de réinitialisation TeamUp',
        html: htmlTemplate,
        // Version texte pour les clients qui ne supportent pas HTML
        text: `
Bonjour ${userName},

Votre code de réinitialisation TeamUp :

${resetCode}

Entrez ce code dans l'application pour créer un nouveau mot de passe.

Ce code expirera dans 10 minutes pour des raisons de sécurité.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

L'équipe TeamUp
        `
      };

      // Envoyer l'email
      const result = await this.transporter.sendMail(mailOptions);
      
              console.log('✅ Code de réinitialisation envoyé avec succès:', {
          messageId: result.messageId,
          to: userEmail,
          code: resetCode,
          timestamp: new Date().toISOString()
        });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi du code:', error);
      throw new Error('Impossible d\'envoyer le code de réinitialisation');
    }
  }

  getPasswordResetCodeTemplate(userName, resetCode, userEmail) {
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation de mot de passe - TeamUp</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #20B2AA, #17A2B8, #0891B2);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .icon {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .icon-circle {
            display: inline-block;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #20B2AA, #17A2B8);
            border-radius: 50%;
            line-height: 80px;
            font-size: 32px;
            color: white;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.6;
        }
        
                 .code-container {
             text-align: center;
             margin: 40px 0;
             background: #f8fafc;
             border-radius: 16px;
             padding: 30px;
             border: 2px solid #e5e7eb;
         }
         
         .reset-code {
             font-size: 48px;
             font-weight: bold;
             color: #20B2AA;
             letter-spacing: 8px;
             margin-bottom: 16px;
             background: linear-gradient(135deg, #20B2AA, #17A2B8, #0891B2);
             -webkit-background-clip: text;
             -webkit-text-fill-color: transparent;
             background-clip: text;
             font-family: 'Courier New', monospace;
         }
         
         .code-label {
             font-size: 14px;
             color: #6b7280;
             margin: 0;
             font-weight: 500;
         }
        
        .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #20B2AA;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
        }
        
        .info-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
        }
        
        .info-text {
            font-size: 14px;
            color: #6b7280;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 10px;
        }
        
        .security-note {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .container {
                margin: 0 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏆 TEAMUP</div>
            <div class="tagline">Votre plateforme sport préférée</div>
        </div>
        
        <div class="content">
            <div class="icon">
                <div class="icon-circle">🔑</div>
            </div>
            
                         <h1 class="title">Code de réinitialisation</h1>
             
             <p class="description">
                 Bonjour ${userName || 'cher utilisateur'},<br><br>
                 Voici votre code de réinitialisation TeamUp. 
                 Entrez ce code dans l'application pour créer un nouveau mot de passe.
             </p>
             
             <div class="code-container">
                 <div class="reset-code">
                     ${resetCode}
                 </div>
                 <p class="code-label">Code de vérification</p>
             </div>
            
                         <div class="info-box">
                 <div class="info-title">⏰ Important :</div>
                 <div class="info-text">
                     Ce code expirera dans <strong>10 minutes</strong> pour des raisons de sécurité.
                     Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
                 </div>
             </div>
             
             <p class="description">
                 Ouvrez l'application TeamUp et entrez ce code dans l'écran "Mot de passe oublié".<br>
                 <strong>Ne partagez jamais ce code avec qui que ce soit.</strong>
             </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                Cet email a été envoyé à <strong>${userEmail}</strong>
            </p>
            <p class="security-note">
                Pour votre sécurité, ne partagez jamais ce lien avec qui que ce soit.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Méthode pour tester la configuration email
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Configuration email valide');
      return true;
    } catch (error) {
      console.error('❌ Erreur de configuration email:', error);
      return false;
    }
  }

  async sendPasswordChangedConfirmation(userEmail, userName) {
    try {
      const mailOptions = {
        from: {
          name: 'TeamUp',
          address: process.env.EMAIL_USER || 'noreply@teamup.com'
        },
        to: userEmail,
        subject: '🔐 Mot de passe modifié - TeamUp',
        html: this.getPasswordChangedTemplate(userName, userEmail),
        // Version texte pour les clients qui ne supportent pas HTML
        text: `
Bonjour ${userName},

Votre mot de passe TeamUp a été modifié avec succès.

Détails de la modification :
- Date : ${new Date().toLocaleString('fr-FR')}
- Email : ${userEmail}

Si vous n'êtes pas à l'origine de cette modification, contactez immédiatement notre support.

Pour votre sécurité :
- Ne partagez jamais votre mot de passe
- Utilisez un mot de passe unique et fort
- Activez l'authentification à deux facteurs si disponible

L'équipe TeamUp
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email de confirmation mot de passe envoyé:', {
        messageId: result.messageId,
        to: userEmail,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        messageId: result.messageId
      };

    } catch (error) {
      console.error('❌ Erreur envoi confirmation mot de passe:', error);
      throw new Error('Impossible d\'envoyer l\'email de confirmation');
    }
  }

  getPasswordChangedTemplate(userName, userEmail) {
    const currentDate = new Date().toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mot de passe modifié - TeamUp</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #10B981, #059669, #047857);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .tagline {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .icon {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .icon-circle {
            display: inline-block;
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10B981, #059669);
            border-radius: 50%;
            line-height: 80px;
            font-size: 32px;
            color: white;
        }
        
        .title {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            text-align: center;
            line-height: 1.6;
        }
        
        .details-box {
            background-color: #f0f9f4;
            border-left: 4px solid #10B981;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
        }
        
        .details-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
        }
        
        .detail-label {
            color: #6b7280;
            font-weight: 500;
        }
        
        .detail-value {
            color: #1f2937;
            font-weight: 600;
        }
        
        .security-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .security-title {
            display: flex;
            align-items: center;
            font-weight: 600;
            color: #92400e;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .security-text {
            font-size: 14px;
            color: #92400e;
            line-height: 1.5;
        }
        
        .tips-list {
            background-color: #f9fafb;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .tips-title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 12px;
            font-size: 16px;
        }
        
        .tip-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .tip-icon {
            color: #10B981;
            margin-right: 8px;
            margin-top: 2px;
        }
        
        .tip-text {
            font-size: 14px;
            color: #4b5563;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            font-size: 14px;
            color: #9ca3af;
            margin-bottom: 10px;
        }
        
        .support-note {
            font-size: 12px;
            color: #6b7280;
            font-style: italic;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .container {
                margin: 0 10px;
            }
            
            .detail-item {
                flex-direction: column;
                gap: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏆 TEAMUP</div>
            <div class="tagline">Votre sécurité est notre priorité</div>
        </div>
        
        <div class="content">
            <div class="icon">
                <div class="icon-circle">✅</div>
            </div>
            
            <h1 class="title">Mot de passe modifié avec succès</h1>
            
            <p class="description">
                Bonjour ${userName || 'cher utilisateur'},<br><br>
                Votre mot de passe TeamUp a été modifié avec succès. Cette modification a été effectuée de manière sécurisée.
            </p>
            
            <div class="details-box">
                <div class="details-title">📋 Détails de la modification</div>
                <div class="detail-item">
                    <span class="detail-label">Date et heure :</span>
                    <span class="detail-value">${currentDate}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Compte :</span>
                    <span class="detail-value">${userEmail}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Action :</span>
                    <span class="detail-value">Réinitialisation par code de vérification</span>
                </div>
            </div>
            
            <div class="security-box">
                <div class="security-title">
                    🚨 Vous n'êtes pas à l'origine de cette modification ?
                </div>
                <div class="security-text">
                    Si vous n'avez pas demandé cette modification, votre compte pourrait être compromis. 
                    Contactez immédiatement notre support et changez votre mot de passe.
                </div>
            </div>
            
            <div class="tips-list">
                <div class="tips-title">🛡️ Conseils de sécurité</div>
                <div class="tip-item">
                    <span class="tip-icon">•</span>
                    <span class="tip-text">Utilisez un mot de passe unique et fort pour TeamUp</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">•</span>
                    <span class="tip-text">Ne partagez jamais votre mot de passe avec qui que ce soit</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">•</span>
                    <span class="tip-text">Connectez-vous toujours depuis l'application officielle</span>
                </div>
                <div class="tip-item">
                    <span class="tip-icon">•</span>
                    <span class="tip-text">Surveillez régulièrement l'activité de votre compte</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                Cet email a été envoyé à <strong>${userEmail}</strong>
            </p>
            <p class="support-note">
                Si vous avez des questions, contactez notre support depuis l'application TeamUp.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // Méthode pour envoyer des emails de bienvenue (bonus)
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const mailOptions = {
        from: {
          name: 'TeamUp',
          address: process.env.EMAIL_USER || 'noreply@teamup.com'
        },
        to: userEmail,
        subject: '🎉 Bienvenue sur TeamUp !',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #20B2AA, #17A2B8); padding: 30px; text-align: center; color: white;">
              <h1>🏆 Bienvenue sur TeamUp !</h1>
            </div>
            <div style="padding: 30px;">
              <h2>Salut ${userName} ! 👋</h2>
              <p>Merci de rejoindre notre communauté sportive ! Vous pouvez maintenant :</p>
              <ul>
                <li>🏃‍♂️ Découvrir des événements sportifs près de chez vous</li>
                <li>🎯 Créer vos propres événements</li>
                <li>🤝 Rencontrer d'autres passionnés de sport</li>
                <li>📊 Suivre vos statistiques et progrès</li>
              </ul>
              <p>Prêt à commencer votre aventure sportive ?</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:19006'}" 
                   style="background: linear-gradient(135deg, #20B2AA, #17A2B8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
                  Découvrir TeamUp
                </a>
              </div>
            </div>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email de bienvenue envoyé:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Erreur envoi email bienvenue:', error);
      throw error;
    }
  }
}

module.exports = new EmailService(); 