import { LocationWithRole } from "@/features/locations/models/location.model";
import { User } from "@/features/users/models/user.model";

export interface LoginLocations {
  temporaryToken: string;
  user: User;
  locations: LocationWithRole[];
}
