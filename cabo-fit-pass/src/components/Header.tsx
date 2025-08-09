'use client'

import { Button } from "@/components/ui/button";
import { User, LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CreditBadge } from "./CreditBadge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out successfully",
    });
    router.push("/");
  };

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          Cabo Fit Pass
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/classes" className="hover:text-primary">
            Classes
          </Link>
          <Link href="/studios" className="hover:text-primary">
            Studios
          </Link>
          <Link href="/pricing" className="hover:text-primary">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <CreditBadge />
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/signup">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
