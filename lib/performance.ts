/**
 * Performance monitoring utilities for tracking page load times and component rendering
 */

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric> = new Map();

  start(name: string): void {
    if (typeof window !== "undefined" && performance.mark) {
      performance.mark(`${name}-start`);
    }
    this.metrics.set(name, {
      name,
      startTime: Date.now(),
    });
  }

  end(name: string): number | null {
    const metric = this.metrics.get(name);
    if (!metric) {
      console.warn(`Performance metric "${name}" was not started`);
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - metric.startTime;

    this.metrics.set(name, {
      ...metric,
      endTime,
      duration,
    });

    if (
      typeof window !== "undefined" &&
      performance.mark &&
      performance.measure
    ) {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    }

    // Only log in development
    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 ${name}: ${duration}ms`);
    }

    return duration;
  }

  getMetric(name: string): PerformanceMetric | undefined {
    return this.metrics.get(name);
  }

  getAllMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clear(): void {
    this.metrics.clear();
  }

  // Helper for measuring component render time
  measureRender<T>(name: string, fn: () => T): T {
    this.start(name);
    const result = fn();
    this.end(name);
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();

// React hook for measuring component render times
import { useEffect, useRef } from "react";

export function usePerformanceTracking(componentName: string) {
  const renderCount = useRef<number>(0);
  const mountTime = useRef<number | null>(null);

  useEffect(() => {
    // Track mount time
    mountTime.current = Date.now();
    performanceMonitor.start(`${componentName}-mount`);

    return () => {
      // Track unmount time
      if (mountTime.current !== null) {
        performanceMonitor.end(`${componentName}-mount`);
      }
    };
  }, [componentName]);

  useEffect(() => {
    // Track re-renders
    renderCount.current++;
    if (process.env.NODE_ENV === "development" && renderCount.current > 1) {
      console.log(
        `🔄 ${componentName} re-rendered ${renderCount.current} times`
      );
    }
  });

  return {
    renderCount: renderCount.current,
  };
}

// Web Vitals tracking
export function trackWebVitals() {
  if (typeof window === "undefined") return;

  // Track First Contentful Paint (FCP)
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === "first-contentful-paint") {
        console.log("🎨 FCP:", entry.startTime);
      }
    }
  }).observe({ entryTypes: ["paint"] });

  // Track Largest Contentful Paint (LCP)
  new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    console.log("📏 LCP:", lastEntry.startTime);
  }).observe({ entryTypes: ["largest-contentful-paint"] });

  // Track First Input Delay (FID)
  new PerformanceObserver((list) => {
    const entries = list.getEntries() as unknown as PerformanceEventTiming[];
    for (const entry of entries) {
      console.log("👆 FID:", entry.processingStart - entry.startTime);
    }
  }).observe({ entryTypes: ["first-input"] as any });
}
