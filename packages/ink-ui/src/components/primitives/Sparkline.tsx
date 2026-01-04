import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../../theme/colors.js';
import { blocks, braille } from '../../theme/icons.js';

export interface SparklineProps {
  /** Data points to visualize */
  data: number[];
  /** Maximum width in characters */
  width?: number;
  /** Chart color */
  color?: string;
  /** Minimum value (auto-detected if not provided) */
  min?: number;
  /** Maximum value (auto-detected if not provided) */
  max?: number;
  /** Height in rows (1-4) */
  height?: 1 | 2 | 3 | 4;
  /** Show trend indicator */
  showTrend?: boolean;
  /** Chart style */
  style?: 'blocks' | 'braille' | 'dots';
}

// Block characters for different heights
const blockChars = [' ', '▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];

/**
 * Sparkline micro-chart component
 *
 * @example
 * ```tsx
 * <Sparkline data={[1, 5, 3, 9, 2, 7, 4, 8, 6]} color="#4CAF50" />
 * <Sparkline data={values} width={20} showTrend />
 * ```
 */
export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width,
  color = colors.success[500],
  min: propMin,
  max: propMax,
  height = 1,
  showTrend = false,
  style = 'blocks',
}) => {
  if (data.length === 0) return null;

  // Downsample or use all data based on width
  const displayData = width && width < data.length
    ? downsample(data, width)
    : data;

  const min = propMin ?? Math.min(...displayData);
  const max = propMax ?? Math.max(...displayData);
  const range = max - min || 1;

  // Calculate trend
  const trend = data.length >= 2
    ? data[data.length - 1] - data[0]
    : 0;
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';
  const trendColor = trend > 0
    ? colors.success[500]
    : trend < 0
      ? colors.error[500]
      : colors.neutral[500];

  let chartContent: React.ReactNode;

  if (style === 'braille') {
    chartContent = renderBrailleChart(displayData, min, range, color);
  } else if (style === 'dots') {
    chartContent = renderDotChart(displayData, min, range, color);
  } else {
    chartContent = renderBlockChart(displayData, min, range, height, color);
  }

  return (
    <Box>
      {chartContent}
      {showTrend && (
        <Text color={trendColor}> {trendIcon}</Text>
      )}
    </Box>
  );
};

/**
 * Render block-style chart
 */
function renderBlockChart(
  data: number[],
  min: number,
  range: number,
  height: number,
  color: string,
): React.ReactNode {
  if (height === 1) {
    // Single row sparkline
    const spark = data.map((value) => {
      const normalized = (value - min) / range;
      const index = Math.min(
        Math.floor(normalized * (blockChars.length - 1)),
        blockChars.length - 1
      );
      return blockChars[index];
    }).join('');

    return <Text color={color}>{spark}</Text>;
  }

  // Multi-row chart
  const rows: string[][] = Array.from({ length: height }, () => []);
  const maxLevel = height * 8; // 8 levels per row

  data.forEach((value) => {
    const normalized = (value - min) / range;
    const level = Math.round(normalized * maxLevel);

    for (let row = 0; row < height; row++) {
      const rowFromBottom = height - 1 - row;
      const rowMinLevel = rowFromBottom * 8;
      const rowLevel = Math.max(0, Math.min(8, level - rowMinLevel));
      rows[row].push(blockChars[rowLevel]);
    }
  });

  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <Text key={i} color={color}>{row.join('')}</Text>
      ))}
    </Box>
  );
}

/**
 * Render braille-style chart (higher resolution)
 */
function renderBrailleChart(
  data: number[],
  min: number,
  range: number,
  color: string,
): React.ReactNode {
  // Each braille character can represent 2 data points horizontally
  // and 4 levels vertically
  const chars: string[] = [];

  for (let i = 0; i < data.length; i += 2) {
    const val1 = data[i];
    const val2 = i + 1 < data.length ? data[i + 1] : val1;

    const norm1 = (val1 - min) / range;
    const norm2 = (val2 - min) / range;

    const level1 = Math.round(norm1 * 4);
    const level2 = Math.round(norm2 * 4);

    // Build braille pattern
    const dots: number[] = [];

    // Left column (dots 1, 2, 3, 7)
    if (level1 >= 1) dots.push(7);
    if (level1 >= 2) dots.push(3);
    if (level1 >= 3) dots.push(2);
    if (level1 >= 4) dots.push(1);

    // Right column (dots 4, 5, 6, 8)
    if (level2 >= 1) dots.push(8);
    if (level2 >= 2) dots.push(6);
    if (level2 >= 3) dots.push(5);
    if (level2 >= 4) dots.push(4);

    chars.push(braille.fromDots(dots));
  }

  return <Text color={color}>{chars.join('')}</Text>;
}

/**
 * Render dot-style chart
 */
function renderDotChart(
  data: number[],
  min: number,
  range: number,
  color: string,
): React.ReactNode {
  const dotChars = ['⋅', '·', '•', '●'];

  const spark = data.map((value) => {
    const normalized = (value - min) / range;
    const index = Math.min(
      Math.floor(normalized * dotChars.length),
      dotChars.length - 1
    );
    return dotChars[index];
  }).join('');

  return <Text color={color}>{spark}</Text>;
}

/**
 * Downsample data to fit width
 */
function downsample(data: number[], targetWidth: number): number[] {
  if (data.length <= targetWidth) return data;

  const result: number[] = [];
  const ratio = data.length / targetWidth;

  for (let i = 0; i < targetWidth; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.floor((i + 1) * ratio);
    const slice = data.slice(start, end);
    const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
    result.push(avg);
  }

  return result;
}

/**
 * Sparkline with value label
 */
export interface LabeledSparklineProps extends SparklineProps {
  /** Current/latest value to display */
  value: string | number;
  /** Value suffix (e.g., "%", "ms") */
  suffix?: string;
  /** Trend percentage */
  trendPercent?: number;
}

export const LabeledSparkline: React.FC<LabeledSparklineProps> = ({
  data,
  value,
  suffix = '',
  trendPercent,
  ...props
}) => {
  const trendColor = trendPercent !== undefined
    ? trendPercent > 0
      ? colors.success[500]
      : trendPercent < 0
        ? colors.error[500]
        : colors.neutral[500]
    : undefined;

  const trendIcon = trendPercent !== undefined
    ? trendPercent > 0
      ? '↑'
      : trendPercent < 0
        ? '↓'
        : '→'
    : '';

  return (
    <Box>
      <Sparkline data={data} {...props} />
      <Text color={colors.neutral[700]} bold>
        {' '}{value}{suffix}
      </Text>
      {trendPercent !== undefined && (
        <Text color={trendColor}>
          {' '}{trendIcon}{Math.abs(trendPercent)}%
        </Text>
      )}
    </Box>
  );
};

/**
 * Area chart sparkline (filled)
 */
export interface AreaSparklineProps {
  data: number[];
  width?: number;
  height?: 2 | 3 | 4;
  color?: string;
  fillColor?: string;
}

export const AreaSparkline: React.FC<AreaSparklineProps> = ({
  data,
  width,
  height = 3,
  color = colors.primary[500],
  fillColor = colors.primary[800],
}) => {
  if (data.length === 0) return null;

  const displayData = width && width < data.length
    ? downsample(data, width)
    : data;

  const min = Math.min(...displayData);
  const max = Math.max(...displayData);
  const range = max - min || 1;
  const maxLevel = height * 8;

  const rows: React.ReactNode[][] = Array.from({ length: height }, () => []);

  displayData.forEach((value, col) => {
    const normalized = (value - min) / range;
    const level = Math.round(normalized * maxLevel);

    for (let row = 0; row < height; row++) {
      const rowFromBottom = height - 1 - row;
      const rowMinLevel = rowFromBottom * 8;
      const rowLevel = Math.max(0, Math.min(8, level - rowMinLevel));

      // Top of the area uses the line color, below uses fill
      const isTopOfArea = rowLevel > 0 && rowLevel < 8;
      const isFilled = level > rowMinLevel;

      rows[row].push(
        <Text key={col} color={isTopOfArea ? color : isFilled ? fillColor : undefined}>
          {blockChars[rowLevel]}
        </Text>
      );
    }
  });

  return (
    <Box flexDirection="column">
      {rows.map((row, i) => (
        <Box key={i}>{row}</Box>
      ))}
    </Box>
  );
};

/**
 * Bar chart (vertical bars)
 */
export interface BarChartProps {
  data: number[];
  height?: number;
  barWidth?: number;
  gap?: number;
  color?: string;
  labels?: string[];
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 6,
  barWidth = 3,
  gap = 1,
  color = colors.primary[500],
  labels,
}) => {
  if (data.length === 0) return null;

  const max = Math.max(...data);

  return (
    <Box flexDirection="column">
      {/* Bars */}
      {Array.from({ length: height }, (_, rowIndex) => {
        const rowFromBottom = height - 1 - rowIndex;
        const threshold = (rowFromBottom / height) * max;

        return (
          <Box key={rowIndex}>
            {data.map((value, colIndex) => (
              <Box key={colIndex} marginRight={gap}>
                <Text color={value > threshold ? color : colors.neutral[200]}>
                  {(value > threshold ? blocks.full : blocks.shades[0]).repeat(barWidth)}
                </Text>
              </Box>
            ))}
          </Box>
        );
      })}

      {/* Labels */}
      {labels && (
        <Box marginTop={1}>
          {labels.map((label, i) => (
            <Box key={i} width={barWidth + gap}>
              <Text color={colors.neutral[600]}>
                {label.slice(0, barWidth).padEnd(barWidth)}
              </Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Sparkline;
