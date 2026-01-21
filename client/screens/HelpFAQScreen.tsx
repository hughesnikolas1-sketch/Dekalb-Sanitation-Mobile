import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Linking } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FloatingParticles } from '@/components/FloatingParticles';
import { LiveAgentBanner } from '@/components/LiveAgentBanner';
import { BrandColors, Spacing, BorderRadius, FontSizes } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  faqs: FAQItem[];
}

const FAQ_SECTIONS: FAQSection[] = [
  {
    title: "🏞️ Landfill Information",
    icon: "map-pin",
    color: BrandColors.green,
    faqs: [
      {
        question: "How many landfills does DeKalb County own and operate?",
        answer: "One - The Seminole Road Landfill located at 4203 Clevemont Road, Ellenwood, GA 30294\n\nScale house: (404) 687-4040\nOffice: (404) 687-4016",
      },
      {
        question: "Who may use the landfill?",
        answer: "Residents of DeKalb County or licensed DeKalb County businesses can use the Landfill. Municipal solid waste material generated in DeKalb County is also accepted for disposal.",
      },
      {
        question: "What is needed to prove residency?",
        answer: "Vehicles with a DeKalb County vehicle registration sticker on the tag, a DeKalb County address on the driver's license of the vehicle operator, or a DeKalb County government invoice (such as water bill or tax assessment).",
      },
      {
        question: "How can I obtain a landfill decal?",
        answer: "Landfill decals can be obtained by completing a landfill decal application; providing the necessary documentation listed on the application; and following the instructions provided. Once processed and approved, the appropriate decal will be issued to the applicant.",
      },
      {
        question: "What items can residents dispose at the landfill, and at what cost?",
        answer: "Contact the landfill office for a complete list of acceptable items and associated fees.",
      },
      {
        question: "What type of waste does the landfill accept?",
        answer: "Normal home-generated refuse, such as non-combustible trash, discarded furniture or old appliances; yard trimmings, such as grass clippings, leaves, pine straw, limbs or tree trunks (must be in paper bags; no plastic bags will be accepted) or containerized loosely for disposal; building materials, such as lumber, shingles or carpet; and commercial waste, such as rocks, stumps or concrete products; a maximum of 10 passenger car tires from residents only; and small dead domestic animals.",
      },
      {
        question: "Is there any type of waste that the landfill will not accept?",
        answer: "Yes. The Seminole Road Landfill will not accept any hazardous material (corrosive materials, explosive materials, inflammable materials or dangerous material of any kind); liquids (including old paint, used motor oil, etc.); lead-acid batteries; feces; or old tires generated through a commercial operation.",
      },
      {
        question: "What costs are associated with disposal of items at the landfill?",
        answer: "Sample disposal fees include:\n\n• Animals (from DeKalb residents) - $25.00\n• Animals (non-DeKalb County residents) - $100.00\n• Securing and preparing the landfill burial site - $200.00\n• Appliances and all items with Freon - $48 per item\n• Personal vehicle tires (no commercial vehicle tires; up to 10 tires per visit) - $10 per tire",
      },
      {
        question: "What are the driving directions to the landfill?",
        answer: "From I-285 E and exit 48 (Flat Shoals Parkway), proceed East (outside the perimeter) on Flat Shoals Parkway approximately 1.5 miles to the traffic light at the intersection of Waldrop Road, and turn right. Follow Waldrop Road to the traffic light at the intersection of River Road and turn left. Follow River Road approximately 1.5 miles and turn right on Clevemont Road. The Landfill is the first driveway on the right.",
      },
      {
        question: "Can recyclable items be dropped off at the landfill?",
        answer: "Yes. There is a drop-off area with specially marked containers where residents can drop off recyclable materials.",
      },
    ],
  },
  {
    title: "♻️ Residential Recycling Program",
    icon: "refresh-cw",
    color: "#4CAF50",
    faqs: [
      {
        question: "How can residents subscribe to the recycling program?",
        answer: "Contact the Sanitation Division or visit the website for more information on subscribing to the recycling program.",
      },
      {
        question: "Is glass being recycled?",
        answer: "While the County no longer accepts glass in curbside single-stream recycling, residents can recycle glass using county-operated glass recycling drop-off locations. Contact the Sanitation Division for more information.",
      },
      {
        question: "What time should garbage, yard trimmings and recyclables be placed curbside for collection?",
        answer: "All garbage, yard trimmings and recyclables must be placed curbside by 7 a.m. on scheduled collection days.",
      },
    ],
  },
  {
    title: "🚛 Curbside Collection Procedures",
    icon: "truck",
    color: BrandColors.blue,
    faqs: [
      {
        question: "Does the Sanitation Division collect furniture and appliances at the curb?",
        answer: "Yes. This service is available free to all residential curbside customers. Refrigerator and freezer doors must be secured or removed, and placed on the right-of-way away from mailboxes, sidewalks, utilities, roadways or drainage ditches. All food must be removed prior to placing refrigerators at the curb for collection. Once the furniture or appliance is placed curbside, residents are required to submit a bulky item collection request.",
      },
      {
        question: "How should paint be prepared for proper disposal?",
        answer: "Paint can be collected on residents' scheduled collection day if the paint has solidified and will not pour out of the can. Please ensure that paint cans are double-bagged and placed in garbage roll carts to ensure collection. Paint cans left curbside beside garbage roll carts will not be collected. Residents can use kitty litter or another drying agent to solidify liquid paint. Another method is to remove the paint can's lid and stir the paint daily until it hardens in the can. Full cans of paint must be dry to the bottom, and not simply crusted over. Cans with liquid paint placed in collection trucks can spill and leak onto roads. Paint spills on roads are difficult to remove.",
      },
      {
        question: "What is the proper size for tree parts?",
        answer: "Tree trunks must be cut small enough in size that they can be hand loaded to the collection vehicle. Each tree part must not exceed 25 lbs. in weight. Limbs and branches must not exceed four feet in length, and must be stacked neatly at the curb. Twigs, leaves, pine straw and other small vegetation items must be placed in paper biodegradable bags or containers up to 40 gallons that are clean and have not been exposed to loose household refuse.",
      },
      {
        question: "Do you collect building materials and is there a charge?",
        answer: "Items can be collected curbside for a special collection fee. Contact the Sanitation Division for more information. Items can also be disposed of at the Seminole Road Landfill for a fee.",
      },
      {
        question: "Does the Sanitation Division collect tires curbside from residents?",
        answer: "NO. However, residents may take a maximum of 10 passenger tires per visit to the Seminole Road Landfill, 4203 Clevemont Road, Ellenwood, GA 30294. A fee of $10 per tire is required. Please call (404) 687-4020 for more information.",
      },
      {
        question: "How should dead animals be handled?",
        answer: "Dead animals on county rights of way and roads can be collected by the Sanitation Division. Residents can transport dead domestic animals to the Animal Crematory or Seminole Road Landfill. Contact the Sanitation Division for more information.",
      },
    ],
  },
  {
    title: "💰 Sanitation Service Fees",
    icon: "dollar-sign",
    color: "#FF9800",
    faqs: [
      {
        question: "How is new sanitation service established?",
        answer: "Residents requesting new sanitation service are required to complete a new service application. Proof of ownership or a lease agreement will be requested. A prorated annual sanitation service fee will be required prior to activating collection service. Contact the Sanitation Division for more information on how to establish new sanitation service.",
      },
      {
        question: "How are residential collection services billed and paid?",
        answer: "Residents' annual sanitation assessment fees are billed on annual property tax statements through the Tax Commissioner's office, and listed as a separate line item. Please visit the Tax Commissioner's website for more information on payment options.",
      },
      {
        question: "What services are included in the annual sanitation assessment fee?",
        answer: "Once-a-week household garbage, recyclable materials and yard trimmings collection, and bulky item collections.",
      },
    ],
  },
  {
    title: "🌳 Beautification Unit",
    icon: "sun",
    color: "#8BC34A",
    faqs: [
      {
        question: "Who handles mowing on county rights of way, and litter on county roads and rights of way?",
        answer: "Property owners are responsible for maintaining the right of way joining their property. The Beautification Unit - Keep DeKalb Beautiful periodically mows overgrown county rights of way; trims bushes; increases sight vision on rights of way and county-owned vacant lots; and collects litter on roads and rights of way. For more information, visit the Beautification Unit - Keep DeKalb Beautiful website.",
      },
    ],
  },
];

function FAQAccordion({ section }: { section: FAQSection }) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const { theme } = useTheme();

  const toggleItem = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <View style={styles.sectionContainer}>
      <LinearGradient
        colors={[section.color, section.color + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sectionHeader}
      >
        <Feather name={section.icon} size={22} color="#fff" />
        <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
      </LinearGradient>

      {section.faqs.map((faq, index) => (
        <View key={index} style={[styles.faqItem, { backgroundColor: theme.backgroundSecondary }]}>
          <Pressable
            style={styles.questionContainer}
            onPress={() => toggleItem(index)}
          >
            <ThemedText style={[styles.question, { color: section.color }]}>
              {faq.question}
            </ThemedText>
            <Feather
              name={expandedItems[index] ? "chevron-up" : "chevron-down"}
              size={20}
              color={section.color}
            />
          </Pressable>
          {expandedItems[index] ? (
            <Animated.View
              entering={FadeInDown.duration(200)}
              style={styles.answerContainer}
            >
              <ThemedText style={styles.answer}>{faq.answer}</ThemedText>
            </Animated.View>
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function HelpFAQScreen() {
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const handleCallLandfill = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL('tel:4046874040');
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
            colors={[BrandColors.blue, BrandColors.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerCard}
          >
            <Feather name="help-circle" size={48} color="#fff" />
            <ThemedText style={styles.headerTitle}>📚 Help & FAQ</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Find answers to commonly asked questions about DeKalb County Sanitation services
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <Pressable style={[styles.quickCallCard, { backgroundColor: theme.backgroundSecondary }]} onPress={handleCallLandfill}>
            <View style={styles.quickCallContent}>
              <View style={[styles.iconCircle, { backgroundColor: BrandColors.green + '20' }]}>
                <Feather name="phone" size={24} color={BrandColors.green} />
              </View>
              <View style={styles.quickCallText}>
                <ThemedText style={styles.quickCallTitle}>📞 Seminole Road Landfill</ThemedText>
                <ThemedText style={styles.quickCallNumber}>(404) 687-4040</ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={24} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>

        {FAQ_SECTIONS.map((section, index) => (
          <Animated.View
            key={section.title}
            entering={FadeInDown.delay(300 + index * 100).duration(400)}
          >
            <FAQAccordion section={section} />
          </Animated.View>
        ))}

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
  quickCallCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickCallContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickCallText: {
    gap: 2,
  },
  quickCallTitle: {
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  quickCallNumber: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: BrandColors.green,
  },
  sectionContainer: {
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
    color: '#fff',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  questionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  question: {
    fontSize: FontSizes.md,
    fontWeight: '600',
    flex: 1,
    paddingRight: Spacing.md,
  },
  answerContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  answer: {
    fontSize: FontSizes.sm,
    lineHeight: 22,
    opacity: 0.8,
  },
});
