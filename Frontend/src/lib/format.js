export function doctorDisplayName(name = "") {
    return /^dr\.?\s/i.test(name) ? name : `Dr. ${name}`;
}
