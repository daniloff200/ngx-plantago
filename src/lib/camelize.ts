export function camelize(str: string) {
    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (letter: string, index: number) => {
        return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
    }).replace(/\s+/g, '');
}
