const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function parseISODate(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatStartDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  const weekday = WEEKDAY_SHORT[date.getDay()];
  const day = date.getDate();
  const month = MONTH_SHORT[date.getMonth()];

  return `${weekday}, ${day} ${month}`;
}

export function formatRenewalDate(isoDate: string): string {
  return formatStartDate(isoDate);
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function isoDateToDate(isoDate: string): Date {
  return parseISODate(isoDate);
}

export function resolveQuickDate(label: string, now: Date = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (label) {
    case "Today":
      break;
    case "Tomorrow":
      date.setDate(date.getDate() + 1);
      break;
    case "Friday": {
      const day = date.getDay();
      const daysUntilFriday = (5 - day + 7) % 7;
      date.setDate(date.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
      break;
    }
    case "Next week":
      date.setDate(date.getDate() + 7);
      break;
    default:
      break;
  }

  return toISODate(date);
}
