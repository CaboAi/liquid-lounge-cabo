'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import { auth } from '@/lib/supabase/browser'

interface EmailVerificationProps {
  email?: string
  className?: string
}

export function EmailVerification({ email, className }: EmailVerificationProps) {
  const [isResending, setIsResending] = useState(false)
  const [resendCount, setResendCount] = useState(0)
  const [cooldownTime, setCooldownTime] = useState(0)
  const [userEmail, setUserEmail] = useState(email || '')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Get email from URL params if not provided
    if (!userEmail) {
      const emailFromUrl = searchParams.get('email')
      if (emailFromUrl) {
        setUserEmail(emailFromUrl)
      }
    }

    // Start cooldown timer
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(cooldownTime - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [userEmail, searchParams, cooldownTime])

  const handleResendVerification = async () => {
    if (!userEmail) {
      toast.error('Email address required', {
        description: 'Please provide your email address to resend verification.',
      })
      return
    }

    if (cooldownTime > 0) {
      toast.error('Please wait', {
        description: `You can resend the verification email in ${cooldownTime} seconds.`,
      })
      return
    }

    setIsResending(true)

    try {
      await auth.resetPassword(userEmail, `${window.location.origin}/auth/callback`)
      
      setResendCount(resendCount + 1)
      setCooldownTime(60) // 60 second cooldown
      
      toast.success('Verification email sent!', {
        description: 'Please check your email for the verification link.',
      })
    } catch (error: any) {
      toast.error('Failed to resend verification', {
        description: error.message || 'Please try again.',
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckVerification = async () => {
    try {
      const user = await auth.getUser()
      
      if (user?.email_confirmed_at) {
        toast.success('Email verified!', {
          description: 'Your email has been successfully verified.',
        })
        router.push('/dashboard')
      } else {
        toast.info('Email not verified yet', {
          description: 'Please check your email and click the verification link.',
        })
      }
    } catch (error) {
      toast.error('Failed to check verification status', {
        description: 'Please try again.',
      })
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-10 w-10 text-primary" />
        </div>
        <CardTitle className="text-2xl">Verify your email</CardTitle>
        <CardDescription>
          We&apos;ve sent a verification link to{' '}
          {userEmail ? (
            <span className="font-medium break-all">{userEmail}</span>
          ) : (
            'your email address'
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please check your email and click the verification link to activate your account.
            You may need to check your spam or junk folder.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCheckVerification}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            I&apos;ve verified my email
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={handleResendVerification}
            disabled={isResending || cooldownTime > 0}
          >
            {isResending ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {cooldownTime > 0
              ? `Resend in ${cooldownTime}s`
              : resendCount > 0
              ? 'Resend verification email again'
              : 'Resend verification email'
            }
          </Button>
        </div>

        {resendCount > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Verification email sent {resendCount} time{resendCount > 1 ? 's' : ''}
          </div>
        )}

        <div className="rounded-lg border p-4 text-sm text-muted-foreground">
          <p className="mb-2 font-medium">Didn&apos;t receive the email?</p>
          <ul className="list-inside list-disc space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure {userEmail || 'your email'} is correct</li>
            <li>Add noreply@cabofitpass.com to your contacts</li>
            <li>Check your internet connection</li>
          </ul>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> You won&apos;t be able to book classes or access 
            all features until your email is verified.
          </AlertDescription>
        </Alert>
      </CardContent>

      <CardFooter className="flex flex-col space-y-2">
        <div className="text-center text-sm text-muted-foreground">
          Need help? Contact us at{' '}
          <Link
            href="mailto:support@cabofitpass.com"
            className="text-primary underline-offset-4 hover:underline"
          >
            support@cabofitpass.com
          </Link>
        </div>
        
        <div className="text-center text-sm text-muted-foreground">
          Wrong email address?{' '}
          <Link
            href="/signup"
            className="text-primary underline-offset-4 hover:underline"
          >
            Sign up again
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}