import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function BookingProgress({
  currentStep,
  totalSteps,
}: BookingProgressProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-label="Progresso da marcação"
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-valuenow={currentStep + 1}
      aria-valuetext={`Passo ${currentStep + 1} de ${totalSteps}`}
    >
      {Array.from({ length: totalSteps }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors duration-500",
            index <= currentStep ? "bg-ink" : "bg-ink/15",
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
