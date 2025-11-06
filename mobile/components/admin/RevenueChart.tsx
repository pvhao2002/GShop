import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';

interface RevenueDataPoint {
  period: string;
  revenue: number;
  orderCount: number;
}

interface RevenueChartProps {
  data: RevenueDataPoint[];
  width?: number;
  height?: number;
  isLoading?: boolean;
}

const { width: screenWidth } = Dimensions.get('window');

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  width = screenWidth - 32,
  height = 200,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <View style={[styles.container, { width, height }]}>
        <View style={styles.loadingContainer}>
          <View style={styles.loadingBar} />
          <View style={[styles.loadingBar, styles.loadingBarShort]} />
          <View style={[styles.loadingBar, styles.loadingBarMedium]} />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>No revenue data available</Text>
      </View>
    );
  }

  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Find min and max values
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const minRevenue = Math.min(...data.map(d => d.revenue));
  const revenueRange = maxRevenue - minRevenue || 1;

  // Create path for the line chart
  const createPath = () => {
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.revenue - minRevenue) / revenueRange) * chartHeight;
      return { x, y, revenue: point.revenue };
    });

    const pathData = points.reduce((path, point, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${point.x} ${point.y}`;
    }, '');

    return { pathData, points };
  };

  const { pathData, points } = createPath();

  const formatCurrency = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };

  return (
    <View style={[styles.container, { width, height }]}>
      <Text style={styles.chartTitle}>Revenue Trend</Text>
      <Svg width={width} height={height - 30}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * ratio;
          return (
            <Line
              key={index}
              x1={padding}
              y1={y}
              x2={padding + chartWidth}
              y2={y}
              stroke="#F0F0F0"
              strokeWidth="1"
            />
          );
        })}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const y = padding + chartHeight * (1 - ratio);
          const value = minRevenue + revenueRange * ratio;
          return (
            <SvgText
              key={index}
              x={padding - 10}
              y={y + 4}
              fontSize="10"
              fill="#666666"
              textAnchor="end"
            >
              {formatCurrency(value)}
            </SvgText>
          );
        })}

        {/* Revenue line */}
        <Path
          d={pathData}
          stroke="#4A5D23"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#4A5D23"
            stroke="#FFFFFF"
            strokeWidth="2"
          />
        ))}

        {/* X-axis labels */}
        {data.map((point, index) => {
          const x = padding + (index / (data.length - 1)) * chartWidth;
          return (
            <SvgText
              key={index}
              x={x}
              y={height - 10}
              fontSize="10"
              fill="#666666"
              textAnchor="middle"
            >
              {point.period}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'Poppins',
    marginBottom: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBar: {
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    marginBottom: 8,
    width: '80%',
  },
  loadingBarShort: {
    width: '60%',
  },
  loadingBarMedium: {
    width: '70%',
  },
  noDataText: {
    fontSize: 14,
    color: '#999999',
    fontFamily: 'Inter',
    textAlign: 'center',
    flex: 1,
    textAlignVertical: 'center',
  },
});