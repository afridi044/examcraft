#!/usr/bin/env node

/**
 * =============================================================================
 * ExamCraft Frontend - Health Check Script
 * =============================================================================
 * This script performs health checks for Docker containers to ensure the
 * Next.js application is running properly and responding to requests.
 * =============================================================================
 */

import http from 'http';
import https from 'https';

// Configuration
const HEALTH_CHECK_CONFIG = {
  // Health check endpoint
  path: '/api/health',
  // Timeout for health check request (in milliseconds)
  timeout: 5000,
  // Expected HTTP status codes for healthy response
  expectedStatusCodes: [200, 201],
  // Host and port configuration
  host: process.env.HOSTNAME || 'localhost',
  port: process.env.PORT || 3000,
  // Protocol (http or https)
  protocol: process.env.HEALTH_CHECK_PROTOCOL || 'http'
};

/**
 * Performs the health check request
 * @returns {Promise<boolean>} True if healthy, false otherwise
 */
function performHealthCheck() {
  return new Promise((resolve) => {
    const { protocol, host, port, path, timeout, expectedStatusCodes } = HEALTH_CHECK_CONFIG;
    
    // Construct the health check URL
    const healthCheckUrl = `${protocol}://${host}:${port}${path}`;
    
    console.log(`[Health Check] Checking: ${healthCheckUrl}`);
    
    // Choose the appropriate HTTP module
    const httpModule = protocol === 'https' ? https : http;
    
    // Create the request options
    const options = {
      hostname: host,
      port: port,
      path: path,
      method: 'GET',
      timeout: timeout,
      headers: {
        'User-Agent': 'ExamCraft-HealthCheck/1.0',
        'Accept': 'application/json',
        'Connection': 'close'
      }
    };
    
    // Create the request
    const req = httpModule.request(options, (res) => {
      const { statusCode } = res;
      
      console.log(`[Health Check] Response status: ${statusCode}`);
      
      // Check if status code indicates healthy response
      if (expectedStatusCodes.includes(statusCode)) {
        console.log('[Health Check] ✅ Application is healthy');
        resolve(true);
      } else {
        console.log(`[Health Check] ❌ Unexpected status code: ${statusCode}`);
        resolve(false);
      }
      
      // Consume response data to free up memory
      res.on('data', () => {});
      res.on('end', () => {});
    });
    
    // Handle request errors
    req.on('error', (error) => {
      console.log(`[Health Check] ❌ Request error: ${error.message}`);
      resolve(false);
    });
    
    // Handle request timeout
    req.on('timeout', () => {
      console.log(`[Health Check] ❌ Request timeout after ${timeout}ms`);
      req.destroy();
      resolve(false);
    });
    
    // Send the request
    req.end();
  });
}

/**
 * Fallback health check for basic server availability
 * @returns {Promise<boolean>} True if server is responding, false otherwise
 */
function performBasicHealthCheck() {
  return new Promise((resolve) => {
    const { protocol, host, port, timeout } = HEALTH_CHECK_CONFIG;
    
    console.log('[Health Check] Performing basic connectivity check...');
    
    const httpModule = protocol === 'https' ? https : http;
    
    const options = {
      hostname: host,
      port: port,
      path: '/',
      method: 'HEAD',
      timeout: timeout,
      headers: {
        'User-Agent': 'ExamCraft-HealthCheck/1.0',
        'Connection': 'close'
      }
    };
    
    const req = httpModule.request(options, (res) => {
      console.log(`[Health Check] Basic check response: ${res.statusCode}`);
      // Any response indicates the server is running
      resolve(res.statusCode < 500);
    });
    
    req.on('error', (error) => {
      console.log(`[Health Check] ❌ Basic check error: ${error.message}`);
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('[Health Check] ❌ Basic check timeout');
      req.destroy();
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Main health check function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('ExamCraft Frontend - Health Check');
  console.log('='.repeat(60));
  
  try {
    // First, try the dedicated health check endpoint
    let isHealthy = await performHealthCheck();
    
    // If the health check endpoint fails, try a basic connectivity check
    if (!isHealthy) {
      console.log('[Health Check] Dedicated endpoint failed, trying basic check...');
      isHealthy = await performBasicHealthCheck();
    }
    
    if (isHealthy) {
      console.log('[Health Check] 🎉 Application is healthy and ready to serve requests');
      process.exit(0);
    } else {
      console.log('[Health Check] 💀 Application is not healthy');
      process.exit(1);
    }
  } catch (error) {
    console.log(`[Health Check] ❌ Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

// Handle process signals gracefully
process.on('SIGTERM', () => {
  console.log('[Health Check] Received SIGTERM, exiting...');
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('[Health Check] Received SIGINT, exiting...');
  process.exit(1);
});

// Run the health check
main(); 