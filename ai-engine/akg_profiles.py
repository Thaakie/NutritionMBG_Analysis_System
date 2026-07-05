import json
from pathlib import Path


def _load_akg_shared_data():
    shared_file = (
        Path(__file__).resolve().parent.parent
        / "shared"
        / "akgProfiles.shared.json"
    )
    with shared_file.open("r", encoding="utf-8") as file:
        return json.load(file)


_AKG_SHARED_DATA = _load_akg_shared_data()
AKG_PROFILES = _AKG_SHARED_DATA["profiles"]
MBG_MEAL_SHARE = _AKG_SHARED_DATA["mbgMealShare"]
AKG_SOURCE = _AKG_SHARED_DATA.get("source", "Permenkes No. 28 Tahun 2019")


def get_akg_profile(age_group):
    profile = AKG_PROFILES[age_group]
    meal_target = {
        key: round(value * MBG_MEAL_SHARE, 2)
        for key, value in profile["dailyTarget"].items()
    }

    return {
        "age_group": age_group,
        "label": profile["label"],
        "daily_target": profile["dailyTarget"],
        "meal_target": meal_target,
        "source": AKG_SOURCE,
    }
