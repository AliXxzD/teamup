import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';
import GlobalMenu from '../components/GlobalMenu';
import GradientButton from '../components/GradientButton';

const HomeScreen = ({ navigation }) => {
  
  const sportsEvents = [
    {
      title: 'Tournoi Football',
      date: 'Jusqu\'au 31 déc.',
      badge: 'BIENTÔT',
      badgeColor: 'rgba(156, 163, 175, 0.8)',
      imageUrl: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop&crop=center'
    },
    {
      title: 'Tournoi Basketball',
      date: 'Démarre le 15 jan.',
      badge: 'BIENTÔT',
      badgeColor: 'rgba(156, 163, 175, 0.8)',
      imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop&crop=center'
    },
    {
      title: 'Session Tennis',
      date: 'Tous les samedis',
      badge: 'GRATUIT',
      badgeColor: 'rgba(34, 197, 94, 0.8)',
      imageUrl: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop&crop=center'
    }
  ];

  const stats = [
    { number: '2.4K+', label: 'Joueurs actifs' },
    { number: '150+', label: 'Événements/mois' },
    { number: '25', label: 'Sports disponibles' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header with Global Menu */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <LinearGradient
            colors={['#20B2AA', '#17A2B8', '#0891B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoIcon}
          >
            <Ionicons name="trophy" size={16} color={colors.white} />
          </LinearGradient>
          <Text style={styles.appName}>TEAMUP</Text>
        </View>
        <GlobalMenu navigation={navigation} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section with Gradient */}
        <LinearGradient
          colors={['#20B2AA', '#1a9b94', '#16857a']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroSection}
        >
          <View style={styles.badge}>
            <Ionicons name="flash" size={14} color={colors.white} />
            <Text style={styles.badgeText}>NOUVEAU</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            Découvrez de nouveaux événements{'\n'}sportifs près de chez vous
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Rejoignez des milliers de sportifs passionnés et participez à des tournois, matchs amicaux et entraînements.
          </Text>
          
          <GradientButton
            onPress={() => navigation.navigate('Register')}
            style={styles.startButton}
          >
            <View style={styles.startButtonContent}>
              <Ionicons name="play" size={16} color={colors.white} />
              <Text style={styles.startButtonText}>Commencer</Text>
            </View>
          </GradientButton>
          
          <View style={styles.dotsIndicator}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </LinearGradient>

        {/* Discover Section */}
        <View style={styles.discoverSection}>
          <Text style={styles.sectionTitle}>Découvrez quelque chose de{'\n'}nouveau</Text>
          <TouchableOpacity style={styles.sectionIcon}>
            <Ionicons name="arrow-forward" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sports Events Cards */}
        <View style={styles.sportsContainer}>
          {sportsEvents.map((event, index) => (
            <View key={index} style={styles.eventCard}>
              <View style={styles.eventImageContainer}>
                <Image 
                  source={{ uri: event.imageUrl }}
                  style={styles.eventImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
                <View style={[styles.eventBadge, { backgroundColor: event.badgeColor }]}>
                  <Text style={styles.eventBadgeText}>{event.badge}</Text>
                </View>
              </View>
              <View style={styles.eventInfo}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDate}>{event.date}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Free Events Section */}
        <View style={styles.freeEventsSection}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
              </View>
              <Text style={styles.sectionHeaderTitle}>Événements gratuits</Text>
            </View>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>Voir plus</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.ctaSection}>
            <View style={styles.ctaIcon}>
              <Ionicons name="trophy" size={28} color={colors.white} />
            </View>
            <Text style={styles.ctaTitle}>Prêt à commencer ?</Text>
            <Text style={styles.ctaSubtitle}>
              Rejoignez des milliers de sportifs passionnés
            </Text>
            
            <GradientButton
              title="Créer un compte"
              onPress={() => navigation.navigate('Register')}
              style={styles.primaryButton}
            />
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.secondaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },

  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  heroSection: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 30,
    position: 'relative',
    shadowColor: colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    lineHeight: 34,
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: 30,
  },
  startButton: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  startButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    marginLeft: 8,
  },
  dotsIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: colors.white,
  },
  discoverSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    lineHeight: 30,
    flex: 1,
  },
  sectionIcon: {
    padding: 8,
  },
  sportsContainer: {
    marginBottom: 40,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImageContainer: {
    width: '100%',
    height: 160,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  eventBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  eventBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '600',
  },
  eventInfo: {
    padding: 20,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  eventDate: {
    fontSize: 13,
    color: colors.textMuted,
  },
  freeEventsSection: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  seeMoreButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceLight,
  },
  seeMoreText: {
    fontSize: 14,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  statsSection: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
  ctaSection: {
    alignItems: 'center',
  },
  ctaIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  ctaSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  secondaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});

export default HomeScreen; 