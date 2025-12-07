const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
    // For development only - remove in production
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
});

// Verify connection configuration (non-critical in development)
transporter.verify(function (error, success) {
    if (error) {
        // Only log as info in development since SMTP is optional
        if (process.env.NODE_ENV === 'development') {
            logger.info('SMTP not available (email features disabled in development)');
        } else {
            logger.error('SMTP connection error:', error);
        }
    } else {
        logger.info('SMTP server is ready to take our messages');
    }
});

/**
 * Send an email using a template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.template - Name of the EJS template file (without extension)
 * @param {Object} options.templateVars - Variables to pass to the template
 * @returns {Promise<Object>} - Result of the sendMail operation
 */
const sendEmail = async ({ to, subject, template, templateVars = {} }) => {
    try {
        // If in test environment, log the email instead of sending it
        if (process.env.NODE_ENV === 'test') {
            logger.info('Test email (not sent in test environment):', {
                to,
                subject,
                templateVars,
            });
            return { messageId: 'test-message-id' };
        }

        // Check if template exists
        const templatePath = path.join(
            __dirname,
            '..',
            'templates',
            'emails',
            `${template}.ejs`
        );

        if (!fs.existsSync(templatePath)) {
            throw new Error(`Email template not found: ${template}.ejs`);
        }

        // Render the email template
        const html = await ejs.renderFile(templatePath, {
            ...templateVars,
            appName: process.env.APP_NAME || 'AI Personal Trainer',
            appUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
            currentYear: new Date().getFullYear(),
        });

        // Send mail with defined transport object
        const info = await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'AI Personal Trainer'}" <${process.env.EMAIL_FROM || 'noreply@aipersonaltrainer.com'}>`,
            to,
            subject,
            html,
            text: html.replace(/<[^>]*>?/gm, ''), // Convert HTML to plain text
        });

        logger.info(`Email sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} token - Password reset token
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Result of the sendMail operation
 */
const sendPasswordResetEmail = async (to, token, name) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    return sendEmail({
        to,
        subject: 'Password Reset Request',
        template: 'password-reset',
        templateVars: {
            name,
            resetUrl,
            expiryHours: process.env.PASSWORD_RESET_EXPIRE || 24,
        },
    });
};

/**
 * Send a welcome email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<Object>} - Result of the sendMail operation
 */
const sendWelcomeEmail = async (to, name) => {
    return sendEmail({
        to,
        subject: 'Welcome to AI Personal Trainer',
        template: 'welcome',
        templateVars: { name },
    });
};

/**
 * Send an email verification email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @param {string} token - Email verification token
 * @returns {Promise<Object>} - Result of the sendMail operation
 */
const sendVerificationEmail = async (to, name, token) => {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    return sendEmail({
        to,
        subject: 'Verify Your Email Address',
        template: 'verify-email',
        templateVars: {
            name,
            verificationUrl,
        },
    });
};

module.exports = {
    sendEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail,
    sendVerificationEmail,
    transporter, // Export the transporter for direct use if needed
};
