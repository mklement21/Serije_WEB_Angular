export interface SerijaI {
  original_name: string;
  overview: string;
  season_count: number;
  episode_count: number;
  number_of_seasons: number;
  number_of_episodes: number;
}

export interface SerijaDetaljiI {
  name: string;
  overview: string;
  season_count: number;
  episode_count: number;
  popularity: number;
  poster_path: string;
  homepage: string;

  number_of_episodes: number;
  number_of_seasons: number;
}