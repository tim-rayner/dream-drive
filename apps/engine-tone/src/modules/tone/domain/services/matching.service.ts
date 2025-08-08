// If you later want fuzzy matching independent from Catalog, keep it pure here.
import { CarModel } from '../../../catalog/domain/entities/car-model.entity';

export class MatchingService {
  fuzzyBest(make: string, model: string, all: CarModel[]) {
    const q = `${make} ${model}`;
    const score = (cm: CarModel) => {
      const s = `${cm.make} ${cm.model}`;
      const overlap = s.split(' ').filter((x) => q.includes(x)).length;
      return overlap / Math.max(1, s.split(' ').length);
    };
    const best = all
      .map((i) => ({ i, c: score(i) }))
      .sort((a, b) => b.c - a.c)[0];
    return best && best.c > 0.5 ? { item: best.i, confidence: best.c } : null;
  }
}
