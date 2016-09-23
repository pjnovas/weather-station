
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
 
void read_temperature() {
  // Wait at least 10 seconds seconds between measurements.
  unsigned long currentMillis = millis();
 
  if(currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;   

    humidity = dht.readHumidity();          // Read humidity (percent)
    temp_c = dht.readTemperature();         // Read temperature as Celcius
    hi_c = dht.computeHeatIndex(temp_c, humidity, false);
    
    // Check if any reads failed and exit early (to try again).
    if (isnan(humidity) || isnan(temp_c) || isnan(hi_c)) {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }

    Serial.println("READ DHT sensor!");
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

void notifyPOST() {
  HTTPClient http;
  http.begin(apiURL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + (String)deviceID);
  http.addHeader("x-local-ip", WiFi.localIP().toString());
  http.POST(getJSON());
  http.end();
}

void notifier() {
  // Every 10 seconds send a POST to a server
  unsigned long currentMillis = millis();
 
  if(currentMillis - previousMillisPOST >= intervalPOST) {
    previousMillisPOST = currentMillis;   
    read_temperature();
    Serial.println("POSTING TO SERVER!");
    notifyPOST();
  }
}

void setup(void)
{
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi network
  WiFi.begin(ssid, password);
  Serial.print("\n\r \n\rWorking to connect");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("");
  Serial.println("DHT Weather Reading Server");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
   
  server.on("/", handle_root);
  read_temperature(); // make a first reading
  
  server.begin();
  Serial.println("HTTP server started");
}
 
void loop(void)
{
  server.handleClient();
  notifier();
} 


