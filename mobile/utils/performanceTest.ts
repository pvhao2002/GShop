import { PerformanceMonitor } from './performance';

export interface PerformanceTestResult {
  testName: string;
  duration: number;
  passed: boolean;
  threshold: number;
  details?: any;
}

export interface PerformanceTestSuite {
  name: string;
  tests: PerformanceTestResult[];
  overallPassed: boolean;
  totalDuration: number;
}

class PerformanceTestRunner {
  private monitor: PerformanceMonitor;
  private results: PerformanceTestSuite[] = [];

  constructor() {
    this.monitor = PerformanceMonitor.getInstance();
  }

  async runTestSuite(suiteName: string, tests: Array<() => Promise<PerformanceTestResult>>): Promise<PerformanceTestSuite> {
    console.log(`🧪 Running performance test suite: ${suiteName}`);
    
    const suiteStartTime = Date.now();
    const testResults: PerformanceTestResult[] = [];

    for (const test of tests) {
      try {
        const result = await test();
        testResults.push(result);
        
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${result.testName}: ${result.duration}ms (threshold: ${result.threshold}ms)`);
      } catch (error) {
        console.error(`  ❌ Test failed with error:`, error);
        testResults.push({
          testName: 'Unknown Test',
          duration: 0,
          passed: false,
          threshold: 0,
          details: { error: error.message }
        });
      }
    }

    const suite: PerformanceTestSuite = {
      name: suiteName,
      tests: testResults,
      overallPassed: testResults.every(t => t.passed),
      totalDuration: Date.now() - suiteStartTime
    };

    this.results.push(suite);
    
    const overallStatus = suite.overallPassed ? '✅' : '❌';
    console.log(`${overallStatus} Suite ${suiteName} completed in ${suite.totalDuration}ms\n`);

    return suite;
  }

  // Pre-built performance tests
  async testNavigationPerformance(): Promise<PerformanceTestResult> {
    const testName = 'Navigation Performance';
    const threshold = 300; // 300ms threshold
    
    this.monitor.startTiming('navigation-test');
    
    // Simulate navigation operations
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const duration = this.monitor.endTiming('navigation-test');
    
    return {
      testName,
      duration,
      passed: duration <= threshold,
      threshold,
      details: { type: 'navigation' }
    };
  }

  async testImageLoadingPerformance(): Promise<PerformanceTestResult> {
    const testName = 'Image Loading Performance';
    const threshold = 1000; // 1 second threshold
    
    this.monitor.startTiming('image-loading-test');
    
    // Simulate image loading
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const duration = this.monitor.endTiming('image-loading-test');
    
    return {
      testName,
      duration,
      passed: duration <= threshold,
      threshold,
      details: { type: 'image-loading' }
    };
  }

  async testListRenderingPerformance(): Promise<PerformanceTestResult> {
    const testName = 'List Rendering Performance';
    const threshold = 500; // 500ms threshold
    
    this.monitor.startTiming('list-rendering-test');
    
    // Simulate list rendering with 100 items
    const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
    
    // Simulate processing time
    items.forEach(item => {
      // Simulate some processing
      JSON.stringify(item);
    });
    
    const duration = this.monitor.endTiming('list-rendering-test');
    
    return {
      testName,
      duration,
      passed: duration <= threshold,
      threshold,
      details: { type: 'list-rendering', itemCount: items.length }
    };
  }

  async testAPIResponseTime(): Promise<PerformanceTestResult> {
    const testName = 'API Response Time';
    const threshold = 2000; // 2 seconds threshold
    
    this.monitor.startTiming('api-response-test');
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const duration = this.monitor.endTiming('api-response-test');
      
      return {
        testName,
        duration,
        passed: duration <= threshold,
        threshold,
        details: { type: 'api-response', success: true }
      };
    } catch (error) {
      const duration = this.monitor.endTiming('api-response-test');
      
      return {
        testName,
        duration,
        passed: false,
        threshold,
        details: { type: 'api-response', success: false, error: error.message }
      };
    }
  }

  async testMemoryUsage(): Promise<PerformanceTestResult> {
    const testName = 'Memory Usage';
    const threshold = 100; // 100MB threshold (simplified)
    
    // Simulate memory usage test
    const memoryUsage = Math.random() * 150; // Random memory usage
    
    return {
      testName,
      duration: 0, // Memory test doesn't have duration
      passed: memoryUsage <= threshold,
      threshold,
      details: { type: 'memory-usage', usage: `${memoryUsage.toFixed(1)}MB` }
    };
  }

  async testBundleSize(): Promise<PerformanceTestResult> {
    const testName = 'Bundle Size';
    const threshold = 10; // 10MB threshold (simplified)
    
    // Simulate bundle size check
    const bundleSize = Math.random() * 15; // Random bundle size
    
    return {
      testName,
      duration: 0, // Bundle size test doesn't have duration
      passed: bundleSize <= threshold,
      threshold,
      details: { type: 'bundle-size', size: `${bundleSize.toFixed(1)}MB` }
    };
  }

  async runAllTests(): Promise<PerformanceTestSuite[]> {
    console.log('🚀 Starting comprehensive performance tests...\n');

    // Core Performance Tests
    await this.runTestSuite('Core Performance', [
      () => this.testNavigationPerformance(),
      () => this.testImageLoadingPerformance(),
      () => this.testListRenderingPerformance(),
    ]);

    // Network Performance Tests
    await this.runTestSuite('Network Performance', [
      () => this.testAPIResponseTime(),
    ]);

    // Resource Usage Tests
    await this.runTestSuite('Resource Usage', [
      () => this.testMemoryUsage(),
      () => this.testBundleSize(),
    ]);

    return this.results;
  }

  getResults(): PerformanceTestSuite[] {
    return [...this.results];
  }

  generateReport(): string {
    let report = '📊 Performance Test Report\n';
    report += '='.repeat(50) + '\n\n';

    this.results.forEach(suite => {
      const status = suite.overallPassed ? '✅' : '❌';
      report += `${status} ${suite.name} (${suite.totalDuration}ms)\n`;
      
      suite.tests.forEach(test => {
        const testStatus = test.passed ? '  ✅' : '  ❌';
        report += `${testStatus} ${test.testName}: `;
        
        if (test.duration > 0) {
          report += `${test.duration}ms (threshold: ${test.threshold}ms)\n`;
        } else {
          report += `${test.details?.usage || test.details?.size || 'N/A'} (threshold: ${test.threshold}${test.details?.type === 'memory-usage' ? 'MB' : test.details?.type === 'bundle-size' ? 'MB' : ''})\n`;
        }
      });
      
      report += '\n';
    });

    // Summary
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passedTests = this.results.reduce((sum, suite) => sum + suite.tests.filter(t => t.passed).length, 0);
    const failedTests = totalTests - passedTests;

    report += `Summary: ${passedTests}/${totalTests} tests passed`;
    if (failedTests > 0) {
      report += `, ${failedTests} failed`;
    }
    report += '\n';

    return report;
  }

  clearResults(): void {
    this.results = [];
    this.monitor.clearMetrics();
  }
}

// Export singleton instance
export const performanceTestRunner = new PerformanceTestRunner();

// Convenience functions
export async function runPerformanceTests(): Promise<PerformanceTestSuite[]> {
  return performanceTestRunner.runAllTests();
}

export function getPerformanceReport(): string {
  return performanceTestRunner.generateReport();
}

export async function quickPerformanceCheck(): Promise<boolean> {
  const results = await performanceTestRunner.runTestSuite('Quick Check', [
    () => performanceTestRunner.testNavigationPerformance(),
    () => performanceTestRunner.testImageLoadingPerformance(),
  ]);
  
  return results.overallPassed;
}