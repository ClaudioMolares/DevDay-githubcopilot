import network
import time
from microdot import Microdot
from microdot.cors import CORS

from config import (
    CORS_ALLOWED_ORIGINS,
    DHT_PIN,
    LIGHT_ADC_PIN,
    WIFI_PASSWORD,
    WIFI_SSID,
)
from sensors import SensorReader


app = Microdot()
CORS(app, allowed_origins=CORS_ALLOWED_ORIGINS)
sensor_reader = SensorReader(DHT_PIN, LIGHT_ADC_PIN)


@app.get("/api/health")
async def health(request):
    return {"ok": True, "device": "esp32"}


@app.get("/api/sensors")
async def get_sensors(request):
    snapshot = sensor_reader.read()
    return snapshot, 200 if snapshot["ok"] else 503


def connect_wifi():
    if WIFI_SSID == "YOUR_WIFI_NAME":
        raise RuntimeError("Define WIFI_SSID e WIFI_PASSWORD em config.py")

    wlan = network.WLAN(network.WLAN.IF_STA)
    wlan.active(True)

    if not wlan.isconnected():
        wlan.connect(WIFI_SSID, WIFI_PASSWORD)
        started_at = time.ticks_ms()
        while not wlan.isconnected():
            if time.ticks_diff(time.ticks_ms(), started_at) > 20000:
                raise RuntimeError("Não foi possível ligar à rede Wi-Fi")
            time.sleep_ms(250)

    ip_address = wlan.ipconfig("addr4")[0]
    print("Wi-Fi ligado. Endereço do ESP32:", ip_address)
    return ip_address


connect_wifi()
app.run(host="0.0.0.0", port=80, debug=False)