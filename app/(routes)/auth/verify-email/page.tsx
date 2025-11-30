'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const redirectTo = searchParams.get('redirectTo');
    const firstName = searchParams.get('firstName');
    const lastName = searchParams.get('lastName');
    const password = searchParams.get('password');
    const confirmPassword = searchParams.get('confirmPassword');

    if (emailParam) {
      setEmail(emailParam);
    }

    // Store registration data in sessionStorage for later use
    if (redirectTo === '/auth/register-vendor' && emailParam) {
      const registrationData = {
        email: emailParam,
        firstName: firstName || '',
        lastName: lastName || '',
        password: password || '',
        confirmPassword: confirmPassword || '',
      };
      sessionStorage.setItem('registerVendorData', JSON.stringify(registrationData));
    }
  }, [searchParams]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email vérifié avec succès ! Connexion en cours...');

        // If the response includes a token, automatically log the user in
        if (data.token && data.user) {
          // Store the token using authStorage
          const { authStorage } = await import('@/app/lib/api');
          authStorage.setToken(data.token);

          // Clear any stored registration data
          sessionStorage.removeItem('registerVendorData');

          // Redirect immediately to home page
          router.push('/');
        } else {
          // Fallback for older responses without token
          const registrationData = sessionStorage.getItem('registerVendorData');
          if (registrationData) {
            sessionStorage.removeItem('registerVendorData');
            setTimeout(() => {
              router.push('/');
            }, 2000);
          } else {
            setTimeout(() => {
              router.push('/');
            }, 2000);
          }
        }
      } else {
        setError(data.message || 'Erreur lors de la vérification');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('Adresse email manquante');
      return;
    }

    setResendLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Un nouveau code de vérification a été envoyé à votre email');
      } else {
        setError(data.message || 'Erreur lors de l\'envoi du code');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Vérifiez votre email</CardTitle>
          <CardDescription>
            Nous avons envoyé un code de vérification à{' '}
            <span className="font-medium text-gray-900">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleVerify} className="space-y-4">
            {/* {email && (
              <div className=''>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-gray-50"
                />
              </div>
            )} */}
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Entrez le code à 6 chiffres"
                className="text-center text-lg tracking-widest"
                maxLength={6}
                required
              />
            </div>

            {error && (
              <Alert className="text-red-700">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Vérification...
                </>
              ) : (
                'Vérifier'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-2">
              Vous n&apos;avez pas reçu le code ?
            </p>
            <Button
              variant="outline"
              onClick={handleResendCode}
              disabled={resendLoading}
              className="w-full"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                'Renvoyer le code'
              )}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
