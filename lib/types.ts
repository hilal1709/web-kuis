// Tipe baris database QUIZORAMA

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
};

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
};

export type Quiz = {
  id: string;
  title: string;
  description: string | null;
  category_id: string | null;
  cover_image: string | null;
  plays_count: number;
  created_by: string | null;
  created_at: string;
  categories?: Category | null;
};

export type Option = {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  position: number;
};

export type Question = {
  id: string;
  quiz_id: string;
  question_text: string;
  image_url: string | null;
  position: number;
  time_limit: number;
  options: Option[];
};

export type Attempt = {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  correct_count: number;
  total_count: number;
  time_taken: number;
  created_at: string;
  profiles?: Profile | null;
};
