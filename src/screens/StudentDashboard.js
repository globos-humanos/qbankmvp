import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import Feather from '@expo/vector-icons/Feather';
const Icon = Feather;

export default function StudentDashboard({ navigation }) {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  async function fetchBatches() {
    setLoading(true);
    // Fetch batches along with a count of their questions
    const { data, error } = await supabase
      .from('batches')
      .select('*, questions(count)')
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setBatches(data || []);
    }
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  const filteredBatches = batches.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center space-x-2">
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center">
            <Icon name="book-open" size={16} color="#2563eb" />
          </View>
          <Text className="text-xl font-bold text-slate-800 tracking-tight">QBank</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} className="px-3 py-1.5 bg-gray-100 rounded-md">
          <Text className="text-sm font-medium text-gray-600">Log out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-slate-800 mb-6">Question bank</Text>

        {/* Filters & Search */}
        <View className="flex-row items-end mb-8 space-x-4">
          <View className="flex-1">
            <Text className="text-sm font-semibold text-slate-700 mb-2">Search</Text>
            <View className="flex-row items-center border border-gray-300 rounded-lg bg-white px-3 h-11">
              <Icon name="search" size={18} color="#9ca3af" />
              <TextInput
                className="flex-1 ml-2 text-slate-800 h-full"
                placeholder="Start typing to search"
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        <Text className="text-lg font-medium text-slate-600 mb-4">All Question bank ({batches.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
        ) : (
          <View className="flex-row flex-wrap justify-between pb-10">
            {filteredBatches.map(batch => (
              <TouchableOpacity
                key={batch.id}
                className="w-[48%] bg-white rounded-xl border border-gray-200 mb-6 overflow-hidden shadow-sm"
                onPress={() => navigation.navigate('Quiz', { batchId: batch.id, batchTitle: batch.title })}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 }}
              >
                {/* Top Colored Section */}
                <View 
                  className="h-32 items-center justify-center relative" 
                  style={{ backgroundColor: batch.color_theme || '#bde0fe' }}
                >
                  <View className="absolute top-3 right-3 bg-teal-500 px-2 py-1 rounded">
                    <Text className="text-white text-xs font-bold tracking-wider">PUBLISHED</Text>
                  </View>
                  <Icon name={batch.icon_name || "book"} size={48} color="#1e293b" />
                  
                  {/* Floating Action Buttons */}
                  <View className="absolute -bottom-4 flex-row space-x-2">
                    <View className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm">
                      <Icon name="copy" size={14} color="#64748b" />
                    </View>
                    <View className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm">
                      <Icon name="download" size={14} color="#64748b" />
                    </View>
                    <View className="w-8 h-8 bg-white rounded-full items-center justify-center border border-gray-200 shadow-sm">
                      <Icon name="eye" size={14} color="#64748b" />
                    </View>
                  </View>
                </View>

                {/* Bottom Content Section */}
                <View className="p-4 pt-6">
                  <Text className="text-base font-bold text-slate-800 mb-2" numberOfLines={1}>{batch.title}</Text>
                  
                  {batch.tag && (
                    <View className="self-start px-2 py-1 rounded bg-blue-100 mb-3">
                      <Text className="text-xs font-medium text-blue-600">{batch.tag}</Text>
                    </View>
                  )}
                  
                  <Text className="text-xs text-slate-500 mb-4" numberOfLines={3}>
                    {batch.description || "Test your knowledge base on top UI system in the world."}
                  </Text>
                  
                  <View className="flex-row items-center justify-between mt-auto">
                    <Text className="text-xs font-medium text-slate-500">
                      <Text className="font-bold text-slate-700">{batch.questions?.[0]?.count || 0}</Text> Questions
                    </Text>
                    {/* Placeholder for user avatars */}
                    <View className="flex-row">
                      <View className="w-5 h-5 rounded-full bg-gray-300 border border-white" />
                      <View className="w-5 h-5 rounded-full bg-gray-400 border border-white -ml-2" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}