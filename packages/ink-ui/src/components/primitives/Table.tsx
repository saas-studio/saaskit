import React, { useState, useCallback } from 'react';
import { Box, Text, useInput, useFocus } from 'ink';
import { colors, interactive } from '../../theme/colors.js';
import { box, arrows } from '../../theme/icons.js';

export interface Column<T> {
  /** Unique key for the column, matching a property of T */
  key: keyof T;
  /** Column header text */
  header: string;
  /** Column width in characters */
  width: number;
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom render function */
  render?: (value: T[keyof T], row: T, index: number) => React.ReactNode;
  /** Whether column is sortable */
  sortable?: boolean;
}

export interface TableProps<T> {
  /** Data rows */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Enable row selection with keyboard */
  selectable?: boolean;
  /** Callback when row is selected (Enter key) */
  onSelect?: (row: T, index: number) => void;
  /** Callback when selection changes */
  onSelectionChange?: (index: number) => void;
  /** Enable multi-select mode */
  multiSelect?: boolean;
  /** Enable sorting */
  sortable?: boolean;
  /** Initial sort column */
  defaultSortKey?: keyof T;
  /** Initial sort direction */
  defaultSortDirection?: 'asc' | 'desc';
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Alternate row colors */
  striped?: boolean;
  /** Border style */
  borderStyle?: 'none' | 'single' | 'double' | 'rounded';
  /** Maximum visible rows (for scrolling) */
  maxHeight?: number;
  /** Empty state message */
  emptyMessage?: string;
}

/**
 * Interactive data table component
 *
 * @example
 * ```tsx
 * <Table
 *   data={users}
 *   columns={[
 *     { key: 'name', header: 'Name', width: 20 },
 *     { key: 'email', header: 'Email', width: 30 },
 *     { key: 'status', header: 'Status', width: 10, render: (v) => <Badge label={v} /> },
 *   ]}
 *   selectable
 *   onSelect={(user) => console.log(user)}
 * />
 * ```
 */
export function Table<T extends Record<string, unknown>>({
  data,
  columns,
  selectable = false,
  onSelect,
  onSelectionChange,
  multiSelect = false,
  sortable = false,
  defaultSortKey,
  defaultSortDirection = 'asc',
  showRowNumbers = false,
  striped = true,
  borderStyle = 'single',
  maxHeight,
  emptyMessage = 'No data',
}: TableProps<T>): React.ReactElement {
  const { isFocused } = useFocus();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultSortKey);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(defaultSortDirection);
  const [scrollOffset, setScrollOffset] = useState(0);

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      let cmp = 0;
      if (aVal === null || aVal === undefined) cmp = 1;
      else if (bVal === null || bVal === undefined) cmp = -1;
      else if (aVal < bVal) cmp = -1;
      else if (aVal > bVal) cmp = 1;

      return sortDirection === 'asc' ? cmp : -cmp;
    });
  }, [data, sortKey, sortDirection]);

  // Visible data for scrolling
  const visibleData = maxHeight
    ? sortedData.slice(scrollOffset, scrollOffset + maxHeight)
    : sortedData;

  const handleKeyboard = useCallback((input: string, key: { upArrow?: boolean; downArrow?: boolean; return?: boolean; tab?: boolean }) => {
    if (!selectable || !isFocused) return;

    if (key.upArrow) {
      const newIndex = Math.max(0, selectedIndex - 1);
      setSelectedIndex(newIndex);
      onSelectionChange?.(newIndex);

      // Scroll up if needed
      if (maxHeight && newIndex < scrollOffset) {
        setScrollOffset(newIndex);
      }
    } else if (key.downArrow) {
      const newIndex = Math.min(sortedData.length - 1, selectedIndex + 1);
      setSelectedIndex(newIndex);
      onSelectionChange?.(newIndex);

      // Scroll down if needed
      if (maxHeight && newIndex >= scrollOffset + maxHeight) {
        setScrollOffset(newIndex - maxHeight + 1);
      }
    } else if (key.return) {
      onSelect?.(sortedData[selectedIndex], selectedIndex);
    } else if (input === ' ' && multiSelect) {
      setSelectedRows((prev) => {
        const next = new Set(prev);
        if (next.has(selectedIndex)) {
          next.delete(selectedIndex);
        } else {
          next.add(selectedIndex);
        }
        return next;
      });
    }
  }, [selectable, isFocused, selectedIndex, sortedData, maxHeight, scrollOffset, onSelect, onSelectionChange, multiSelect]);

  useInput(handleKeyboard);

  // Calculate total width
  const totalWidth = columns.reduce((sum, col) => sum + col.width + 3, 0) +
    (showRowNumbers ? 5 : 0) +
    (selectable ? 3 : 0);

  // Get border characters
  const borderChars = borderStyle === 'none'
    ? null
    : borderStyle === 'double'
      ? box.double
      : borderStyle === 'rounded'
        ? box.rounded
        : box.single;

  // Render header
  const renderHeader = () => (
    <Box>
      {selectable && (
        <Box width={3}>
          <Text color={colors.neutral[500]}> </Text>
        </Box>
      )}
      {showRowNumbers && (
        <Box width={5}>
          <Text color={colors.neutral[500]}>#</Text>
        </Box>
      )}
      {columns.map((col) => (
        <Box key={String(col.key)} width={col.width + 3} paddingX={1}>
          <Text bold color={interactive.table.headerText}>
            {alignText(col.header, col.width, col.align)}
          </Text>
          {sortable && col.sortable !== false && sortKey === col.key && (
            <Text color={colors.primary[500]}>
              {sortDirection === 'asc' ? arrows.triangleUpSmall : arrows.triangleDownSmall}
            </Text>
          )}
        </Box>
      ))}
    </Box>
  );

  // Render row
  const renderRow = (row: T, index: number, dataIndex: number) => {
    const isSelected = selectable && dataIndex === selectedIndex;
    const isChecked = multiSelect && selectedRows.has(dataIndex);
    const isAlternate = striped && index % 2 === 1;

    let bgColor: string | undefined;
    if (isSelected) {
      bgColor = interactive.table.selected;
    } else if (isAlternate) {
      bgColor = interactive.table.alternate;
    }

    return (
      <Box
        key={dataIndex}
        backgroundColor={bgColor}
      >
        {selectable && (
          <Box width={3}>
            <Text color={isSelected ? colors.primary[500] : colors.neutral[400]}>
              {multiSelect
                ? isChecked ? '☑ ' : '☐ '
                : isSelected ? `${arrows.triangleRightSmall} ` : '  '}
            </Text>
          </Box>
        )}
        {showRowNumbers && (
          <Box width={5}>
            <Text color={colors.neutral[500]}>
              {(dataIndex + 1).toString().padStart(3)}
            </Text>
          </Box>
        )}
        {columns.map((col) => {
          const value = row[col.key];
          const content = col.render
            ? col.render(value, row, dataIndex)
            : formatValue(value, col.width);

          return (
            <Box key={String(col.key)} width={col.width + 3} paddingX={1}>
              {typeof content === 'string' ? (
                <Text color={isSelected ? colors.neutral[800] : colors.neutral[700]}>
                  {alignText(content, col.width, col.align)}
                </Text>
              ) : (
                content
              )}
            </Box>
          );
        })}
      </Box>
    );
  };

  // Empty state
  if (data.length === 0) {
    return (
      <Box
        flexDirection="column"
        borderStyle={borderStyle !== 'none' ? 'single' : undefined}
        borderColor={colors.neutral[300]}
        paddingX={2}
        paddingY={1}
      >
        <Text color={colors.neutral[500]}>{emptyMessage}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Header */}
      {borderChars && (
        <Box>
          <Text color={colors.neutral[300]}>
            {borderChars.topLeft}
            {borderChars.horizontal.repeat(totalWidth - 2)}
            {borderChars.topRight}
          </Text>
        </Box>
      )}
      <Box
        backgroundColor={interactive.table.headerBg}
        borderStyle={borderStyle !== 'none' ? 'single' : undefined}
        borderColor={colors.neutral[300]}
        borderTop={false}
        borderBottom={true}
        borderLeft={borderStyle !== 'none'}
        borderRight={borderStyle !== 'none'}
      >
        {renderHeader()}
      </Box>

      {/* Body */}
      <Box
        flexDirection="column"
        borderStyle={borderStyle !== 'none' ? 'single' : undefined}
        borderColor={colors.neutral[300]}
        borderTop={false}
      >
        {visibleData.map((row, index) => renderRow(row, index, scrollOffset + index))}
      </Box>

      {/* Scroll indicator */}
      {maxHeight && sortedData.length > maxHeight && (
        <Box marginTop={0}>
          <Text color={colors.neutral[500]}>
            Showing {scrollOffset + 1}-{Math.min(scrollOffset + maxHeight, sortedData.length)} of {sortedData.length}
            {scrollOffset > 0 && ` ${arrows.up}`}
            {scrollOffset + maxHeight < sortedData.length && ` ${arrows.down}`}
          </Text>
        </Box>
      )}
    </Box>
  );
}

// Helper: Format value for display
function formatValue(value: unknown, maxWidth: number): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str.length > maxWidth ? str.slice(0, maxWidth - 1) + '…' : str;
}

// Helper: Align text within width
function alignText(text: string, width: number, align: 'left' | 'center' | 'right' = 'left'): string {
  const truncated = text.length > width ? text.slice(0, width - 1) + '…' : text;

  switch (align) {
    case 'right':
      return truncated.padStart(width);
    case 'center':
      const leftPad = Math.floor((width - truncated.length) / 2);
      return ' '.repeat(leftPad) + truncated + ' '.repeat(width - leftPad - truncated.length);
    default:
      return truncated.padEnd(width);
  }
}

/**
 * Simple table without interactivity
 */
export function SimpleTable<T extends Record<string, unknown>>({
  data,
  columns,
}: {
  data: T[];
  columns: Column<T>[];
}): React.ReactElement {
  return (
    <Table
      data={data}
      columns={columns}
      selectable={false}
      striped
      borderStyle="single"
    />
  );
}

/**
 * Key-value table (two columns)
 */
export interface KeyValueTableProps {
  data: Array<{ key: string; value: React.ReactNode }>;
  keyWidth?: number;
  valueWidth?: number;
}

export const KeyValueTable: React.FC<KeyValueTableProps> = ({
  data,
  keyWidth = 15,
  valueWidth = 30,
}) => (
  <Box flexDirection="column">
    {data.map(({ key, value }, i) => (
      <Box key={i}>
        <Box width={keyWidth}>
          <Text color={colors.neutral[600]}>{key}</Text>
        </Box>
        <Box width={valueWidth}>
          {typeof value === 'string' ? (
            <Text color={colors.neutral[700]}>{value}</Text>
          ) : (
            value
          )}
        </Box>
      </Box>
    ))}
  </Box>
);

export default Table;
