import pandas as pd
import matplotlib.pyplot as plt
from datetime import timedelta


# Скользящее среднее + экстраполяция
def moving_average_extrapolation(series, window, steps):
    values = list(series[-window:])
    forecast = []

    for _ in range(steps):
        avg = sum(values[-window:]) / window
        forecast.append(avg)
        values.append(avg)

    return forecast


# Анализ рождаемости
def analyze_births(children_file, total_file, forecast_years):
    children_data = pd.read_json(children_file)
    total_data = pd.read_json(total_file)

    df = pd.merge(children_data, total_data, on="year")
    df["percentage_out_of_wedlock"] = (
        df["children_born_out_of_wedlock"] / df["total_births"] * 100
    )

    # Разница по годам
    df["change"] = df["percentage_out_of_wedlock"].diff()
    max_change = df["change"].max()
    min_change = df["change"].min()
    max_year = int(df.loc[df["change"].idxmax(), "year"])
    min_year = int(df.loc[df["change"].idxmin(), "year"])

    # Прогноз
    forecast = moving_average_extrapolation(df["percentage_out_of_wedlock"], window=3, steps=forecast_years)
    forecast_years_range = list(range(df["year"].max() + 1, df["year"].max() + 1 + forecast_years))

    # Вывод для фронтенда
    return {
        "data": df[["year", "percentage_out_of_wedlock"]].to_dict(orient="records"),
        "max_change": {"value": round(max_change, 2), "year": max_year},
        "min_change": {"value": round(min_change, 2), "year": min_year},
        "forecast": [
            {"year": year, "predicted_percentage": round(value, 2)}
            for year, value in zip(forecast_years_range, forecast)
        ]
    }


# Анализ курса валют
def analyze_currency(currency_file, forecast_days):
    df = pd.read_json(currency_file)
    df["date"] = pd.to_datetime(df["date"])

    # Изменения
    df["usd_change"] = df["usd"].diff()
    df["eur_change"] = df["eur"].diff()

    # USD
    max_usd_gain = df["usd_change"].min()
    max_usd_gain_date = df.loc[df["usd_change"].idxmin(), "date"].date()
    max_usd_loss = df["usd_change"].max()
    max_usd_loss_date = df.loc[df["usd_change"].idxmax(), "date"].date()

    # EUR
    max_eur_gain = df["eur_change"].min()
    max_eur_gain_date = df.loc[df["eur_change"].idxmin(), "date"].date()
    max_eur_loss = df["eur_change"].max()
    max_eur_loss_date = df.loc[df["eur_change"].idxmax(), "date"].date()

    # Прогноз USD и EUR
    forecasts = {}
    for currency in ["usd", "eur"]:
        forecast = moving_average_extrapolation(df[currency], window=3, steps=forecast_days)
        forecast_dates = pd.date_range(start=df["date"].max() + timedelta(days=1), periods=forecast_days)
        forecasts[currency] = [
            {"date": date.strftime("%Y-%m-%d"), "predicted_rate": round(rate, 4)}
            for date, rate in zip(forecast_dates, forecast)
        ]

    # Вывод для фронта
    return {
        "daily_rates": df[["date", "usd", "eur"]].assign(date=lambda d: d["date"].dt.strftime("%Y-%m-%d")).to_dict(orient="records"),
        "usd": {
            "max_gain": {"value": round(abs(max_usd_gain), 2), "date": str(max_usd_gain_date)},
            "max_loss": {"value": round(abs(max_usd_loss), 2), "date": str(max_usd_loss_date)},
        },
        "eur": {
            "max_gain": {"value": round(abs(max_eur_gain), 2), "date": str(max_eur_gain_date)},
            "max_loss": {"value": round(abs(max_eur_loss), 2), "date": str(max_eur_loss_date)},
        },
        "forecast": forecasts
    }


# Пример вызова функций и вывод в консоль (для отладки)
if __name__ == "__laba3__":
    try:
        # Настройки
        forecast_years = 5
        forecast_days = 10

        births_result = analyze_births("data/childrenData.json", "data/totalBirthsData.json", forecast_years)
        currency_result = analyze_currency("data/exchangeRates.json", forecast_days)

        # Пример: распечатать словари (можно заменить на возврат в Flask/FastAPI)
        import json
        print("\n=== Births Result ===")
        print(json.dumps(births_result, ensure_ascii=False, indent=2))

        print("\n=== Currency Result ===")
        print(json.dumps(currency_result, ensure_ascii=False, indent=2))

    except FileNotFoundError as e:
        print(f"❌ Файл не найден: {e.filename}")
    except ValueError as e:
        print(f"❌ Неверное значение: {e}")
    except Exception as e:
        print(f"❌ Произошла ошибка: {e}")
