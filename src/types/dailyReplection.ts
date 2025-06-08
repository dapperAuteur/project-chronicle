export interface DailyReflection {
  initialReflection: string; // The reflection already saved for today, if any
  isDrafting: boolean; // To show a loading state for the AI button
  onSave: (reflectionText: string) => void;
  onDraft: () => void;
  onClose: () => void;
}