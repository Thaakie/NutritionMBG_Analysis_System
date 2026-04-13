AKG_PROFILES = {
    "7-9": {
        "label": "Usia 7-9 tahun",
        "daily_target": {
            "calories": 1650,
            "protein": 40,
            "fat": 55,
            "carbs": 250,
        },
    },
    "10-12": {
        "label": "Usia 10-12 tahun",
        "daily_target": {
            "calories": 2000,
            "protein": 50,
            "fat": 65,
            "carbs": 300,
        },
    },
    "13-15": {
        "label": "Usia 13-15 tahun",
        "daily_target": {
            "calories": 2400,
            "protein": 70,
            "fat": 80,
            "carbs": 350,
        },
    },
    "16-18": {
        "label": "Usia 16-18 tahun",
        "daily_target": {
            "calories": 2650,
            "protein": 75,
            "fat": 85,
            "carbs": 400,
        },
    },
}

MBG_MEAL_SHARE = 0.3


def get_akg_profile(age_group):
    profile = AKG_PROFILES[age_group]
    meal_target = {
        key: round(value * MBG_MEAL_SHARE, 2)
        for key, value in profile["daily_target"].items()
    }

    return {
        "age_group": age_group,
        "label": profile["label"],
        "daily_target": profile["daily_target"],
        "meal_target": meal_target,
        "source": "Prototype reference aligned to Permenkes No. 28 Tahun 2019",
    }
