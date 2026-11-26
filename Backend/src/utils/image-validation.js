const signatures = {
    "image/jpeg": {
        extension: ".jpg",
        matches: buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
    },
    "image/png": {
        extension: ".png",
        matches: buffer => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    },
    "image/webp": {
        extension: ".webp",
        matches: buffer => buffer.length >= 12
            && buffer.toString("ascii", 0, 4) === "RIFF"
            && buffer.toString("ascii", 8, 12) === "WEBP"
    }
};

export function getSupportedImageExtension(file) {
    if (!file || !Buffer.isBuffer(file.buffer)) return null;
    const signature = signatures[file.mimetype];
    return signature?.matches(file.buffer) ? signature.extension : null;
}
