// Mongo/Mongoose documents come back over the wire with `_id`, but the whole
// frontend (types, components) was built around a plain `id: string` field.
// These helpers convert at the API boundary so nothing above this layer has
// to know or care that the backend is MongoDB.

export function withId<T extends { _id: string }>(doc: T): Omit<T, '_id'> & { id: string } {
  const { _id, ...rest } = doc;
  return { id: _id, ...rest } as Omit<T, '_id'> & { id: string };
}

export function withIds<T extends { _id: string }>(docs: T[]): (Omit<T, '_id'> & { id: string })[] {
  return docs.map(withId);
}
