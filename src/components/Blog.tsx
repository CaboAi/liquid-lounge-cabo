import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const Blog = () => {
  const blogPosts = [
    {
      title: "The Science Behind IV Hydration Therapy",
      excerpt: "Understanding how intravenous hydration works and why it's more effective than drinking water for rapid rehydration.",
      category: "Education",
      date: "March 15, 2024",
      readTime: "5 min read",
      image: "/api/placeholder/400/250"
    },
    {
      title: "NAD+ Therapy: The Fountain of Youth?",
      excerpt: "Exploring the anti-aging benefits of NAD+ infusions and what current research tells us about longevity.",
      category: "Anti-Aging",
      date: "March 10, 2024", 
      readTime: "7 min read",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Hangover Recovery: Why IV Therapy Works",
      excerpt: "The medical explanation of how alcohol affects your body and why IV therapy is the fastest path to recovery.",
      category: "Wellness",
      date: "March 5, 2024",
      readTime: "4 min read",
      image: "/api/placeholder/400/250"
    },
    {
      title: "Athlete's Guide to IV Recovery",
      excerpt: "How professional athletes use IV therapy for performance enhancement and faster recovery from intense training.",
      category: "Performance",
      date: "February 28, 2024",
      readTime: "6 min read", 
      image: "/api/placeholder/400/250"
    },
    {
      title: "Glutathione: The Master Antioxidant",
      excerpt: "Discovering the powerful detoxification and skin benefits of glutathione IV therapy.",
      category: "Beauty",
      date: "February 20, 2024",
      readTime: "5 min read",
      image: "/api/placeholder/400/250"
    },
    {
      title: "IV Therapy Safety: What You Need to Know",
      excerpt: "Important safety considerations and what to expect during your IV therapy session with a registered nurse.",
      category: "Safety",
      date: "February 15, 2024",
      readTime: "8 min read",
      image: "/api/placeholder/400/250"
    }
  ];

  const categories = [
    { name: "All", count: 6 },
    { name: "Education", count: 2 },
    { name: "Wellness", count: 2 },
    { name: "Performance", count: 1 },
    { name: "Safety", count: 1 }
  ];

  return (
    <section id="blog" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            IV Therapy Education Hub
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Stay informed with the latest research, tips, and insights about IV therapy, wellness, and optimal health.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category, index) => (
            <Badge 
              key={index} 
              variant={category.name === "All" ? "default" : "secondary"}
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              {category.name} ({category.count})
            </Badge>
          ))}
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Card className="overflow-hidden border-primary/20 hover:shadow-xl transition-shadow">
            <div className="md:flex">
              <div className="md:w-1/2">
                <div className="h-64 md:h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">🧬</div>
                    <p className="text-primary font-semibold">Featured Article</p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge className="bg-primary/10 text-primary">Featured</Badge>
                  <Badge variant="secondary">Education</Badge>
                </div>
                <h3 className="text-2xl font-bold mb-4 hover:text-primary transition-colors cursor-pointer">
                  The Complete Guide to IV Therapy Benefits
                </h3>
                <p className="text-muted-foreground mb-6">
                  A comprehensive overview of how IV therapy works, its benefits for different health conditions, 
                  and what to expect during treatment. Perfect for those new to IV therapy.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      March 20, 2024
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      10 min read
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Read More <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {blogPosts.map((post, index) => (
            <Card key={index} className="group overflow-hidden border-primary/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="h-48 bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-4xl opacity-50">📄</div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {post.category}
                  </Badge>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </div>
                </div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors cursor-pointer line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="line-clamp-3 mb-4">
                  {post.excerpt}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </div>
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary-foreground hover:bg-primary">
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="text-center p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter for the latest IV therapy research, wellness tips, and exclusive offers 
            for Liquid Lounge services in Cabo San Lucas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 border border-border rounded-md bg-background"
            />
            <Button variant="medical">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Blog;