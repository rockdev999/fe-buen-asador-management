import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export interface UserForm {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  description?: string;
  position?: JobPositionEnum[];
  password: string;
  repitPassword: string;
}
