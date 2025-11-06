#!/usr/bin/env node

/**
 * Bundle Analysis Script for React Native Expo App
 * 
 * This script analyzes the bundle size and provides optimization recommendations.
 * Run with: node scripts/analyze-bundle.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class BundleAnalyzer {
  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.nodeModulesPath = path.join(this.projectRoot, 'node_modules');
    this.srcPath = path.join(this.projectRoot, 'app');
    this.componentsPath = path.join(this.projectRoot, 'components');
    this.servicesPath = path.join(this.projectRoot, 'services');
    this.utilsPath = path.join(this.projectRoot, 'utils');
  }

  async analyze() {
    console.log('🔍 Analyzing bundle size and dependencies...\n');

    try {
      // Analyze package.json dependencies
      await this.analyzeDependencies();
      
      // Analyze source code structure
      await this.analyzeSourceCode();
      
      // Check for optimization opportunities
      await this.checkOptimizations();
      
      // Generate recommendations
      await this.generateRecommendations();
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message);
      process.exit(1);
    }
  }

  async analyzeDependencies() {
    console.log('📦 Dependency Analysis');
    console.log('='.repeat(50));

    const packageJson = JSON.parse(
      fs.readFileSync(path.join(this.projectRoot, 'package.json'), 'utf8')
    );

    const dependencies = packageJson.dependencies || {};
    const devDependencies = packageJson.devDependencies || {};

    console.log(`Total dependencies: ${Object.keys(dependencies).length}`);
    console.log(`Dev dependencies: ${Object.keys(devDependencies).length}`);

    // Analyze large dependencies
    const largeDependencies = await this.findLargeDependencies(dependencies);
    if (largeDependencies.length > 0) {
      console.log('\n🚨 Large dependencies (>1MB):');
      largeDependencies.forEach(dep => {
        console.log(`  - ${dep.name}: ${dep.size}`);
      });
    }

    // Check for duplicate dependencies
    const duplicates = await this.findDuplicateDependencies();
    if (duplicates.length > 0) {
      console.log('\n⚠️  Potential duplicate dependencies:');
      duplicates.forEach(dup => {
        console.log(`  - ${dup}`);
      });
    }

    console.log('\n');
  }

  async analyzeSourceCode() {
    console.log('📁 Source Code Analysis');
    console.log('='.repeat(50));

    const sourceStats = await this.getDirectoryStats(this.srcPath, 'App');
    const componentStats = await this.getDirectoryStats(this.componentsPath, 'Components');
    const serviceStats = await this.getDirectoryStats(this.servicesPath, 'Services');
    const utilStats = await this.getDirectoryStats(this.utilsPath, 'Utils');

    console.log(`App files: ${sourceStats.files} (${sourceStats.size})`);
    console.log(`Components: ${componentStats.files} (${componentStats.size})`);
    console.log(`Services: ${serviceStats.files} (${serviceStats.size})`);
    console.log(`Utils: ${utilStats.files} (${utilStats.size})`);

    // Find large files
    const largeFiles = await this.findLargeFiles();
    if (largeFiles.length > 0) {
      console.log('\n📄 Large files (>50KB):');
      largeFiles.forEach(file => {
        console.log(`  - ${file.path}: ${file.size}`);
      });
    }

    console.log('\n');
  }

  async checkOptimizations() {
    console.log('⚡ Optimization Opportunities');
    console.log('='.repeat(50));

    const opportunities = [];

    // Check for unused imports
    const unusedImports = await this.findUnusedImports();
    if (unusedImports.length > 0) {
      opportunities.push({
        type: 'Unused Imports',
        count: unusedImports.length,
        impact: 'Medium',
        files: unusedImports.slice(0, 5) // Show first 5
      });
    }

    // Check for large images
    const largeImages = await this.findLargeImages();
    if (largeImages.length > 0) {
      opportunities.push({
        type: 'Large Images',
        count: largeImages.length,
        impact: 'High',
        files: largeImages.slice(0, 5)
      });
    }

    // Check for missing lazy loading
    const nonLazyScreens = await this.findNonLazyScreens();
    if (nonLazyScreens.length > 0) {
      opportunities.push({
        type: 'Non-Lazy Screens',
        count: nonLazyScreens.length,
        impact: 'Medium',
        files: nonLazyScreens.slice(0, 5)
      });
    }

    if (opportunities.length === 0) {
      console.log('✅ No major optimization opportunities found!');
    } else {
      opportunities.forEach(opp => {
        console.log(`\n${opp.type} (${opp.impact} impact): ${opp.count} items`);
        opp.files.forEach(file => {
          console.log(`  - ${file}`);
        });
      });
    }

    console.log('\n');
  }

  async generateRecommendations() {
    console.log('💡 Optimization Recommendations');
    console.log('='.repeat(50));

    const recommendations = [
      {
        title: 'Enable Hermes Engine',
        description: 'Hermes can reduce bundle size and improve startup time',
        command: 'Add "jsEngine": "hermes" to app.json',
        priority: 'High'
      },
      {
        title: 'Implement Code Splitting',
        description: 'Split large screens into separate bundles',
        command: 'Use React.lazy() and Suspense for screen components',
        priority: 'High'
      },
      {
        title: 'Optimize Images',
        description: 'Compress and resize images appropriately',
        command: 'Use expo-image-manipulator or external services',
        priority: 'Medium'
      },
      {
        title: 'Tree Shaking',
        description: 'Remove unused code from dependencies',
        command: 'Use babel-plugin-transform-remove-console in production',
        priority: 'Medium'
      },
      {
        title: 'Bundle Analysis',
        description: 'Regularly analyze bundle size',
        command: 'npx expo export --dump-sourcemap',
        priority: 'Low'
      }
    ];

    recommendations.forEach(rec => {
      console.log(`\n${rec.title} (${rec.priority} Priority)`);
      console.log(`  ${rec.description}`);
      console.log(`  Command: ${rec.command}`);
    });

    console.log('\n');
  }

  async findLargeDependencies(dependencies) {
    // This is a simplified implementation
    // In a real scenario, you'd use tools like bundlephobia API
    const largeDeps = [];
    
    const knownLargeDeps = {
      'react-native': '~50MB',
      'expo': '~30MB',
      '@react-navigation/native': '~5MB',
      'axios': '~2MB',
      'lodash': '~4MB'
    };

    Object.keys(dependencies).forEach(dep => {
      if (knownLargeDeps[dep]) {
        largeDeps.push({ name: dep, size: knownLargeDeps[dep] });
      }
    });

    return largeDeps;
  }

  async findDuplicateDependencies() {
    // Simplified duplicate detection
    return []; // Placeholder
  }

  async getDirectoryStats(dirPath, name) {
    if (!fs.existsSync(dirPath)) {
      return { files: 0, size: '0KB' };
    }

    let fileCount = 0;
    let totalSize = 0;

    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walkDir(filePath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
          fileCount++;
          totalSize += stat.size;
        }
      });
    };

    walkDir(dirPath);

    return {
      files: fileCount,
      size: this.formatBytes(totalSize)
    };
  }

  async findLargeFiles() {
    const largeFiles = [];
    const threshold = 50 * 1024; // 50KB

    const searchDirs = [this.srcPath, this.componentsPath, this.servicesPath, this.utilsPath];

    searchDirs.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.walkDirectory(dir, (filePath, stat) => {
          if (stat.size > threshold && (filePath.endsWith('.tsx') || filePath.endsWith('.ts'))) {
            largeFiles.push({
              path: path.relative(this.projectRoot, filePath),
              size: this.formatBytes(stat.size)
            });
          }
        });
      }
    });

    return largeFiles.sort((a, b) => b.size.localeCompare(a.size));
  }

  async findUnusedImports() {
    // Simplified unused import detection
    // In a real implementation, you'd use AST parsing
    return []; // Placeholder
  }

  async findLargeImages() {
    const largeImages = [];
    const assetsPath = path.join(this.projectRoot, 'assets');
    
    if (fs.existsSync(assetsPath)) {
      this.walkDirectory(assetsPath, (filePath, stat) => {
        if (stat.size > 100 * 1024 && /\.(png|jpg|jpeg|gif)$/i.test(filePath)) {
          largeImages.push(path.relative(this.projectRoot, filePath));
        }
      });
    }

    return largeImages;
  }

  async findNonLazyScreens() {
    const nonLazyScreens = [];
    
    if (fs.existsSync(this.srcPath)) {
      this.walkDirectory(this.srcPath, (filePath) => {
        if (filePath.endsWith('.tsx') && filePath.includes('app/')) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (!content.includes('lazy') && !content.includes('Suspense')) {
            nonLazyScreens.push(path.relative(this.projectRoot, filePath));
          }
        }
      });
    }

    return nonLazyScreens;
  }

  walkDirectory(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        this.walkDirectory(filePath, callback);
      } else {
        callback(filePath, stat);
      }
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + sizes[i];
  }
}

// Run the analyzer
if (require.main === module) {
  const analyzer = new BundleAnalyzer();
  analyzer.analyze().catch(console.error);
}

module.exports = BundleAnalyzer;