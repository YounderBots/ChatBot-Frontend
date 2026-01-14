export const heatmapData = [
  // Sunday
  { day: "Sun", hour: 0, count: 2 },
  { day: "Sun", hour: 1, count: 1 },
  { day: "Sun", hour: 2, count: 0 },
  { day: "Sun", hour: 3, count: 0 },
  { day: "Sun", hour: 4, count: 1 },
  { day: "Sun", hour: 5, count: 2 },
  { day: "Sun", hour: 6, count: 4 },
  { day: "Sun", hour: 7, count: 6 },
  { day: "Sun", hour: 8, count: 10 },
  { day: "Sun", hour: 9, count: 14 },
  { day: "Sun", hour: 10, count: 18 },
  { day: "Sun", hour: 11, count: 20 },
  { day: "Sun", hour: 12, count: 22 },
  { day: "Sun", hour: 13, count: 19 },
  { day: "Sun", hour: 14, count: 16 },
  { day: "Sun", hour: 15, count: 14 },
  { day: "Sun", hour: 16, count: 12 },
  { day: "Sun", hour: 17, count: 10 },
  { day: "Sun", hour: 18, count: 9 },
  { day: "Sun", hour: 19, count: 8 },
  { day: "Sun", hour: 20, count: 7 },
  { day: "Sun", hour: 21, count: 6 },
  { day: "Sun", hour: 22, count: 4 },
  { day: "Sun", hour: 23, count: 3 },

  // Monday
  { day: "Mon", hour: 0, count: 3 },
  { day: "Mon", hour: 1, count: 1 },
  { day: "Mon", hour: 2, count: 0 },
  { day: "Mon", hour: 3, count: 0 },
  { day: "Mon", hour: 4, count: 1 },
  { day: "Mon", hour: 5, count: 3 },
  { day: "Mon", hour: 6, count: 6 },
  { day: "Mon", hour: 7, count: 12 },
  { day: "Mon", hour: 8, count: 22 },
  { day: "Mon", hour: 9, count: 30 },
  { day: "Mon", hour: 10, count: 38 },
  { day: "Mon", hour: 11, count: 42 },
  { day: "Mon", hour: 12, count: 45 },
  { day: "Mon", hour: 13, count: 40 },
  { day: "Mon", hour: 14, count: 36 },
  { day: "Mon", hour: 15, count: 32 },
  { day: "Mon", hour: 16, count: 30 },
  { day: "Mon", hour: 17, count: 28 },
  { day: "Mon", hour: 18, count: 24 },
  { day: "Mon", hour: 19, count: 20 },
  { day: "Mon", hour: 20, count: 16 },
  { day: "Mon", hour: 21, count: 12 },
  { day: "Mon", hour: 22, count: 8 },
  { day: "Mon", hour: 23, count: 5 },

  // Tuesday
  ...Array.from({ length: 24 }, (_, hour) => ({
    day: "Tue",
    hour,
    count:
      hour < 6
        ? 1
        : hour < 9
        ? 18
        : hour < 12
        ? 40
        : hour < 15
        ? 48
        : hour < 18
        ? 42
        : hour < 21
        ? 28
        : 10,
  })),

  // Wednesday
  ...Array.from({ length: 24 }, (_, hour) => ({
    day: "Wed",
    hour,
    count:
      hour < 6
        ? 2
        : hour < 9
        ? 20
        : hour < 12
        ? 45
        : hour < 15
        ? 55
        : hour < 18
        ? 48
        : hour < 21
        ? 32
        : 12,
  })),

  // Thursday
  ...Array.from({ length: 24 }, (_, hour) => ({
    day: "Thu",
    hour,
    count:
      hour < 6
        ? 2
        : hour < 9
        ? 22
        : hour < 12
        ? 48
        : hour < 15
        ? 60
        : hour < 18
        ? 52
        : hour < 21
        ? 36
        : 14,
  })),

  // Friday
  ...Array.from({ length: 24 }, (_, hour) => ({
    day: "Fri",
    hour,
    count:
      hour < 6
        ? 3
        : hour < 9
        ? 25
        : hour < 12
        ? 55
        : hour < 15
        ? 65
        : hour < 18
        ? 58
        : hour < 21
        ? 40
        : 20,
  })),

  // Saturday
  ...Array.from({ length: 24 }, (_, hour) => ({
    day: "Sat",
    hour,
    count:
      hour < 6
        ? 1
        : hour < 9
        ? 10
        : hour < 12
        ? 25
        : hour < 15
        ? 30
        : hour < 18
        ? 28
        : hour < 21
        ? 20
        : 8,
  })),
];
