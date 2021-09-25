#!/usr/bin/env ts-node
import puppeteer, { Page } from 'puppeteer';
import { getPuppetBrowser, ResolverModule, SearchCandidate, SongText } from "../resolver";

export const HOP_AM_CHUAN_RESOLVER: ResolverModule = {
    matchSongUrl: matchHopAmChuanSongUrl,
    getSongText: getHopAmChuanSongText,
    searchSongs: searchSongs,
}

const HOP_AM_CHUAN_SONG_URL_REGEXP = /^https?:\/\/hopamchuan.com\/song\//;

function matchHopAmChuanSongUrl(url: string) {
    return HOP_AM_CHUAN_SONG_URL_REGEXP.exec(url) !== null;
}

async function getHopAmChuanSongText(songUrl: string, transposition: number): Promise<SongText> {
    const browser = await getPuppetBrowser();
    let page = null;

    try {
        page = await browser.newPage();
        await page.goto(songUrl);

        if (transposition !== 0) {
            await transpose(page, transposition);
        }

        const text = await page.$eval('#song-lyric', node => (node as HTMLElement).innerText);
        const title = await page.$eval('#song-title', node => (node as HTMLElement).innerText);
        const artist = await page.$$eval('#song-author .author-item', nodes => (nodes as HTMLElement[]).map(n => n.innerText).join(', '));

        return {
            title: title,
            artists: [artist],
            text: text,
            // TODO wrap around?
            transposition: transposition,
        }
    } finally {
        if (page) {
            await page.close();
        }
    }
}

async function transpose(page: Page, transposition: number) {
    const transposeButton = await page.$(`#tool-box i.fa.fa-fw.fa-${transposition > 0 ? 'plus' : 'minus'}`);
    // TODO Delay between clicks? What if we can't click?
    await transposeButton?.click({clickCount: transposition});
}

async function searchSongs(keyword: string): Promise<SearchCandidate[]> {
    const browser = await getPuppetBrowser();

    const page = await browser.newPage();
    await page.goto(`https://hopamchuan.com/search?q=${encodeURIComponent(keyword)}`);

    return await page.$$eval('#page-content .song-item', function (elems) {
        const results: SearchCandidate[] = [];

        for (const elem of elems) {
            let title = (elem.querySelector('.song-title-singers .song-title') as HTMLElement)?.innerText;
            let artistElems = (elem.querySelectorAll('.song-title-singers .author-item'));

            const artists: string[] = [];

            artistElems.forEach(function(el) {
                artists.push((el as HTMLElement).innerText);
            });

            let preview = (elem.querySelector('.song-preview-lyric') as HTMLElement)?.innerText;

            results.push({
                title,
                artists: artists,
                preview,
                source: 'hopamchuan'
            });
        }

        return results;
    });
}
