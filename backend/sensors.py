import dht
import time
from machine import ADC, Pin


class SensorReader:
    def __init__(self, dht_pin, light_adc_pin):
        self.climate_sensor = dht.DHT22(Pin(dht_pin))
        self.light_sensor = ADC(Pin(light_adc_pin))
        self.light_sensor.atten(ADC.ATTN_11DB)

    def read(self):
        sensors = {
            "temperature_c": {"value": None, "unit": "°C"},
            "humidity_pct": {"value": None, "unit": "%"},
            "light_raw": {"value": None, "unit": "ADC (0-65535)"},
        }

        try:
            self.climate_sensor.measure()
            sensors["temperature_c"]["value"] = self.climate_sensor.temperature()
            sensors["humidity_pct"]["value"] = self.climate_sensor.humidity()
        except Exception:
            sensors["temperature_c"]["error"] = "read_failed"
            sensors["humidity_pct"]["error"] = "read_failed"

        try:
            sensors["light_raw"]["value"] = self.light_sensor.read_u16()
        except Exception:
            sensors["light_raw"]["error"] = "read_failed"

        ok = all(item["value"] is not None for item in sensors.values())
        return {
            "ok": ok,
            "device": "esp32",
            "sampled_at_ms": time.ticks_ms(),
            "sensors": sensors,
        }