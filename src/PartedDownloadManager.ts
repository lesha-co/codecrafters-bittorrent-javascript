export class PartedDownloadManager {
  private items: number[];
  constructor(nItems: number) {
    this.items = new Array(nItems).fill(false).map((x, i) => i);
  }
  public getAnyItem() {
    if (this.items.length === 0) {
      return null;
    }
    const index =
      Math.round(this.items.length * Math.random()) % this.items.length;

    const item = this.items[index];
    this.items.splice(index, 1);
    return item;
  }
}
