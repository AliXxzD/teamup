import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GradientButton from './GradientButton';

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
    <View className="my-4">
      <Text className="text-white text-base font-semibold mb-3">{title}</Text>
      {children}
    </View>
  );

  const FilterButton = ({ title, isSelected, onPress, color = '#20B2AA' }) => (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full border m-1 ${
        isSelected 
          ? 'bg-primary-500 border-primary-500' 
          : 'bg-dark-800 border-dark-600'
      }`}
      onPress={onPress}
    >
      <Text className={`text-sm font-medium ${
        isSelected ? 'text-white' : 'text-dark-300'
      }`}>
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
      <View className="flex-1 bg-dark-900">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 py-4 border-b border-dark-700">
          <TouchableOpacity 
            className="w-10 h-10 items-center justify-center"
            onPress={onClose}
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">Recherche Avancée</Text>
          <TouchableOpacity 
            className="px-3 py-1.5"
            onPress={resetFilters}
          >
            <Text className="text-primary-500 font-semibold">Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
          {/* Recherche textuelle */}
          <FilterSection title="Recherche">
            <TextInput
              className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
              placeholder="Titre, description, lieu..."
              value={filters.search}
              onChangeText={(text) => setFilters({ ...filters, search: text })}
              placeholderTextColor="#64748b"
            />
          </FilterSection>

          {/* Sport */}
          <FilterSection title="Sport">
            <View className="flex-row flex-wrap -mx-1">
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
            <View className="flex-row flex-wrap -mx-1">
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
            <View className="flex-row flex-wrap -mx-1">
              <FilterButton
                title="Gratuit"
                isSelected={filters.isFree === true}
                onPress={() => setFilters({
                  ...filters,
                  isFree: filters.isFree === true ? null : true
                })}
                color="#10B981"
              />
              <FilterButton
                title="Payant"
                isSelected={filters.isFree === false}
                onPress={() => setFilters({
                  ...filters,
                  isFree: filters.isFree === false ? null : false
                })}
                color="#F59E0B"
              />
            </View>
          </FilterSection>

          {/* Distance */}
          <FilterSection title="Distance maximale (km)">
            <View className="flex-row flex-wrap -mx-1">
              {distances.map((distance) => (
                <FilterButton
                  key={distance}
                  title={`${distance}km`}
                  isSelected={filters.maxDistance === distance}
                  onPress={() => setFilters({
                    ...filters,
                    maxDistance: filters.maxDistance === distance ? null : distance
                  })}
                  color="#06B6D4"
                />
              ))}
            </View>
          </FilterSection>

          {/* Nombre de participants */}
          <FilterSection title="Nombre de participants">
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-dark-300 text-sm mb-1 font-medium">Min</Text>
                <TextInput
                  className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
                  placeholder="2"
                  value={filters.minParticipants}
                  onChangeText={(text) => setFilters({ ...filters, minParticipants: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-dark-300 text-sm mb-1 font-medium">Max</Text>
                <TextInput
                  className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
                  placeholder="100"
                  value={filters.maxParticipants}
                  onChangeText={(text) => setFilters({ ...filters, maxParticipants: text })}
                  keyboardType="numeric"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          </FilterSection>

          {/* Dates */}
          <FilterSection title="Période">
            <View className="flex-row justify-between">
              <View className="flex-1 mr-2">
                <Text className="text-dark-300 text-sm mb-1 font-medium">Du</Text>
                <TextInput
                  className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
                  placeholder="JJ/MM/AAAA"
                  value={filters.dateFrom}
                  onChangeText={(text) => setFilters({ ...filters, dateFrom: text })}
                  placeholderTextColor="#64748b"
                />
              </View>
              <View className="flex-1 ml-2">
                <Text className="text-dark-300 text-sm mb-1 font-medium">Au</Text>
                <TextInput
                  className="bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white text-base"
                  placeholder="JJ/MM/AAAA"
                  value={filters.dateTo}
                  onChangeText={(text) => setFilters({ ...filters, dateTo: text })}
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>
          </FilterSection>
        </ScrollView>

        {/* Footer */}
        <View className="px-5 py-4 border-t border-dark-700">
          <GradientButton
            title="Rechercher"
            onPress={handleSearch}
            variant="primary"
            size="large"
            icon="search"
          />
        </View>
      </View>
    </Modal>
  );
};



export default AdvancedEventSearch;
