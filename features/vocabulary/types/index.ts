export interface VocabularyItem {
  id: string;
  term: string;
  translation: string;
  example: string | null;
  audioUrl: string | null;
  category: string | null;
  difficulty: "easy" | "medium" | "hard";
  isFavorite: boolean;
  due: boolean;
}
