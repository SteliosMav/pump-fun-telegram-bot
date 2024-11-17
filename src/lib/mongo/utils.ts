import { Document, ObjectId } from "mongoose";

export function docToJSON<T extends object, D extends Document = Document>(
  doc: D
): T {
  const data = {
    ...doc.toJSON(),
    _id: (doc._id as ObjectId).toString(),
  };
  return data as T;
}
