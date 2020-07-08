
export class TitleGenerator {
    private readonly _pattern = /^Untitled ([0-9]+)$/;

    public getTitle(currentTitles: string[], offset: number = 0) {
        const titlesMatchingPattern = currentTitles.filter((t) => this._pattern.test(t));

        const titleNumbers = titlesMatchingPattern.map((t) => parseInt(this._pattern.exec(t)[1], 10));
        const biggestNumber = titleNumbers.length ? titleNumbers.sort()[titleNumbers.length - 1] : 0;

        return `Untitled ${biggestNumber + 1 + offset}`;
    }
}
