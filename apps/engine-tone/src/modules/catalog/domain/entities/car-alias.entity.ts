export class CarAlias {
  constructor(
    public readonly id: string,
    public readonly make: string, // normalized alias make
    public readonly model: string, // normalized alias model
    public readonly carModelId: string, // FK -> CarModel.id (canonical)
    public readonly yearFrom?: number,
    public readonly yearTo?: number,
    public readonly engineCode?: string
  ) {}

  matchesYear(y?: number): boolean {
    if (!y) return true;
    if (this.yearFrom && y < this.yearFrom) return false;
    if (this.yearTo && y > this.yearTo) return false;
    return true;
  }
}
