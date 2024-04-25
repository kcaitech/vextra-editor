function isMobileDevice(): boolean {
    const mobileKeywords = [
        "Android",
        "webOS",
        "iPhone",
        "iPad",
        "iPod",
        "Macintosh",
        "BlackBerry",
        "Windows Phone",
    ];

    const userAgent = navigator.userAgent;

    for (const keyword of mobileKeywords) {
        if (userAgent.includes(keyword)) {
            if (keyword === 'Macintosh') {
                if (navigator.maxTouchPoints > 1) {
                    return true
                } else {
                    return false
                }
            }
            return true;
        }
    }
    return false;
}

export default isMobileDevice;