import akgShared from "./akgProfiles.shared.json";

export const akgProfiles = akgShared.profiles;
export const mbgMealShare = akgShared.mbgMealShare;

export function getMealTarget(ageGroup) {
  const profile = akgProfiles[ageGroup];

  return {
    calories: Number((profile.dailyTarget.calories * mbgMealShare).toFixed(2)),
    protein: Number((profile.dailyTarget.protein * mbgMealShare).toFixed(2)),
    fat: Number((profile.dailyTarget.fat * mbgMealShare).toFixed(2)),
    carbs: Number((profile.dailyTarget.carbs * mbgMealShare).toFixed(2)),
  };
}
