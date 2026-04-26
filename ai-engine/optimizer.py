from pulp import (
    LpBinary,
    LpMaximize,
    LpProblem,
    LpStatus,
    LpVariable,
    PULP_CBC_CMD,
    lpSum,
    value,
)

from akg_profiles import get_akg_profile

CORE_MENU_CATEGORIES = ("Makanan Pokok", "Lauk Pauk", "Sayuran")
CATEGORY_SCORE_BONUS = {
    "Buah-buahan": 4,
    "Susu & Produk Susu": 4,
    "Sayuran": 2.5,
}


def calculate_totals(foods):
    return {
        "total_protein": round(sum(food["protein"] for food in foods), 2),
        "total_calories": round(sum(food["calories"] for food in foods), 2),
        "total_fat": round(sum(food["fat"] for food in foods), 2),
        "total_carbs": round(sum(food["carbs"] for food in foods), 2),
        "total_cost": round(sum(food["price"] for food in foods), 2),
    }


def calculate_akg_percentages(totals, nutrition_reference):
    meal_target = nutrition_reference["meal_target"]
    return {
        "calories": round((totals["total_calories"] / meal_target["calories"]) * 100, 2)
        if meal_target["calories"]
        else 0,
        "protein": round((totals["total_protein"] / meal_target["protein"]) * 100, 2)
        if meal_target["protein"]
        else 0,
        "fat": round((totals["total_fat"] / meal_target["fat"]) * 100, 2)
        if meal_target["fat"]
        else 0,
        "carbs": round((totals["total_carbs"] / meal_target["carbs"]) * 100, 2)
        if meal_target["carbs"]
        else 0,
    }


def classify_feasibility(totals, akg_percentages, budget):
    within_budget = totals["total_cost"] <= budget
    calories_ok = akg_percentages["calories"] >= 100
    protein_ok = akg_percentages["protein"] >= 100
    support_macros_ok = akg_percentages["fat"] >= 80 and akg_percentages["carbs"] >= 80

    if within_budget and calories_ok and protein_ok and support_macros_ok:
        return "Layak"

    if within_budget and akg_percentages["calories"] >= 80 and akg_percentages["protein"] >= 80:
        return "Perlu optimasi"

    return "Tidak layak"


def normalize_category(food):
    return food.get("category", "Lainnya")


def calculate_food_score(food):
    return round(
        (food["protein"] * 5)
        + (food["calories"] * 0.03)
        + (food["fat"] * 0.7)
        + (food["carbs"] * 0.04)
        - (food["price"] * 0.001)
        + CATEGORY_SCORE_BONUS.get(normalize_category(food), 0),
        2,
    )


def extract_selected_categories(foods):
    return sorted({normalize_category(food) for food in foods})


def build_alternative_result(selected_foods, nutrition_reference, budget, rank):
    totals = calculate_totals(selected_foods)
    akg_percentages = calculate_akg_percentages(totals, nutrition_reference)
    feasibility_status = classify_feasibility(totals, akg_percentages, budget)

    nutrition_score = round(sum(calculate_food_score(food) for food in selected_foods), 2)

    return {
        "rank": rank,
        "recommended_menu": [food["name"] for food in selected_foods],
        "selected_categories": extract_selected_categories(selected_foods),
        **totals,
        "akg_percentages": akg_percentages,
        "budget_status": "within_budget" if totals["total_cost"] <= budget else "over_budget",
        "feasibility_status": feasibility_status,
        "nutrition_score": nutrition_score,
    }


def sort_alternatives(alternatives):
    feasibility_priority = {
        "Layak": 0,
        "Perlu optimasi": 1,
        "Tidak layak": 2,
    }

    sorted_alternatives = sorted(
        alternatives,
        key=lambda alternative: (
            feasibility_priority.get(alternative["feasibility_status"], 3),
            -alternative["nutrition_score"],
            alternative["total_cost"],
        ),
    )

    for index, alternative in enumerate(sorted_alternatives, start=1):
        alternative["rank"] = index

    return sorted_alternatives


def optimize_menu(data):
    items = data["foods"]
    budget = data["budget"]
    minimum_calories = data["minimum_calories"]
    minimum_protein = data["minimum_protein"]
    age_group = data["age_group"]
    nutrition_reference = get_akg_profile(age_group)

    ranked_alternatives = []
    excluded_name_sets = []
    solver = PULP_CBC_CMD(msg=False)

    for rank in range(1, 4):
        problem = LpProblem(f"NutriSafetyMenuOptimization_{rank}", LpMaximize)

        decision_variables = {
            food["name"]: LpVariable(f"select_{rank}_{index}", cat=LpBinary)
            for index, food in enumerate(items)
        }

        problem += lpSum(
            decision_variables[food["name"]] * calculate_food_score(food)
            for food in items
        )

        problem += lpSum(decision_variables[food["name"]] * food["price"] for food in items) <= budget
        problem += (
            lpSum(decision_variables[food["name"]] * food["calories"] for food in items)
            >= minimum_calories
        )
        problem += (
            lpSum(decision_variables[food["name"]] * food["protein"] for food in items)
            >= minimum_protein
        )
        for category in CORE_MENU_CATEGORIES:
            category_foods = [
                food["name"] for food in items if normalize_category(food) == category
            ]
            if category_foods:
                problem += lpSum(decision_variables[name] for name in category_foods) >= 1

        for excluded_names in excluded_name_sets:
            problem += (
                lpSum(decision_variables[name] for name in excluded_names) <= len(excluded_names) - 1
            )

        problem.solve(solver)
        status = LpStatus.get(problem.status, "unknown")

        if status != "Optimal":
            break

        selected_foods = [food for food in items if value(decision_variables[food["name"]]) == 1]
        if not selected_foods:
            break

        ranked_alternatives.append(
            build_alternative_result(selected_foods, nutrition_reference, budget, rank)
        )
        excluded_name_sets.append([food["name"] for food in selected_foods])

    if not ranked_alternatives:
        return {
            "recommended_menu": [],
            "total_protein": 0,
            "total_calories": 0,
            "total_fat": 0,
            "total_carbs": 0,
            "total_cost": 0,
            "status": "infeasible",
            "feasibility_status": "Tidak layak",
            "akg_percentages": {
                "calories": 0,
                "protein": 0,
                "fat": 0,
                "carbs": 0,
            },
            "budget_status": "within_budget",
            "nutrition_reference": nutrition_reference,
            "ranked_alternatives": [],
            "message": "Tidak ada kombinasi menu yang memenuhi batas biaya dan target gizi minimum.",
        }

    ranked_alternatives = sort_alternatives(ranked_alternatives)
    best_alternative = ranked_alternatives[0]

    return {
        **best_alternative,
        "status": "optimal",
        "nutrition_reference": nutrition_reference,
        "ranked_alternatives": ranked_alternatives,
    }
