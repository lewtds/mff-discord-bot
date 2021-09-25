import puppeteer, { Browser } from "puppeteer";

export interface ResolverModule {
    matchSongUrl: (url: string) => boolean;
    getSongText: (url: string, transposition: number) => Promise<SongText>;
    searchSongs: (keyword: string) => Promise<SearchCandidate[]>;
}

export interface SearchCandidate {
    title: string,
    artist: string,
    preview: string,
    // ranking? confidence?
}

export interface SongText {
    title: string;
    artist: string;
    text: string;
    transposition: number;
}


let BROWSER_CACHE: Browser | null = null;

export async function getPuppetBrowser(): Promise<Browser> {
    if (!BROWSER_CACHE) {
        BROWSER_CACHE = await puppeteer.launch();
    }

    return BROWSER_CACHE;
}
