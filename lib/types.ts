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
  is_public: boolean;
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

export type GameSession = {
  id: string;
  quiz_id: string;
  owner_id: string;
  status: string;
  current_question: number;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
  min_players: number;
  quizzes?: Quiz | null;
};

export type GamePlayer = {
  id: string;
  game_session_id: string;
  user_id: string | null;
  guest_username: string | null;
  score: number;
  correct_count: number;
  joined_at: string;
  plays_incremented: boolean;
  profiles?: Profile | null;
};

export type GameAnswer = {
  id: string;
  game_player_id: string;
  question_id: string;
  option_id: string;
  is_correct: boolean;
  answered_at: string;
};
