export type PickupType = "trash" | "recycling" | "yardWaste";

export interface PickupSchedule {
  id: string;
  date: Date;
  type: PickupType;
  label: string;
}

export function getPickupTypeLabel(type: PickupType): string {
  switch (type) {
    case "trash":
      return "Trash Collection";
    case "recycling":
      return "Recycling";
    case "yardWaste":
      return "Yard Waste";
  }
}

export function getPickupTypeIcon(type: PickupType): string {
  switch (type) {
    case "trash":
      return "trash-2";
    case "recycling":
      return "refresh-cw";
    case "yardWaste":
      return "feather";
  }
}

export function getPickupTypeColor(type: PickupType, isDark: boolean): string {
  switch (type) {
    case "trash":
      return isDark ? "#757575" : "#424242";
    case "recycling":
      return isDark ? "#42A5F5" : "#1976D2";
    case "yardWaste":
      return isDark ? "#8BC34A" : "#689F38";
  }
}

function getNextDayOfWeek(dayOfWeek: number, weeksAhead: number = 0): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (dayOfWeek - today.getDay() + 7) % 7;
  const nextDay = new Date(today);
  nextDay.setDate(today.getDate() + diff + weeksAhead * 7);
  if (diff === 0 && weeksAhead === 0) {
    return nextDay;
  }
  return nextDay;
}

export function generateUpcomingPickups(): PickupSchedule[] {
  const pickups: PickupSchedule[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let week = 0; week < 4; week++) {
    const tuesday = getNextDayOfWeek(2, week);
    if (tuesday >= today) {
      pickups.push({
        id: `trash-${week}`,
        date: new Date(tuesday),
        type: "trash",
        label: getPickupTypeLabel("trash"),
      });
    }

    if (week % 2 === 0) {
      const wednesday = getNextDayOfWeek(3, week);
      if (wednesday >= today) {
        pickups.push({
          id: `recycling-${week}`,
          date: new Date(wednesday),
          type: "recycling",
          label: getPickupTypeLabel("recycling"),
        });
      }
    }

    if (week % 4 === 0) {
      const thursday = getNextDayOfWeek(4, week);
      if (thursday >= today) {
        pickups.push({
          id: `yardWaste-${week}`,
          date: new Date(thursday),
          type: "yardWaste",
          label: getPickupTypeLabel("yardWaste"),
        });
      }
    }
  }

  return pickups.sort((a, b) => a.date.getTime() - b.date.getTime());
}

export function getNextPickup(): PickupSchedule | null {
  const pickups = generateUpcomingPickups();
  return pickups.length > 0 ? pickups[0] : null;
}

export function formatPickupDate(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) {
    return "Today";
  }
  if (dateOnly.getTime() === tomorrow.getTime()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function getDaysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
