import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../styles/globalStyles';

const AdvancedEventSearch = ({ visible, onClose, onSearch, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    search: '',
    sport: '',
    level: '',
    isFree: null,
    dateFrom: '',
    dateTo: '',
    maxDistance: null,
    minParticipants: '',
    maxParticipants: '',
    ...initialFilters
  });

  const sports = [
    'Football', 'Basketball', 'Tennis', 'Running', 'Yoga', 'Natation',
    'Volleyball', 'Badminton', 'Cyclisme', 'Fitness', 'Rugby', 'Handball'
  ];
  
  const levels = ['Débutant', 'Intermédiaire', 'Avancé', 'Tous niveaux'];
  const distances = [1, 5, 10, 25, 50, 100];

  const handleSearch = () => {
    // Nettoyer les filtres vides
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onSearch(cleanFilters);
    onClose();
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      sport: '',
      level: '',
      isFree: null,
      dateFrom: '',
      dateTo: '',
      maxDistance: null,
      minParticipants: '',
      maxParticipants: ''
    });
  };

  const FilterSection = ({ title, children }) => (
    <View style={styles.filterSection}>
      <Text style={styles.filterTitle}>{title}</Text>
      {children}
    </View>
  );

  const FilterButton = ({ title, isSelected, onPress, color = colors.primary }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        isSelected && { backgroundColor: color, borderColor: color }
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterButtonText,
        isSelected && { color: colors.white }
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recherche Avancée</Text>
          <TouchableOpacity onPress={resetFilters} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recherche textuelle */}
          <FilterSection title="Recherche">
            <TextInput
              style={styles.textInput}
              placeholder="Titre, description, lieu..."
              value={filters.search}
              onChangeText={(text) => setFilters({ ...filters, search: text })}
              placeholderTextColor={colors.textMuted}
            />
          </FilterSection>

          {/* Sport */}
          <FilterSection title="Sport">
            <View style={styles.filterGrid}>
              {sports.map((sport) => (
                <FilterButton
                  key={sport}
                  title={sport}
                  isSelected={filters.sport === sport}
                  onPress={() => setFilters({
                    ...filters,
                    sport: filters.sport === sport ? '' : sport
                  })}
                />
              ))}
            </View>
          </FilterSection>

          {/* Niveau */}
          <FilterSection title="Niveau">
            <View style={styles.filterGrid}>
              {levels.map((level) => (
                <FilterButton
                  key={level}
                  title={level}
                  isSelected={filters.level === level}
                  onPress={() => setFilters({
                    ...filters,
                    level: filters.level === level ? '' : level
                  })}
                />
              ))}
            </View>
          </FilterSection>

          {/* Prix */}
          <FilterSection title="Prix">
            <View style={styles.filterRow}>
              <FilterButton
                title="Gratuit"
                isSelected={filters.isFree === true}
                onPress={() => setFilters({
                  ...filters,
                  isFree: filters.isFree === true ? null : true
                })}
                color={colors.success}
              />
              <FilterButton
                title="Payant"
                isSelected={filters.isFree === false}
                onPress={() => setFilters({
                  ...filters,
                  isFree: filters.isFree === false ? null : false
                })}
                color={colors.warning}
              />
            </View>
          </FilterSection>

          {/* Distance */}
          <FilterSection title="Distance maximale (km)">
            <View style={styles.filterRow}>
              {distances.map((distance) => (
                <FilterButton
                  key={distance}
                  title={`${distance}km`}
                  isSelected={filters.maxDistance === distance}
                  onPress={() => setFilters({
                    ...filters,
                    maxDistance: filters.maxDistance === distance ? null : distance
                  })}
                  color={colors.info}
                />
              ))}
            </View>
          </FilterSection>

          {/* Nombre de participants */}
          <FilterSection title="Nombre de participants">
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Min</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="2"
                  value={filters.minParticipants}
                  onChangeText={(text) => setFilters({ ...filters, minParticipants: text })}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Max</Text>
                <TextInput
                  style={styles.numberInput}
                  placeholder="100"
                  value={filters.maxParticipants}
                  onChangeText={(text) => setFilters({ ...filters, maxParticipants: text })}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </FilterSection>

          {/* Dates */}
          <FilterSection title="Période">
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Du</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="JJ/MM/AAAA"
                  value={filters.dateFrom}
                  onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Au</Text>
                <TextInput
                  style={styles.dateInput}
                  placeholder="JJ/MM/AAAA"
                  value={filters.dateTo}
                  onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>
          </FilterSection>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Ionicons name="search" size={20} color={colors.white} />
            <Text style={styles.searchButtonText}>Rechercher</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[700],
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  resetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  resetText: {
    color: colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  filterSection: {
    marginVertical: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.gray[600],
    backgroundColor: colors.surface,
    margin: 4,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  numberInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray[700],
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.gray[700],
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray[700],
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default AdvancedEventSearch;
