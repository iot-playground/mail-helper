'use server'
import { getComanyRevenue } from "../ai/financial-data"
import { readLastEmail } from "../mail/email-reader"
import { getContentForComany } from "../web-scrapper/web-scrapper"

export const getLastEmailAndComanyInfo = async () => {
    const emailData = await readLastEmail()

    if (emailData && emailData.from) {
        const company = emailData?.from.split('@')[1] || ''
        if (company) {
            const releavantContent = await getContentForComany(company)

            const revenue = await getComanyRevenue(company, releavantContent)

            emailData.revenueEur = revenue
        }
    }

    return emailData;
}