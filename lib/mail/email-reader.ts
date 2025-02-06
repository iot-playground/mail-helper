'use server'

import imaps from "imap-simple";
import { simpleParser } from "mailparser";

if (!process.env.EMAIL_USER) {
    throw new Error('EMAIL_USER environment variable is not set.');
}

if (!process.env.EMAIL_PASSWORD) {
    throw new Error('EMAIL_PASSWORD environment variable is not set.');
}

if (!process.env.EMAIL_HOST) {
    throw new Error('EMAIL_HOST environment variable is not set.');
}

if (!process.env.EMAIL_PORT) {
    throw new Error('EMAIL_PORT environment variable is not set.');
}

if (!process.env.EMAIL_TLS) {
    throw new Error('EMAIL_TLS environment variable is not set.');
}

if (!process.env.EMAIL_AUTH_TIMEOUT) {
    throw new Error('EMAIL_AUTH_TIMEOUT environment variable is not set.');
}

// IMAP Configuration
const config = {
    imap: {
        user: process.env.EMAIL_USER,
        password: process.env.EMAIL_PASSWORD,
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 993,
        tls: process.env.EMAIL_TLS.toLowerCase() === 'true',
        authTimeout: process.env.EMAIL_AUTH_TIMEOUT ? Number(process.env.EMAIL_AUTH_TIMEOUT) : 3000,
        tlsOptions: {
            rejectUnauthorized: false
        }
    }
};

const getLastMonthDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0]; // Format: YYYY-MM-DD
}

export const readLastEmail = async () => {
    const ret = {
        date: undefined as Date | undefined,
        subject: '' as string | undefined,
        from: '',
        fromName: '',
        body: '',
        revenueEur: ''
    }

    try {
        const connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        const lastMonthDate = getLastMonthDate();

        const searchCriteria = [['SINCE', lastMonthDate]]; // Emails since last month

        const fetchOptions = { bodies: [''], struct: true };

        const messages = await connection.search(searchCriteria, fetchOptions);

        console.log(`Found ${messages.length} messages.`);

        if (messages.length > 0) {
            const message = messages[messages.length - 1];
            const allBodyParts = message.parts.filter(part => part.which === '');
            const fullEmailBody = allBodyParts.map(part => part.body).join('');

            const parsedEmail = await simpleParser(fullEmailBody);

            // console.log('📩 New Email Received:');
            // console.log('📅 Date:', parsedEmail.date);
            // console.log('📝 Subject:', parsedEmail.subject);
            // console.log('✉️ From:', parsedEmail.from?.value[0].address);
            // console.log('✉️ From name:', parsedEmail.from?.value[0].name);
            // console.log('------------------------------------');
            ret.date = parsedEmail.date;
            ret.subject = parsedEmail.subject;
            ret.from = parsedEmail.from?.value[0].address || '';
            ret.fromName = parsedEmail.from?.value[0].name || '';
            ret.body = parsedEmail.text || '';
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }

    return ret;
}
