import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FirecrawlService } from '@/utils/FirecrawlService';
import { Key, Check, X } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: () => void;
}

export const ApiKeyInput = ({ onApiKeySet }: ApiKeyInputProps) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsLoading(true);
    
    try {
      const isValidKey = await FirecrawlService.testApiKey(apiKey);
      
      if (isValidKey) {
        FirecrawlService.saveApiKey(apiKey);
        setIsValid(true);
        toast({
          title: "Success",
          description: "API key validated and saved successfully",
          duration: 3000,
        });
        setTimeout(() => {
          onApiKeySet();
        }, 1000);
      } else {
        toast({
          title: "Invalid API Key",
          description: "Please check your Firecrawl API key and try again",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error validating API key:', error);
      toast({
        title: "Error",
        description: "Failed to validate API key",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Key className="h-5 w-5" />
          Setup Required
        </CardTitle>
        <CardDescription>
          Enter your Firecrawl API key to load Google Reviews
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Firecrawl API key"
              className={`pr-10 ${isValid ? 'border-green-500' : ''}`}
              disabled={isLoading || isValid}
            />
            {isValid && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          
          {!isValid && (
            <Button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="w-full"
            >
              {isLoading ? "Validating..." : "Save API Key"}
            </Button>
          )}
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Get your API key from <a href="https://firecrawl.dev" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">firecrawl.dev</a></p>
            <p>• This will be stored locally and used to fetch Google Reviews</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};