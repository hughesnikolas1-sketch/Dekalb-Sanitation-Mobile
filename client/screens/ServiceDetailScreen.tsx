import React, { useState, useEffect } from "react";
import { View, ScrollView, StyleSheet, Pressable, TextInput, Alert, ActivityIndicator, Platform, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { useQuery } from "@tanstack/react-query";

const showAlert = (title: string, message: string, buttons?: { text: string; style?: string }[]) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message, buttons as any);
  }
};
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { RouteProp, useRoute, useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { DCLogo, SelectionCelebration } from "@/components/DCLogo";
import { useTheme } from "@/hooks/useTheme";
import {
  Spacing,
  BorderRadius,
  BrandColors,
  FuturisticGradients,
  GlowEffects,
  ServiceReminders,
} from "@/constants/theme";
import { ServicesStackParamList } from "@/navigation/ServicesStackNavigator";

const MISSED_PICKUP_REASONS = [
  "Cart was not at the curb by 6:00 AM on collection day",
  "Cart was blocked by parked vehicles or other obstructions",
  "Cart lid was not fully closed due to overfilling",
  "Cart was placed on the wrong side of the driveway",
  "Cart was too far from the curb (must be within 3 feet)",
  "Prohibited items were visible in the cart",
  "Weather conditions or road issues prevented access",
  "Cart was placed behind a gate or in an inaccessible area",
];

const ADDITIONAL_CART_REASONS = [
  "Household size increased",
  "Frequently overflow on collection day",
  "Seasonal yard waste volume",
  "Other",
];

const SERVICE_LOCATIONS = [
  { id: "1", name: "Default", label: "Default", type: "Rental Property" },
  { id: "2", name: "Work", label: "Work", type: "Work" },
  { id: "3", name: "Home", label: "Home Address", type: "Home" },
];

const COLLECTION_PROCEDURES = {
  title: "Residential Collection Procedures",
  curbsideProcedures: [
    {
      icon: "package" as const,
      text: "Place garbage in secure plastic bags prior to placement in the green garbage roll cart; place recyclable items loosely in the blue recycling roll cart.",
    },
    {
      icon: "arrow-right" as const,
      text: "Place roll carts at the curb; roll cart handles must face your home and lid openings must face the street.",
    },
    {
      icon: "home" as const,
      text: "Place roll carts as far away as possible from flower beds, mailboxes, or anything that could impede servicing; vehicles should not block the collection truck's service area.",
    },
    {
      icon: "maximize-2" as const,
      text: "Roll carts should be 3 - 5 feet apart from each other.",
    },
    {
      icon: "alert-circle" as const,
      text: "No excess/overflow bags are permitted outside of roll carts; schedule an excess garbage or yard trimmings collection request online for a prepaid special collection fee; OR obtain a second 95-gallon roll cart.",
    },
  ],
  procedures: [
    {
      icon: "trash-2" as const,
      title: "Household garbage",
      text: "place in secure plastic bags prior to placing in roll cart; no loose garbage; lid must be fully closed; no excess/overflow bags on the top or side of roll carts; only county-provided roll carts are serviced.",
    },
    {
      icon: "refresh-cw" as const,
      title: "Recyclable materials",
      text: "loosely placed in roll cart; acceptable plastics - 1 and 2 ONLY; visit www.dekalbsanitation.com for acceptable materials; only county-provided roll carts are serviced.",
    },
    {
      icon: "box" as const,
      title: "Boxes",
      text: "must be flattened (10 or less) or a special collection fee will apply.",
    },
    {
      icon: "sun" as const,
      title: "Yard trimmings",
      text: "biodegradable bags or approved containers up to 40 gallons; no plastic bags; limbs and brush must be four feet or less in length, bundled and tied; large volumes of yard trimmings, or tree parts greater than 3\" require a special collection fee.",
    },
    {
      icon: "clock" as const,
      title: "Collection day procedures",
      text: "roll carts and yard trimmings containers placed curbside by 7 a.m. and removed by 7 p.m.",
    },
    {
      icon: "truck" as const,
      title: "Bulky items",
      text: "household appliances and furniture only; schedule collection at www.dekalbsanitation.com.",
    },
    {
      icon: "dollar-sign" as const,
      title: "Special collections",
      text: "prepaid fee required; excess/overflow garbage bags; large volumes of garbage and yard trimmings; improperly prepared yard trimmings; tree parts; commingled piles; flattened boxes (more than 10); unflattened boxes (any number); schedule payment and collection at www.dekalbsanitation.com.",
    },
    {
      icon: "x-circle" as const,
      title: "Prohibited materials",
      text: "needles; batteries; dirt; rock; concrete; automobile bodies and parts; liquids of any kind; hazardous materials; tires.",
    },
  ],
};

type ServiceDetailRouteProp = RouteProp<ServicesStackParamList, "ServiceDetail">;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FormQuestion {
  question: string;
  type: "text" | "yesno" | "select" | "time";
  options?: string[];
  placeholder?: string;
}

interface ServiceOption {
  id: string;
  name: string;
  size?: string;
  price: string;
  schedule?: string;
}

interface ContentSection {
  title: string;
  content: string[];
}

interface ServiceInfo {
  title: string;
  description: string;
  icon: keyof typeof Feather.glyphMap;
  color: string;
  gradientColors: string[];
  options: ServiceOption[];
  formQuestions?: FormQuestion[];
  contentSections?: ContentSection[];
  additionalInfo?: string[];
  links?: { text: string; url: string }[];
  rollOffInfo?: {
    importantNotes: string[];
    feeSchedule: { size: string; price: string }[];
  };
}

const CURB_TIME_OPTIONS = [
  "Before 6:00 AM",
  "6:00 AM - 7:00 AM",
  "7:00 AM - 8:00 AM",
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "After 10:00 AM",
  "The night before collection day",
];

const BOX_COUNT_OPTIONS = [
  "1-5 boxes",
  "6-10 boxes",
  "11-15 boxes",
  "16-20 boxes",
  "More than 20 boxes",
];

const DEBRIS_TYPE_OPTIONS = [
  "Grass clippings",
  "Leaves",
  "Tree branches/limbs",
  "Shrub trimmings",
  "Mixed yard waste",
  "Other",
];

const BAG_COUNT_OPTIONS = [
  "1-5 bags",
  "6-10 bags",
  "11-15 bags",
  "16-20 bags",
  "More than 20 bags",
];

const CART_ISSUE_REASONS = [
  "Cart was damaged by collection truck",
  "Cart was damaged by weather/storm",
  "Cart lid is broken or missing",
  "Cart wheels are broken",
  "Cart body is cracked or has holes",
  "Cart handle is broken",
  "Other damage",
];

const CART_STOLEN_DETAILS = [
  "Cart was stolen from curb on collection day",
  "Cart was stolen from my property",
  "Cart went missing after a storm",
  "Cart was taken by unknown party",
  "Other",
];

const CART_RETURN_REASONS = [
  "Moving out of DeKalb County",
  "Selling/transferring property",
  "No longer need additional cart",
  "Downsizing service",
  "Other",
];

const serviceDetails: Record<string, ServiceInfo> = {
  "res-missed-trash": {
    title: "Missed Trash Pickup",
    description: "Report a missed residential trash collection. We will schedule a pickup within 24-48 hours of your report.",
    icon: "trash-2",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Report Missed Pickup", price: "Free", schedule: "Response within 48 hours" },
    ],
    formQuestions: [
      { question: "Do you have a county issued roll cart?", type: "yesno" },
      { question: "Did the roll cart have excess overflow?", type: "yesno" },
      { question: "Was there anything in the roll cart that was not trash?", type: "yesno" },
      { question: "What time was the roll cart placed at the curb?", type: "select", options: CURB_TIME_OPTIONS },
    ],
  },
  "res-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed residential recycling collection. Our team will address your concern promptly.",
    icon: "refresh-cw",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Report Missed Recycling", price: "Free", schedule: "Response within 48 hours" },
    ],
    formQuestions: [
      { question: "Is there any glass in your roll cart?", type: "yesno" },
      { question: "Is everything inside the cart considered recyclable?", type: "select", options: ["Yes", "No", "Not Sure"] },
      { question: "How many boxes are at the curb?", type: "select", options: BOX_COUNT_OPTIONS },
      { question: "What time was the roll cart placed at the curb?", type: "select", options: CURB_TIME_OPTIONS },
    ],
  },
  "res-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed yard waste collection. Available during seasonal collection periods.",
    icon: "feather",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Report Missed Yard Waste", price: "Free", schedule: "Response within 48 hours" },
    ],
    formQuestions: [
      { question: "What type of debris is it?", type: "select", options: DEBRIS_TYPE_OPTIONS },
      { question: "How many bags are at the curb currently?", type: "select", options: BAG_COUNT_OPTIONS },
      { question: "Are there any dirt in the bags?", type: "yesno" },
      { question: "Are the bags biodegradable?", type: "select", options: ["Yes", "No", "N/A (loose pile)"] },
      { question: "Are the tree branches and limbs cut down to 4 feet or less?", type: "select", options: ["Yes", "No", "N/A (no branches)"] },
      { question: "What time were items placed at the curb?", type: "select", options: CURB_TIME_OPTIONS },
    ],
  },
  "res-roll-cart": {
    title: "Roll Cart Request",
    description: "Request a new roll cart, replacement cart, or additional cart for your residential property. An annual prorated assessment fee applies when receiving an additional cart.",
    icon: "box",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "Complimentary 45-Gallon Recycle Cart", size: "Free recycle roll cart for new customers", price: "Free", schedule: "Delivery within 5-7 days" },
      { id: "2", name: "Additional Trash Roll Cart", size: "Add another trash cart - $25", price: "$25", schedule: "Delivery within 5-7 days" },
      { id: "3", name: "New 45-Gallon Recycle Cart", size: "Request a new 45-gallon recycle cart", price: "$42.50", schedule: "Delivery within 5-7 days" },
      { id: "4", name: "New 65-Gallon Recycle Cart", size: "Request a new 65-gallon recycle cart - $52.30", price: "$52.30", schedule: "Delivery within 5-7 days" },
      { id: "5", name: "New Trash Roll Cart", size: "Request a new trash cart - $60.55", price: "$60.55", schedule: "Delivery within 5-7 days" },
      { id: "6", name: "Damaged Cart", size: "Repair or refurbished replacement (free)", price: "Free", schedule: "Response within 3-5 days" },
      { id: "7", name: "Stolen Cart", size: "Refurbished replacement provided (free)", price: "Free", schedule: "Response within 3-5 days" },
      { id: "8", name: "Return Cart", size: "Schedule cart return/pickup", price: "Free", schedule: "Pickup within 5-7 days" },
    ],
    links: [
      { text: "View Annual Prorated Fee Assessments", url: "https://www.dekalbcountyga.gov/sanitation/garbage-roll-cart-application" },
      { text: "Pay via InvoiceCloud Portal", url: "https://www.invoicecloud.com/portal/(S(yjnv2fenvzusksodjbig42md))/2/cloudstore.aspx?cs=EA8433D6-3EAA-4147-87BC-D9FF94D3306C&bg=0b13fbf9-01c5-41f3-8549-2d5277a00a99&return=1" },
    ],
  },
  "res-roll-off": {
    title: "Residential Roll-Off Container (2 Week Rental)",
    description: "ATTENTION: ROLL OFF CONTAINERS ARE ONLY FOR RESIDENTS THAT RECEIVE WEEKLY GARBAGE AND RECYCLING SERVICE FROM DEKALB COUNTY SANITATION.",
    icon: "truck",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [
      { id: "1", name: "10 Yard Container", size: "2-week rental period", price: "$226" },
      { id: "2", name: "20 Yard Container", size: "2-week rental period", price: "$451" },
      { id: "3", name: "30 Yard Container", size: "2-week rental period", price: "$677" },
      { id: "4", name: "40 Yard Container", size: "2-week rental period", price: "$902" },
    ],
    links: [
      { text: "Pay via InvoiceCloud Portal", url: "https://www.invoicecloud.com/portal/(S(yjnv2fenvzusksodjbig42md))/2/cloudstore.aspx?cs=EA8433D6-3EAA-4147-87BC-D9FF94D3306C&bg=0b13fbf9-01c5-41f3-8549-2d5277a00a99&return=1" },
    ],
    rollOffInfo: {
      importantNotes: [
        "No containers will be delivered on Saturday, Sunday, or county-observed holidays.",
        "Containers should be placed in resident's driveway.",
        "Residents with sloped driveways should email sanitation@dekalbcountyga.gov for a site assessment PRIOR to requesting and paying for a roll-off container.",
        "Servicing and returning the container require payment of an additional two-week rental fee.",
        "Residential roll off containers are ONLY for residents that receive weekly garbage and recycling service from DeKalb County Sanitation.",
        "Roll-Off containers cannot be placed in the streets.",
        "Containers are available for a maximum of a two-week rental period and cannot be used to replace standard long-term garbage service.",
      ],
      feeSchedule: [
        { size: "10 yard", price: "$226" },
        { size: "20 yard", price: "$451" },
        { size: "30 yard", price: "$677" },
        { size: "40 yard", price: "$902" },
      ],
    },
  },
  "res-bulk-special": {
    title: "Bulk & Special Collection",
    description: "Please confirm your details and provide any additional information needed.",
    icon: "package",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    isBulkSpecialForm: true,
    options: [],
    contentSections: [
      {
        title: "Collection Process",
        content: [
          "Once items have been placed curbside, residents must complete a bulky item or special collection request.",
          "Bulky items are included in residents' annual sanitation assessment fees, but special collection items incur a prepaid special collection fee (see pricing below).",
          "After a request has been submitted, an assessment will be completed, and residents will be provided with further instructions for completing the process.",
          "For all requests, a copy of the completed special collection form (SCAF) will be left at the resident's home.",
        ],
      },
    ],
    bulkItems: {
      title: "Bulk Items (Included in Annual Fee)",
      items: [
        "Toilets",
        "Furniture",
        "Mattresses & box springs",
        "Household appliances (must be empty and all doors removed)",
      ],
    },
    specialCollectionItems: {
      title: "Special Collection Items (Prepaid Fee Required)",
      items: [
        "Commingled piles",
        "Landlord evictions",
        "Excess garbage bags",
        "Wood, metal fences, decking",
        "Improperly prepared yard trimmings",
        "Logs/limbs too large or greater than 3\" diameter",
        "Large volumes of garbage or yard trimmings",
        "Tree limbs cut by hired/professional contractors",
      ],
    },
    specialCollectionPricing: [
      { item: "General special collection pile", price: "$100 min / $225 per truckload" },
      { item: "Tree parts greater than 3\" diameter", price: "$200 min / $450 per truckload" },
      { item: "Commingled piles (tree parts & garbage)", price: "$200 min / $450 per truckload" },
    ],
    formFields: {
      itemsReady: { question: "Are all items at the curb ready for collection?", type: "yesno", required: true },
      itemCategory: { 
        question: "Choose Item Category", 
        type: "select", 
        required: true,
        options: [
          "Bulk Item - Toilets",
          "Bulk Item - Furniture",
          "Bulk Item - Mattresses & box springs",
          "Bulk Item - Household appliances",
          "Special Collection - Commingled piles",
          "Special Collection - Landlord evictions",
          "Special Collection - Excess garbage bags",
          "Special Collection - Wood/metal fences/decking",
          "Special Collection - Improperly prepared yard trimmings",
          "Special Collection - Large logs/limbs (>3\" diameter)",
          "Special Collection - Large volumes of garbage/yard trimmings",
          "Special Collection - Tree limbs (professional contractor)",
        ],
      },
      details: { question: "Details", type: "text", placeholder: "Please describe the issue or request in detail...", required: false },
      photo: { question: "Photo of Items at Curb", type: "photo", required: true, note: "Take a photo showing all items placed at the curb for collection" },
    },
  },
  "res-new-service": {
    title: "Establish New Residential Garbage & Recycling Service",
    description: "Apply for new residential garbage and recycling collection service. Submit your application and our team will process your request.",
    icon: "file-plus",
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [],
    isNewServiceForm: true,
    contentSections: [
      {
        title: "Required Documents",
        content: [
          "Proof of home ownership is required (closing statement and government-issued ID)",
          "New home purchases require proof of ownership documentation",
        ],
      },
      {
        title: "Garbage Roll Cart",
        content: [
          "95-gallon garbage roll cart provided to all new residential customers",
          "Specialized service options may be available for residents with mobility or medical challenges. Requests are reviewed on a case-by-case basis. Proof of medical or mobility challenge is required.",
        ],
      },
      {
        title: "Recycling Roll Cart Options (Optional)",
        content: [
          "This subscription-based service is offered to residents at no additional fee:",
          "• Complimentary 45-gallon roll cart",
          "• Upgrade to a 65-gallon roll cart (a one-time $25 prepaid roll cart fee applies)",
        ],
      },
    ],
    newServiceFormFields: {
      customerInfo: [
        { id: "residentName", label: "Resident's Name", type: "text", required: true, placeholder: "Enter your full name" },
        { id: "serviceAddress", label: "Service Address", type: "text", required: true, placeholder: "Enter your service address" },
        { id: "phone", label: "Phone", type: "phone", required: true, placeholder: "(xxx) xxx-xxxx" },
        { id: "email", label: "Email", type: "email", required: true, placeholder: "your@email.com" },
        { id: "specialInstructions", label: "Special Delivery Instructions (gate code, etc.)", type: "text", required: false, placeholder: "Optional: Enter gate code or special instructions" },
      ],
      homePurchaseDate: { id: "homePurchaseDate", label: "Home Purchase Date", type: "date", required: true },
      propertyType: {
        label: "Type of Property",
        options: ["Owner", "Tenant", "Townhouse", "Single-family", "Triplex", "Condominium"],
      },
      garbageCart: {
        label: "Garbage Roll Cart",
        description: "95-gallon garbage roll cart",
        note: "Specialized service options may be available for residents with mobility or medical challenges. Requests are reviewed on a case-by-case basis. Proof of medical or mobility challenge is required.",
      },
      recyclingOptions: {
        label: "Recycling Roll Cart Options (optional)",
        description: "This subscription-based service is offered to residents at no additional fee.",
        options: [
          { id: "recycle45", label: "Complimentary 45-gallon roll cart", price: "Free" },
          { id: "recycle65", label: "Upgrade to a 65-gallon roll cart", price: "$25 one-time fee" },
        ],
      },
    },
    proratedFees: {
      title: "Prorated Annual Sanitation Assessment Fees",
      subtitle: "One Garbage Roll Cart and One Optional Recycling Roll Cart",
      fees: [
        { month: "January", amount: "$315.00" },
        { month: "February", amount: "$288.75" },
        { month: "March", amount: "$262.50" },
        { month: "April", amount: "$236.25" },
        { month: "May", amount: "$210.00" },
        { month: "June", amount: "$183.75" },
        { month: "July", amount: "$157.50" },
        { month: "August", amount: "$131.25" },
        { month: "September", amount: "$105.00" },
        { month: "October", amount: "$78.75" },
        { month: "November", amount: "$52.50" },
        { month: "December 1-10", amount: "$26.25" },
        { month: "December 11-31", amount: "$315.00" },
      ],
    },
  },
  "com-missed-trash": {
    title: "Missed Trash Pickup",
    description: "Report a missed commercial trash collection. We will schedule a pickup within 24-48 hours of your report.",
    icon: "trash-2",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Report Missed Pickup", price: "Free", schedule: "Response within 48 hours" },
    ],
    formQuestions: [
      { question: "Do you have a county issued roll cart?", type: "yesno" },
      { question: "Did the roll cart have excess overflow?", type: "yesno" },
      { question: "Was there anything in the roll cart that was not trash?", type: "yesno" },
      { question: "What time was the roll cart placed at the curb?", type: "select", options: CURB_TIME_OPTIONS },
    ],
  },
  "com-missed-recycling": {
    title: "Missed Recycling",
    description: "Report a missed commercial recycling collection. Our team will address your concern promptly.",
    icon: "refresh-cw",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Report Missed Recycling", price: "Free", schedule: "Response within 48 hours" },
    ],
    formQuestions: [
      { question: "Is there any glass in your roll cart?", type: "yesno" },
      { question: "Is everything inside the cart considered recyclable?", type: "select", options: ["Yes", "No", "Not Sure"] },
      { question: "How many boxes are at the curb?", type: "select", options: BOX_COUNT_OPTIONS },
      { question: "What time was the roll cart placed at the curb?", type: "select", options: CURB_TIME_OPTIONS },
    ],
  },
  "com-missed-yard-waste": {
    title: "Missed Yard Waste",
    description: "Report a missed commercial yard waste collection. Available during seasonal collection periods.",
    icon: "feather",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Report Missed Yard Waste", price: "Free", schedule: "Response within 48 hours" },
    ],
    formQuestions: [
      { question: "What type of debris is it?", type: "select", options: DEBRIS_TYPE_OPTIONS },
      { question: "How many bags are at the curb currently?", type: "select", options: BAG_COUNT_OPTIONS },
      { question: "Are there any dirt in the bags?", type: "yesno" },
      { question: "Are the bags biodegradable?", type: "select", options: ["Yes", "No", "N/A (loose pile)"] },
      { question: "Are the tree branches and limbs cut down to 4 feet or less?", type: "select", options: ["Yes", "No", "N/A (no branches)"] },
      { question: "What time were items placed at the curb?", type: "select", options: CURB_TIME_OPTIONS },
    ],
  },
  "com-roll-cart": {
    title: "Roll Cart Services",
    description: "An annual prorated assessment fee applies when receiving an additional cart. Select the service you need below.",
    icon: "box",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Complimentary 45-Gallon Recycle Cart", size: "One complimentary 45-gallon recycle roll cart provided to each new commercial customer", price: "Free" },
      { id: "2", name: "Additional Trash Roll Cart", size: "Request an additional trash roll cart for your property", price: "$25" },
      { id: "3", name: "New 45-Gallon Recycle Cart", size: "Request a new 45-gallon recycle cart", price: "$42.50" },
      { id: "4", name: "New 65-Gallon Recycle Cart", size: "Request a new 65-gallon recycle cart", price: "$52.30" },
      { id: "5", name: "New Trash Roll Cart", size: "Request a new trash roll cart", price: "$60.55" },
      { id: "6", name: "Damaged Cart", size: "Repair or refurbished replacement provided at no charge", price: "Free" },
      { id: "7", name: "Stolen Cart", size: "Refurbished replacement provided at no charge", price: "Free" },
      { id: "8", name: "Return Cart", size: "Schedule a cart return or pickup", price: "Free" },
    ],
    links: [
      { text: "View Annual Prorated Fee Assessments", url: "https://www.dekalbcountyga.gov/sanitation/garbage-roll-cart-application" },
      { text: "Pay via InvoiceCloud Portal", url: "https://www.invoicecloud.com/portal/(S(yjnv2fenvzusksodjbig42md))/2/cloudstore.aspx?cs=EA8433D6-3EAA-4147-87BC-D9FF94D3306C&bg=0b13fbf9-01c5-41f3-8549-2d5277a00a99&return=1" },
    ],
  },
  "com-roll-off": {
    title: "Commercial Roll-Off Container (2 Week Rental)",
    description: "Roll off containers are available for 2-week rental periods. The roll off fee is applied once the container has been serviced by the driver and returned to the Sanitation Division.",
    icon: "truck",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "10 Yard Container", size: "2-week rental period", price: "$226" },
      { id: "2", name: "20 Yard Container", size: "2-week rental period", price: "$451" },
      { id: "3", name: "30 Yard Container", size: "2-week rental period", price: "$677" },
      { id: "4", name: "40 Yard Container", size: "2-week rental period", price: "$902" },
      { id: "5", name: "Request Early Pickup", size: "If your container is full before the 2-week period ends, request an early pickup", price: "Included" },
    ],
    links: [
      { text: "Pay via InvoiceCloud Portal", url: "https://www.invoicecloud.com/portal/(S(yjnv2fenvzusksodjbig42md))/2/cloudstore.aspx?cs=EA8433D6-3EAA-4147-87BC-D9FF94D3306C&bg=0b13fbf9-01c5-41f3-8549-2d5277a00a99&return=1" },
    ],
    rollOffInfo: {
      importantNotes: [
        "In order to complete pre-payment for Roll-Off container 2 week rental, please complete all fields below. Required fields are denoted with an asterisk (*).",
        "Roll off containers are ONLY for businesses that receive weekly garbage and recycling service from Dekalb County Sanitation.",
        "No Roll-Off containers will be delivered on Saturday, Sunday & County Observed Holidays.",
        "Roll-Offs cannot be placed in the streets.",
        "If you have a sloped driveway please email Dekalb Sanitation for a site assessment review PRIOR to requesting and paying for a Roll-Off container.",
        "Businesses can submit a 10-, 20-, 30- or 40-yard Roll-Off container rental request. Containers are available for a maximum of a two-week rental period and cannot be used to replace standard long-term garbage service.",
        "A pickup and return of the Roll-Off Container requires payment of an additional 2 Week Rental charge.",
      ],
      feeSchedule: [
        { size: "10 yard", price: "$226" },
        { size: "20 yard", price: "$451" },
        { size: "30 yard", price: "$677" },
        { size: "40 yard", price: "$902" },
      ],
    },
  },
  "com-new-requirements": {
    title: "Requirements for Establishing Commercial Sanitation Service",
    description: "Office Location: 3720 Leroy Scott Drive, Decatur, GA 30032\nOffice Hours: Monday - Friday, 8 a.m. - 3:30 p.m.",
    icon: "file-text",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [],
    contentSections: [
      {
        title: "New Commercial Business Owner",
        content: [
          "1. New commercial business application (signed by Sanitation Division staff only)",
          "2. Photo identification: driver's license, state-issued identification card, or passport",
          "3. Proof of ownership: deed, title, bill of sale or current property tax statement",
          "4. No outstanding sanitation debt associated with property address",
          "5. Prepayment of dumpster delivery and removal fee of $150 per dumpster, plus first month's collection",
        ],
      },
      {
        title: "Commercial Business Tenant/Lease",
        content: [
          "1. New commercial business application (signed by Sanitation Division staff only)",
          "2. Photo identification: driver's license, state-issued identification card, or passport",
          "3. Property owner authorization or current commercial lease",
          "4. No outstanding sanitation debt associated with property address or applicant",
          "5. Prepayment of dumpster delivery and removal fee of $150 per dumpster, plus first month's collection",
        ],
      },
      {
        title: "Change in Business Ownership",
        content: [
          "When there is a change in business ownership, the incoming owner must:",
          "- Complete a new commercial business application",
          "- Provide all required documentation listed above",
          "- Ensure all prior accounts are closed and settled",
        ],
      },
    ],
    additionalInfo: [
      "Ready to Apply? Visit our office or call for assistance!",
    ],
  },
  "com-payment-options": {
    title: "Commercial Garbage and Recycling Payment Options",
    description: "Choose from multiple convenient ways to pay your commercial sanitation bill.",
    icon: "credit-card",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [],
    contentSections: [
      {
        title: "Online Payments",
        content: [
          "Visit Myaccount.dekalbcountyga.gov",
          "Use the Quick Pay tab for express payment",
          "Email confirmation will be sent upon successful payment",
        ],
      },
      {
        title: "Telephone Payments",
        content: [
          "Call our automated payment line",
          "Have your account number ready",
          "Follow the prompts to complete payment",
        ],
      },
      {
        title: "In-Office Payments",
        content: [
          "Location: 3720 Leroy Scott Drive, Decatur, GA 30032",
          "Hours: Monday - Friday, 8 a.m. - 3:30 p.m.",
          "Cash, check, money order, and credit/debit cards accepted",
        ],
      },
    ],
    links: [
      { text: "Pay Online Now", url: "https://myaccount.dekalbcountyga.gov" },
    ],
  },
  "com-new-garbage": {
    title: "Establish New Garbage Service",
    description: "Set up new commercial garbage collection service for your business.",
    icon: "plus-square",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "2 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
      { id: "2", name: "4 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
      { id: "3", name: "6 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
      { id: "4", name: "8 Yard Dumpster", price: "Contact for pricing", schedule: "Weekly/Bi-weekly" },
    ],
  },
  "com-new-recycle": {
    title: "Establish New Recycle Service",
    description: "Set up new commercial recycling service for your business.",
    icon: "refresh-cw",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Commercial Recycling", price: "Contact for pricing", schedule: "Weekly" },
    ],
  },
  "com-front-load": {
    title: "Front Load Dumpster",
    description: "Front load dumpster service for commercial businesses.",
    icon: "box",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "2 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
      { id: "2", name: "4 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
      { id: "3", name: "6 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
      { id: "4", name: "8 Yard Front Load", price: "Contact for pricing", schedule: "Scheduled service" },
    ],
  },
  "com-special-collection": {
    title: "Commercial Bulk & Special Collection",
    description: "Please confirm your details and provide any additional information needed.",
    icon: "star",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    isBulkSpecialForm: true,
    options: [],
    contentSections: [
      {
        title: "Collection Process",
        content: [
          "Once items have been placed curbside, businesses must complete a bulky item or special collection request.",
          "Bulky items are included in the business's annual sanitation assessment fees, but special collection items incur a prepaid special collection fee (see pricing below).",
          "After a request has been submitted, an assessment will be completed, and businesses will be provided with further instructions for completing the process.",
          "For all requests, a copy of the completed special collection form (SCAF) will be left at the business location.",
        ],
      },
    ],
    bulkItems: {
      title: "Bulk Items (Included in Annual Fee)",
      items: [
        "Toilets",
        "Furniture",
        "Mattresses & box springs",
        "Household appliances (must be empty and all doors removed)",
      ],
    },
    specialCollectionItems: {
      title: "Special Collection Items (Prepaid Fee Required)",
      items: [
        "Commingled piles",
        "Landlord evictions",
        "Excess garbage bags",
        "Wood, metal fences, decking",
        "Improperly prepared yard trimmings",
        "Logs/limbs too large or greater than 3\" diameter",
        "Large volumes of garbage or yard trimmings",
        "Tree limbs cut by hired/professional contractors",
      ],
    },
    specialCollectionPricing: [
      { item: "General special collection pile", price: "$100 min / $225 per truckload" },
      { item: "Tree parts greater than 3\" diameter", price: "$200 min / $450 per truckload" },
      { item: "Commingled piles (tree parts & garbage)", price: "$200 min / $450 per truckload" },
    ],
    formFields: {
      itemsReady: { question: "Are all items at the curb ready for collection?", type: "yesno", required: true },
      itemCategory: { 
        question: "Choose Item Category", 
        type: "select", 
        required: true,
        options: [
          "Bulk Item - Toilets",
          "Bulk Item - Furniture",
          "Bulk Item - Mattresses & box springs",
          "Bulk Item - Household appliances",
          "Special Collection - Commingled piles",
          "Special Collection - Landlord evictions",
          "Special Collection - Excess garbage bags",
          "Special Collection - Wood/metal fences/decking",
          "Special Collection - Improperly prepared yard trimmings",
          "Special Collection - Large logs/limbs (>3\" diameter)",
          "Special Collection - Large volumes of garbage/yard trimmings",
          "Special Collection - Tree limbs (professional contractor)",
        ],
      },
      details: { question: "Details", type: "text", placeholder: "Please describe the issue or request in detail...", required: false },
      photo: { question: "Photo of Items at Curb", type: "photo", required: true, note: "Take a photo showing all items placed at the curb for collection" },
    },
  },
  "com-hand-pick": {
    title: "Commercial Hand-Pick Up",
    description: "Hand-pick up service for commercial businesses with specific collection needs.",
    icon: "clipboard",
    color: BrandColors.green,
    gradientColors: FuturisticGradients.commercial,
    options: [
      { id: "1", name: "Hand-Pick Up Service", price: "Contact for pricing", schedule: "Scheduled service" },
    ],
  },
};

function InteractiveFormQuestion({
  question,
  value,
  onChange,
  color,
  index,
}: {
  question: FormQuestion;
  value: string;
  onChange: (val: string) => void;
  color: string;
  index: number;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleOptionPress = (option: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSequence(withSpring(0.97), withSpring(1));
    onChange(option);
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(200 + index * 80).duration(400).springify()}
      style={[
        styles.formCard,
        { backgroundColor: theme.backgroundSecondary, borderColor: color + "40" },
      ]}
    >
      <View style={styles.formQuestionHeader}>
        <LinearGradient
          colors={[color, color + "CC"]}
          style={styles.formQuestionIcon}
        >
          <Feather name="help-circle" size={18} color="#FFFFFF" />
        </LinearGradient>
        <ThemedText type="body" style={styles.formQuestionText}>
          {question.question}
        </ThemedText>
      </View>

      {question.type === "yesno" ? (
        <View style={styles.yesNoContainer}>
          <AnimatedPressable
            onPress={() => handleOptionPress("Yes")}
            style={[
              styles.yesNoButton,
              animatedStyle,
              {
                backgroundColor: value === "Yes" ? "#00E676" : theme.backgroundDefault,
                borderColor: value === "Yes" ? "#00E676" : theme.cardBorder,
                ...(value === "Yes" ? GlowEffects.neonGreen : {}),
              },
            ]}
          >
            <Feather
              name="check-circle"
              size={22}
              color={value === "Yes" ? "#FFFFFF" : theme.textSecondary}
            />
            <ThemedText
              type="body"
              style={{
                marginLeft: Spacing.sm,
                color: value === "Yes" ? "#FFFFFF" : theme.text,
                fontWeight: value === "Yes" ? "600" : "400",
              }}
            >
              Yes
            </ThemedText>
          </AnimatedPressable>

          <AnimatedPressable
            onPress={() => handleOptionPress("No")}
            style={[
              styles.yesNoButton,
              animatedStyle,
              {
                backgroundColor: value === "No" ? "#FF5252" : theme.backgroundDefault,
                borderColor: value === "No" ? "#FF5252" : theme.cardBorder,
                shadowColor: "#FF5252",
                shadowOpacity: value === "No" ? 0.4 : 0,
                shadowRadius: 12,
                elevation: value === "No" ? 6 : 0,
              },
            ]}
          >
            <Feather
              name="x-circle"
              size={22}
              color={value === "No" ? "#FFFFFF" : theme.textSecondary}
            />
            <ThemedText
              type="body"
              style={{
                marginLeft: Spacing.sm,
                color: value === "No" ? "#FFFFFF" : theme.text,
                fontWeight: value === "No" ? "600" : "400",
              }}
            >
              No
            </ThemedText>
          </AnimatedPressable>
        </View>
      ) : question.type === "select" && question.options ? (
        <View style={styles.selectContainer}>
          {question.options.map((option, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleOptionPress(option)}
              style={[
                styles.selectOption,
                {
                  backgroundColor: value === option ? color : theme.backgroundDefault,
                  borderColor: value === option ? color : theme.cardBorder,
                  shadowColor: color,
                  shadowOpacity: value === option ? 0.3 : 0,
                  shadowRadius: 10,
                  elevation: value === option ? 4 : 0,
                },
              ]}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: value === option ? "#FFFFFF" : theme.textSecondary },
                ]}
              >
                {value === option ? <View style={styles.radioInner} /> : null}
              </View>
              <ThemedText
                type="body"
                style={{
                  marginLeft: Spacing.sm,
                  color: value === option ? "#FFFFFF" : theme.text,
                  flex: 1,
                }}
              >
                {option}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      ) : (
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: value ? color : theme.cardBorder,
              color: theme.text,
            },
          ]}
          placeholder={question.placeholder || "Enter your answer..."}
          placeholderTextColor={theme.textSecondary}
          value={value}
          onChangeText={onChange}
          multiline={question.type === "text"}
          numberOfLines={question.type === "text" ? 2 : 1}
        />
      )}
    </Animated.View>
  );
}

function ServiceReminder({ color }: { color: string }) {
  const { theme } = useTheme();
  const [reminderIndex, setReminderIndex] = useState(Math.floor(Math.random() * ServiceReminders.length));
  const sparkle = useSharedValue(1);

  useEffect(() => {
    sparkle.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkle.value }],
  }));

  return (
    <Animated.View
      entering={FadeInUp.delay(100).duration(500)}
      style={[styles.reminderCard, { backgroundColor: color + "15", borderColor: color + "40" }]}
    >
      <Animated.View style={sparkleStyle}>
        <Feather name="heart" size={20} color={color} />
      </Animated.View>
      <ThemedText type="small" style={[styles.reminderText, { color: theme.text }]}>
        {ServiceReminders[reminderIndex]}
      </ThemedText>
      <Animated.View style={sparkleStyle}>
        <Feather name="star" size={16} color="#FFD600" />
      </Animated.View>
    </Animated.View>
  );
}

function OptionCard({ 
  option, 
  color, 
  index, 
  gradientColors, 
  isSelected, 
  onSelect 
}: { 
  option: ServiceOption; 
  color: string; 
  index: number; 
  gradientColors: string[];
  isSelected?: boolean;
  onSelect?: (option: ServiceOption) => void;
}) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const glowIntensity = useSharedValue(0.2);

  useEffect(() => {
    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1500 }),
        withTiming(0.2, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <Animated.View entering={ZoomIn.delay(200 + index * 60).duration(400).springify()}>
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[
          styles.optionCard,
          animatedStyle,
          glowStyle,
          { 
            backgroundColor: isSelected ? color + "20" : theme.backgroundSecondary, 
            borderColor: isSelected ? color : color + "40", 
            borderWidth: isSelected ? 2.5 : 1.5,
            shadowColor: color,
          },
        ]}
      >
        <View style={styles.optionHeader}>
          <View style={{ width: 28, marginRight: Spacing.sm }}>
            <View
              style={[
                styles.radioOuter,
                { borderColor: isSelected ? color : theme.textSecondary },
              ]}
            >
              {isSelected ? <View style={[styles.radioInner, { backgroundColor: color }]} /> : null}
            </View>
          </View>
          <View style={styles.optionInfo}>
            <ThemedText type="h4" style={{ flex: 1 }}>{option.name}</ThemedText>
            <LinearGradient
              colors={gradientColors as [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.priceTag}
            >
              <ThemedText type="h4" style={styles.priceText}>
                {option.price}
              </ThemedText>
            </LinearGradient>
          </View>
        </View>
        {option.size ? (
          <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.sm, marginLeft: 36 }}>
            {option.size}
          </ThemedText>
        ) : null}
        {option.schedule ? (
          <View style={[styles.scheduleRow, { marginLeft: 36 }]}>
            <Feather name="calendar" size={16} color={color} />
            <ThemedText type="small" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
              {option.schedule}
            </ThemedText>
          </View>
        ) : null}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function ServiceDetailScreen() {
  const route = useRoute<ServiceDetailRouteProp>();
  const navigation = useNavigation<StackNavigationProp<any>>();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const { serviceId } = route.params;
  const service = serviceDetails[serviceId] || {
    title: "Service",
    description: "Service details coming soon.",
    icon: "info" as keyof typeof Feather.glyphMap,
    color: BrandColors.blue,
    gradientColors: FuturisticGradients.residential,
    options: [],
  };

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const [showAdditionalCartForm, setShowAdditionalCartForm] = useState(false);
  const [additionalCartStep, setAdditionalCartStep] = useState(1);
  const [additionalCartReason, setAdditionalCartReason] = useState("");
  const [additionalCartLocation, setAdditionalCartLocation] = useState("");
  const [additionalCartDescription, setAdditionalCartDescription] = useState("");
  const [additionalCartPhoto, setAdditionalCartPhoto] = useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  
  const [showRollOffForm, setShowRollOffForm] = useState(false);
  const [rollOffStep, setRollOffStep] = useState(1);
  const [rollOffAddress, setRollOffAddress] = useState("");
  const [rollOffAddressLine2, setRollOffAddressLine2] = useState("");
  const [rollOffCity, setRollOffCity] = useState("");
  const [rollOffZip, setRollOffZip] = useState("");
  const [rollOffDeliveryDate, setRollOffDeliveryDate] = useState("");
  const [rollOffDetails, setRollOffDetails] = useState("");
  const [rollOffPaymentComplete, setRollOffPaymentComplete] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  // New Service Form State
  const [newServiceResidentName, setNewServiceResidentName] = useState("");
  const [newServiceAddress, setNewServiceAddress] = useState("");
  const [newServicePhone, setNewServicePhone] = useState("");
  const [newServiceEmail, setNewServiceEmail] = useState("");
  const [newServiceSpecialInstructions, setNewServiceSpecialInstructions] = useState("");
  const [newServiceHomePurchaseDate, setNewServiceHomePurchaseDate] = useState("");
  const [newServicePropertyType, setNewServicePropertyType] = useState("");
  const [newServiceRecyclingOption, setNewServiceRecyclingOption] = useState("");
  const [showPropertyTypeDropdown, setShowPropertyTypeDropdown] = useState(false);
  const [newServiceStep, setNewServiceStep] = useState(1);

  // Bulk & Special Collection Form State
  const [bulkItemsReady, setBulkItemsReady] = useState<string | null>(null);
  const [bulkItemCategory, setBulkItemCategory] = useState("");
  const [bulkDetails, setBulkDetails] = useState("");
  const [bulkPhoto, setBulkPhoto] = useState<string | null>(null);
  const [bulkServiceLocation, setBulkServiceLocation] = useState("");
  const [showBulkCategoryDropdown, setShowBulkCategoryDropdown] = useState(false);
  const [showBulkLocationDropdown, setShowBulkLocationDropdown] = useState(false);

  interface SavedAddress {
    id: string;
    street: string;
    aptSuite?: string;
    city: string;
    zipCode: string;
    isDefault?: boolean;
  }

  const { data: savedAddresses } = useQuery<SavedAddress[]>({
    queryKey: ["/api/addresses"],
  });

  const selectSavedAddress = (address: SavedAddress) => {
    setRollOffAddress(address.street);
    setRollOffAddressLine2(address.aptSuite || "");
    setRollOffCity(address.city);
    setRollOffZip(address.zipCode);
    setShowAddressPicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateFormValue = (questionIndex: number, value: string) => {
    setFormValues((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const isFormService = service.formQuestions && service.formQuestions.length > 0;
  const hasContentSections = service.contentSections && service.contentSections.length > 0;

  const parsePrice = (priceStr: string): number => {
    const match = priceStr.match(/\$?([\d,]+(?:\.\d{2})?)/);
    if (match) {
      return parseFloat(match[1].replace(",", ""));
    }
    return 0;
  };

  const handleSubmit = async (option?: ServiceOption) => {
    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const formData = {
        serviceId,
        serviceTitle: service.title,
        selectedOption: option?.name || null,
        formAnswers: service.formQuestions?.map((q, idx) => ({
          question: q.question,
          answer: formValues[idx] || "",
        })) || [],
        submittedAt: new Date().toISOString(),
      };

      const amount = option ? parsePrice(option.price) : 0;

      const response = await apiRequest("POST", "/api/service-requests", {
        serviceType: serviceId.startsWith("com-") ? "commercial" : "residential",
        serviceId,
        formData,
        amount: amount > 0 ? Math.round(amount * 100) : null,
      });

      const result = await response.json();

      if (serviceId.includes("roll-cart")) {
        if (Platform.OS === 'web') {
          const viewRequests = window.confirm(
            `Request Submitted Successfully!\n\nYour ${service.title} request has been submitted.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nYou will receive a confirmation email shortly. We will be in touch via phone or email with further instructions and updates.\n\nDelivery Timeline: 1-10 business days\n\nClick OK to view your requests.`
          );
          if (viewRequests) {
            navigation.navigate("MyRequests");
          }
        } else {
          Alert.alert(
            "Request Submitted Successfully!",
            `Your ${service.title} request has been submitted.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nYou will receive a confirmation email shortly. We will be in touch via phone or email with further instructions and updates.\n\nDelivery Timeline: 1-10 business days`,
            [
              { text: "OK", style: "cancel" },
              { text: "View My Requests", onPress: () => navigation.navigate("MyRequests") }
            ]
          );
        }
      } else if (amount > 0) {
        showAlert(
          "Request Submitted",
          `Your ${service.title} request has been submitted. Total: ${option?.price}.\n\nYou will receive payment instructions via email, or you can pay online at myaccount.dekalbcountyga.gov`,
          [{ text: "OK", style: "default" }]
        );
      } else if (serviceId.includes("missed")) {
        showAlert(
          "We've Received Your Request!",
          `We have received your request and it's on the way to the correct lot for missed collection!\n\nWe're truly sorry you were missed! Our team will address this within 24-48 hours.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nFor future pickups, please ensure your cart is at the curb by 6:00 AM.`,
          [{ text: "Thank You!", style: "default" }]
        );
      } else {
        showAlert(
          "Request Submitted Successfully!",
          `Your ${service.title} request has been received. Our team will process it within 24-48 hours.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}`,
          [{ text: "Great!", style: "default" }]
        );
      }

      setFormValues({});
      setSelectedOption(null);
    } catch (error) {
      console.error("Submit error:", error);
      showAlert(
        "Submission Error",
        "We couldn't submit your request. Please try again or contact us at (404) 294-2900.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionSelect = (option: ServiceOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOption(option);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 1200);
    
    if (serviceId.includes("roll-cart")) {
      setShowAdditionalCartForm(true);
      setAdditionalCartStep(1);
    } else if (serviceId.includes("roll-off")) {
      setShowRollOffForm(true);
      setRollOffStep(1);
    }
  };

  const resetRollOffForm = () => {
    setShowRollOffForm(false);
    setRollOffStep(1);
    setRollOffAddress("");
    setRollOffAddressLine2("");
    setRollOffCity("");
    setRollOffZip("");
    setRollOffDeliveryDate("");
    setRollOffDetails("");
    setRollOffPaymentComplete(false);
    setSelectedOption(null);
  };

  const getMinDeliveryDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 3);
    return today.toISOString().split("T")[0];
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  };

  const handleRollOffPayment = async () => {
    if (!selectedOption) return;
    
    const price = parsePrice(selectedOption.price);
    if (price <= 0) {
      showAlert("Price Error", "Unable to process payment. Please contact us at (404) 294-2900.");
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        amount: price,
        serviceId,
        serviceType: serviceId.startsWith("com-") ? "commercial" : "residential",
      });

      const data = await response.json();
      
      if (data.clientSecret) {
        await apiRequest("POST", "/api/service-requests", {
          serviceType: serviceId.startsWith("com-") ? "commercial" : "residential",
          serviceId,
          formData: {
            selectedOption: selectedOption.name,
            deliveryAddress: `${rollOffAddress}${rollOffAddressLine2 ? ", " + rollOffAddressLine2 : ""}, ${rollOffCity}, GA ${rollOffZip}`,
            requestedDeliveryDate: rollOffDeliveryDate,
            additionalDetails: rollOffDetails,
          },
          amount: price,
        });

        await apiRequest("POST", "/api/confirm-payment", {
          paymentIntentId: data.paymentIntentId,
        });

        setRollOffPaymentComplete(true);
        setRollOffStep(4);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      console.error("Payment error:", error);
      showAlert("Payment Error", "We couldn't process your payment. Please try again or call (404) 294-2900.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAdditionalCartPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleChooseFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setAdditionalCartPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAdditionalCartSubmit = () => {
    if (!additionalCartReason) {
      showAlert("Selection Required", "Please select a reason for needing an additional cart.");
      return;
    }
    if (!additionalCartPhoto) {
      showAlert("Photo Required", "Please upload a photo of your roll cart to submit this request.");
      return;
    }
    
    setFormValues({
      0: additionalCartReason,
      1: additionalCartLocation || "Default",
      2: additionalCartDescription,
      3: "Photo attached",
    });
    
    handleSubmit(selectedOption || undefined);
    
    setShowAdditionalCartForm(false);
    setAdditionalCartStep(1);
    setAdditionalCartReason("");
    setAdditionalCartLocation("");
    setAdditionalCartDescription("");
    setAdditionalCartPhoto(null);
  };

  const resetAdditionalCartForm = () => {
    setShowAdditionalCartForm(false);
    setAdditionalCartStep(1);
    setAdditionalCartReason("");
    setAdditionalCartLocation("");
    setAdditionalCartDescription("");
    setAdditionalCartPhoto(null);
    setSelectedOption(null);
  };

  const handleNewServiceSubmit = async () => {
    if (!newServiceResidentName || !newServiceAddress || !newServicePhone || !newServiceEmail) {
      showAlert("Required Fields", "Please fill in all required fields (Name, Address, Phone, Email).");
      return;
    }
    if (!newServiceHomePurchaseDate) {
      showAlert("Required Field", "Please enter your home purchase date.");
      return;
    }
    if (!newServicePropertyType) {
      showAlert("Required Field", "Please select your property type.");
      return;
    }

    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const formData = {
        serviceId: "res-new-service",
        serviceTitle: "Establish New Residential Garbage & Recycling Service",
        formAnswers: [
          { question: "Resident's Name", answer: newServiceResidentName },
          { question: "Service Address", answer: newServiceAddress },
          { question: "Phone", answer: newServicePhone },
          { question: "Email", answer: newServiceEmail },
          { question: "Special Delivery Instructions", answer: newServiceSpecialInstructions || "None" },
          { question: "Home Purchase Date", answer: newServiceHomePurchaseDate },
          { question: "Property Type", answer: newServicePropertyType },
          { question: "Recycling Option", answer: newServiceRecyclingOption || "Complimentary 45-gallon roll cart" },
        ],
        submittedAt: new Date().toISOString(),
      };

      const response = await apiRequest("POST", "/api/service-requests", {
        serviceType: "residential",
        serviceId: "res-new-service",
        formData,
        amount: newServiceRecyclingOption === "recycle65" ? 2500 : null,
      });

      const result = await response.json();

      if (Platform.OS === 'web') {
        window.alert(
          `Application Submitted Successfully!\n\nYour new residential garbage & recycling service application has been received.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nYou will receive a confirmation email shortly. Our team will review your application and contact you via phone or email within 3-5 business days to schedule your service setup.\n\nRequired Documents:\nPlease have your proof of home ownership (closing statement and government-issued ID) ready for verification.`
        );
      } else {
        Alert.alert(
          "Application Submitted Successfully!",
          `Your new residential garbage & recycling service application has been received.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nYou will receive a confirmation email shortly. Our team will review your application and contact you via phone or email within 3-5 business days.\n\nPlease have your proof of home ownership ready for verification.`,
          [
            { text: "OK", style: "default" },
            { text: "View My Requests", onPress: () => navigation.navigate("MyRequests") }
          ]
        );
      }

      // Reset form
      setNewServiceResidentName("");
      setNewServiceAddress("");
      setNewServicePhone("");
      setNewServiceEmail("");
      setNewServiceSpecialInstructions("");
      setNewServiceHomePurchaseDate("");
      setNewServicePropertyType("");
      setNewServiceRecyclingOption("");
      setNewServiceStep(1);
    } catch (error) {
      console.error("Submit error:", error);
      showAlert(
        "Submission Error",
        "We couldn't submit your application. Please try again or contact us at (404) 294-2900.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setBulkPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBulkChooseFile = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setBulkPhoto(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleBulkSpecialSubmit = async () => {
    if (bulkItemsReady === null) {
      showAlert("Required Field", "Please indicate if all items are at the curb ready for collection.");
      return;
    }
    if (!bulkItemCategory) {
      showAlert("Required Field", "Please select an item category.");
      return;
    }
    if (!bulkServiceLocation) {
      showAlert("Required Field", "Please select a service location.");
      return;
    }
    if (!bulkPhoto) {
      showAlert("Photo Required", "Please upload a photo of items at the curb. This is required for all bulk and special collection requests.");
      return;
    }

    setIsSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      const isSpecialCollection = bulkItemCategory.includes("Special Collection");
      const formData = {
        serviceId,
        serviceTitle: service.title,
        formAnswers: [
          { question: "Are all items at the curb ready for collection?", answer: bulkItemsReady },
          { question: "Item Category", answer: bulkItemCategory },
          { question: "Service Location", answer: bulkServiceLocation },
          { question: "Details", answer: bulkDetails || "None provided" },
          { question: "Photo", answer: "Photo attached" },
        ],
        submittedAt: new Date().toISOString(),
      };

      const response = await apiRequest("POST", "/api/service-requests", {
        serviceType: serviceId.startsWith("com-") ? "commercial" : "residential",
        serviceId,
        formData,
        amount: isSpecialCollection ? null : null,
      });

      const result = await response.json();

      if (Platform.OS === 'web') {
        window.alert(
          `Request Submitted Successfully!\n\nYour ${isSpecialCollection ? "special collection" : "bulk item"} request has been received.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nAn assessment will be completed, and you will be provided with further instructions for completing the process. A copy of the completed special collection form (SCAF) will be left at your ${serviceId.startsWith("com-") ? "business location" : "home"}.\n\n${isSpecialCollection ? "Note: Special collection items require prepaid fees. You will receive pricing details after assessment." : "Bulk items are included in your annual sanitation assessment fee."}`
        );
      } else {
        Alert.alert(
          "Request Submitted Successfully!",
          `Your ${isSpecialCollection ? "special collection" : "bulk item"} request has been received.\n\nReference ID: ${result.request?.id?.slice(0, 8) || "Pending"}\n\nAn assessment will be completed, and you will be provided with further instructions.\n\n${isSpecialCollection ? "Note: Special collection items require prepaid fees." : "Bulk items are included in your annual sanitation assessment fee."}`,
          [
            { text: "OK", style: "default" },
            { text: "View My Requests", onPress: () => navigation.navigate("MyRequests") }
          ]
        );
      }

      // Reset form
      setBulkItemsReady(null);
      setBulkItemCategory("");
      setBulkDetails("");
      setBulkPhoto(null);
      setBulkServiceLocation("");
    } catch (error) {
      console.error("Submit error:", error);
      showAlert(
        "Submission Error",
        "We couldn't submit your request. Please try again or contact us at (404) 294-2900.",
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOptionSubmit = () => {
    if (!selectedOption) {
      showAlert("Please Select an Option", "Choose a service option before submitting.");
      return;
    }
    
    if (serviceId.includes("roll-cart")) {
      if (Platform.OS === 'web') {
        const confirmed = window.confirm(
          "Important Notice\n\n" +
          "Before submitting your roll cart request, please review the Annual Sanitation Assessment Fee Chart.\n\n" +
          "Prices vary based on cart type and service level.\n\n" +
          "For more information, visit:\nhttps://www.dekalbcountyga.gov/sanitation/garbage-roll-cart-application\n\n" +
          "Click OK to continue with your request."
        );
        if (confirmed) {
          handleSubmit(selectedOption);
        }
      } else {
        Alert.alert(
          "Important Notice",
          "Before submitting your roll cart request, please review the Annual Sanitation Assessment Fee Chart.\n\nPrices vary based on cart type and service level.\n\nFor more information, visit:\nwww.dekalbcountyga.gov/sanitation/garbage-roll-cart-application",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Continue", onPress: () => handleSubmit(selectedOption) },
          ]
        );
      }
      return;
    }
    
    handleSubmit(selectedOption);
  };

  return (
    <ThemedView style={styles.container}>
      <SelectionCelebration visible={showCelebration} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={ZoomIn.delay(100).duration(500).springify()}>
          <LinearGradient
            colors={service.gradientColors as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={styles.iconGlow}>
              <Feather name={service.icon} size={44} color="#FFFFFF" />
            </View>
            <ThemedText type="h2" style={styles.serviceTitle}>
              {service.title}
            </ThemedText>
            <ThemedText type="body" style={styles.serviceDescription}>
              {service.description}
            </ThemedText>
          </LinearGradient>
        </Animated.View>

        <ServiceReminder color={service.color} />

        {showAdditionalCartForm && selectedOption ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={[styles.additionalCartHeader, { backgroundColor: service.color + "15", borderColor: service.color }]}>
              <View style={[styles.additionalCartIcon, { backgroundColor: service.color + "20" }]}>
                <Feather name="arrow-up-circle" size={24} color={service.color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4" style={{ color: "#1a1a1a" }}>
                  {selectedOption.name} - {selectedOption.price}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  Your request will be processed within <ThemedText type="small" style={{ fontWeight: "700" }}>1-10 business days</ThemedText> after payment is processed. Payment will be collected after you submit this request.
                </ThemedText>
              </View>
            </View>

            {additionalCartStep === 1 ? (
              <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                <ThemedText type="h3" style={[styles.sectionTitle, { color: service.color }]}>
                  {selectedOption.name.toLowerCase().includes("damaged") 
                    ? "What happened to your roll cart?"
                    : selectedOption.name.toLowerCase().includes("stolen")
                    ? "Tell us about your stolen cart"
                    : selectedOption.name.toLowerCase().includes("return")
                    ? "Why are you returning your cart?"
                    : "Why do you need this cart service?"}
                </ThemedText>
                <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Please select the option that best describes your situation
                </ThemedText>

                {(selectedOption.name.toLowerCase().includes("damaged") 
                  ? CART_ISSUE_REASONS 
                  : selectedOption.name.toLowerCase().includes("stolen")
                  ? CART_STOLEN_DETAILS
                  : selectedOption.name.toLowerCase().includes("return")
                  ? CART_RETURN_REASONS
                  : ADDITIONAL_CART_REASONS).map((reason, index) => (
                  <Pressable
                    key={index}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setAdditionalCartReason(reason);
                      setAdditionalCartStep(2);
                    }}
                    style={[
                      styles.reasonOption,
                      additionalCartReason === reason && { borderColor: service.color, backgroundColor: service.color + "10" }
                    ]}
                  >
                    <ThemedText type="body" style={{ color: "#1a1a1a" }}>{reason}</ThemedText>
                    {additionalCartReason === reason ? (
                      <Feather name="check-circle" size={20} color={service.color} />
                    ) : null}
                  </Pressable>
                ))}
              </Animated.View>
            ) : additionalCartStep === 2 ? (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <ThemedText type="h4" style={styles.formLabel}>
                  <Feather name="map-pin" size={16} color={service.color} /> Service Address
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                  Select the address where this cart is located
                </ThemedText>
                
                {savedAddresses && savedAddresses.length > 0 ? (
                  <>
                    <Pressable
                      onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                      style={[styles.locationDropdown, { borderColor: service.color }]}
                    >
                      <Feather name="map-pin" size={18} color={service.color} />
                      <ThemedText type="body" style={{ color: additionalCartLocation ? "#1a1a1a" : theme.textSecondary, flex: 1, marginLeft: Spacing.sm }}>
                        {additionalCartLocation || "Select your saved address..."}
                      </ThemedText>
                      <Feather name={showLocationDropdown ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
                    </Pressable>

                    {showLocationDropdown ? (
                      <View style={styles.dropdownList}>
                        {savedAddresses.map((addr) => (
                          <Pressable
                            key={addr.id}
                            onPress={() => {
                              const fullAddr = `${addr.street}${addr.aptSuite ? `, ${addr.aptSuite}` : ""}, ${addr.city}, GA ${addr.zipCode}`;
                              setAdditionalCartLocation(fullAddr);
                              setShowLocationDropdown(false);
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            style={[
                              styles.dropdownItem,
                              additionalCartLocation?.includes(addr.street) && { backgroundColor: service.color + "15" }
                            ]}
                          >
                            <Feather name="map-pin" size={16} color={service.color} />
                            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                              <ThemedText type="body" style={{ fontWeight: "600" }}>
                                {addr.street}{addr.aptSuite ? `, ${addr.aptSuite}` : ""}
                              </ThemedText>
                              <ThemedText type="small" style={{ color: theme.textSecondary }}>
                                {addr.city}, GA {addr.zipCode}
                              </ThemedText>
                            </View>
                            {addr.isDefault ? (
                              <View style={[styles.defaultBadge, { backgroundColor: service.color }]}>
                                <ThemedText type="caption" style={{ color: "#FFF", fontWeight: "600" }}>Default</ThemedText>
                              </View>
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </>
                ) : (
                  <View style={[styles.infoBox, { backgroundColor: "#FFF3E0", borderColor: "#FF9800" }]}>
                    <Feather name="alert-circle" size={20} color="#FF9800" />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <ThemedText type="body" style={{ fontWeight: "600", color: "#E65100" }}>No Saved Addresses</ThemedText>
                      <ThemedText type="small" style={{ color: "#795548", marginTop: Spacing.xs }}>
                        Please add an address in "My Addresses" from the menu before submitting a cart request.
                      </ThemedText>
                    </View>
                  </View>
                )}

                <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                  Please describe the issue or request in detail...
                </ThemedText>
                <TextInput
                  style={[styles.descriptionInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  placeholder="Enter additional details here..."
                  placeholderTextColor={theme.textSecondary}
                  value={additionalCartDescription}
                  onChangeText={setAdditionalCartDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <Pressable
                  onPress={() => setAdditionalCartStep(3)}
                  style={{ marginTop: Spacing.lg }}
                >
                  <LinearGradient
                    colors={service.gradientColors || [service.color, service.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    <ThemedText type="h4" style={styles.submitText}>Continue</ThemedText>
                    <Feather name="arrow-right" size={20} color="#FFFFFF" style={{ marginLeft: Spacing.sm }} />
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setAdditionalCartStep(1)} style={styles.backButton}>
                  <Feather name="arrow-left" size={18} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>Back</ThemedText>
                </Pressable>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <View style={[styles.photoRequiredBox, { backgroundColor: "#E3F2FD", borderColor: BrandColors.blue }]}>
                  <Feather name="camera" size={24} color={BrandColors.blue} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <ThemedText type="h4" style={{ color: BrandColors.blue }}>Photo Required</ThemedText>
                    <ThemedText type="small" style={{ color: "#1565C0", marginTop: Spacing.xs }}>
                      Please upload a photo of your roll cart. This helps us process your request faster.
                    </ThemedText>
                  </View>
                </View>

                <ThemedText type="body" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                  Photo of Roll Cart <ThemedText type="body" style={{ color: "#F44336" }}>*</ThemedText>
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                  Take a clear photo showing the current condition of your cart
                </ThemedText>

                {additionalCartPhoto ? (
                  <View style={styles.photoPreview}>
                    <Image source={{ uri: additionalCartPhoto }} style={styles.previewImage} />
                    <Pressable
                      onPress={() => setAdditionalCartPhoto(null)}
                      style={styles.removePhotoButton}
                    >
                      <Feather name="x" size={18} color="#FFFFFF" />
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.photoButtons}>
                    <Pressable onPress={handleTakePhoto} style={styles.photoButton}>
                      <Feather name="camera" size={20} color={theme.textSecondary} />
                      <ThemedText type="body" style={{ color: theme.text, marginLeft: Spacing.sm }}>Take Photo</ThemedText>
                    </Pressable>
                    <Pressable onPress={handleChooseFile} style={styles.photoButton}>
                      <Feather name="upload" size={20} color={theme.textSecondary} />
                      <ThemedText type="body" style={{ color: theme.text, marginLeft: Spacing.sm }}>Choose File</ThemedText>
                    </Pressable>
                  </View>
                )}

                {!additionalCartPhoto ? (
                  <ThemedText type="small" style={{ color: "#F44336", marginTop: Spacing.sm }}>
                    A photo is required to submit this request
                  </ThemedText>
                ) : null}

                <Pressable
                  onPress={handleAdditionalCartSubmit}
                  disabled={isSubmitting}
                  style={{ marginTop: Spacing.xl }}
                >
                  <LinearGradient
                    colors={service.gradientColors || [service.color, service.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <ThemedText type="h4" style={styles.submitText}>Submit Request</ThemedText>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setAdditionalCartStep(2)} style={styles.backButton}>
                  <Feather name="arrow-left" size={18} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>Back</ThemedText>
                </Pressable>

                <Pressable onPress={resetAdditionalCartForm} style={[styles.backButton, { marginTop: Spacing.sm }]}>
                  <Feather name="x" size={18} color="#F44336" />
                  <ThemedText type="body" style={{ color: "#F44336", marginLeft: Spacing.xs }}>Cancel Request</ThemedText>
                </Pressable>
              </Animated.View>
            )}
          </Animated.View>
        ) : showRollOffForm && selectedOption ? (
          <Animated.View entering={FadeInDown.delay(100).duration(400)}>
            <View style={[styles.additionalCartHeader, { backgroundColor: service.color + "15", borderColor: service.color }]}>
              <View style={[styles.additionalCartIcon, { backgroundColor: service.color + "20" }]}>
                <Feather name="truck" size={24} color={service.color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4" style={{ color: "#1a1a1a" }}>
                  {selectedOption.name} - {selectedOption.price}
                </ThemedText>
                <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                  2-week rental period. Container will be delivered to your specified address.
                </ThemedText>
              </View>
            </View>

            <View style={styles.stepIndicator}>
              {[1, 2, 3, 4].map((step) => (
                <View key={step} style={styles.stepRow}>
                  <View style={[
                    styles.stepCircle,
                    { 
                      backgroundColor: rollOffStep >= step ? service.color : theme.border,
                      borderColor: rollOffStep >= step ? service.color : theme.border 
                    }
                  ]}>
                    {rollOffStep > step ? (
                      <Feather name="check" size={14} color="#FFF" />
                    ) : (
                      <ThemedText type="small" style={{ color: rollOffStep >= step ? "#FFF" : theme.textSecondary }}>{step}</ThemedText>
                    )}
                  </View>
                  {step < 4 ? <View style={[styles.stepLine, { backgroundColor: rollOffStep > step ? service.color : theme.border }]} /> : null}
                </View>
              ))}
            </View>
            <View style={styles.stepLabels}>
              <ThemedText type="caption" style={{ color: rollOffStep >= 1 ? service.color : theme.textSecondary }}>Address</ThemedText>
              <ThemedText type="caption" style={{ color: rollOffStep >= 2 ? service.color : theme.textSecondary }}>Date</ThemedText>
              <ThemedText type="caption" style={{ color: rollOffStep >= 3 ? service.color : theme.textSecondary }}>Payment</ThemedText>
              <ThemedText type="caption" style={{ color: rollOffStep >= 4 ? service.color : theme.textSecondary }}>Done</ThemedText>
            </View>

            {rollOffStep === 1 ? (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <ThemedText type="h3" style={[styles.sectionTitle, { color: service.color }]}>
                  Delivery Address
                </ThemedText>
                <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Where should we deliver the roll off container?
                </ThemedText>

                {savedAddresses && savedAddresses.length > 0 ? (
                  <View style={{ marginTop: Spacing.md, marginBottom: Spacing.md }}>
                    <Pressable
                      onPress={() => setShowAddressPicker(!showAddressPicker)}
                      style={[styles.savedAddressToggle, { 
                        backgroundColor: theme.surface, 
                        borderColor: service.color,
                        borderWidth: 2,
                      }]}
                    >
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Feather name="map-pin" size={20} color={service.color} />
                        <ThemedText type="body" style={{ color: service.color, marginLeft: Spacing.sm, fontWeight: "600" }}>
                          Select from Saved Addresses ({savedAddresses.length})
                        </ThemedText>
                      </View>
                      <Feather name={showAddressPicker ? "chevron-up" : "chevron-down"} size={20} color={service.color} />
                    </Pressable>
                    
                    {showAddressPicker ? (
                      <Animated.View entering={FadeInDown.duration(200)} style={{ marginTop: Spacing.sm }}>
                        {savedAddresses.map((addr) => (
                          <Pressable
                            key={addr.id}
                            onPress={() => selectSavedAddress(addr)}
                            style={[styles.savedAddressItem, { 
                              backgroundColor: theme.surface, 
                              borderColor: theme.border,
                            }]}
                          >
                            <View style={{ flex: 1 }}>
                              <ThemedText type="body" style={{ fontWeight: "600" }}>
                                {addr.street}{addr.aptSuite ? `, ${addr.aptSuite}` : ""}
                              </ThemedText>
                              <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: 2 }}>
                                {addr.city}, GA {addr.zipCode}
                              </ThemedText>
                            </View>
                            {addr.isDefault ? (
                              <View style={[styles.defaultBadge, { backgroundColor: service.color }]}>
                                <ThemedText type="caption" style={{ color: "#FFF", fontWeight: "600" }}>Default</ThemedText>
                              </View>
                            ) : null}
                          </Pressable>
                        ))}
                      </Animated.View>
                    ) : null}
                    
                    <View style={styles.orDivider}>
                      <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                      <ThemedText type="small" style={{ color: theme.textSecondary, marginHorizontal: Spacing.md }}>OR</ThemedText>
                      <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
                    </View>
                  </View>
                ) : null}

                <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                  Street Address *
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  placeholder="123 Main Street"
                  placeholderTextColor={theme.textSecondary}
                  value={rollOffAddress}
                  onChangeText={setRollOffAddress}
                  autoCapitalize="words"
                />

                <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                  Apt/Suite/Unit (optional)
                </ThemedText>
                <TextInput
                  style={[styles.textInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  placeholder="Apt 4B"
                  placeholderTextColor={theme.textSecondary}
                  value={rollOffAddressLine2}
                  onChangeText={setRollOffAddressLine2}
                />

                <View style={{ flexDirection: "row", gap: Spacing.md }}>
                  <View style={{ flex: 2 }}>
                    <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                      City *
                    </ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                      placeholder="Decatur"
                      placeholderTextColor={theme.textSecondary}
                      value={rollOffCity}
                      onChangeText={setRollOffCity}
                      autoCapitalize="words"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                      ZIP *
                    </ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                      placeholder="30030"
                      placeholderTextColor={theme.textSecondary}
                      value={rollOffZip}
                      onChangeText={setRollOffZip}
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    if (!rollOffAddress || !rollOffCity || !rollOffZip) {
                      showAlert("Required Fields", "Please fill in all required address fields.");
                      return;
                    }
                    setRollOffStep(2);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{ marginTop: Spacing.xl }}
                >
                  <LinearGradient
                    colors={service.gradientColors || [service.color, service.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    <ThemedText type="h4" style={styles.submitText}>Continue to Delivery Date</ThemedText>
                    <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: Spacing.sm }} />
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={resetRollOffForm} style={[styles.backButton, { marginTop: Spacing.md }]}>
                  <Feather name="x" size={18} color="#F44336" />
                  <ThemedText type="body" style={{ color: "#F44336", marginLeft: Spacing.xs }}>Cancel Request</ThemedText>
                </Pressable>
              </Animated.View>
            ) : rollOffStep === 2 ? (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <ThemedText type="h3" style={[styles.sectionTitle, { color: service.color }]}>
                  Requested Delivery Date
                </ThemedText>
                <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Select your preferred delivery date (minimum 3 business days from today)
                </ThemedText>

                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.datePickerButton, { backgroundColor: theme.surface, borderColor: service.color }]}
                >
                  <Feather name="calendar" size={22} color={service.color} />
                  <ThemedText type="body" style={{ marginLeft: Spacing.md, flex: 1, color: rollOffDeliveryDate ? theme.text : theme.textSecondary }}>
                    {rollOffDeliveryDate ? formatDate(rollOffDeliveryDate) : "Select delivery date"}
                  </ThemedText>
                  <Feather name="chevron-down" size={20} color={theme.textSecondary} />
                </Pressable>

                {showDatePicker ? (
                  <View style={[styles.dateInputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor={theme.textSecondary}
                      value={rollOffDeliveryDate}
                      onChangeText={(text) => {
                        setRollOffDeliveryDate(text);
                        if (text.length === 10) {
                          setShowDatePicker(false);
                        }
                      }}
                      keyboardType="numbers-and-punctuation"
                      maxLength={10}
                    />
                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                      Enter date as YYYY-MM-DD (e.g., 2026-01-25)
                    </ThemedText>
                  </View>
                ) : null}

                <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                  Additional Details (optional)
                </ThemedText>
                <TextInput
                  style={[styles.descriptionInput, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.text }]}
                  placeholder="Gate codes, placement instructions, access notes..."
                  placeholderTextColor={theme.textSecondary}
                  value={rollOffDetails}
                  onChangeText={setRollOffDetails}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={[styles.infoBox, { backgroundColor: service.color + "10", borderColor: service.color }]}>
                  <Feather name="info" size={18} color={service.color} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <ThemedText type="body" style={{ fontWeight: "600", color: "#1a1a1a" }}>2-Week Rental Period</ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                      The roll off fee is applied once the container has been serviced by the driver and returned to the Sanitation Division.
                    </ThemedText>
                  </View>
                </View>

                <Pressable
                  onPress={() => {
                    if (!rollOffDeliveryDate) {
                      showAlert("Required Field", "Please select a delivery date.");
                      return;
                    }
                    setRollOffStep(3);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={{ marginTop: Spacing.lg }}
                >
                  <LinearGradient
                    colors={service.gradientColors || [service.color, service.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    <ThemedText type="h4" style={styles.submitText}>Continue to Payment</ThemedText>
                    <Feather name="credit-card" size={20} color="#FFF" style={{ marginLeft: Spacing.sm }} />
                  </LinearGradient>
                </Pressable>

                <Pressable onPress={() => setRollOffStep(1)} style={styles.backButton}>
                  <Feather name="arrow-left" size={18} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>Back</ThemedText>
                </Pressable>
              </Animated.View>
            ) : rollOffStep === 3 ? (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <ThemedText type="h3" style={[styles.sectionTitle, { color: service.color }]}>
                  Review & Payment
                </ThemedText>
                <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                  Review your order details and complete payment
                </ThemedText>

                <View style={[styles.reviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <View style={styles.reviewRow}>
                    <Feather name="package" size={18} color={service.color} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>Container</ThemedText>
                      <ThemedText type="body" style={{ fontWeight: "600" }}>{selectedOption.name}</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.reviewRow, { marginTop: Spacing.md }]}>
                    <Feather name="map-pin" size={18} color={service.color} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>Delivery Address</ThemedText>
                      <ThemedText type="body">{rollOffAddress}{rollOffAddressLine2 ? `, ${rollOffAddressLine2}` : ""}</ThemedText>
                      <ThemedText type="body">{rollOffCity}, GA {rollOffZip}</ThemedText>
                    </View>
                  </View>
                  <View style={[styles.reviewRow, { marginTop: Spacing.md }]}>
                    <Feather name="calendar" size={18} color={service.color} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <ThemedText type="caption" style={{ color: theme.textSecondary }}>Requested Delivery</ThemedText>
                      <ThemedText type="body">{formatDate(rollOffDeliveryDate)}</ThemedText>
                    </View>
                  </View>
                  {rollOffDetails ? (
                    <View style={[styles.reviewRow, { marginTop: Spacing.md }]}>
                      <Feather name="file-text" size={18} color={service.color} />
                      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                        <ThemedText type="caption" style={{ color: theme.textSecondary }}>Additional Details</ThemedText>
                        <ThemedText type="body">{rollOffDetails}</ThemedText>
                      </View>
                    </View>
                  ) : null}
                </View>

                <View style={[styles.totalCard, { backgroundColor: service.color + "15", borderColor: service.color }]}>
                  <ThemedText type="h4" style={{ color: "#1a1a1a" }}>Total Due</ThemedText>
                  <ThemedText type="h2" style={{ color: service.color }}>{selectedOption.price}</ThemedText>
                </View>

                <Pressable
                  onPress={handleRollOffPayment}
                  disabled={isSubmitting}
                  style={{ marginTop: Spacing.lg }}
                >
                  <LinearGradient
                    colors={["#4CAF50", "#2E7D32"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Feather name="lock" size={20} color="#FFF" />
                        <ThemedText type="h4" style={[styles.submitText, { marginLeft: Spacing.sm }]}>Pay {selectedOption.price} Securely</ThemedText>
                      </>
                    )}
                  </LinearGradient>
                </Pressable>

                <View style={styles.securityBadges}>
                  <Feather name="shield" size={16} color={theme.textSecondary} />
                  <ThemedText type="caption" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>
                    Secure payment powered by Stripe
                  </ThemedText>
                </View>

                <Pressable onPress={() => setRollOffStep(2)} style={styles.backButton}>
                  <Feather name="arrow-left" size={18} color={theme.textSecondary} />
                  <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>Back</ThemedText>
                </Pressable>
              </Animated.View>
            ) : rollOffStep === 4 ? (
              <Animated.View entering={FadeInDown.delay(100).duration(400)}>
                <View style={[styles.confirmationCard, { backgroundColor: "#E8F5E9", borderColor: "#4CAF50" }]}>
                  <View style={[styles.confirmationIcon, { backgroundColor: "#4CAF50" }]}>
                    <Feather name="check" size={40} color="#FFF" />
                  </View>
                  <ThemedText type="h2" style={{ color: "#2E7D32", textAlign: "center", marginTop: Spacing.lg }}>
                    Payment Successful!
                  </ThemedText>
                  <ThemedText type="body" style={{ color: "#1a1a1a", textAlign: "center", marginTop: Spacing.sm }}>
                    Your roll off container request has been received.
                  </ThemedText>
                </View>

                <View style={[styles.contactCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Feather name="mail" size={24} color={service.color} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <ThemedText type="h4" style={{ color: "#1a1a1a" }}>We'll Be In Touch!</ThemedText>
                    <ThemedText type="body" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                      Our team will contact you via <ThemedText type="body" style={{ fontWeight: "700" }}>email</ThemedText> or <ThemedText type="body" style={{ fontWeight: "700" }}>phone</ThemedText> to confirm your delivery date and provide any additional instructions.
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <ThemedText type="h4" style={{ color: "#1a1a1a", marginBottom: Spacing.md }}>Order Summary</ThemedText>
                  <View style={styles.summaryRow}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>Container:</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>{selectedOption.name}</ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>Amount Paid:</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600", color: "#4CAF50" }}>{selectedOption.price}</ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>Rental Period:</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600" }}>2 Weeks</ThemedText>
                  </View>
                  <View style={styles.summaryRow}>
                    <ThemedText type="body" style={{ color: theme.textSecondary }}>Delivery To:</ThemedText>
                    <ThemedText type="body" style={{ fontWeight: "600", flex: 1, textAlign: "right" }}>{rollOffCity}, GA</ThemedText>
                  </View>
                </View>

                <Pressable onPress={resetRollOffForm} style={{ marginTop: Spacing.xl }}>
                  <LinearGradient
                    colors={service.gradientColors || [service.color, service.color]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButton}
                  >
                    <Feather name="home" size={20} color="#FFF" />
                    <ThemedText type="h4" style={[styles.submitText, { marginLeft: Spacing.sm }]}>Back to Services</ThemedText>
                  </LinearGradient>
                </Pressable>
              </Animated.View>
            ) : null}
          </Animated.View>
        ) : isFormService ? (
          <>
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Complete Your Request
              </ThemedText>
              <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Please fill out all required fields below
              </ThemedText>
            </Animated.View>

            {service.formQuestions?.map((question, index) => (
              <InteractiveFormQuestion
                key={index}
                question={question}
                value={formValues[index] || ""}
                onChange={(val) => updateFormValue(index, val)}
                color={service.color}
                index={index}
              />
            ))}

            {service.additionalInfo ? (
              <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <View style={[styles.infoCard, { backgroundColor: service.color + "15", borderColor: service.color + "40" }]}>
                  <ThemedText type="h4" style={{ color: service.color, marginBottom: Spacing.md }}>
                    Additional Options
                  </ThemedText>
                  {service.additionalInfo.map((info, index) => (
                    <View key={index} style={styles.infoRow}>
                      <Feather name="check-circle" size={16} color={service.color} />
                      <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm }}>{info}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {serviceId.includes("missed") ? (
              <>
                <Animated.View entering={FadeInDown.delay(550).duration(400)}>
                  <View style={[styles.reasonsCard, { backgroundColor: "#FFF3E0", borderColor: "#FF9800" }]}>
                    <View style={styles.reasonsHeader}>
                      <Feather name="help-circle" size={24} color="#F57C00" />
                      <ThemedText type="h4" style={{ color: "#E65100", marginLeft: Spacing.sm, flex: 1 }}>
                        Want to know reasons why you could have been missed?
                      </ThemedText>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(600).duration(400)}>
                  <View style={styles.proceduresSection}>
                    <ThemedText type="h3" style={[styles.sectionTitle, { color: BrandColors.green }]}>
                      {COLLECTION_PROCEDURES.title}
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
                      1 of 2 - Roll Cart Curbside Procedures
                    </ThemedText>

                    {COLLECTION_PROCEDURES.curbsideProcedures.map((proc, index) => (
                      <View key={index} style={styles.procedureItem}>
                        <View style={[styles.procedureIcon, { backgroundColor: BrandColors.green + "20" }]}>
                          <Feather name={proc.icon} size={20} color={BrandColors.green} />
                        </View>
                        <ThemedText type="body" style={{ flex: 1, lineHeight: 22 }}>{proc.text}</ThemedText>
                      </View>
                    ))}

                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.md }}>
                      2 of 2 - Residential Collection Procedures
                    </ThemedText>

                    {COLLECTION_PROCEDURES.procedures.map((proc, index) => (
                      <View key={index} style={styles.procedureItem}>
                        <View style={[styles.procedureIcon, { backgroundColor: BrandColors.green + "20" }]}>
                          <Feather name={proc.icon} size={20} color={BrandColors.green} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="body" style={{ fontWeight: "700", color: BrandColors.green }}>
                            {proc.title}
                          </ThemedText>
                          <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20, marginTop: 2 }}>
                            {proc.text}
                          </ThemedText>
                        </View>
                      </View>
                    ))}

                    <View style={styles.websiteFooter}>
                      <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
                        www.dekalbsanitation.com • @DKalbSanitation on X
                      </ThemedText>
                    </View>
                  </View>
                </Animated.View>
              </>
            ) : null}

            <Animated.View entering={FadeInDown.delay(650).duration(400)}>
              <Pressable onPress={() => handleSubmit()} disabled={isSubmitting}>
                <LinearGradient
                  colors={service.gradientColors as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: Spacing.sm }} />
                  ) : (
                    <Feather name="send" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                  )}
                  <ThemedText type="h4" style={styles.submitText}>
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </>
        ) : null}

        {hasContentSections ? (
          <>
            {service.contentSections?.map((section, sectionIndex) => (
              <Animated.View
                key={sectionIndex}
                entering={FadeInDown.delay(200 + sectionIndex * 100).duration(400)}
              >
                <View style={[styles.contentSection, { backgroundColor: theme.backgroundSecondary, borderColor: service.color + "30" }]}>
                  <View style={styles.contentSectionHeader}>
                    <LinearGradient
                      colors={service.gradientColors as [string, string, ...string[]]}
                      style={styles.contentSectionIcon}
                    >
                      <Feather name="file-text" size={18} color="#FFFFFF" />
                    </LinearGradient>
                    <ThemedText type="h4" style={{ color: service.color, flex: 1 }}>
                      {section.title}
                    </ThemedText>
                  </View>
                  {section.content.map((item, itemIndex) => (
                    <View key={itemIndex} style={styles.contentItem}>
                      <ThemedText type="body" style={styles.contentText}>{item}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ))}

            {service.additionalInfo ? (
              <Animated.View entering={FadeInDown.delay(500).duration(400)}>
                <View style={[styles.infoCard, { backgroundColor: service.color + "15", borderColor: service.color + "40" }]}>
                  {service.additionalInfo.map((info, index) => (
                    <View key={index} style={styles.infoRow}>
                      <Feather name="info" size={16} color={service.color} />
                      <ThemedText type="body" style={{ flex: 1, marginLeft: Spacing.sm, fontWeight: "600" }}>{info}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            {/* New Service Application Form */}
            {service.isNewServiceForm ? (
              <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                <View style={[styles.newServiceFormContainer, { backgroundColor: theme.surface, borderColor: service.color + "40" }]}>
                  <View style={[styles.formHeader, { backgroundColor: service.color + "15" }]}>
                    <Feather name="file-plus" size={24} color={service.color} />
                    <ThemedText type="h3" style={{ color: service.color, marginLeft: Spacing.sm }}>
                      Application Form
                    </ThemedText>
                  </View>

                  {newServiceStep === 1 ? (
                    <View style={styles.formBody}>
                      <ThemedText type="h4" style={[styles.formSectionTitle, { color: service.color }]}>
                        Customer Information
                      </ThemedText>

                      <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                        Resident's Name <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                      </ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.background, borderColor: newServiceResidentName ? service.color : theme.border, color: theme.text }]}
                        placeholder="Enter your full name"
                        placeholderTextColor={theme.textSecondary}
                        value={newServiceResidentName}
                        onChangeText={setNewServiceResidentName}
                        autoCapitalize="words"
                      />

                      <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                        Service Address <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                      </ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.background, borderColor: newServiceAddress ? service.color : theme.border, color: theme.text }]}
                        placeholder="Enter your service address"
                        placeholderTextColor={theme.textSecondary}
                        value={newServiceAddress}
                        onChangeText={setNewServiceAddress}
                        autoCapitalize="words"
                      />

                      <View style={{ flexDirection: "row", gap: Spacing.md }}>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                            Phone <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                          </ThemedText>
                          <TextInput
                            style={[styles.textInput, { backgroundColor: theme.background, borderColor: newServicePhone ? service.color : theme.border, color: theme.text }]}
                            placeholder="(xxx) xxx-xxxx"
                            placeholderTextColor={theme.textSecondary}
                            value={newServicePhone}
                            onChangeText={setNewServicePhone}
                            keyboardType="phone-pad"
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                            Email <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                          </ThemedText>
                          <TextInput
                            style={[styles.textInput, { backgroundColor: theme.background, borderColor: newServiceEmail ? service.color : theme.border, color: theme.text }]}
                            placeholder="your@email.com"
                            placeholderTextColor={theme.textSecondary}
                            value={newServiceEmail}
                            onChangeText={setNewServiceEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                          />
                        </View>
                      </View>

                      <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                        Special Delivery Instructions (gate code, etc.)
                      </ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.background, borderColor: newServiceSpecialInstructions ? service.color : theme.border, color: theme.text }]}
                        placeholder="Optional: Enter gate code or special instructions"
                        placeholderTextColor={theme.textSecondary}
                        value={newServiceSpecialInstructions}
                        onChangeText={setNewServiceSpecialInstructions}
                      />

                      <Pressable
                        onPress={() => {
                          if (!newServiceResidentName || !newServiceAddress || !newServicePhone || !newServiceEmail) {
                            showAlert("Required Fields", "Please fill in all required fields.");
                            return;
                          }
                          setNewServiceStep(2);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={{ marginTop: Spacing.xl }}
                      >
                        <LinearGradient
                          colors={service.gradientColors as [string, string, ...string[]]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.submitButton}
                        >
                          <ThemedText type="h4" style={styles.submitText}>Continue</ThemedText>
                          <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: Spacing.sm }} />
                        </LinearGradient>
                      </Pressable>
                    </View>
                  ) : newServiceStep === 2 ? (
                    <View style={styles.formBody}>
                      <ThemedText type="h4" style={[styles.formSectionTitle, { color: service.color }]}>
                        Property Information
                      </ThemedText>

                      <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.md }]}>
                        Home Purchase Date <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                      </ThemedText>
                      <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.xs }}>
                        Proof of home ownership is required (closing statement and government-issued ID)
                      </ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.background, borderColor: newServiceHomePurchaseDate ? service.color : theme.border, color: theme.text }]}
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor={theme.textSecondary}
                        value={newServiceHomePurchaseDate}
                        onChangeText={setNewServiceHomePurchaseDate}
                      />

                      <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                        Type of Property <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                      </ThemedText>
                      <Pressable
                        onPress={() => setShowPropertyTypeDropdown(!showPropertyTypeDropdown)}
                        style={[styles.locationDropdown, { borderColor: newServicePropertyType ? service.color : theme.border }]}
                      >
                        <ThemedText type="body" style={{ color: newServicePropertyType ? theme.text : theme.textSecondary, flex: 1 }}>
                          {newServicePropertyType || "Select property type..."}
                        </ThemedText>
                        <Feather name={showPropertyTypeDropdown ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
                      </Pressable>

                      {showPropertyTypeDropdown ? (
                        <View style={styles.dropdownList}>
                          {["Owner", "Tenant", "Townhouse", "Single-family", "Triplex", "Condominium"].map((type) => (
                            <Pressable
                              key={type}
                              onPress={() => {
                                setNewServicePropertyType(type);
                                setShowPropertyTypeDropdown(false);
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }}
                              style={[
                                styles.dropdownItem,
                                newServicePropertyType === type && { backgroundColor: service.color + "15" }
                              ]}
                            >
                              <Feather name={newServicePropertyType === type ? "check-circle" : "circle"} size={18} color={service.color} />
                              <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>{type}</ThemedText>
                            </Pressable>
                          ))}
                        </View>
                      ) : null}

                      <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl }}>
                        <Pressable onPress={() => setNewServiceStep(1)} style={[styles.backButton, { flex: 1 }]}>
                          <Feather name="arrow-left" size={18} color={theme.textSecondary} />
                          <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>Back</ThemedText>
                        </Pressable>
                        <Pressable
                          onPress={() => {
                            if (!newServiceHomePurchaseDate || !newServicePropertyType) {
                              showAlert("Required Fields", "Please fill in all required fields.");
                              return;
                            }
                            setNewServiceStep(3);
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }}
                          style={{ flex: 2 }}
                        >
                          <LinearGradient
                            colors={service.gradientColors as [string, string, ...string[]]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitButton}
                          >
                            <ThemedText type="h4" style={styles.submitText}>Continue</ThemedText>
                            <Feather name="arrow-right" size={20} color="#FFF" style={{ marginLeft: Spacing.sm }} />
                          </LinearGradient>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.formBody}>
                      <ThemedText type="h4" style={[styles.formSectionTitle, { color: service.color }]}>
                        Service Options
                      </ThemedText>

                      <View style={[styles.infoBox, { backgroundColor: BrandColors.blue + "10", borderColor: BrandColors.blue, marginTop: Spacing.md }]}>
                        <Feather name="trash-2" size={20} color={BrandColors.blue} />
                        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                          <ThemedText type="body" style={{ fontWeight: "700", color: "#1a1a1a" }}>Garbage Roll Cart</ThemedText>
                          <ThemedText type="small" style={{ color: theme.textSecondary, marginTop: Spacing.xs }}>
                            95-gallon garbage roll cart provided to all new residential customers
                          </ThemedText>
                          <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.xs, fontStyle: "italic" }}>
                            Specialized service options may be available for residents with mobility or medical challenges. Requests are reviewed on a case-by-case basis.
                          </ThemedText>
                        </View>
                      </View>

                      <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                        Recycling Roll Cart Options (optional)
                      </ThemedText>
                      <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.sm }}>
                        This subscription-based service is offered to residents at no additional fee.
                      </ThemedText>

                      <Pressable
                        onPress={() => {
                          setNewServiceRecyclingOption("recycle45");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.reasonOption,
                          newServiceRecyclingOption === "recycle45" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "10" }
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <ThemedText type="body" style={{ color: "#1a1a1a", fontWeight: "600" }}>Complimentary 45-gallon roll cart</ThemedText>
                          <ThemedText type="small" style={{ color: BrandColors.green, marginTop: 2 }}>Free</ThemedText>
                        </View>
                        {newServiceRecyclingOption === "recycle45" ? (
                          <Feather name="check-circle" size={22} color={BrandColors.green} />
                        ) : (
                          <Feather name="circle" size={22} color={theme.border} />
                        )}
                      </Pressable>

                      <Pressable
                        onPress={() => {
                          setNewServiceRecyclingOption("recycle65");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.reasonOption,
                          newServiceRecyclingOption === "recycle65" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "10" }
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <ThemedText type="body" style={{ color: "#1a1a1a", fontWeight: "600" }}>Upgrade to a 65-gallon roll cart</ThemedText>
                          <ThemedText type="small" style={{ color: "#FF9800", marginTop: 2 }}>One-time $25 prepaid roll cart fee applies</ThemedText>
                        </View>
                        {newServiceRecyclingOption === "recycle65" ? (
                          <Feather name="check-circle" size={22} color={BrandColors.green} />
                        ) : (
                          <Feather name="circle" size={22} color={theme.border} />
                        )}
                      </Pressable>

                      {/* Prorated Fees Table */}
                      <View style={[styles.proratedFeesCard, { backgroundColor: theme.background, borderColor: service.color + "40", marginTop: Spacing.lg }]}>
                        <ThemedText type="h4" style={{ color: BrandColors.green, textAlign: "center", marginBottom: Spacing.xs }}>
                          Prorated Annual Sanitation Assessment Fees
                        </ThemedText>
                        <ThemedText type="caption" style={{ color: service.color, textAlign: "center", marginBottom: Spacing.md }}>
                          One Garbage Roll Cart and One Optional Recycling Roll Cart
                        </ThemedText>
                        <View style={styles.feesGrid}>
                          <View style={styles.feesColumn}>
                            <View style={styles.feeRow}><ThemedText type="small">January</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$315.00</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">February</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$288.75</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">March</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$262.50</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">April</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$236.25</ThemedText></View>
                          </View>
                          <View style={styles.feesColumn}>
                            <View style={styles.feeRow}><ThemedText type="small">May</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$210.00</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">June</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$183.75</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">July</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$157.50</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">August</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$131.25</ThemedText></View>
                          </View>
                          <View style={styles.feesColumn}>
                            <View style={styles.feeRow}><ThemedText type="small">September</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$105.00</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">October</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$78.75</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">November</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$52.50</ThemedText></View>
                            <View style={styles.feeRow}><ThemedText type="small">Dec 1-10</ThemedText><ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue }}>$26.25</ThemedText></View>
                          </View>
                        </View>
                        <View style={[styles.feeRow, { justifyContent: "center", marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: 1, borderTopColor: theme.border }]}>
                          <ThemedText type="small">December 11-31</ThemedText>
                          <ThemedText type="small" style={{ fontWeight: "700", color: BrandColors.blue, marginLeft: Spacing.md }}>$315.00</ThemedText>
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.xl }}>
                        <Pressable onPress={() => setNewServiceStep(2)} style={[styles.backButton, { flex: 1 }]}>
                          <Feather name="arrow-left" size={18} color={theme.textSecondary} />
                          <ThemedText type="body" style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}>Back</ThemedText>
                        </Pressable>
                        <Pressable
                          onPress={handleNewServiceSubmit}
                          disabled={isSubmitting}
                          style={{ flex: 2 }}
                        >
                          <LinearGradient
                            colors={["#4CAF50", "#2E7D32"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.submitButton}
                          >
                            {isSubmitting ? (
                              <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                              <>
                                <Feather name="send" size={20} color="#FFF" />
                                <ThemedText type="h4" style={[styles.submitText, { marginLeft: Spacing.sm }]}>Submit Application</ThemedText>
                              </>
                            )}
                          </LinearGradient>
                        </Pressable>
                      </View>
                    </View>
                  )}
                </View>
              </Animated.View>
            ) : null}

            {/* Bulk & Special Collection Form */}
            {service.isBulkSpecialForm ? (
              <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                {/* Bulk Items Section */}
                {service.bulkItems ? (
                  <View style={[styles.contentSection, { backgroundColor: "#E8F5E9", borderColor: BrandColors.green + "40", marginBottom: Spacing.md }]}>
                    <View style={styles.contentSectionHeader}>
                      <View style={[styles.contentSectionIcon, { backgroundColor: BrandColors.green }]}>
                        <Feather name="check-circle" size={18} color="#FFFFFF" />
                      </View>
                      <ThemedText type="h4" style={{ color: BrandColors.green, flex: 1 }}>
                        {service.bulkItems.title}
                      </ThemedText>
                    </View>
                    {service.bulkItems.items.map((item: string, idx: number) => (
                      <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.xs }}>
                        <ThemedText type="body" style={{ color: BrandColors.green, marginRight: Spacing.sm }}>•</ThemedText>
                        <ThemedText type="body" style={{ flex: 1 }}>{item}</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Special Collection Items Section */}
                {service.specialCollectionItems ? (
                  <View style={[styles.contentSection, { backgroundColor: "#FFF3E0", borderColor: "#FF9800" + "40", marginBottom: Spacing.md }]}>
                    <View style={styles.contentSectionHeader}>
                      <View style={[styles.contentSectionIcon, { backgroundColor: "#FF9800" }]}>
                        <Feather name="alert-triangle" size={18} color="#FFFFFF" />
                      </View>
                      <ThemedText type="h4" style={{ color: "#E65100", flex: 1 }}>
                        {service.specialCollectionItems.title}
                      </ThemedText>
                    </View>
                    {service.specialCollectionItems.items.map((item: string, idx: number) => (
                      <View key={idx} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: Spacing.xs }}>
                        <ThemedText type="body" style={{ color: "#FF9800", marginRight: Spacing.sm }}>•</ThemedText>
                        <ThemedText type="body" style={{ flex: 1 }}>{item}</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Special Collection Pricing */}
                {service.specialCollectionPricing ? (
                  <View style={[styles.contentSection, { backgroundColor: theme.surface, borderColor: service.color + "40", marginBottom: Spacing.lg }]}>
                    <View style={styles.contentSectionHeader}>
                      <View style={[styles.contentSectionIcon, { backgroundColor: service.color }]}>
                        <Feather name="dollar-sign" size={18} color="#FFFFFF" />
                      </View>
                      <ThemedText type="h4" style={{ color: service.color, flex: 1 }}>
                        Special Collection Pricing
                      </ThemedText>
                    </View>
                    {service.specialCollectionPricing.map((pricing: { item: string; price: string }, idx: number) => (
                      <View key={idx} style={[styles.pricingRow, { borderBottomColor: theme.border }]}>
                        <ThemedText type="body" style={{ flex: 1 }}>{pricing.item}</ThemedText>
                        <ThemedText type="body" style={{ fontWeight: "700", color: service.color }}>{pricing.price}</ThemedText>
                      </View>
                    ))}
                  </View>
                ) : null}

                {/* Request Form */}
                <View style={[styles.newServiceFormContainer, { backgroundColor: theme.surface, borderColor: service.color + "40" }]}>
                  <View style={[styles.formHeader, { backgroundColor: service.color + "15" }]}>
                    <Feather name="clipboard" size={24} color={service.color} />
                    <ThemedText type="h3" style={{ color: service.color, marginLeft: Spacing.sm }}>
                      Submit Request
                    </ThemedText>
                  </View>

                  <View style={styles.formBody}>
                    {/* Service Location */}
                    <ThemedText type="small" style={styles.formLabel}>
                      <Feather name="map-pin" size={14} color={service.color} /> Service Location <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                    </ThemedText>
                    {savedAddresses && savedAddresses.length > 0 ? (
                      <>
                        <Pressable
                          onPress={() => setShowBulkLocationDropdown(!showBulkLocationDropdown)}
                          style={[styles.locationDropdown, { borderColor: bulkServiceLocation ? service.color : theme.border }]}
                        >
                          <ThemedText type="body" style={{ color: bulkServiceLocation ? theme.text : theme.textSecondary, flex: 1 }}>
                            {bulkServiceLocation || "Select your address..."}
                          </ThemedText>
                          <Feather name={showBulkLocationDropdown ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
                        </Pressable>

                        {showBulkLocationDropdown ? (
                          <View style={styles.dropdownList}>
                            {savedAddresses.map((addr) => (
                              <Pressable
                                key={addr.id}
                                onPress={() => {
                                  const fullAddr = `${addr.street}${addr.aptSuite ? `, ${addr.aptSuite}` : ""}, ${addr.city}, GA ${addr.zipCode}`;
                                  setBulkServiceLocation(fullAddr);
                                  setShowBulkLocationDropdown(false);
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }}
                                style={[
                                  styles.dropdownItem,
                                  bulkServiceLocation?.includes(addr.street) && { backgroundColor: service.color + "15" }
                                ]}
                              >
                                <Feather name="map-pin" size={16} color={service.color} />
                                <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                                  <ThemedText type="body" style={{ fontWeight: "600" }}>
                                    {addr.street}{addr.aptSuite ? `, ${addr.aptSuite}` : ""}
                                  </ThemedText>
                                  <ThemedText type="small" style={{ color: theme.textSecondary }}>
                                    {addr.city}, GA {addr.zipCode}
                                  </ThemedText>
                                </View>
                                {addr.isDefault ? (
                                  <View style={[styles.defaultBadge, { backgroundColor: service.color }]}>
                                    <ThemedText type="caption" style={{ color: "#FFF", fontWeight: "600" }}>Default</ThemedText>
                                  </View>
                                ) : null}
                              </Pressable>
                            ))}
                          </View>
                        ) : null}

                        <Pressable 
                          onPress={() => navigation.navigate("MyAddresses")}
                          style={{ flexDirection: "row", alignItems: "center", marginTop: Spacing.sm }}
                        >
                          <Feather name="settings" size={14} color={service.color} />
                          <ThemedText type="small" style={{ color: service.color, marginLeft: Spacing.xs }}>
                            Manage my addresses
                          </ThemedText>
                        </Pressable>
                      </>
                    ) : (
                      <View style={[styles.infoBox, { backgroundColor: "#FFF3E0", borderColor: "#FF9800" }]}>
                        <Feather name="alert-circle" size={20} color="#FF9800" />
                        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                          <ThemedText type="body" style={{ fontWeight: "600", color: "#E65100" }}>No Saved Addresses</ThemedText>
                          <ThemedText type="small" style={{ color: "#795548", marginTop: Spacing.xs }}>
                            Please add an address in "My Addresses" from the menu first.
                          </ThemedText>
                        </View>
                      </View>
                    )}

                    {/* Items Ready Question */}
                    <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                      Are all items at the curb ready for collection? <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                    </ThemedText>
                    <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm }}>
                      <Pressable
                        onPress={() => {
                          setBulkItemsReady("Yes");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.yesNoButton,
                          bulkItemsReady === "Yes" && { borderColor: BrandColors.green, backgroundColor: BrandColors.green + "10" }
                        ]}
                      >
                        <View style={[styles.radioCircle, bulkItemsReady === "Yes" && { borderColor: BrandColors.green }]}>
                          {bulkItemsReady === "Yes" ? <View style={[styles.radioFill, { backgroundColor: BrandColors.green }]} /> : null}
                        </View>
                        <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>Yes</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setBulkItemsReady("No");
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[
                          styles.yesNoButton,
                          bulkItemsReady === "No" && { borderColor: "#F44336", backgroundColor: "#F44336" + "10" }
                        ]}
                      >
                        <View style={[styles.radioCircle, bulkItemsReady === "No" && { borderColor: "#F44336" }]}>
                          {bulkItemsReady === "No" ? <View style={[styles.radioFill, { backgroundColor: "#F44336" }]} /> : null}
                        </View>
                        <ThemedText type="body" style={{ marginLeft: Spacing.sm }}>No</ThemedText>
                      </Pressable>
                    </View>

                    {/* Item Category */}
                    <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                      Choose Item Category <ThemedText type="small" style={{ color: "#F44336" }}>*</ThemedText>
                    </ThemedText>
                    <Pressable
                      onPress={() => setShowBulkCategoryDropdown(!showBulkCategoryDropdown)}
                      style={[styles.locationDropdown, { borderColor: bulkItemCategory ? service.color : theme.border }]}
                    >
                      <ThemedText type="body" style={{ color: bulkItemCategory ? theme.text : theme.textSecondary, flex: 1 }}>
                        {bulkItemCategory || "Select a category..."}
                      </ThemedText>
                      <Feather name={showBulkCategoryDropdown ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
                    </Pressable>

                    {showBulkCategoryDropdown ? (
                      <View style={styles.dropdownList}>
                        {service.formFields?.itemCategory?.options?.map((category: string, idx: number) => (
                          <Pressable
                            key={idx}
                            onPress={() => {
                              setBulkItemCategory(category);
                              setShowBulkCategoryDropdown(false);
                              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            style={[
                              styles.dropdownItem,
                              bulkItemCategory === category && { backgroundColor: service.color + "15" }
                            ]}
                          >
                            <Feather 
                              name={category.includes("Bulk") ? "check-circle" : "alert-triangle"} 
                              size={16} 
                              color={category.includes("Bulk") ? BrandColors.green : "#FF9800"} 
                            />
                            <ThemedText type="body" style={{ marginLeft: Spacing.sm, flex: 1 }}>{category}</ThemedText>
                          </Pressable>
                        ))}
                      </View>
                    ) : null}

                    {/* Details */}
                    <ThemedText type="small" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                      Details
                    </ThemedText>
                    <TextInput
                      style={[styles.descriptionInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                      placeholder="Please describe the issue or request in detail..."
                      placeholderTextColor={theme.textSecondary}
                      value={bulkDetails}
                      onChangeText={setBulkDetails}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />

                    {/* Photo Required */}
                    <View style={[styles.photoRequiredBox, { backgroundColor: "#E3F2FD", borderColor: BrandColors.blue, marginTop: Spacing.lg }]}>
                      <Feather name="camera" size={24} color={BrandColors.blue} />
                      <View style={{ flex: 1, marginLeft: Spacing.md }}>
                        <ThemedText type="h4" style={{ color: BrandColors.blue }}>Photo Required</ThemedText>
                        <ThemedText type="small" style={{ color: "#1565C0", marginTop: Spacing.xs }}>
                          Please upload a photo of items at the curb. This is required for all bulk and special collection requests.
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText type="body" style={[styles.formLabel, { marginTop: Spacing.lg }]}>
                      Photo of Items at Curb <ThemedText type="body" style={{ color: "#F44336" }}>*</ThemedText>
                    </ThemedText>
                    <ThemedText type="small" style={{ color: theme.textSecondary, marginBottom: Spacing.md }}>
                      Take a photo showing all items placed at the curb for collection
                    </ThemedText>

                    {bulkPhoto ? (
                      <View style={styles.photoPreview}>
                        <Image source={{ uri: bulkPhoto }} style={styles.previewImage} />
                        <Pressable
                          onPress={() => setBulkPhoto(null)}
                          style={styles.removePhotoButton}
                        >
                          <Feather name="x" size={18} color="#FFFFFF" />
                        </Pressable>
                      </View>
                    ) : (
                      <View style={styles.photoButtons}>
                        <Pressable onPress={handleBulkTakePhoto} style={styles.photoButton}>
                          <Feather name="camera" size={20} color={theme.textSecondary} />
                          <ThemedText type="body" style={{ color: theme.text, marginLeft: Spacing.sm }}>Take Photo</ThemedText>
                        </Pressable>
                        <Pressable onPress={handleBulkChooseFile} style={styles.photoButton}>
                          <Feather name="upload" size={20} color={theme.textSecondary} />
                          <ThemedText type="body" style={{ color: theme.text, marginLeft: Spacing.sm }}>Choose File</ThemedText>
                        </Pressable>
                      </View>
                    )}

                    {!bulkPhoto ? (
                      <ThemedText type="small" style={{ color: "#F44336", marginTop: Spacing.sm }}>
                        A photo is required to submit this request
                      </ThemedText>
                    ) : null}

                    {/* Submit Button */}
                    <Pressable
                      onPress={handleBulkSpecialSubmit}
                      disabled={isSubmitting}
                      style={{ marginTop: Spacing.xl }}
                    >
                      <LinearGradient
                        colors={service.gradientColors as [string, string, ...string[]]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.submitButton}
                      >
                        {isSubmitting ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <Feather name="send" size={20} color="#FFF" />
                            <ThemedText type="h4" style={[styles.submitText, { marginLeft: Spacing.sm }]}>Submit Request</ThemedText>
                          </>
                        )}
                      </LinearGradient>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            ) : null}
          </>
        ) : null}

        {service.options.length > 0 ? (
          <>
            <Animated.View entering={FadeInDown.delay(150).duration(400)}>
              <ThemedText type="h3" style={styles.sectionTitle}>
                Pricing & Options
              </ThemedText>
              <ThemedText type="small" style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>
                Select an option to continue
              </ThemedText>
            </Animated.View>

            {service.options.map((option, index) => (
              <OptionCard
                key={option.id}
                option={option}
                color={service.color}
                index={index}
                gradientColors={service.gradientColors}
                isSelected={selectedOption?.id === option.id}
                onSelect={handleOptionSelect}
              />
            ))}

            {serviceId.includes("missed") ? (
              <>
                <Animated.View entering={FadeInDown.delay(400).duration(400)}>
                  <View style={[styles.reasonsCard, { backgroundColor: "#FFF3E0", borderColor: "#FF9800" }]}>
                    <View style={styles.reasonsHeader}>
                      <Feather name="help-circle" size={24} color="#F57C00" />
                      <ThemedText type="h4" style={{ color: "#E65100", marginLeft: Spacing.sm, flex: 1 }}>
                        Want to know reasons why you could have been missed?
                      </ThemedText>
                    </View>
                  </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(450).duration(400)}>
                  <View style={styles.proceduresSection}>
                    <ThemedText type="h3" style={[styles.sectionTitle, { color: BrandColors.green }]}>
                      {COLLECTION_PROCEDURES.title}
                    </ThemedText>
                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginBottom: Spacing.lg }}>
                      1 of 2 - Roll Cart Curbside Procedures
                    </ThemedText>

                    {COLLECTION_PROCEDURES.curbsideProcedures.map((proc, index) => (
                      <View key={index} style={styles.procedureItem}>
                        <View style={[styles.procedureIcon, { backgroundColor: BrandColors.green + "20" }]}>
                          <Feather name={proc.icon} size={20} color={BrandColors.green} />
                        </View>
                        <ThemedText type="body" style={{ flex: 1, lineHeight: 22 }}>{proc.text}</ThemedText>
                      </View>
                    ))}

                    <ThemedText type="caption" style={{ color: theme.textSecondary, marginTop: Spacing.lg, marginBottom: Spacing.md }}>
                      2 of 2 - Residential Collection Procedures
                    </ThemedText>

                    {COLLECTION_PROCEDURES.procedures.map((proc, index) => (
                      <View key={index} style={styles.procedureItem}>
                        <View style={[styles.procedureIcon, { backgroundColor: BrandColors.green + "20" }]}>
                          <Feather name={proc.icon} size={20} color={BrandColors.green} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText type="body" style={{ fontWeight: "700", color: BrandColors.green }}>
                            {proc.title}
                          </ThemedText>
                          <ThemedText type="small" style={{ color: theme.textSecondary, lineHeight: 20, marginTop: 2 }}>
                            {proc.text}
                          </ThemedText>
                        </View>
                      </View>
                    ))}

                    <View style={styles.websiteFooter}>
                      <ThemedText type="small" style={{ color: theme.textSecondary, textAlign: "center" }}>
                        www.dekalbsanitation.com • @DKalbSanitation on X
                      </ThemedText>
                    </View>
                  </View>
                </Animated.View>
              </>
            ) : null}

            {service.rollOffInfo ? (
              <Animated.View entering={FadeInDown.delay(450).duration(400)}>
                <View style={[styles.rollOffInfoCard, { backgroundColor: "#FFF8E1", borderColor: "#FF9800" }]}>
                  <View style={styles.rollOffInfoHeader}>
                    <Feather name="alert-triangle" size={22} color="#F57C00" />
                    <ThemedText type="h4" style={{ color: "#E65100", marginLeft: Spacing.sm, flex: 1 }}>
                      Important Information
                    </ThemedText>
                  </View>
                  {service.rollOffInfo.importantNotes.map((note, index) => (
                    <View key={index} style={styles.rollOffInfoItem}>
                      <View style={[styles.rollOffBullet, { backgroundColor: "#F57C00" }]} />
                      <ThemedText type="small" style={{ flex: 1, color: "#5D4037", lineHeight: 20 }}>
                        {note}
                      </ThemedText>
                    </View>
                  ))}
                </View>

                <View style={[styles.feeScheduleCard, { backgroundColor: service.color + "10", borderColor: service.color }]}>
                  <ThemedText type="h4" style={{ color: "#1a1a1a", marginBottom: Spacing.md }}>
                    2 Week Rental Fees
                  </ThemedText>
                  {service.rollOffInfo.feeSchedule.map((fee, index) => (
                    <View key={index} style={styles.feeRow}>
                      <ThemedText type="body" style={{ color: theme.textSecondary }}>{fee.size}</ThemedText>
                      <ThemedText type="body" style={{ fontWeight: "700", color: service.color }}>{fee.price}</ThemedText>
                    </View>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(500).duration(400)}>
              <Pressable 
                onPress={handleOptionSubmit}
                disabled={isSubmitting || !selectedOption}
                style={{ opacity: selectedOption ? 1 : 0.6 }}
              >
                <LinearGradient
                  colors={service.gradientColors as [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButton}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" style={{ marginRight: Spacing.sm }} />
                  ) : (
                    <Feather name="check-circle" size={22} color="#FFFFFF" style={{ marginRight: Spacing.sm }} />
                  )}
                  <ThemedText type="h4" style={styles.submitText}>
                    {isSubmitting ? "Submitting..." : selectedOption ? `Submit Request - ${selectedOption.price}` : "Select an Option"}
                  </ThemedText>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </>
        ) : null}

        {service.links && service.links.length > 0 ? (
          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <ThemedText type="h4" style={[styles.sectionTitle, { marginTop: Spacing.lg }]}>
              Quick Links
            </ThemedText>
            {service.links.map((link, index) => (
              <Pressable
                key={index}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                style={[styles.linkButton, { borderColor: service.color }]}
              >
                <LinearGradient
                  colors={service.gradientColors as [string, string, ...string[]]}
                  style={styles.linkIcon}
                >
                  <Feather name="external-link" size={16} color="#FFFFFF" />
                </LinearGradient>
                <ThemedText type="body" style={{ color: service.color, flex: 1 }}>{link.text}</ThemedText>
                <Feather name="chevron-right" size={20} color={service.color} />
              </Pressable>
            ))}
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <Pressable 
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              showAlert("Live Chat", "Connecting you to a live representative...\n\nPlease wait while we connect you to the next available agent.");
            }}
            style={styles.liveChatButton}
          >
            <View style={styles.liveChatIconContainer}>
              <Feather name="message-circle" size={28} color="#FFFFFF" />
              <View style={styles.liveChatBadge}>
                <View style={styles.liveChatDot} />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
                Chat with a Live Representative
              </ThemedText>
              <ThemedText type="caption" style={{ color: "rgba(255,255,255,0.8)", marginTop: 2 }}>
                Available Mon-Fri 8AM-5PM
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={24} color="#FFFFFF" />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerGradient: {
    borderRadius: BorderRadius["2xl"],
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  iconGlow: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
  },
  serviceTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  serviceDescription: {
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1.5,
    gap: Spacing.sm,
  },
  reminderText: {
    flex: 1,
    textAlign: "center",
    fontStyle: "italic",
  },
  sectionTitle: {
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    marginBottom: Spacing.lg,
  },
  formCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  formQuestionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  formQuestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  formQuestionText: {
    flex: 1,
    lineHeight: 24,
  },
  yesNoContainer: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  yesNoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  selectContainer: {
    gap: Spacing.sm,
  },
  selectOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
  },
  textInput: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    fontSize: 18,
    minHeight: 56,
  },
  infoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  reasonsCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 2,
  },
  reasonsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    paddingLeft: Spacing.xs,
  },
  reasonNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#F57C00",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  submitButton: {
    flexDirection: "row",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  submitText: {
    color: "#FFFFFF",
  },
  optionCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  optionInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  priceTag: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  priceText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  contentSection: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1.5,
  },
  contentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  contentSectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  contentItem: {
    marginBottom: Spacing.sm,
    paddingLeft: Spacing.sm,
  },
  contentText: {
    lineHeight: 24,
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  linkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contactButton: {
    flexDirection: "row",
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.xl,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xl,
  },
  contactText: {
    color: "#FFFFFF",
  },
  additionalCartHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    marginBottom: Spacing.lg,
  },
  additionalCartIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  reasonOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
    marginBottom: Spacing.sm,
  },
  formLabel: {
    marginBottom: Spacing.sm,
    fontWeight: "600",
  },
  locationDropdown: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: Spacing.xs,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  descriptionInput: {
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 100,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  photoRequiredBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
  photoButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  photoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderStyle: "dashed",
  },
  photoPreview: {
    position: "relative",
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.lg,
  },
  removePhotoButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  liveChatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#7C4DFF",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.xl,
  },
  liveChatIconContainer: {
    position: "relative",
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  liveChatBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#7C4DFF",
    alignItems: "center",
    justifyContent: "center",
  },
  liveChatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  proceduresSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  procedureItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  procedureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  websiteFooter: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  stepLine: {
    width: 40,
    height: 3,
    marginHorizontal: Spacing.xs,
  },
  stepLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  datePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    minHeight: 60,
  },
  dateInputContainer: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  reviewCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  totalCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    marginTop: Spacing.lg,
  },
  securityBadges: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  confirmationCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  confirmationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  rollOffInfoCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  rollOffInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  rollOffInfoItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  rollOffBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  feeScheduleCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  savedAddressToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  savedAddressItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  orDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  newServiceFormContainer: {
    borderRadius: BorderRadius.xl,
    borderWidth: 2,
    overflow: "hidden",
    marginTop: Spacing.lg,
  },
  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  formBody: {
    padding: Spacing.lg,
  },
  formSectionTitle: {
    marginBottom: Spacing.sm,
  },
  proratedFeesCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  feesGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  feesColumn: {
    flex: 1,
  },
  feeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  pricingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  yesNoButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    backgroundColor: "#FFFFFF",
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
  },
  radioFill: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
});
