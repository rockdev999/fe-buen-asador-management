import { ShiftStatusEnum } from "@/constants";
import { Location } from "@/features/locations/models/location.model";
import { UserShort } from "@/features/users/models/user.model";
import { ISODateTimeString, UUID } from "@/types/common";

export interface Shift {
  id: UUID;
  location: Location;
  cashier: UserShort;
  openedAt: ISODateTimeString;
  closedAt: ISODateTimeString | null;
  initialAmount: number;
  declaredAmount: number | null;
  systemAmount: number | null;
  difference: number | null;
  status: ShiftStatusEnum;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
}
