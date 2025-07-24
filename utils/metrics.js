import fs from 'fs';
import path from 'path';

const METRICS_FILE = path.join(process.cwd(), 'data', 'metrics.json');

// Ensure metrics file exists
function ensureMetricsFile() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  if (!fs.existsSync(METRICS_FILE)) {
    fs.writeFileSync(METRICS_FILE, JSON.stringify({
      commandUsage: {},
      ticketMetrics: {},
      performanceMetrics: [],
      errorMetrics: {}
    }, null, 2));
  }
}

export const trackMetric = (action, duration, metadata = {}) => {
  ensureMetricsFile();
  
  try {
    const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    const timestamp = new Date().toISOString();
    
    // Track performance
    metrics.performanceMetrics.push({
      action,
      duration,
      timestamp,
      metadata
    });
    
    // Keep only last 1000 performance metrics
    if (metrics.performanceMetrics.length > 1000) {
      metrics.performanceMetrics = metrics.performanceMetrics.slice(-1000);
    }
    
    // Track command usage
    if (metadata.command) {
      metrics.commandUsage[metadata.command] = (metrics.commandUsage[metadata.command] || 0) + 1;
    }
    
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
    
    console.log(`Metric: ${action} took ${duration}ms`, metadata);
  } catch (error) {
    console.error('Error tracking metric:', error);
  }
};

export const trackError = (context, error, metadata = {}) => {
  ensureMetricsFile();
  
  try {
    const metrics = JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
    const timestamp = new Date().toISOString();
    
    const errorKey = `${context}-${error.name || 'Unknown'}`;
    
    if (!metrics.errorMetrics[errorKey]) {
      metrics.errorMetrics[errorKey] = {
        count: 0,
        lastOccurred: null,
        firstOccurred: timestamp
      };
    }
    
    metrics.errorMetrics[errorKey].count++;
    metrics.errorMetrics[errorKey].lastOccurred = timestamp;
    
    fs.writeFileSync(METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (writeError) {
    console.error('Error tracking error metric:', writeError);
  }
};

export const getMetrics = () => {
  ensureMetricsFile();
  
  try {
    return JSON.parse(fs.readFileSync(METRICS_FILE, 'utf8'));
  } catch (error) {
    console.error('Error reading metrics:', error);
    return {
      commandUsage: {},
      ticketMetrics: {},
      performanceMetrics: [],
      errorMetrics: {}
    };
  }
};

export const getPerformanceStats = (timeframe = '24h') => {
  const metrics = getMetrics();
  const now = Date.now();
  const timeframeMs = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000
  }[timeframe] || 24 * 60 * 60 * 1000;
  
  const recentMetrics = metrics.performanceMetrics.filter(
    metric => now - new Date(metric.timestamp).getTime() < timeframeMs
  );
  
  if (recentMetrics.length === 0) {
    return { avgDuration: 0, totalActions: 0, slowestAction: null };
  }
  
  const avgDuration = recentMetrics.reduce((sum, m) => sum + m.duration, 0) / recentMetrics.length;
  const slowestAction = recentMetrics.reduce((slowest, m) => 
    !slowest || m.duration > slowest.duration ? m : slowest
  );
  
  return {
    avgDuration: Math.round(avgDuration),
    totalActions: recentMetrics.length,
    slowestAction
  };
};
