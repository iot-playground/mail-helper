'use server';

import * as cheerio from 'cheerio';
import { google } from 'googleapis';

if (!process.env.GOOGLE_SEARCH_API_KEY || !process.env.GOOGLE_SEARCH_CX) {
    throw new Error('Missing required environment variables: GOOGLE_SEARCH_API_KEY and/or GOOGLE_SEARCH_CX');
}

const getSearchResults = async (query: string) => {
    let links = [] as string[];

    try {
        const customsearch = google.customsearch('v1');
        
        const res = await customsearch.cse.list({
            cx: process.env.GOOGLE_SEARCH_CX,
            q: query,
            auth: process.env.GOOGLE_SEARCH_API_KEY,
        });

        const data = res.data;

        links = (data.items || [])
            .map((item) => item.link || '')
            .filter((link: string) => !link.endsWith('.pdf')).slice(0, 3);

        console.log('Links:', links);
    } catch (error) {
        console.error('Error fetching search results:', error);
    }

    return links;
}

const getTextForUrl = async (url: string) => {
    let text = '';

    try {
        const response = await fetch(url);
        const resp = await response.text();
        const $ = cheerio.load(resp);

        // Extract text from the entire body and remove new lines and extra spaces
        text = $('body').text().replace(/^\s*[\r\n]/gm, '').trim();
    } catch (error) {
        console.error('Error fetching website:', error);
    }

    return text;
}

export const getContentForComany = async (company: string) => {
    const links = await getSearchResults(`financial statement for company ${company} in year 2023`)

    const relevantContent = [];

    for (const link of links) {
        const text = await getTextForUrl(link as string);
        relevantContent.push(text);
    }

    return relevantContent;
}