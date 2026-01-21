import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FloatingParticles } from '@/components/FloatingParticles';
import { LiveAgentBanner } from '@/components/LiveAgentBanner';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface HolidaySchedule {
  holiday: string;
  dateObserved: string;
  collectionSchedule: string;
  icon: string;
}

interface SpecialEvent {
  title: string;
  dates: string;
  icon: string;
  color: string;
}

const SPECIAL_EVENTS: SpecialEvent[] = [
  {
    title: "🎄 Christmas Tree Collection",
    dates: "December 26, 2025 - January 8, 2026",
    icon: "gift",
    color: "#2E7D32",
  },
  {
    title: "📄 Spring Paper Shredding Event",
    dates: "May 16, 2026",
    icon: "file-text",
    color: "#1565C0",
  },
  {
    title: "🍂 Fall Paper Shredding Event",
    dates: "October 17, 2026",
    icon: "file-text",
    color: "#FF9800",
  },
  {
    title: "🎄 Christmas Tree Collection",
    dates: "December 28, 2026 - January 7, 2027",
    icon: "gift",
    color: "#2E7D32",
  },
];

const HOLIDAY_SCHEDULE: HolidaySchedule[] = [
  {
    holiday: "🎊 New Year's Day",
    dateObserved: "Thursday, January 1, 2026",
    collectionSchedule: "No service on Thursday, Jan. 1. Thursday customers will be serviced on Friday.",
    icon: "star",
  },
  {
    holiday: "✊ Martin Luther King Jr. Day",
    dateObserved: "Monday, January 19, 2026",
    collectionSchedule: "No service on Monday, Jan. 19. Collection will run one day late for all customers.",
    icon: "heart",
  },
  {
    holiday: "🇺🇸 Presidents Day",
    dateObserved: "Monday, February 16, 2026",
    collectionSchedule: "No service on Monday, Feb. 16. Collection will run one day late for all customers.",
    icon: "flag",
  },
  {
    holiday: "🌺 Memorial Day",
    dateObserved: "Monday, May 25, 2026",
    collectionSchedule: "No service on Monday, May 25. Collection will run one day late for all customers.",
    icon: "award",
  },
  {
    holiday: "✨ Juneteenth",
    dateObserved: "Friday, June 19, 2026",
    collectionSchedule: "Juneteenth observed. No change in collection service.",
    icon: "sun",
  },
  {
    holiday: "🎆 Independence Day",
    dateObserved: "Friday, July 3, 2026",
    collectionSchedule: "Independence Day observed on Friday, July 3. No change in collection service.",
    icon: "zap",
  },
  {
    holiday: "👷 Labor Day",
    dateObserved: "Monday, September 7, 2026",
    collectionSchedule: "No service on Monday, Sept. 7. Collection will run one day late for all customers.",
    icon: "tool",
  },
  {
    holiday: "🎖️ Veterans Day",
    dateObserved: "Wednesday, November 11, 2026",
    collectionSchedule: "No service on Wednesday, Nov. 11. Collection will run one day late for Wednesday and Thursday customers.",
    icon: "shield",
  },
  {
    holiday: "🦃 Thanksgiving Holiday",
    dateObserved: "Thursday, Nov. 26 & Friday, Nov. 27, 2026",
    collectionSchedule: "No service on Thursday, Nov. 26. Thursday customers will be serviced on Friday.",
    icon: "home",
  },
  {
    holiday: "🎄 Christmas Day",
    dateObserved: "Friday, December 25, 2026",
    collectionSchedule: "Christmas Day observed. No change in collection service.",
    icon: "gift",
  },
];

export default function ViewScheduleScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleCallOffice = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:4042942900');
  };

  return (
    <ThemedView style={styles.container}>
      <FloatingParticles count={8} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl + 100,
          paddingHorizontal: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <LinearGradient
            colors={[BrandColors.blue, '#1976D2', BrandColors.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <Feather name="calendar" size={48} color="#fff" />
            <ThemedText style={styles.headerTitle}>📅 2026 Collection Schedule</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              DeKalb County Sanitation Division{'\n'}Residential Holiday Collection Schedule
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.noteCard, { backgroundColor: '#FFF3E0' }]}>
            <Feather name="alert-circle" size={20} color="#E65100" />
            <ThemedText style={styles.noteText}>
              ⚠️ Collection schedule may change due to inclement weather. Event dates are subject to change due to weather and other factors.
            </ThemedText>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <LinearGradient
            colors={['#FFFDE7', '#FFF9C4']}
            style={styles.eventsSection}
          >
            <View style={styles.stickyNoteHeader}>
              <Feather name="star" size={22} color="#F57F17" />
              <ThemedText style={styles.eventsSectionTitle}>📌 2026 Events & Recycling Initiatives</ThemedText>
            </View>
            
            {SPECIAL_EVENTS.map((event, index) => (
              <View key={index} style={styles.eventItem}>
                <View style={[styles.eventDot, { backgroundColor: event.color }]} />
                <View style={styles.eventContent}>
                  <ThemedText style={[styles.eventTitle, { color: event.color }]}>
                    {event.title}
                  </ThemedText>
                  <ThemedText style={styles.eventDates}>{event.dates}</ThemedText>
                </View>
              </View>
            ))}
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={styles.sectionHeader}>
            <Feather name="calendar" size={24} color={BrandColors.blue} />
            <ThemedText style={styles.sectionTitle}>🗓️ Holiday Collection Schedule</ThemedText>
          </View>
        </Animated.View>

        {HOLIDAY_SCHEDULE.map((item, index) => (
          <Animated.View
            key={index}
            entering={FadeInDown.delay(450 + index * 50).duration(400)}
          >
            <View style={[styles.holidayCard, { backgroundColor: theme.backgroundSecondary }]}>
              <LinearGradient
                colors={index % 2 === 0 ? [BrandColors.blue, '#1976D2'] : [BrandColors.green, '#388E3C']}
                style={styles.holidayBadge}
              >
                <Feather name={item.icon as any} size={18} color="#fff" />
              </LinearGradient>
              <View style={styles.holidayContent}>
                <ThemedText style={styles.holidayName}>{item.holiday}</ThemedText>
                <ThemedText style={[styles.holidayDate, { color: index % 2 === 0 ? BrandColors.blue : BrandColors.green }]}>
                  {item.dateObserved}
                </ThemedText>
                <ThemedText style={styles.holidaySchedule}>{item.collectionSchedule}</ThemedText>
              </View>
            </View>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(900).duration(400)}>
          <LinearGradient
            colors={[BrandColors.blue, BrandColors.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.contactCard}
          >
            <View style={styles.contactHeader}>
              <ThemedText style={styles.contactTitle}>📞 DeKalb County Sanitation Division</ThemedText>
              <ThemedText style={styles.contactSubtitle}>Customer Care Team - Public Works Department</ThemedText>
            </View>
            
            <View style={styles.contactDetails}>
              <Pressable style={styles.contactRow} onPress={handleCallOffice}>
                <View style={styles.contactIcon}>
                  <Feather name="phone" size={18} color="#fff" />
                </View>
                <ThemedText style={styles.contactText}>404.294.2900</ThemedText>
              </Pressable>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Feather name="globe" size={18} color="#fff" />
                </View>
                <ThemedText style={styles.contactText}>DeKalbSanitation.com</ThemedText>
              </View>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Feather name="mail" size={18} color="#fff" />
                </View>
                <ThemedText style={styles.contactText}>sanitation@dekalbcountyga.gov</ThemedText>
              </View>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Feather name="map-pin" size={18} color="#fff" />
                </View>
                <ThemedText style={styles.contactText}>3720 Leroy Scott Drive{'\n'}Decatur, GA 30032</ThemedText>
              </View>
              
              <View style={styles.contactRow}>
                <View style={styles.contactIcon}>
                  <Feather name="clock" size={18} color="#fff" />
                </View>
                <ThemedText style={styles.contactText}>Monday - Friday{'\n'}9 am - 3 pm</ThemedText>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(950).duration(400)}>
          <View style={[styles.valuesCard, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.valuesTitle}>🌟 A Tradition of Excellence</ThemedText>
            <View style={styles.valuesRow}>
              <View style={styles.valueItem}>
                <ThemedText style={styles.valueText}>✅ Efficiency</ThemedText>
              </View>
              <View style={styles.valueItem}>
                <ThemedText style={styles.valueText}>✅ Accountability</ThemedText>
              </View>
            </View>
            <View style={styles.valuesRow}>
              <View style={styles.valueItem}>
                <ThemedText style={styles.valueText}>✅ Resilience</ThemedText>
              </View>
              <View style={styles.valueItem}>
                <ThemedText style={styles.valueText}>✅ Integrity</ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(1000).duration(400)}>
          <View style={styles.recycledNote}>
            <Feather name="refresh-cw" size={16} color={BrandColors.green} />
            <ThemedText style={styles.recycledText}>♻️ Printed on recycled paper</ThemedText>
          </View>
        </Animated.View>

        <LiveAgentBanner />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: '700',
    color: '#fff',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: FontSizes.md,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: '#E65100',
    fontWeight: '500',
  },
  eventsSection: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ rotate: '-1deg' }],
  },
  stickyNoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  eventsSectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#F57F17',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  eventDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  eventDates: {
    fontSize: FontSizes.sm,
    color: '#666',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  holidayCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  holidayBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  holidayContent: {
    flex: 1,
  },
  holidayName: {
    fontSize: FontSizes.md,
    fontWeight: '700',
    marginBottom: 2,
  },
  holidayDate: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    marginBottom: 4,
  },
  holidaySchedule: {
    fontSize: FontSizes.sm,
    color: '#666',
    lineHeight: 20,
  },
  contactCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  contactHeader: {
    marginBottom: Spacing.md,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  contactTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  contactSubtitle: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  contactDetails: {
    gap: Spacing.sm,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactText: {
    fontSize: FontSizes.sm,
    color: '#fff',
    flex: 1,
    lineHeight: 22,
  },
  valuesCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  valuesTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    marginBottom: Spacing.md,
    color: BrandColors.blue,
  },
  valuesRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  valueItem: {
    padding: Spacing.sm,
  },
  valueText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: BrandColors.green,
  },
  recycledNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  recycledText: {
    fontSize: FontSizes.sm,
    color: BrandColors.green,
    fontWeight: '500',
  },
});
