import { ShiftStatusEnum } from "@/constants";
import { LocationDTO } from "@/features/locations/dto/location.dto";
import { UserShortDTO } from "@/features/users/dto/user.dto";
import { ISODateTimeString, UUID } from "@/types/common";

export interface ShiftOpenDTO {
  initialAmount: number;
}

export interface ShiftDTO {
  id: UUID;
  location: LocationDTO;
  cashier: UserShortDTO;
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
