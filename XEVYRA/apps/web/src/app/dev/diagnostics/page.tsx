'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ShieldCheck, Smartphone, Database, Cpu, CheckCircle2, RefreshCw, ArrowLeft } from 'lucide-react';
import { FlutterBridgeClient } from '@/lib/bridge/flutter-bridge';

export default function DevDiagnosticsPage() {
  const [isFlutter, setIsFlutter] = useState(false);
  const [apiHealth, setApiHealth] = useState<{ status: string; db: string } | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState(false);

  useEffect(() => {
    setIsFlutter(FlutterBridgeClient.isRunningInFlutter());
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setIsLoadingHealth(true);
    try {
      const res = await fetch('http://localhost:4000/api/v1/health').catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setApiHealth({
          status: data.status,
          db: data.services.database,
        });
      } else {
        setApiHealth({ status: 'offline', db: 'unreachable' });
      }
    } catch {
      setApiHealth({ status: 'offline', db: 'unreachable' });
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const handleNativeAuthTest = () => {
    if (isFlutter) {
      FlutterBridgeClient.requestNativeAuth();
      alert('Native Auth request dispatched via Flutter JS Bridge!');
    } else {
      alert('Running in standalone Web browser mode. Flutter JS Bridge is only active in Flutter mobile shell.');
    }
  };

  return (
    <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-8 space-y-6">
      {/* Return to Dashboard */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to App
        </Link>
        <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
          Dev Diagnostic Route
        </span>
      </div>

      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 rounded-full bg-accent animate-pulse" />
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              XEVYRA DEV
            </h1>
          </div>
          <p className="text-xs text-text-secondary mt-1 font-medium">Internal Diagnostics & Health</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-surface border border-border px-3 py-1.5 rounded-full text-xs font-semibold">
          {isFlutter ? (
            <>
              <Smartphone className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent">Flutter Shell</span>
            </>
          ) : (
            <>
              <Activity className="w-3.5 h-3.5 text-primary-light" />
              <span className="text-text-primary">Web Client</span>
            </>
          )}
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-surface/80 backdrop-blur border border-border rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary-light" />
            Foundational Architecture
          </h2>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded">
            Live
          </span>
        </div>

        <p className="text-sm text-text-secondary leading-relaxed">
          Clean Architecture foundation established. The responsive web application and Flutter mobile shell operate
          as first-class clients connected to the unified backend security boundary.
        </p>

        {/* Status Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span>Backend API</span>
              <button
                onClick={checkHealth}
                disabled={isLoadingHealth}
                className="hover:text-text-primary transition-colors"
                title="Refresh Health"
              >
                <RefreshCw className={`w-3 h-3 ${isLoadingHealth ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="text-sm font-semibold text-text-primary capitalize flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiHealth?.status === 'healthy'
                    ? 'bg-accent'
                    : apiHealth?.status === 'degraded'
                    ? 'bg-warning'
                    : 'bg-danger'
                }`}
              />
              {apiHealth ? apiHealth.status : 'Checking...'}
            </div>
          </div>

          <div className="bg-surface-elevated/60 border border-border/80 rounded-xl p-3.5 space-y-1">
            <div className="text-xs text-text-muted">MongoDB Store</div>
            <div className="text-sm font-semibold text-text-primary capitalize flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-primary-light" />
              {apiHealth?.db || 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted px-1">Phase 1 Capabilities</h3>
        <div className="bg-surface border border-border rounded-xl divide-y divide-border text-xs">
          <div className="p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text-primary">Clean Architecture Domain Boundaries</p>
              <p className="text-text-muted mt-0.5">Framework-agnostic domain layer with pure TypeScript entities & value objects.</p>
            </div>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text-primary">Standardized Error Contract</p>
              <p className="text-text-muted mt-0.5">Strict typed errors with request IDs and zero internal stack leakages.</p>
            </div>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text-primary">Firebase ID Token Verification</p>
              <p className="text-text-muted mt-0.5">Server-side authenticated context with zero client-supplied user ID trust.</p>
            </div>
          </div>

          <div className="p-3.5 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-text-primary">Mobile Shell & JavaScript Bridge</p>
              <p className="text-text-muted mt-0.5">Dual web & Flutter WebView interface with secure message passing.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={handleNativeAuthTest}
          className="w-full bg-primary hover:bg-primary-hover active:scale-[0.98] transition-all text-white font-medium py-3 px-4 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
        >
          <Cpu className="w-4 h-4" />
          {isFlutter ? 'Test Flutter JS Bridge Auth' : 'Test Client Bridge Protocol'}
        </button>
      </div>
    </main>
  );
}
