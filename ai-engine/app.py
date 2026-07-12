import os

from flask import Flask, jsonify, request

from akg_profiles import AKG_PROFILES, get_akg_profile
from optimizer import optimize_menu

app = Flask(__name__)


def is_valid_number(value):
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def get_first_present_value(payload, keys):
    for key in keys:
        if key in payload:
            return payload[key]
    return None


def normalize_food_record(food):
    return {
        "name": str(get_first_present_value(food, ["name"]) or "").strip(),
        "category": str(get_first_present_value(food, ["category"]) or "Lainnya").strip() or "Lainnya",
        "portion_grams": float(get_first_present_value(food, ["portion_grams", "portionGrams"]) or 0),
        "protein": float(get_first_present_value(food, ["protein", "proteins"]) or 0),
        "calories": float(get_first_present_value(food, ["calories", "energy"]) or 0),
        "fat": float(get_first_present_value(food, ["fat"]) or 0),
        "carbs": float(get_first_present_value(food, ["carbs", "carbohydrate"]) or 0),
        "price": float(get_first_present_value(food, ["price"]) or 0),
    }


def normalize_payload(payload):
    normalized_foods = [normalize_food_record(food) for food in payload["foods"]]

    return {
        **payload,
        "budget": float(payload["budget"]),
        "minimum_calories": float(payload["minimum_calories"]),
        "minimum_protein": float(payload["minimum_protein"]),
        "student_count": int(payload["student_count"]) if "student_count" in payload and payload["student_count"] is not None else payload.get("student_count"),
        "foods": normalized_foods,
    }


def validate_payload(payload):
    if not isinstance(payload, dict):
        return "Request body must be a JSON object."

    required_fields = ["budget", "minimum_calories", "minimum_protein", "age_group", "foods"]
    for field in required_fields:
        if field not in payload:
            return f"Missing required field: {field}."

    numeric_fields = ["budget", "minimum_calories", "minimum_protein"]
    for field in numeric_fields:
        if not is_valid_number(payload[field]) or payload[field] < 0:
            return f"{field} must be a non-negative number."

    if payload["age_group"] not in AKG_PROFILES:
        return "age_group is not supported."

    if "excluded_menus" in payload:
        excluded_menus = payload["excluded_menus"]
        if not isinstance(excluded_menus, list):
            return "excluded_menus must be an array."

        for index, menu in enumerate(excluded_menus):
            if not isinstance(menu, list):
                return f"excluded_menus at index {index} must be an array of food names."

            for food_name in menu:
                if not isinstance(food_name, str) or not food_name.strip():
                    return (
                        f"excluded_menus at index {index} must only contain non-empty food names."
                    )

    foods = payload["foods"]
    if not isinstance(foods, list) or len(foods) == 0:
        return "foods must be a non-empty array."

    for index, food in enumerate(foods):
        if not isinstance(food, dict):
            return f"Food at index {index} must be an object."

        if not isinstance(food.get("name"), str) or not food["name"].strip():
            return f"Food at index {index} must have a non-empty name."

        if "category" in food and (
            not isinstance(food["category"], str) or not food["category"].strip()
        ):
            return f"category for food at index {index} must be a non-empty string."

        field_aliases = {
            "portion_grams": ["portion_grams", "portionGrams"],
            "protein": ["protein", "proteins"],
            "calories": ["calories", "energy"],
            "fat": ["fat"],
            "carbs": ["carbs", "carbohydrate"],
            "price": ["price"],
        }

        for field, aliases in field_aliases.items():
            value = next((food[alias] for alias in aliases if alias in food), None)
            if value is None:
                return f"Food at index {index} is missing field: {field}."

            if not is_valid_number(value) or value < 0:
                return f"{field} for food at index {index} must be a non-negative number."

    return None


@app.get("/health")
def health():
    return jsonify({"status": "ok", "service": "nutrisafety-ai-engine"})


@app.get("/akg-profiles")
def akg_profiles():
    return jsonify(
        {
            "profiles": [get_akg_profile(age_group) for age_group in AKG_PROFILES],
        }
    )


@app.post("/optimize")
def optimize():
    data = request.get_json(silent=True)
    validation_error = validate_payload(data)

    if validation_error:
        return jsonify({"error": validation_error}), 400

    result = optimize_menu(normalize_payload(data))
    return jsonify(result)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5001")), debug=False)
