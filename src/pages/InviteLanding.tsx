import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../utils/auth';
import { toast } from 'sonner@2.0.3';

export function InviteLanding() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  // Invite validation state
  const [inviteToken, setInviteToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [error, setError] = useState('');

  // Onboarding state
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    capital: '',
    riskProfile: 'moderate',
  });

  // Admin login state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const handleValidateInvite = async () => {
    setIsValidating(true);
    setError('');
    
    try {
      const result = await api.validateInvite(inviteToken);
      if (result.valid) {
        setIsValidated(true);
        toast('Invite token validated!');
      } else {
        setError(result.message || 'Invalid invite token');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to validate invite token');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onboardingData.password !== onboardingData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signup({
        name: onboardingData.name,
        email: onboardingData.email,
        password: onboardingData.password,
        capital: parseFloat(onboardingData.capital) || undefined,
        riskProfile: onboardingData.riskProfile,
        inviteToken,
      });
      toast('Account created successfully!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(adminEmail, adminPassword);
      toast('Welcome back!');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Branding */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-foreground">CatIQz</h1>
                <p className="text-muted-foreground">The Intelligence Behind Market Moves</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3>AI-Powered Market Intelligence</h3>
                  <p className="text-muted-foreground">
                    Real-time analysis of market catalysts with AI-generated summaries and impact predictions
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3>Live Data Feed</h3>
                  <p className="text-muted-foreground">
                    Stay ahead with continuous updates from global sources and regulatory filings
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3>Invite-Only Access</h3>
                  <p className="text-muted-foreground">
                    Exclusive platform for serious traders and investors
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Authentication */}
          <Card className="p-6">
            <Tabs defaultValue="invite">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="invite">Join with Invite</TabsTrigger>
                <TabsTrigger value="admin">Admin Login</TabsTrigger>
              </TabsList>

              {/* Invite Tab */}
              <TabsContent value="invite" className="space-y-4">
                {!isValidated ? (
                  <>
                    <div>
                      <h3 className="mb-2">Enter Your Invite Token</h3>
                      <p className="text-muted-foreground mb-4">
                        Paste your invite link or token to get started
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="invite">Invite Token</Label>
                        <Input
                          id="invite"
                          placeholder="XXXX-XXXX-XXXX or full invite URL"
                          value={inviteToken}
                          onChange={(e) => setInviteToken(e.target.value)}
                        />
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleValidateInvite}
                        disabled={!inviteToken || isValidating}
                      >
                        {isValidating ? 'Validating...' : 'Validate Invite'}
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <h3 className="mb-2">Complete Your Profile</h3>
                      <p className="text-muted-foreground mb-4">
                        Tell us about yourself to personalize your experience
                      </p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-3">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          required
                          value={onboardingData.name}
                          onChange={(e) =>
                            setOnboardingData({ ...onboardingData, name: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={onboardingData.email}
                          onChange={(e) =>
                            setOnboardingData({ ...onboardingData, email: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          required
                          value={onboardingData.password}
                          onChange={(e) =>
                            setOnboardingData({ ...onboardingData, password: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          required
                          value={onboardingData.confirmPassword}
                          onChange={(e) =>
                            setOnboardingData({
                              ...onboardingData,
                              confirmPassword: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="capital">Trading Capital (₹, optional)</Label>
                        <Input
                          id="capital"
                          type="number"
                          placeholder="100000"
                          value={onboardingData.capital}
                          onChange={(e) =>
                            setOnboardingData({ ...onboardingData, capital: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="risk">Risk Profile</Label>
                        <select
                          id="risk"
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          value={onboardingData.riskProfile}
                          onChange={(e) =>
                            setOnboardingData({ ...onboardingData, riskProfile: e.target.value })
                          }
                        >
                          <option value="conservative">Conservative</option>
                          <option value="moderate">Moderate</option>
                          <option value="aggressive">Aggressive</option>
                        </select>
                      </div>

                      <Button type="submit" className="w-full">
                        Create Account
                      </Button>
                    </form>
                  </>
                )}
              </TabsContent>

              {/* Admin Tab */}
              <TabsContent value="admin" className="space-y-4">
                <div>
                  <h3 className="mb-2">Admin Access</h3>
                  <p className="text-muted-foreground mb-4">
                    Login with your admin credentials to bypass invite requirements
                  </p>
                </div>

                <form onSubmit={handleAdminLogin} className="space-y-3">
                  <div>
                    <Label htmlFor="admin-email">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="admin-password">Password</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Admin Login
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
