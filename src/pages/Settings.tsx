import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Key, Bell, Shield, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../utils/auth';
import { useTheme } from '../utils/theme';
import { toast } from 'sonner@2.0.3';

export function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [refreshInterval, setRefreshInterval] = useState('5');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const [highImpactOnly, setHighImpactOnly] = useState(false);

  // Admin panel state
  const [inviteTokens, setInviteTokens] = useState([
    { id: '1', token: 'INV-2024-ABC123', uses: 0, maxUses: 1, expires: '2025-12-31', active: true },
    { id: '2', token: 'INV-2024-XYZ789', uses: 1, maxUses: 5, expires: '2025-11-30', active: true },
  ]);

  const handleSaveSettings = () => {
    toast('Settings saved successfully');
  };

  const handleGenerateToken = () => {
    const newToken = {
      id: String(inviteTokens.length + 1),
      token: `INV-2024-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      uses: 0,
      maxUses: 1,
      expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true,
    };
    setInviteTokens([...inviteTokens, newToken]);
    toast('New invite token generated');
  };

  const handleToggleToken = (id: string) => {
    setInviteTokens(
      inviteTokens.map((token) =>
        token.id === id ? { ...token, active: !token.active } : token
      )
    );
    toast('Token status updated');
  };

  const handleManualFetch = () => {
    toast('Manual data fetch triggered');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h2>Settings</h2>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">
              <SettingsIcon className="w-4 h-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <Bell className="w-4 h-4 mr-2" />
              Alerts
            </TabsTrigger>
            {user?.isAdmin && (
              <TabsTrigger value="admin">
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </TabsTrigger>
            )}
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Theme</Label>
                    <p className="text-muted-foreground">
                      Choose between light and dark mode
                    </p>
                  </div>
                  <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Data Refresh</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="refresh">Auto-refresh Interval (minutes)</Label>
                  <Input
                    id="refresh"
                    type="number"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-muted-foreground mt-2">
                    How often to check for new market events
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="text-foreground mt-1">{user?.email || 'Not logged in'}</div>
                </div>
                <div>
                  <Label>Name</Label>
                  <div className="text-foreground mt-1">{user?.name || 'Not set'}</div>
                </div>
                <Separator />
                <Button variant="outline">Change Password</Button>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </TabsContent>

          {/* Alert Settings */}
          <TabsContent value="alerts" className="space-y-6">
            <Card className="p-6">
              <h3 className="mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Alerts</Label>
                    <p className="text-muted-foreground">
                      Receive email notifications for important events
                    </p>
                  </div>
                  <Switch checked={emailAlerts} onCheckedChange={setEmailAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push Notifications</Label>
                    <p className="text-muted-foreground">
                      Get browser push notifications
                    </p>
                  </div>
                  <Switch checked={pushAlerts} onCheckedChange={setPushAlerts} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <Label>High Impact Only</Label>
                    <p className="text-muted-foreground">
                      Only notify for high-impact events
                    </p>
                  </div>
                  <Switch checked={highImpactOnly} onCheckedChange={setHighImpactOnly} />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4">Alert Filters</h3>
              <div className="space-y-4">
                <div>
                  <Label>Sectors to Monitor</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="default">Banks</Badge>
                    <Badge variant="default">IT</Badge>
                    <Badge variant="outline">Auto</Badge>
                    <Badge variant="outline">Pharma</Badge>
                    <Badge variant="outline">Energy</Badge>
                  </div>
                  <p className="text-muted-foreground mt-2">
                    Click to toggle sectors you want to monitor
                  </p>
                </div>

                <div>
                  <Label>Watchlist Symbols</Label>
                  <Input
                    placeholder="Add symbols (e.g., RELIANCE, TCS, INFY)"
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSaveSettings}>Save Changes</Button>
            </div>
          </TabsContent>

          {/* Admin Panel */}
          {user?.isAdmin && (
            <TabsContent value="admin" className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3>Invite Token Management</h3>
                  <Button onClick={handleGenerateToken}>
                    <Key className="w-4 h-4 mr-2" />
                    Generate Token
                  </Button>
                </div>

                <div className="space-y-3">
                  {inviteTokens.map((token) => (
                    <div
                      key={token.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <code className="text-foreground">{token.token}</code>
                          <Badge variant={token.active ? 'default' : 'secondary'}>
                            {token.active ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="text-muted-foreground">
                          Uses: {token.uses}/{token.maxUses} • Expires: {token.expires}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(token.token);
                            toast('Token copied to clipboard');
                          }}
                        >
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleToken(token.id)}
                        >
                          {token.active ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4">Data Source Management</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-foreground mb-1">Reuters Feed</div>
                      <div className="text-muted-foreground">Last sync: 2 min ago</div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-foreground mb-1">Economic Times</div>
                      <div className="text-muted-foreground">Last sync: 5 min ago</div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="text-foreground mb-1">SEBI Filings</div>
                      <div className="text-muted-foreground">Last sync: 15 min ago</div>
                    </div>
                    <Badge variant="default">Active</Badge>
                  </div>

                  <Button onClick={handleManualFetch} className="w-full">
                    Trigger Manual Fetch
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="mb-4">User Management</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="text-foreground">Total Users</div>
                        <div className="text-muted-foreground">12 active accounts</div>
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full">
                    View All Users
                  </Button>
                </div>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
