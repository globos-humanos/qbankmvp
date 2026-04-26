import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../utils/supabase';
import Feather from '@expo/vector-icons/Feather';
const Icon = Feather;

export default function QuizScreen({ route, navigation }) {
  const { batchId, batchTitle } = route.params;
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [batchId]);

  async function fetchQuestions() {
    setLoading(true);
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at', { ascending: true });

    if (error) {
      Alert.alert('Error', error.message);
      navigation.goBack();
    } else {
      setQuestions(data || []);
    }
    setLoading(false);
  }

  const handleOptionSelect = (opt) => {
    if (showExplanation) return; // Prevent changing answer after submission
    setSelectedOption(opt);
  };

  const handleSubmit = () => {
    if (!selectedOption) return Alert.alert('Wait!', 'Please select an option first.');
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      Alert.alert('Completed!', 'You have finished this batch.', [
        { text: 'Go Back', onPress: () => navigation.goBack() }
      ]);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </SafeAreaView>
    );
  }

  if (questions.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center p-6">
        <Icon name="inbox" size={48} color="#cbd5e1" className="mb-4" />
        <Text className="text-lg font-medium text-slate-600 mb-6 text-center">No questions found in this batch yet.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-blue-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const options = [
    { key: 'A', value: currentQ.option_a },
    { key: 'B', value: currentQ.option_b },
    { key: 'C', value: currentQ.option_c },
    { key: 'D', value: currentQ.option_d },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
          <Icon name="arrow-left" size={24} color="#334155" />
        </TouchableOpacity>
        <Text className="text-base font-bold text-slate-800" numberOfLines={1}>{batchTitle}</Text>
        <View className="bg-slate-100 px-3 py-1 rounded-full">
          <Text className="text-sm font-semibold text-slate-600">{currentIndex + 1} / {questions.length}</Text>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-8" showsVerticalScrollIndicator={false}>
        {/* Question Text */}
        <Text className="text-xl font-bold text-slate-800 leading-relaxed mb-8">
          {currentIndex + 1}. {currentQ.question_text}
        </Text>

        {/* Options */}
        <View className="space-y-3 mb-8">
          {options.map((opt) => {
            let isSelected = selectedOption === opt.key;
            let isCorrect = currentQ.correct_option === opt.key;
            let showStatus = showExplanation;

            let borderClass = 'border-gray-200';
            let bgClass = 'bg-white';
            let textClass = 'text-slate-700';

            if (showStatus) {
              if (isCorrect) {
                borderClass = 'border-green-500';
                bgClass = 'bg-green-50';
                textClass = 'text-green-800 font-medium';
              } else if (isSelected && !isCorrect) {
                borderClass = 'border-red-400';
                bgClass = 'bg-red-50';
                textClass = 'text-red-800';
              } else {
                borderClass = 'border-gray-200 opacity-50';
              }
            } else if (isSelected) {
              borderClass = 'border-blue-500';
              bgClass = 'bg-blue-50';
              textClass = 'text-blue-800 font-medium';
            }

            return (
              <TouchableOpacity
                key={opt.key}
                onPress={() => handleOptionSelect(opt.key)}
                activeOpacity={0.7}
                className={`flex-row items-center p-4 border rounded-xl ${borderClass} ${bgClass}`}
              >
                <View className={`w-8 h-8 rounded-full border items-center justify-center mr-4 ${isSelected && !showStatus ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'} ${showStatus && isCorrect ? 'border-green-500 bg-green-500' : ''} ${showStatus && isSelected && !isCorrect ? 'border-red-500 bg-red-500' : ''}`}>
                  <Text className={`font-bold ${isSelected || (showStatus && (isCorrect || isSelected)) ? 'text-white' : 'text-gray-500'}`}>{opt.key}</Text>
                </View>
                <Text className={`flex-1 text-base ${textClass}`}>{opt.value}</Text>
                
                {showStatus && isCorrect && <Icon name="check-circle" size={20} color="#22c55e" />}
                {showStatus && isSelected && !isCorrect && <Icon name="x-circle" size={20} color="#ef4444" />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation Block */}
        {showExplanation && (
          <View className="bg-blue-50 p-5 rounded-xl border border-blue-100 mb-8">
            <View className="flex-row items-center mb-2">
              <Icon name="info" size={18} color="#2563eb" className="mr-2" />
              <Text className="text-base font-bold text-blue-900">Explanation</Text>
            </View>
            <Text className="text-blue-800 leading-relaxed">
              {currentQ.explanation || "No explanation provided for this question."}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons Footer */}
      <View className="p-4 border-t border-gray-100 bg-white">
        {!showExplanation ? (
          <TouchableOpacity 
            className={`py-4 rounded-xl items-center ${selectedOption ? 'bg-blue-600' : 'bg-gray-200'}`}
            disabled={!selectedOption}
            onPress={handleSubmit}
          >
            <Text className={`font-bold text-lg ${selectedOption ? 'text-white' : 'text-gray-400'}`}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            className="py-4 rounded-xl items-center bg-slate-800"
            onPress={handleNext}
          >
            <Text className="font-bold text-lg text-white">
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}