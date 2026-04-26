import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, SafeAreaView, ActivityIndicator } from 'react-native';
import { supabase } from '../utils/supabase';

export default function AdminDashboard() {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Batch Form State
  const [newBatchTitle, setNewBatchTitle] = useState('');
  const [newBatchTag, setNewBatchTag] = useState('');
  const [newBatchDesc, setNewBatchDesc] = useState('');
  
  // New Question Form State
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctOption, setCorrectOption] = useState('A');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    fetchBatches();
  }, []);

  async function fetchBatches() {
    setLoading(true);
    const { data, error } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
    if (error) Alert.alert('Error fetching batches', error.message);
    else setBatches(data || []);
    setLoading(false);
  }

  async function handleCreateBatch() {
    if (!newBatchTitle) return Alert.alert('Error', 'Batch title is required');
    const { error } = await supabase.from('batches').insert([{ 
      title: newBatchTitle, 
      tag: newBatchTag, 
      description: newBatchDesc,
      color_theme: '#bde0fe', // Default pastel blue
    }]);
    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success', 'Batch created');
      setNewBatchTitle('');
      setNewBatchTag('');
      setNewBatchDesc('');
      fetchBatches();
    }
  }

  async function handleCreateQuestion() {
    if (!selectedBatchId || !questionText || !optionA || !optionB || !optionC || !optionD || !correctOption) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    const { error } = await supabase.from('questions').insert([{
      batch_id: selectedBatchId,
      question_text: questionText,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_option: correctOption,
      explanation: explanation
    }]);

    if (error) Alert.alert('Error', error.message);
    else {
      Alert.alert('Success', 'Question added to batch!');
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setExplanation('');
      setCorrectOption('A');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 bg-white border-b border-gray-200 flex-row justify-between items-center">
        <Text className="text-2xl font-bold text-gray-900">Admin Panel</Text>
        <TouchableOpacity onPress={handleSignOut}>
          <Text className="text-red-500 font-medium">Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-6">
        {/* Create Batch Section */}
        <View className="bg-white p-6 rounded-xl border border-gray-200 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-4">Create New Question Batch</Text>
          <TextInput
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            placeholder="Batch Title (e.g., NEET PG 2016)"
            value={newBatchTitle}
            onChangeText={setNewBatchTitle}
          />
          <TextInput
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            placeholder="Tag (e.g., Anatomy)"
            value={newBatchTag}
            onChangeText={setNewBatchTag}
          />
          <TextInput
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            placeholder="Description"
            value={newBatchDesc}
            onChangeText={setNewBatchDesc}
            multiline
          />
          <TouchableOpacity 
            className="bg-blue-600 p-3 rounded-lg items-center"
            onPress={handleCreateBatch}
          >
            <Text className="text-white font-semibold">Create Batch</Text>
          </TouchableOpacity>
        </View>

        {/* Add Question Section */}
        <View className="bg-white p-6 rounded-xl border border-gray-200 mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">Add Question to Batch</Text>
          
          <Text className="text-sm font-medium text-gray-700 mb-2">Select Batch:</Text>
          <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
            {loading ? <ActivityIndicator size="small" /> : batches.map(batch => (
              <TouchableOpacity
                key={batch.id}
                onPress={() => setSelectedBatchId(batch.id)}
                className={`mr-3 px-4 py-2 rounded-full border ${selectedBatchId === batch.id ? 'bg-blue-100 border-blue-500' : 'bg-gray-100 border-gray-300'}`}
              >
                <Text className={selectedBatchId === batch.id ? 'text-blue-700 font-semibold' : 'text-gray-700'}>{batch.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            className="w-full p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]"
            placeholder="Question Text"
            value={questionText}
            onChangeText={setQuestionText}
            multiline
          />
          
          <View className="flex-row flex-wrap justify-between">
            <TextInput
              className="w-[48%] p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              placeholder="Option A"
              value={optionA}
              onChangeText={setOptionA}
            />
            <TextInput
              className="w-[48%] p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              placeholder="Option B"
              value={optionB}
              onChangeText={setOptionB}
            />
            <TextInput
              className="w-[48%] p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              placeholder="Option C"
              value={optionC}
              onChangeText={setOptionC}
            />
            <TextInput
              className="w-[48%] p-3 mb-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              placeholder="Option D"
              value={optionD}
              onChangeText={setOptionD}
            />
          </View>

          <Text className="text-sm font-medium text-gray-700 mb-2 mt-2">Correct Option:</Text>
          <View className="flex-row mb-4">
            {['A', 'B', 'C', 'D'].map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setCorrectOption(opt)}
                className={`mr-3 w-10 h-10 rounded-full items-center justify-center border ${correctOption === opt ? 'bg-green-100 border-green-500' : 'bg-gray-100 border-gray-300'}`}
              >
                <Text className={correctOption === opt ? 'text-green-700 font-bold' : 'text-gray-700'}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            className="w-full p-3 mb-4 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 min-h-[80px]"
            placeholder="Explanation (Optional)"
            value={explanation}
            onChangeText={setExplanation}
            multiline
          />

          <TouchableOpacity 
            className="bg-green-600 p-3 rounded-lg items-center"
            onPress={handleCreateQuestion}
          >
            <Text className="text-white font-semibold">Save Question</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}