export interface IResolvedAlias {
  carModelId: string;
}

export interface ICarAliasRepository {
  resolveAlias(
    make: string,
    model: string,
    year?: number,
    engineCode?: string
  ): Promise<IResolvedAlias | null>;
}
