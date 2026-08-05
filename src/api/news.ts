export interface NewsItem {
  title: string;
  url: string;
  source: string;
  date: string;
  country: string;
}

export async function fetchNews(query = 'conflict OR disaster OR earthquake'): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&format=json&maxrecords=15&sort=datedesc`,
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    return (data.articles || []).slice(0, 10).map((a: any) => ({
      title: a.title || 'Untitled',
      url: a.url || '#',
      source: a.domain || 'Unknown',
      date: a.seendate || '',
      country: a.sourcecountry || '',
    }));
  } catch {
    return [];
  }
}
