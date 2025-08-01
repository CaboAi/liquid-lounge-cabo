import FirecrawlApp from '@mendable/firecrawl-js';

interface ErrorResponse {
  success: false;
  error: string;
}

interface CrawlStatusResponse {
  success: true;
  status: string;
  completed: number;
  total: number;
  creditsUsed: number;
  expiresAt: string;
  data: any[];
}

type CrawlResponse = CrawlStatusResponse | ErrorResponse;

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  private static firecrawlApp: FirecrawlApp | null = null;
  private static readonly DEFAULT_API_KEY = 'fc-689bf853a4eb42cd856807826fa57670';

  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    this.firecrawlApp = new FirecrawlApp({ apiKey });
    console.log('API key saved successfully');
  }

  static getApiKey(): string | null {
    const storedKey = localStorage.getItem(this.API_KEY_STORAGE_KEY);
    return storedKey || this.DEFAULT_API_KEY;
  }

  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      console.log('Testing API key with Firecrawl API');
      this.firecrawlApp = new FirecrawlApp({ apiKey });
      // A simple test crawl to verify the API key
      const testResponse = await this.firecrawlApp.crawlUrl('https://example.com', {
        limit: 1
      });
      return testResponse.success;
    } catch (error) {
      console.error('Error testing API key:', error);
      return false;
    }
  }

  static async crawlGoogleReviews(businessUrl: string): Promise<{ success: boolean; error?: string; data?: any }> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }

    // Check cache first (24 hour cache)
    const cacheKey = `google_reviews_${businessUrl}`;
    const cachedData = this.getCachedReviews(cacheKey);
    if (cachedData) {
      console.log('Returning cached Google Reviews');
      return { success: true, data: cachedData };
    }

    try {
      console.log('Making crawl request to Firecrawl API for Google Reviews');
      if (!this.firecrawlApp) {
        this.firecrawlApp = new FirecrawlApp({ apiKey });
      }

      const crawlResponse = await this.firecrawlApp.crawlUrl(businessUrl, {
        limit: 5,
        scrapeOptions: {
          formats: ['markdown', 'html'],
          includeTags: ['div', 'span', 'p'],
          onlyMainContent: false,
          waitFor: 3000
        }
      }) as CrawlResponse;

      if (!crawlResponse.success) {
        console.error('Crawl failed:', (crawlResponse as ErrorResponse).error);
        return { 
          success: false, 
          error: (crawlResponse as ErrorResponse).error || 'Failed to crawl Google Reviews' 
        };
      }

      // Debug: Log raw data to understand structure
      console.log('Raw crawl response:', JSON.stringify(crawlResponse, null, 2));
      
      // Process and cache the results
      const processedReviews = this.processReviewData(crawlResponse.data);
      this.cacheReviews(cacheKey, processedReviews);

      console.log('Google Reviews crawl successful:', processedReviews);
      return { 
        success: true,
        data: processedReviews 
      };
    } catch (error) {
      console.error('Error during Google Reviews crawl:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to connect to Firecrawl API' 
      };
    }
  }

  private static getCachedReviews(cacheKey: string): any | null {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const cacheAge = now - timestamp;
      const cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge > cacheExpiry) {
        localStorage.removeItem(cacheKey);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error reading cached reviews:', error);
      return null;
    }
  }

  private static cacheReviews(cacheKey: string, data: any): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching reviews:', error);
    }
  }

  private static processReviewData(rawData: any[]): any[] {
    console.log('Processing review data:', rawData);
    
    if (!Array.isArray(rawData)) {
      console.log('Raw data is not an array:', rawData);
      return [];
    }

    const processedReviews = rawData.flatMap(item => {
      const reviews: any[] = [];
      
      try {
        const content = item.markdown || item.content || item.html || '';
        console.log('Processing content:', content.substring(0, 500));
        
        // Google Reviews patterns
        const googleReviewPatterns = [
          // Pattern 1: Star rating followed by review text
          /([1-5])\s*(?:star|★|⭐).*?\n(.*?)\n.*?(?:by|from)\s+([A-Za-z\s]+)/gi,
          // Pattern 2: Review with rating in different format
          /Rating:\s*([1-5]).*?\nReview:\s*(.*?)\n.*?Reviewer:\s*([A-Za-z\s]+)/gi,
          // Pattern 3: Simple star pattern
          /(\d+)\s*(?:stars?|★+)\s*[:\-]?\s*(.*?)(?:\n|$)/gi,
          // Pattern 4: Google Maps specific pattern
          /([A-Za-z\s]+)\s*\n.*?([1-5])\s*(?:star|★).*?\n(.*?)$/gmi
        ];

        for (const pattern of googleReviewPatterns) {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            const hasRating = match[1] && /[1-5]/.test(match[1]);
            const hasText = match[2] && match[2].trim().length > 10;
            
            if (hasRating && hasText) {
              reviews.push({
                rating: parseInt(match[1]),
                text: match[2].trim(),
                author: match[3]?.trim() || this.extractAuthor(content) || 'Google User',
                date: this.extractDate(content) || new Date().toISOString().split('T')[0],
                verified: true
              });
            }
          }
        }

        // Fallback: Look for any review-like content
        if (reviews.length === 0) {
          const lines = content.split('\n').filter(line => line.trim().length > 20);
          for (let i = 0; i < lines.length - 1; i++) {
            const ratingMatch = lines[i].match(/([1-5])\s*(?:star|★)/i);
            if (ratingMatch && lines[i + 1] && lines[i + 1].trim().length > 10) {
              reviews.push({
                rating: parseInt(ratingMatch[1]),
                text: lines[i + 1].trim(),
                author: this.extractAuthor(lines[i + 2] || '') || 'Google User',
                date: this.extractDate(content) || new Date().toISOString().split('T')[0],
                verified: true
              });
            }
          }
        }
      } catch (error) {
        console.error('Error processing review item:', error);
      }
      
      return reviews;
    });

    console.log('Processed reviews:', processedReviews);
    return processedReviews.filter(review => review.text && review.text.length > 10);
  }

  private static extractAuthor(content: string): string | null {
    const authorMatch = content.match(/(?:by|from|reviewer?:?)\s*([A-Za-z\s]+)/i);
    return authorMatch ? authorMatch[1].trim() : null;
  }

  private static extractDate(content: string): string | null {
    const dateMatch = content.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
  }
}