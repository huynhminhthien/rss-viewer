
export function isValidUrl(url: string) {
    const regex = /^https?:\/\/.*(rss|feed).*$/;
    return regex.test(url)
}

export function extractURLs(text: string) {
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
    const urls = text.match(urlRegex);
    return urls || [];
}

