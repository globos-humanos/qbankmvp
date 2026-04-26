import "./global.css";
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigation from './src/navigation/RootNavigation';

export default function App() {
  return (
    <>
      <RootNavigation />
      <StatusBar style="auto" />
    </>
  );
}