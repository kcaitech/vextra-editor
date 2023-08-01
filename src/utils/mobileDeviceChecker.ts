function isMobileDevice(): boolean {
    const mobileKeywords = [
        "Android",
        "webOS",
        "iPhone",
        "iPad",
        "iPod",
        "BlackBerry",
        "Windows Phone",
    ];

    const userAgent = navigator.userAgent;

    for (const keyword of mobileKeywords) {
        if (userAgent.includes(keyword)) {
            return true;
        }
    }

    return false;
}

export default isMobileDevice;