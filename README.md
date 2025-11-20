## react-native-draggable-grid

Draggable, reorderable image grid for React Native. This repo also contains the example app under `App.tsx`.

### Install (after publishing)
```bash
npm install react-native-draggable-grid
# or
yarn add react-native-draggable-grid
```

### Usage
```tsx
import { DraggableImageGrid, DraggableImage } from 'react-native-draggable-grid';

const images: DraggableImage[] = [
  { id: '1', uri: 'https://example.com/photo-1.jpg', label: 'One' },
  { id: '2', uri: 'https://example.com/photo-2.jpg', label: 'Two' },
];

<DraggableImageGrid
  images={images}
  onOrderChange={(next) => console.log(next)}
  spacing={16}
/>;
```

### Build for publish
```bash
npm run build
```

This emits the compiled code and types into `lib/`. Publishing will run `npm run build` automatically because of the `prepare` script.

### Publish
```bash
npm login
npm publish --access public
```
