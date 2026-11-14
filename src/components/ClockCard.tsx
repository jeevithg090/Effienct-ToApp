import { StyleSheet, Text, View } from 'react-native';

import { useNow } from '../hooks/useNow';
import { formatDate, formatTime } from '../lib/format';
import { radius, spacing, typography, useTheme } from '../theme';

interface ClockCardProps {
  total: number;
  completed: number;
}

/** Live date/time plus a progress summary. Owns its own timer so the list doesn't re-render every second. */
export function ClockCard({ total, completed }: ClockCardProps) {
  const { colors } = useTheme();
  const now = useNow();
  const progress = total === 0 ? 0 : completed / total;
  const percent = Math.round(progress * 100);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.clock}>
          <Text style={[styles.date, { color: colors.textMuted }]}>{formatDate(now)}</Text>
          <Text
            style={[styles.time, { color: colors.text }]}
            aria-label={`Current time ${formatTime(now)}`}
          >
            {formatTime(now)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.primary }]}>{percent}%</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>done</Text>
        </View>
      </View>
      <View
        role="progressbar"
        aria-label="Tasks completed"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
        style={[styles.track, { backgroundColor: colors.surfaceMuted }]}
      >
        <View style={[styles.fill, { backgroundColor: colors.primary, width: `${percent}%` }]} />
      </View>
      <Text style={[styles.summary, { color: colors.textMuted }]}>
        {total === 0
          ? 'No tasks yet — add your first one below.'
          : `${completed} of ${total} ${total === 1 ? 'task' : 'tasks'} completed`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  clock: { flexShrink: 1 },
  date: { ...typography.caption },
  time: {
    ...typography.display,
    fontVariant: ['tabular-nums'],
  },
  stat: { alignItems: 'flex-end' },
  statValue: { ...typography.title, fontVariant: ['tabular-nums'] },
  statLabel: { ...typography.caption },
  track: {
    height: 8,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  summary: { ...typography.caption },
});
