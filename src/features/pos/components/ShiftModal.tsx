import { MoneyInput } from "@/components/shared/Interactives/MoneyInput";
import { Button } from "@/components/ui/button";
import { t } from "@/locales/es";

const trans = t.pos;

export const ShiftModal = () => {
  return (
    <div className="absolute inset-0 bg-inkblack/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-80 text-center">
        <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-brand"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <h2 className="text-lg font-medium text-inkblack mb-1">
          {trans.shiftModal.title}
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          {trans.shiftModal.description}
        </p>

        <form>
          <MoneyInput
            placeholder="0.00"
            error="asdasd"
            onChange={(value) =>
              //   setValue("initialAmount", value, { shouldValidate: true })
              console.log(value)
            }
          />

          <Button
            type="submit"
            // disabled={isLoading}
            className="w-full mt-2 bg-brand hover:bg-brand-dark text-white font-medium"
          >
            {true ? trans.shiftModal.startButton : trans.shiftModal.startButton}
          </Button>
        </form>
      </div>
    </div>
  );
};
