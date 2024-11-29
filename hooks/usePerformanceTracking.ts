// hooks/usePerformanceTracking.ts
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function usePerformanceTracking() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper function to send metrics to your backend
  const sendMetric = async (metricData: any) => {
    try {
      // We use your backend URL (running on port 3000)
      // Replace this URL with your actual backend endpoint
      const response = await fetch(
        'http://localhost:3000/api/performance-metrics',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...metricData,
            pathname,
            // Convert URLSearchParams to plain object
            searchParams: Object.fromEntries(searchParams.entries()),
            timestamp: Date.now(),
            userAgent: window.navigator.userAgent,
            // You might want to include other relevant data like
            // user session ID, device type, etc.
          }),
        }
      );

      if (!response.ok) {
        // We don't want to throw errors as this is metrics collection
        console.warn('Failed to send performance metric:', response.statusText);
      }
    } catch (error) {
      // Silent fail for metrics collection
      console.warn('Error sending performance metric:', error);
    }
  };

  useEffect(() => {
    // Record when navigation starts
    const navigationStart = performance.now();

    // Create our performance observer
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();

      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          // Create a comprehensive metric object
          const metricData = {
            type: 'largest-contentful-paint',
            value: entry.startTime,
            navigationStart,
            navigationDuration: entry.startTime - navigationStart,
            elementId: (entry as any).element?.id || null,
            elementTag: (entry as any).element?.tagName?.toLowerCase() || null,
            url: window.location.href,
          };

          // Send the metric to your backend
          sendMetric(metricData);
        }
      });
    });

    // Start observing performance metrics
    observer.observe({
      entryTypes: ['largest-contentful-paint'],
    });

    // We can also track other useful metrics here
    // Track when the page becomes interactive
    const timeToInteractive = performance.now() - navigationStart;
    sendMetric({
      type: 'time-to-interactive',
      value: timeToInteractive,
      navigationStart,
      url: window.location.href,
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname, searchParams]);
}
