import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-6">Oops! Page not found</p>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist. Here are some helpful links:
        </p>
        <div className="space-y-2">
          <a href="/" className="block text-primary hover:text-primary/80 underline">
            Return to Home
          </a>
          <a href="/services" className="block text-primary hover:text-primary/80 underline">
            View Our Services
          </a>
          <a href="/about" className="block text-primary hover:text-primary/80 underline">
            About Us
          </a>
          <a href="/contact" className="block text-primary hover:text-primary/80 underline">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
