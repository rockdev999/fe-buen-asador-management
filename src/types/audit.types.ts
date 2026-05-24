import { ISODateTimeString, UUID } from "./common";

export interface Audit {
  createdAt: ISODateTimeString | null;
  updatedAt?: ISODateTimeString | null;
  createdBy: {
    id: UUID;
    name: string;
  } | null;
  updatedBy: {
    id: UUID;
    name: string;
  } | null;
}
