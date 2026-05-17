import { MultiSelectOption } from "@/components/shared/Interactives/MultiSelectDropdown";
import { JobPositionEnum } from "@/constants/enums/job-position.enum";

export const JOB_POSITION_OPTIONS: MultiSelectOption[] = [
  { value: JobPositionEnum.GRILL_COOK, label: "Parrillero" },
  { value: JobPositionEnum.COOK, label: "Cocinera" },
  { value: JobPositionEnum.KITCHEN_ASSISTANT, label: "Ayudante de cocina" },
  { value: JobPositionEnum.CASHIER, label: "Cajero" },
  { value: JobPositionEnum.WAITER, label: "Mesero" },
  { value: JobPositionEnum.DELIVERY_DRIVER, label: "Delivery" },
  { value: JobPositionEnum.ADMINISTRATOR, label: "Administrador" },
  { value: JobPositionEnum.OTHER, label: "Otro" },
];

export const JOB_POSITION_LABELS: Record<JobPositionEnum, string> =
  JOB_POSITION_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
    {} as Record<JobPositionEnum, string>,
  );
