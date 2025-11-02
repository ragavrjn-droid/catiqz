import React, { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Button } from './ui/button';

export function InitDemoData() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [autoInitialized, setAutoInitialized] = useState(false);

  const initializeDemoData = async () => {
    setStatus('loading');
    setMessage('Initializing demo data...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2dfefaa8/init-demo-data`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`Demo data initialized successfully! Added ${data.data.events} events, ${data.data.stocks} stocks, ${data.data.calendarEvents} calendar events.`);
        localStorage.setItem('catiqz-demo-initialized', 'true');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to initialize demo data');
      }
    } catch (error) {
      setStatus('error');
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    // Auto-initialize demo data on first load
    const isInitialized = localStorage.getItem('catiqz-demo-initialized');
    if (!isInitialized && !autoInitialized) {
      setAutoInitialized(true);
      initializeDemoData();
    }
  }, [autoInitialized]);

  if (status === 'idle') {
    return null;
  }

  if (status === 'loading') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="w-80">
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>Initializing</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert className="w-80 border-green-500">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Alert variant="destructive" className="w-80">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="mb-2">{message}</AlertDescription>
          <Button size="sm" variant="outline" onClick={initializeDemoData}>
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return null;
}
