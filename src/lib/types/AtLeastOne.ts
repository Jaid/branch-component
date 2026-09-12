export type AtLeastOne<ObjectType, Keys extends keyof ObjectType = keyof ObjectType> = Keys extends keyof ObjectType
  ? Required<Pick<ObjectType, Keys>> & Partial<Omit<ObjectType, Keys>>
  : never
