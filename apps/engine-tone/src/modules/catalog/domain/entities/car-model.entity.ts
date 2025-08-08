export class CarModel {
  constructor(
    public readonly id: string, // cuid
    public readonly make: string, // normalized: 'nissan'
    public readonly model: string, // normalized: 'gt-r'
    public readonly yearFrom?: number, // inclusive
    public readonly yearTo?: number, // inclusive
    public readonly engineCode?: string // e.g. 'vr38dett'
  ) {}

  includesYear(y?: number): boolean {
    if (!y) return true;
    if (this.yearFrom && y < this.yearFrom) return false;
    if (this.yearTo && y > this.yearTo) return false;
    return true;
  }
}
