"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartedDownloadManager = void 0;
class PartedDownloadManager {
    items;
    constructor(nItems) {
        this.items = new Array(nItems).fill(false).map((x, i) => i);
    }
    getAnyItem() {
        if (this.items.length === 0) {
            return null;
        }
        const index = Math.round(this.items.length * Math.random()) % this.items.length;
        const item = this.items[index];
        this.items.splice(index, 1);
        return item;
    }
}
exports.PartedDownloadManager = PartedDownloadManager;
//# sourceMappingURL=PartedDownloadManager.js.map