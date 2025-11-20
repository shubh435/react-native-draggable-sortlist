import React, { useState } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { DraggableImage, DraggableImageGrid } from './src/components/draggable/DraggableGrid';

const INITIAL_IMAGES: DraggableImage[] = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    label: 'Tokyo Nights',
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d',
    label: 'Desert Dunes',
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1482192597420-4817fdd7e8b0',
    label: 'Mountain Lake',
  },
  {
    id: '4',
    uri: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef',
    label: 'Misty Forest',
  },
  {
    id: '5',
    uri: 'https://images.unsplash.com/photo-1482192597420-4817fdd7e8b0?fit=crop&w=800',
    label: 'Northern Winds',
  },
  {
    id: '6',
    uri: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c',
    label: 'Ice Caves',
  },
  {
    id: '7',
    uri: 'https://images.unsplash.com/photo-1435224654926-ecc9f7fa028c',
    label: 'City Shapes',
  },
  {
    id: '8',
    uri: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
    label: 'Golden Hour',
  },
  {
    id: '9',
    uri: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
    label: 'Sea Breeze',
  },
];

function App() {
  const [images, setImages] = useState(INITIAL_IMAGES);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Draggable Flatlist Images</Text>
          <Text style={styles.subtitle}>Long-press any card and drag to reorder.</Text>
        </View>
        <View style={styles.gridContainer}>
          <DraggableImageGrid
            images={images}
            onOrderChange={setImages}
            style={styles.grid}
            spacing={16}
            testIDPrefix="draggable-image"
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#080808',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    marginTop: 6,
    color: '#b0b0b0',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  grid: {
    flex: 1,
    borderRadius: 16,
  },
});

export default App;
