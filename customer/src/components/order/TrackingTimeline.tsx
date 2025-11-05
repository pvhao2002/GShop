import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatDate } from '../../utils/formatters';

interface TrackingEvent {
  status: string;
  timestamp: string;
  location?: string;
  description: string;
}

interface TrackingTimelineProps {
  trackingHistory: TrackingEvent[];
  currentStatus: string;
}

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  trackingHistory,
  currentStatus,
}) => {
  const getStatusIcon = (status: string, isActive: boolean) => {
    return (
      <View style={[styles.statusIcon, isActive && styles.activeStatusIcon]}>
        <View style={[styles.statusDot, isActive && styles.activeStatusDot]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order Tracking</Text>
      
      <View style={styles.timeline}>
        {trackingHistory.map((event, index) => {
          const isActive = event.status === currentStatus;
          const isLast = index === trackingHistory.length - 1;
          
          return (
            <View key={index} style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                {getStatusIcon(event.status, isActive)}
                {!isLast && <View style={styles.timelineLine} />}
              </View>
              
              <View style={styles.timelineContent}>
                <Text style={[styles.eventStatus, isActive && styles.activeEventStatus]}>
                  {event.status}
                </Text>
                <Text style={styles.eventDescription}>
                  {event.description}
                </Text>
                {event.location && (
                  <Text style={styles.eventLocation}>
                    📍 {event.location}
                  </Text>
                )}
                <Text style={styles.eventTimestamp}>
                  {formatDate(event.timestamp)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  timeline: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: 16,
  },
  statusIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  activeStatusIcon: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  activeStatusDot: {
    backgroundColor: '#fff',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
    minHeight: 20,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 2,
  },
  eventStatus: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  activeEventStatus: {
    color: '#007AFF',
  },
  eventDescription: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  eventLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  eventTimestamp: {
    fontSize: 12,
    color: '#999',
  },
});

export default TrackingTimeline;