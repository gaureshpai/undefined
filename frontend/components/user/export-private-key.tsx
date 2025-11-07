'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ExportPrivateKey() {
  const { user } = useAuth();
  const [privateKey, setPrivateKey] = useState<string>('');
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setError('');
    try {
      throw new Error('Wallet operations are disabled');
    } catch (err: any) {
      setError(err.message || 'Failed to export private key');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(privateKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([privateKey], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-private-key-${user.email || 'user'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Hide component since wallet operations are disabled
  return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Export Private Key</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Your Private Key</DialogTitle>
          <DialogDescription>
            Export your private key to login with your wallet in the future without needing email verification.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>⚠️ Important Security Warning:</strong>
              <ul className="list-disc ml-4 mt-2 space-y-1">
                <li>Never share your private key with anyone</li>
                <li>Store it in a secure location (password manager, encrypted file)</li>
                <li>Anyone with this key has full access to your wallet</li>
                <li>You can use this key to login directly without email verification</li>
              </ul>
            </AlertDescription>
          </Alert>

          {!privateKey ? (
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Reveal Private Key'}
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-md border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Your Private Key:</p>
                <code className="text-sm break-all font-mono block select-all bg-white p-3 rounded border border-gray-300">
                  {privateKey}
                </code>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleCopy} 
                  variant="outline"
                  className="flex-1"
                >
                  {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                </Button>
                <Button 
                  onClick={handleDownload} 
                  variant="outline"
                  className="flex-1"
                >
                  Download as File
                </Button>
              </div>

              <Alert>
                <AlertDescription>
                  Your private key has been saved to your browser's local storage. 
                  Next time you visit, you can use the "Private Key/Wallet" login option.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
