'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerMemberAction } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { UserPlus, User, Phone, Mail, MapPin, Calendar, Lock, ArrowLeft, Gift, Sparkles } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    // Validate passwords match
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const result = await registerMemberAction(formData);

    if (result.success) {
      // Redirect to login page with success message
      router.push('/login?registered=true');
    } else {
      setError(result.error || 'Registration failed');
      setLoading(false);
    }
  }

  const [name, setName] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = e.target.value.replace(/\b\w/g, (char) => char.toUpperCase());
    setName(capitalized);
  };

  const [phone, setPhone] = useState('')

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9+]/g, '');
    const formatted = raw.replace(/(.{4})/g, '$1 ').trim();
    setPhone(formatted);
  };

  const [emailError, setEmailError] = useState('');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    setEmailError(val && !valid ? 'Masukkan alamat email yang valid' : '');
  };

  const [address, setAddress] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 py-12">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-0 relative z-10 backdrop-blur-sm bg-white/95">
        <CardHeader className="space-y-3 pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Gift className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Daftar Member
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Buat akun sekarang dan dapatkan poin setiap kali melakukan pembelian
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Benefits Banner */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
            <p className="font-semibold mb-2 text-xs text-gray-700 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Keuntungan Member:
            </p>
            <ul className="space-y-1 text-xs text-gray-600">
              <li>✨ Dapatkan poin setiap pembelian</li>
              <li>🎁 Hadiah ulang tahun eksklusif</li>
              <li>💰 Tukar poin untuk potongan harga</li>
            </ul>
          </div>

          <form action={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                Nama Lengkap <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                placeholder="John Doe"
                value={name}
                onChange={handleNameChange}
                disabled={loading}
                maxLength={80}
                className="h-11 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                WhatsApp Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                onKeyDown={(e) => {
                  const controlKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];
                  if (!controlKeys.includes(e.key) && !/^[0-9+]$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
                    e.preventDefault();
                  }
                }}
                minLength={9}  // 7 digits + 2 auto-added spaces
                maxLength={19} // 15 digits + 4 auto-added spaces
                inputMode="tel"
                required
                placeholder="0812 3456 7890"
                disabled={loading}
                className="h-11 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Diperlukan untuk login dan klaim poin
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  Email (Opsional - disarankan untuk login alternatif)
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  disabled={loading}
                  onChange={handleEmailChange}
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  className="h-11 text-sm"
                />
                {emailError && <p className="text-xs text-red-500">{emailError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="birthday" className="text-xs font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Tanggal Lahir
                </Label>
                <Input
                  id="birthday"
                  name="birthday"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  disabled={loading}
                  className="h-11 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-xs font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                Alamat
              </Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Nama Jalan, Kota, Kode Pos"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={loading}
                maxLength={150}
                className="h-11 text-sm"
              />
              <p className='text-xs text-gray-500 text-right'>
                {address.length}/150 karakter
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  minLength={6}
                  disabled={loading}
                  className="h-11 text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs font-medium flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-500" />
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Re-enter password"
                  minLength={6}
                  disabled={loading}
                  className="h-11 text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-xs text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-white text-gray-500">Already a member?</span>
            </div>
          </div>

          <Link href="/login" className="block">
            <Button
              variant="outline"
              className="w-full h-11 text-sm font-semibold border-2 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sign In
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}