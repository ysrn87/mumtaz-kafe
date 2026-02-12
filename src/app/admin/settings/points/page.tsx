'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  getAllSettings, 
  updatePointsConversionRate,
  updateMinPointsForRedemption,
  updateMaxPointsPerTransaction,
  initializeSettings,
} from '@/actions/settings';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function PointsSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [conversionRate, setConversionRate] = useState('1000');
  const [minPoints, setMinPoints] = useState('10');
  const [maxPoints, setMaxPoints] = useState('1000');
  
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const settings = await getAllSettings();
      setConversionRate(settings.pointsConversionRate);
      setMinPoints(settings.minPointsForRedemption);
      setMaxPoints(settings.maxPointsPerTransaction);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  async function handleSaveConversionRate() {
    setLoading(true);
    try {
      const rate = parseInt(conversionRate);
      if (isNaN(rate) || rate < 100 || rate > 10000) {
        toast({
          title: 'Invalid Value',
          description: 'Conversion rate must be between 100 and 10,000',
          variant: 'destructive',
        });
        return;
      }

      await updatePointsConversionRate(rate);
      toast({
        title: 'Success!',
        description: `Conversion rate updated to 1 point = Rp ${rate.toLocaleString('id-ID')}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update conversion rate',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMinPoints() {
    setLoading(true);
    try {
      const min = parseInt(minPoints);
      if (isNaN(min) || min < 1 || min > 1000) {
        toast({
          title: 'Invalid Value',
          description: 'Minimum points must be between 1 and 1,000',
          variant: 'destructive',
        });
        return;
      }

      await updateMinPointsForRedemption(min);
      toast({
        title: 'Success!',
        description: `Minimum points updated to ${min}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update minimum points',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveMaxPoints() {
    setLoading(true);
    try {
      const max = parseInt(maxPoints);
      if (isNaN(max) || max < 10) {
        toast({
          title: 'Invalid Value',
          description: 'Maximum points must be at least 10',
          variant: 'destructive',
        });
        return;
      }

      await updateMaxPointsPerTransaction(max);
      toast({
        title: 'Success!',
        description: `Maximum points updated to ${max}`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update maximum points',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleInitialize() {
    setInitializing(true);
    try {
      await initializeSettings();
      await loadSettings();
      toast({
        title: 'Success!',
        description: 'Settings initialized with default values',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to initialize settings',
        variant: 'destructive',
      });
    } finally {
      setInitializing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* Conversion Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Points Conversion Rate
            </CardTitle>
            <CardDescription>
              Set how much money equals 1 loyalty point
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="conversionRate">1 Point = Rp</Label>
              <div className="flex gap-2">
                <Input
                  id="conversionRate"
                  type="number"
                  min="100"
                  max="10000"
                  step="100"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  placeholder="1000"
                  className="max-w-xs"
                />
                <Button onClick={handleSaveConversionRate} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Current: Rp {parseInt(conversionRate).toLocaleString('id-ID')} = 1 point
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Example</h4>
              <p className="text-sm text-blue-700">
                If a customer spends <strong>Rp {(parseInt(conversionRate) * 10).toLocaleString('id-ID')}</strong>, 
                they will earn <strong>10 points</strong>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Minimum Points */}
        <Card>
          <CardHeader>
            <CardTitle>Minimum Redemption Points</CardTitle>
            <CardDescription>
              Minimum points required to redeem rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="minPoints">Minimum Points</Label>
              <div className="flex gap-2">
                <Input
                  id="minPoints"
                  type="number"
                  min="1"
                  max="1000"
                  value={minPoints}
                  onChange={(e) => setMinPoints(e.target.value)}
                  placeholder="10"
                  className="max-w-xs"
                />
                <Button onClick={handleSaveMinPoints} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Customers need at least {minPoints} points to redeem
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Maximum Points */}
        <Card>
          <CardHeader>
            <CardTitle>Maximum Points Per Transaction</CardTitle>
            <CardDescription>
              Maximum points that can be redeemed in a single transaction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="maxPoints">Maximum Points</Label>
              <div className="flex gap-2">
                <Input
                  id="maxPoints"
                  type="number"
                  min="10"
                  value={maxPoints}
                  onChange={(e) => setMaxPoints(e.target.value)}
                  placeholder="1000"
                  className="max-w-xs"
                />
                <Button onClick={handleSaveMaxPoints} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Customers can redeem up to {maxPoints} points per transaction
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Impact Calculator */}
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle>Impact Calculator</CardTitle>
            <CardDescription>See how your settings affect customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Customer Points</p>
                  <p className="text-2xl font-bold">100</p>
                </div>
                <div>
                  <p className="text-gray-600">Can Redeem</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.min(100, parseInt(maxPoints))}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Max Discount</p>
                  <p className="text-2xl font-bold text-purple-600">
                    Rp {(Math.min(100, parseInt(maxPoints)) * parseInt(conversionRate)).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Initialize Settings */}
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <RefreshCw className="w-5 h-5" />
              Reset to Default
            </CardTitle>
            <CardDescription className="text-orange-700">
              Reset all points settings to default values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={handleInitialize} 
              disabled={initializing}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {initializing ? 'Initializing...' : 'Initialize Default Settings'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
