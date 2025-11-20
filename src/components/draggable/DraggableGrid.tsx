import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  ImageStyle,
  LayoutChangeEvent,
  PanResponder,
  PanResponderInstance,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
  useWindowDimensions,
} from 'react-native';

export interface IdentifiableItem {
  id: string;
}

export type Positions = Record<string, number>;

const DEFAULT_COLUMNS = 3;
const DEFAULT_SPACING = 12;
const ACTIVE_SCALE = 1.05;

const orderToPosition = (
  order: number,
  columns: number,
  tileWidth: number,
  tileHeight: number,
  spacing: number,
) => {
  const column = order % columns;
  const row = Math.floor(order / columns);
  return {
    x: spacing + column * (tileWidth + spacing),
    y: spacing + row * (tileHeight + spacing),
  };
};

const clamp = (value: number, min: number, max: number) => {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

const getOrderFromPosition = (
  translateX: number,
  translateY: number,
  columns: number,
  tileWidth: number,
  tileHeight: number,
  spacing: number,
  itemCount: number,
) => {
  const normalizedX = translateX - spacing;
  const normalizedY = translateY - spacing;
  const column = clamp(
    Math.round(normalizedX / (tileWidth + spacing)),
    0,
    columns - 1,
  );
  const row = clamp(
    Math.round(normalizedY / (tileHeight + spacing)),
    0,
    Math.ceil(itemCount / columns),
  );
  const nextOrder = row * columns + column;
  return clamp(nextOrder, 0, itemCount - 1);
};

const normalizePositions = <T extends IdentifiableItem>(
  items: T[],
  previous: Positions,
): Positions => {
  const existingKeys = items
    .map((item) => item.id)
    .filter((key) => previous[key] !== undefined)
    .sort((a, b) => previous[a]! - previous[b]!);

  const next: Positions = {};
  existingKeys.forEach((key, index) => {
    next[key] = index;
  });

  items.forEach((item) => {
    if (next[item.id] === undefined) {
      next[item.id] = Object.keys(next).length;
    }
  });

  return next;
};

interface DraggableTileProps<T extends IdentifiableItem> {
  item: T;
  order: number;
  columns: number;
  tileWidth: number;
  tileHeight: number;
  spacing: number;
  itemCount: number;
  renderItem: (params: { item: T; isActive: boolean }) => React.ReactNode;
  isDraggable: boolean;
  style?: StyleProp<ViewStyle>;
  onDragRelease: (itemId: string, newOrder: number) => void;
  testID?: string;
}

function DraggableTile<T extends IdentifiableItem>({
  item,
  order,
  columns,
  tileHeight,
  tileWidth,
  spacing,
  itemCount,
  renderItem,
  isDraggable,
  style,
  onDragRelease,
  testID,
}: DraggableTileProps<T>) {
  const initialPosition = orderToPosition(order, columns, tileWidth, tileHeight, spacing);
  const translateX = useRef(new Animated.Value(initialPosition.x)).current;
  const translateY = useRef(new Animated.Value(initialPosition.y)).current;
  const currentPosition = useRef(initialPosition);
  const panResponder = useRef<PanResponderInstance | null>(null);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const xListener = translateX.addListener(({ value }) => {
      currentPosition.current = { ...currentPosition.current, x: value };
    });
    const yListener = translateY.addListener(({ value }) => {
      currentPosition.current = { ...currentPosition.current, y: value };
    });

    return () => {
      translateX.removeListener(xListener);
      translateY.removeListener(yListener);
    };
  }, [translateX, translateY]);

  useEffect(() => {
    const destination = orderToPosition(order, columns, tileWidth, tileHeight, spacing);
    Animated.spring(translateX, {
      toValue: destination.x,
      useNativeDriver: false,
    }).start();
    Animated.spring(translateY, {
      toValue: destination.y,
      useNativeDriver: false,
    }).start();
  }, [order, columns, tileWidth, tileHeight, spacing, translateX, translateY]);

  useEffect(() => {
    if (!isDraggable) {
      panResponder.current = null;
      return;
    }

    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsActive(true);
        translateX.stopAnimation((value) => {
          translateX.setOffset(value);
          translateX.setValue(0);
        });
        translateY.stopAnimation((value) => {
          translateY.setOffset(value);
          translateY.setValue(0);
        });
      },
      onPanResponderMove: Animated.event(
        [null, { dx: translateX, dy: translateY }],
        { useNativeDriver: false },
      ),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: () => {
        setIsActive(false);
        translateX.flattenOffset();
        translateY.flattenOffset();
        const destinationOrder = getOrderFromPosition(
          currentPosition.current.x,
          currentPosition.current.y,
          columns,
          tileWidth,
          tileHeight,
          spacing,
          itemCount,
        );
        onDragRelease(item.id, destinationOrder);
      },
    });
  }, [columns, tileHeight, tileWidth, item.id, itemCount, isDraggable, onDragRelease, spacing, translateX, translateY]);

  const animatedStyle = {
    transform: [{ translateX }, { translateY }, { scale: isActive ? ACTIVE_SCALE : 1 }],
    zIndex: isActive ? 1000 : 1,
  };

  return (
    <Animated.View
      testID={testID}
      style={[styles.tile, { width: tileWidth, height: tileHeight }, style, animatedStyle]}
      {...(panResponder.current ? panResponder.current.panHandlers : {})}
    >
      {renderItem({ item, isActive })}
    </Animated.View>
  );
}

export interface DraggableGridProps<T extends IdentifiableItem> {
  items: T[];
  renderItem: (params: { item: T; isActive: boolean }) => React.ReactNode;
  columns?: number;
  spacing?: number;
  isDraggable?: boolean | ((item: T) => boolean);
  style?: StyleProp<ViewStyle>;
  tileStyle?: StyleProp<ViewStyle>;
  onPositionsChange?: (positions: Positions) => void;
  onOrderChange?: (items: T[]) => void;
  testIDPrefix?: string;
}

export function DraggableGrid<T extends IdentifiableItem>({
  items,
  renderItem,
  columns = DEFAULT_COLUMNS,
  spacing = DEFAULT_SPACING,
  isDraggable = true,
  style,
  tileStyle,
  onPositionsChange,
  onOrderChange,
  testIDPrefix,
}: DraggableGridProps<T>) {
  const window = useWindowDimensions();
  const lastPositionsKeyRef = useRef<string | undefined>(undefined);
  const [layoutWidth, setLayoutWidth] = useState(window.width);
  const [positions, setPositions] = useState<Positions>(() => {
    const initial: Positions = {};
    items.forEach((item, index) => {
      initial[item.id] = index;
    });
    return initial;
  });

  useEffect(() => {
    setPositions((prev) => {
      const next = normalizePositions(items, prev);
      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (
        prevKeys.length === nextKeys.length &&
        nextKeys.every((key) => prev[key] === next[key])
      ) {
        return prev;
      }
      return next;
    });
  }, [items]);

  const orderedItems = useMemo(() => {
    const itemsWithPosition = items.map((item) => ({
      item,
      order: positions[item.id] ?? 0,
    }));
    return itemsWithPosition.sort((a, b) => a.order - b.order);
  }, [items, positions]);

  useEffect(() => {
    const normalizedKey = Object.keys(positions)
      .sort()
      .map((key) => `${key}:${positions[key]}`)
      .join('|');
    if (lastPositionsKeyRef.current === normalizedKey) {
      return;
    }
    lastPositionsKeyRef.current = normalizedKey;
    onPositionsChange?.(positions);
    onOrderChange?.(orderedItems.map(({ item }) => item));
  }, [onOrderChange, onPositionsChange, orderedItems, positions]);

  const handleDragRelease = useCallback((itemId: string, newOrder: number) => {
    setPositions((prev) => {
      const currentOrder = prev[itemId];
      if (currentOrder === undefined || currentOrder === newOrder) {
        return prev;
      }
      const next: Positions = { ...prev };
      const swapId = Object.keys(next).find((key) => next[key] === newOrder);
      if (swapId) {
        next[swapId] = currentOrder;
      }
      next[itemId] = newOrder;
      return next;
    });
  }, []);

  const flattenedStyle = useMemo(() => (style ? StyleSheet.flatten(style) : undefined), [style]);
  const containerWidth =
    typeof flattenedStyle?.width === 'number' && flattenedStyle.width > 0
      ? flattenedStyle.width
      : layoutWidth;
  const tileWidth =
    columns > 0
      ? Math.max(40, (containerWidth - spacing * (columns + 1)) / columns)
      : containerWidth - spacing * 2;
  const safeColumns = Math.max(1, columns);
  const tileHeight = tileWidth * 1.25;
  const containerHeight =
    Math.ceil((orderedItems.length || 1) / safeColumns) * (tileHeight + spacing) + spacing;

  const handleLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const width = event.nativeEvent.layout.width;
      if (width > 0 && width !== layoutWidth) {
        setLayoutWidth(width);
      }
    },
    [layoutWidth],
  );

  return (
    <View style={[styles.grid, { height: containerHeight }, style]} onLayout={handleLayout}>
      {orderedItems.map(({ item, order }) => (
        <DraggableTile
          key={item.id}
          item={item}
          order={order}
          columns={safeColumns}
          tileWidth={tileWidth}
          tileHeight={tileHeight}
          spacing={spacing}
          itemCount={orderedItems.length}
          renderItem={renderItem}
          isDraggable={typeof isDraggable === 'function' ? isDraggable(item) : isDraggable}
          style={tileStyle}
          onDragRelease={handleDragRelease}
          testID={testIDPrefix ? `${testIDPrefix}-${item.id}` : undefined}
        />
      ))}
    </View>
  );
}

export interface DraggableImage extends IdentifiableItem {
  uri: string;
  label?: string;
}

export interface DraggableImageGridProps
  extends Omit<DraggableGridProps<DraggableImage>, 'items' | 'renderItem'> {
  images: DraggableImage[];
  imageStyle?: StyleProp<ImageStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export function DraggableImageGrid({
  images,
  imageStyle,
  labelStyle,
  ...gridProps
}: DraggableImageGridProps) {
  return (
    <DraggableGrid
      {...gridProps}
      items={images}
      renderItem={({ item }) => (
        <View style={styles.imageTile}>
          <Image source={{ uri: item.uri }} style={[styles.image, imageStyle]} resizeMode="cover" />
          {item.label ? <Text style={[styles.label, labelStyle]}>{item.label}</Text> : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  grid: {
    width: '100%',
    position: 'relative',
  },
  tile: {
    position: 'absolute',
  },
  imageTile: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1f1f1f',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  label: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    color: '#fff',
    fontWeight: '600',
  },
});
