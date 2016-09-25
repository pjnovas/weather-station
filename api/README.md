# Weather Station
API for collecting temperature and humidity from ESP8266

Create a `devices.json` at `lib/devices.json` (you can follow the file located at `test/devices_test.json`).
```json
{
  "TOKEN-SET-AT-ARDUINO": {
    "id": "ID-from-client-for-api-requests",
    "storeBy": { "minutes": 5 }
  },
  "TOKEN-2": "etc ..."
}
```

For each device you want to add, create a key with token and an ID
* `Token` is used from the device on each request to API server, only device and api know them (it is not exposed by web client) in that way we can be sure to not get other pirate requests away from the device. You could [generate one here](http://passwordsgenerator.net/).
* `id` is used to identify the web client with the device, it's safe to share and use to consume the web API.
* `storedBy` is by how long is storing devices states like temp, humidity, etc. This field must be similar to the one set on the device (preferable a little bigger than the one set on device to catch up values)
