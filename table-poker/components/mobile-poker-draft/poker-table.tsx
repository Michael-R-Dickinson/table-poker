import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shadow } from 'react-native-shadow-2';
import {
  Canvas,
  Rect,
  RadialGradient as SkiaRadialGradient,
  vec,
} from '@shopify/react-native-skia';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export function PokerTable() {
  return (
    <>
      {/* Multi-layer shadow system creates depth and purple glow effect */}
      <Shadow
        distance={200}
        offset={[0, 50]}
        startColor="rgba(90, 60, 255, 0.10)"
        containerStyle={{
          position: 'absolute',
          top: screenHeight * 0.5,
          left: '50%',
          marginLeft: -(screenWidth * 2.8) / 2,
        }}
      >
        <Shadow
          distance={1}
          offset={[0, -1]}
          startColor="rgba(138, 130, 255, 0.3)"
          endColor="#050508"
        >
          {/*
            Table edge: Extra-wide rounded oval that extends beyond screen edges,
            creating the illusion of sitting at a large poker table
          */}
          <LinearGradient
            colors={['#161722', '#101016']}
            locations={[0, 0.1]}
            style={[
              styles.tableEdge,
              {
                width: screenWidth * 2.8,
                height: screenHeight * 0.7,
                borderTopLeftRadius: screenWidth * 1.4,
                borderTopRightRadius: screenWidth * 1.4,
              },
            ]}
          />
        </Shadow>
      </Shadow>

      {/*
        Radial gradient overlay adds atmospheric purple glow to the table surface,
        enhancing the depth effect created by the shadows
      */}
      <Canvas style={styles.purpleGlow} pointerEvents="none">
        <Rect x={0} y={0} width={600} height={screenHeight * 1.5}>
          <SkiaRadialGradient
            c={vec(300, screenHeight * 0.33)}
            r={600}
            colors={[
              'rgba(138, 130, 255, 0.25)',
              'rgba(90, 60, 255, 0.15)',
              'transparent',
            ]}
            positions={[0, 0.3, 0.7]}
          />
        </Rect>
      </Canvas>
    </>
  );
}

const styles = StyleSheet.create({
  tableEdge: {
    overflow: 'hidden',
  },
  purpleGlow: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -300,
    width: 600,
    height: screenHeight * 1.5,
    opacity: 0.3,
  },
});
