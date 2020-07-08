"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleGenerator = void 0;
class TitleGenerator {
    constructor() {
        this._pattern = /^Untitled ([0-9]+)$/;
    }
    getTitle(currentTitles, offset = 0) {
        const titlesMatchingPattern = currentTitles.filter((t) => this._pattern.test(t));
        const titleNumbers = titlesMatchingPattern.map((t) => parseInt(this._pattern.exec(t)[1], 10));
        const biggestNumber = titleNumbers.length ? titleNumbers.sort()[titleNumbers.length - 1] : 0;
        return `Untitled ${biggestNumber + 1 + offset}`;
    }
}
exports.TitleGenerator = TitleGenerator;
//# sourceMappingURL=titleGenerator.js.map