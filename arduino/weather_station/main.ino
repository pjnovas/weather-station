
#include<stdlib.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266HTTPClient.h>
#include <DHT.h>
#define DHTTYPE DHT22
#define DHTPIN  2

ESP8266WebServer server(80);

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE, 11);

float humidity, temp_c, hi_c;  // Values read from sensor

unsigned long previousMillis = 0;        // will store last temp was read
const long interval = 10000;              // interval at which to read sensor

unsigned long previousMillisPOST = 0;        // will store last temp was sent to server

// Every 10 seconds will try to read sensor and update globals if was ok
void read_temperature() {
  float _humidity, _temp_c, _hi_c;
  unsigned long currentMillis = millis();

  if(currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;

    _humidity = dht.readHumidity();          // Read humidity (percent)
    _temp_c = dht.readTemperature();         // Read temperature as Celcius
    _hi_c = dht.computeHeatIndex(temp_c, humidity, false);

    // Check if any reads failed and exit early (to try again).
    if (isnan(humidity) || isnan(temp_c) || isnan(hi_c)) {
      if (DEBUG) {Serial.println("Failed to read from DHT sensor!");}
      return;
    }

    // Update globals
    humidity = _humidity;
    temp_c = _temp_c;
    hi_c = _hi_c;

    if (DEBUG) {Serial.println("READ DHT sensor OK!");}
  }
}

String toString(float value) {
  char buffer[10];
  dtostrf(value,3,1,buffer);
  return buffer;
}

String getJSON() {
  return "{\"temperature\":"+toString(temp_c)+",\"humidity\":"+toString(humidity)+",\"heatIndex\":"+toString(hi_c)+"}";
}

void handle_root() {
  read_temperature();
  server.send(200, "application/json", getJSON());
  delay(100);
}

void printWifiStatus(){
  Serial.println("-----------------------------");
  // print the SSID of the network you're attached to
  Serial.print("SSID: ");
  Serial.println(WiFi.SSID());

  // print your WiFi shield's IP address
  IPAddress ip = WiFi.localIP();
  Serial.print("IP Address: ");
  Serial.println(ip);

  // print the received signal strength
  long rssi = WiFi.RSSI();
  Serial.print("Signal strength (RSSI):");
  Serial.print(rssi);
  Serial.println(" dBm");
  Serial.println("-----------------------------");
}

void notifyPOST() {
  if (DEBUG) {printWifiStatus();}

  HTTPClient http;
  http.begin(apiURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + (String)deviceID);
  http.addHeader("x-local-ip", WiFi.localIP().toString());

  if (DEBUG) {Serial.println("POSTING TO SERVER! ------ ");}
  String json = getJSON();
  if (DEBUG) {Serial.println("Payload: " + json);}

  int httpCode = http.POST(json);


  if(httpCode > 0) {
    if (DEBUG){
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);

      // file found at server
      if(httpCode >= 200 && httpCode < 300) {
        Serial.println("[HTTP] POST OK");
      }
    }
  }
  else {
    if (DEBUG) {Serial.printf("[HTTP] POST - failed, error: %s\n", http.errorToString(httpCode).c_str());}
    // clear the timestamp to retry right way
    previousMillisPOST = 0;
  }

  http.end();
}

void notifier() {
  unsigned long currentMillis = millis();

  if(currentMillis - previousMillisPOST >= intervalPOST) {
    previousMillisPOST = currentMillis;
    notifyPOST();
  }
}

void setup(void)
{
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi network
  WiFi.begin(ssid, password);
  if (DEBUG){Serial.print("\n\r \n\rWorking to connect");}

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    if (DEBUG){Serial.print(".");}
  }

  if (DEBUG){
    Serial.println("");
    Serial.println("DHT Weather Reading Server");
    Serial.print("Connected to ");
    Serial.println(ssid);
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  }

  server.on("/", handle_root);

  server.begin();
  if (DEBUG){Serial.println("HTTP server started");}
}

void loop(void)
{
  server.handleClient();
  read_temperature();
  notifier();
}
