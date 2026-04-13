export const akgProfiles = {
  "7-9": {
    label: "Usia 7-9 tahun",
    dailyTarget: {
      calories: 1650,
      protein: 40,
      fat: 55,
      carbs: 250,
    },
  },
  "10-12": {
    label: "Usia 10-12 tahun",
    dailyTarget: {
      calories: 2000,
      protein: 50,
      fat: 65,
      carbs: 300,
    },
  },
  "13-15": {
    label: "Usia 13-15 tahun",
    dailyTarget: {
      calories: 2400,
      protein: 70,
      fat: 80,
      carbs: 350,
    },
  },
  "16-18": {
    label: "Usia 16-18 tahun",
    dailyTarget: {
      calories: 2650,
      protein: 75,
      fat: 85,
      carbs: 400,
    },
  },
};

export const mbgMealShare = 0.3;

export function getMealTarget(ageGroup) {
  const profile = akgProfiles[ageGroup];

  return {
    calories: Number((profile.dailyTarget.calories * mbgMealShare).toFixed(2)),
    protein: Number((profile.dailyTarget.protein * mbgMealShare).toFixed(2)),
    fat: Number((profile.dailyTarget.fat * mbgMealShare).toFixed(2)),
    carbs: Number((profile.dailyTarget.carbs * mbgMealShare).toFixed(2)),
  };
}
