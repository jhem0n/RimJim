import dotenv from 'dotenv';
dotenv.config();

export interface TMDBMovie {
  id: number;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseYear: string;
  rating: number;
  overview: string;
}

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Curated date night collection used for instant discovery and fallback if TMDB_API_KEY is not yet supplied by user
const CURATED_DATE_MOVIES: TMDBMovie[] = [
  {
    id: 11036,
    title: 'Before Sunrise',
    releaseYear: '1995',
    rating: 8.3,
    posterPath: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
    overview: 'A young American man and a French woman meet on a train in Europe, and wind up spending one evening together in Vienna. An unforgettable cinematic celebration of connection.'
  },
  {
    id: 807,
    title: 'Before Sunset',
    releaseYear: '2004',
    rating: 8.1,
    posterPath: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&w=1200&q=80',
    overview: 'Nine years later, Jesse and Celine meet again in Paris. They have one afternoon before Jesse has to catch a flight to see if what they shared still endures.'
  },
  {
    id: 38,
    title: 'Eternal Sunshine of the Spotless Mind',
    releaseYear: '2004',
    rating: 8.4,
    posterPath: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=80',
    overview: 'When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories. But love has a way of lingering.'
  },
  {
    id: 19995,
    title: 'About Time',
    releaseYear: '2013',
    rating: 8.2,
    posterPath: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    overview: 'At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life. His decision to make his world a better place by getting a girlfriend turns out not to be as easy as you might think.'
  },
  {
    id: 313369,
    title: 'La La Land',
    releaseYear: '2016',
    rating: 8.0,
    posterPath: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
    overview: 'While navigating their careers in Los Angeles, a pianist and an actress fall in love while attempting to reconcile their aspirations for the future.'
  },
  {
    id: 597,
    title: 'Titanic',
    releaseYear: '1997',
    rating: 7.9,
    posterPath: 'https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    overview: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.'
  },
  {
    id: 508947,
    title: 'Past Lives',
    releaseYear: '2023',
    rating: 8.0,
    posterPath: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&w=1200&q=80',
    overview: 'Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after Nora\'s family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week.'
  },
  {
    id: 1124,
    title: 'The Prestige',
    releaseYear: '2006',
    rating: 8.2,
    posterPath: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=600&q=80',
    backdropPath: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=1200&q=80',
    overview: 'After a tragic accident, two stage magicians in 1890s London engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.'
  }
];

export async function searchMovies(query: string): Promise<TMDBMovie[]> {
  const apiKey = process.env.TMDB_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const isBearer = apiKey.length > 50;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      let url = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
      
      if (isBearer) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        url += `&api_key=${apiKey}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.results && Array.isArray(data.results)) {
          return data.results.slice(0, 16).map((m: any) => ({
            id: m.id,
            title: m.title || m.original_title || 'Untitled',
            posterPath: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : null,
            backdropPath: m.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${m.backdrop_path}` : null,
            releaseYear: m.release_date ? m.release_date.split('-')[0] : 'Unknown',
            rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 0,
            overview: m.overview || 'No overview available.',
          }));
        }
      }
    } catch (err) {
      console.warn('TMDB search API request failed, falling back to curated collection:', err);
    }
  }

  // Fallback / curated local search if TMDB_API_KEY is absent or failed
  if (!query || query.trim() === '') {
    return CURATED_DATE_MOVIES;
  }
  const cleanQuery = query.toLowerCase().trim();
  const matched = CURATED_DATE_MOVIES.filter(m => 
    m.title.toLowerCase().includes(cleanQuery) || m.overview.toLowerCase().includes(cleanQuery)
  );

  return matched.length > 0 ? matched : CURATED_DATE_MOVIES.slice(0, 4);
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  const apiKey = process.env.TMDB_API_KEY;

  if (apiKey && apiKey.trim() !== '') {
    try {
      const isBearer = apiKey.length > 50;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      let url = `${TMDB_BASE_URL}/movie/${movieId}?language=en-US`;
      
      if (isBearer) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        url += `&api_key=${apiKey}`;
      }

      const res = await fetch(url, { headers });
      if (res.ok) {
        const m = await res.json();
        return {
          id: m.id,
          title: m.title || m.original_title,
          posterPath: m.poster_path ? `${TMDB_IMAGE_BASE}/w500${m.poster_path}` : null,
          backdropPath: m.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${m.backdrop_path}` : null,
          releaseYear: m.release_date ? m.release_date.split('-')[0] : 'Unknown',
          rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 0,
          overview: m.overview || '',
        };
      }
    } catch (err) {
      console.warn('TMDB details API request failed:', err);
    }
  }

  const found = CURATED_DATE_MOVIES.find(m => m.id === movieId);
  return found || null;
}
