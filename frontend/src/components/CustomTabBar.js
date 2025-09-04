import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import TabIconWithBadge from './TabIconWithBadge';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel !== undefined
          ? options.tabBarLabel
          : options.title !== undefined
          ? options.title
          : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        let iconName;
        let badgeCount = 0;
        let showBadge = false;

        switch (route.name) {
          case 'Dashboard':
            iconName = isFocused ? 'home' : 'home-outline';
            break;
          case 'Discover':
            iconName = isFocused ? 'search' : 'search-outline';
            break;
          case 'CreateEvent':
            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.createButton}
              >
                <LinearGradient
                  colors={['#84cc16', '#22c55e']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.createGradient}
                >
                  <Ionicons name="add" size={24} color="#ffffff" />
                </LinearGradient>
                <Text style={styles.createLabel}>Créer</Text>
              </TouchableOpacity>
            );
          case 'Messages':
            iconName = isFocused ? 'chatbubbles' : 'chatbubbles-outline';
            badgeCount = 3;
            showBadge = true;
            break;
          case 'Profile':
            iconName = isFocused ? 'person' : 'person-outline';
            break;
          default:
            iconName = 'circle';
        }

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tab}
          >
            <View style={[
              styles.tabContent,
              isFocused && styles.activeTabContent
            ]}>
              <View style={[
                styles.iconContainer,
                isFocused && styles.activeIconContainer
              ]}>
                {route.name === 'Messages' ? (
                  <TabIconWithBadge 
                    iconName={iconName} 
                    size={24} 
                    color={isFocused ? '#20B2AA' : '#64748b'}
                    badgeCount={badgeCount}
                    showBadge={showBadge}
                  />
                ) : (
                  <Ionicons 
                    name={iconName} 
                    size={24} 
                    color={isFocused ? '#20B2AA' : '#64748b'} 
                  />
                )}
              </View>
              <Text style={[
                styles.label,
                isFocused && styles.activeLabel
              ]}>
                {label}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingBottom: 34, // Space for iPhone home indicator
    paddingTop: 12,
    height: 90,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeTabContent: {
    backgroundColor: 'rgba(32, 178, 170, 0.1)',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(32, 178, 170, 0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 4,
  },
  activeLabel: {
    color: '#20B2AA',
  },
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#20B2AA',
    marginTop: 2,
  },
  createButton: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -8,
  },
  createGradient: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#84cc16',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 4,
  },
});

export default CustomTabBar;
