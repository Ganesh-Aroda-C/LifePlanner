import React, { useState, useEffect } from 'react';
import { Bell, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export const BrowserNotificationPrompt = () => {
  const [permission, setPermission] = useState('default');
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('Notification' in window)) {
      setSupported(false);
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted') {
        new Notification('LifePlanner Notifications Enabled', {
          body: 'You will receive reminders when tasks and deadlines approach while your browser is open.',
          icon: '/favicon.ico',
        });
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('LifePlanner Test Reminder', {
        body: 'System notifications are operating correctly!',
        icon: '/favicon.ico',
      });
    }
  };

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
        <div>
          <p className="font-semibold">Browser Notifications Not Supported</p>
          <p className="mt-0.5 text-amber-700">
            Your current browser does not support the Web Notifications API. Reminders will be displayed in-app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-800">
                Desktop Web Notifications
              </h4>
              {permission === 'granted' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : permission === 'denied' ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  Blocked in Browser
                </span>
              ) : (
                <span className="inline-flex items-center text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Action Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Receive alerts for upcoming deadlines and scheduled tasks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {permission !== 'granted' ? (
            <Button size="sm" variant="primary" onClick={requestPermission}>
              Enable Notifications
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={sendTestNotification}>
              Send Test Alert
            </Button>
          )}
        </div>
      </div>

      {/* Realistic limitation disclosure required by specs */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs text-slate-500 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-medium text-slate-700">Platform Note:</span> Web notifications require the browser tab to remain active or running in the background. Unlike native Android alarms (scheduled for Phase 4), desktop web notifications cannot wake sleeping devices or ring when your browser process is terminated.
        </div>
      </div>
    </div>
  );
};
