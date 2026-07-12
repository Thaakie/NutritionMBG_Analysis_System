import akgShared from "../../../shared/akgProfiles.shared.json";

export const akgProfiles = akgShared.profiles;
export const mbgMealShare = akgShared.mbgMealShare;

export function getMealTarget(ageGroup) {
  const profile = akgProfiles[ageGroup];
  return Object.fromEntries(
    Object.entries(profile.dailyTarget).map(([key, value]) => [key, Number((value * mbgMealShare).toFixed(2))]),
  );
}
