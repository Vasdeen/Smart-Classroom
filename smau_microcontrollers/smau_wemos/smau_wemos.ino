#include <WiFi.h>
#include <PubSubClient.h>
#include <NTPClient.h>
// New Firebase stuff:
#include <Firebase_ESP_Client.h>
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
// #define API_KEY "****************************************"
#define API_KEY "***************************************"
#define DATABASE_URL "https://*********-default-rtdb.europe-west1.firebasedatabase.app/" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app
#define USER_EMAIL "example@example.com"
#define USER_PASSWORD "example"
// Define Firebase Data object
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
unsigned long sendDataPrevMillis = 0;
unsigned long count = 0;
void firebase_setup() {
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  /* Assign the api key (required) */
  config.api_key = API_KEY;
  /* Assign the user sign in credentials */
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  /* Assign the RTDB URL (required) */
  config.database_url = DATABASE_URL;
  /* Assign the callback function for the long running token generation task */
  config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h
  // Or use legacy authenticate method
  // config.database_url = DATABASE_URL;
  // config.signer.tokens.legacy_token = "<database secret>";

  // To connect without auth in Test Mode, see Authentications/TestMode/TestMode.ino

  //////////////////////////////////////////////////////////////////////////////////////////////
  // Please make sure the device free Heap is not lower than 80 k for ESP32 and 10 k for ESP8266,
  // otherwise the SSL connection will fail.
  //////////////////////////////////////////////////////////////////////////////////////////////

  // Comment or pass false value when WiFi reconnection will control by your code or third party library e.g. WiFiManager
  Firebase.reconnectNetwork(false);
  // Since v4.4.x, BearSSL engine was used, the SSL buffer need to be set.
  // Large data transmission may require larger RX buffer, otherwise connection issue or data read time out can be occurred.
  fbdo.setBSSLBufferSize(4096 /* Rx buffer size in bytes from 512 - 16384 */, 1024 /* Tx buffer size in bytes from 512 - 16384 */);

  // Limit the size of response payload to be collected in FirebaseData
  fbdo.setResponseSize(2048);
  Firebase.begin(&config, &auth);
  Firebase.setDoubleDigits(5);
  config.timeout.serverResponse = 10 * 1000;
}



struct customDeviceEntry
{
  void* object1Pointer = nullptr;
  void* object2Pointer = nullptr;
  void* object3Pointer = nullptr;
  customDeviceEntry() {}
  virtual int scanForDevice() {}
  virtual int updateDevice() {}
  ~customDeviceEntry() {}
};




// библиотека для работы с метеосенсором
#include <TroykaMeteoSensor.h>


struct customTroykaMeteoSensor : public customDeviceEntry
{
  customTroykaMeteoSensor() {
    object1Pointer = (void*)new TroykaMeteoSensor;
  }
  int scanForDevice() {
    ((TroykaMeteoSensor*)object1Pointer)->begin();
    Serial.println("BEGIN TroykaMeteoSensor!");
    return ((TroykaMeteoSensor*)object1Pointer)->read();
  }
  int updateDevice() {
    return ((TroykaMeteoSensor*)object1Pointer)->read();
  }
  ~customTroykaMeteoSensor() {
    ((TroykaMeteoSensor*)object1Pointer)->reset();
    delete (TroykaMeteoSensor*)object1Pointer;
    object1Pointer = nullptr;
  }
};


struct customDeviceCheckingInfrastructure
{
  customDeviceEntry* devices[10] = {};
  TroykaMeteoSensor& tms() {
    if (nullptr == devices[0]) {
      devices[0] = new customTroykaMeteoSensor();
      devices[0]->scanForDevice();
    }
    return *(TroykaMeteoSensor*)devices[0]->object1Pointer;
  }
  customDeviceCheckingInfrastructure() {}
  ~customDeviceCheckingInfrastructure() {
    for (int i = 0; i < 10; i++) {
      if (nullptr == devices[i]) {
        delete devices[i];
      }
    }
  }
};

customDeviceCheckingInfrastructure infra;



// создаём объект для работы с датчиком
// TroykaMeteoSensor meteoSensor;


/////////////////// SETTINGS /////////////////////////////

// Wi-Fi
const char* ssid = "********";
const char* password = "********";

// MQTT
const char* mqtt_server = "**********";
const int mqtt_port = 18050;
const char* mqtt_user = "********";
const char* mqtt_password = "********";

// SENSOR
const int sending_period = 5;
const bool retain_flag = false;
const char* temperature_topic = "temp";
const char* humidity_topic = "hum";
const char* pressure_topic = "bme280/pressure";
/////////////////////////////////////////////////////////


//// WiFi Manager!

/*
// With WiFiManager WiFi connect:
#include <WiFiManager.h>  // https://github.com/tzapu/WiFiManager
// code from setup() from the WiFiManager/Basic example:
void wifimanager_wifi_connect() {
  // WiFi.mode(WIFI_STA);  // explicitly set mode, esp defaults to STA+AP
  // it is a good practice to make sure your code sets wifi mode how you want it.

  // put your setup code here, to run once:
  // Serial.begin(115200);  // We don't need this line from the WiFiManager/Basic example

  //WiFiManager, Local initialization. Once its business is done, there is no need to keep it around
  WiFiManager wm;

  // reset settings - wipe stored credentials for testing
  // these are stored by the esp library
  // wm.resetSettings();

  // Automatically connect using saved credentials,
  // if connection fails, it starts an access point with the specified name ( "AutoConnectAP"),
  // if empty will auto generate SSID, if password is blank it will be anonymous AP (wm.autoConnect())
  // then goes into a blocking loop awaiting configuration and will return success result

  bool res;
  // res = wm.autoConnect();  // auto generated AP name from chipid
  // res = wm.autoConnect("AutoConnectAP");  // anonymous ap
  res = wm.autoConnect("AutoConnectAP", "password");  // password protected ap

  if (!res) {
    Serial.println("Failed to connect with WiFiManager");
    // ESP.restart();
  }
  else {
    //if you get here you have connected to the WiFi
    Serial.println("connected with WiFiManager...yeey :)");
  }
}
*/

//// end of Wifi Manager!


WiFiClient espClient;
PubSubClient client(espClient);
// Adafruit_BME280 bme;
uint32_t tmr1;

void setup_wifi() {

  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  int waiting_for = 10;
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    waiting_for--;
    if (0 == waiting_for) {
      // wifimanager_wifi_connect();
    }
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP8266-" + WiFi.macAddress();
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password) ) {
      Serial.println("connected");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}



// because NTPClient needs a WiFiUDP
WiFiUDP ntpUDP;

// By default 'pool.ntp.org' is used with 60 seconds update interval and
// no offset
NTPClient timeClient(ntpUDP);

void sendData() {
  unsigned long timestamp = timeClient.getEpochTime();
  FirebaseJson json;
  TroykaMeteoSensor& meteoSensor = infra.tms();
  // считываем данные с датчика
  int stateSensor = meteoSensor.read();
  float temperature, pressure, humidity;
  bool success;
  unsigned long latest_timestamp = 0;
  int count = 0;
  // проверяем состояние данных
  switch (stateSensor) {
    case SHT_OK:
      // выводим показания влажности и температуры
      /*
      Serial.println("Data sensor is OK");
      Serial.print("Temperature = ");
      Serial.print(meteoSensor.getTemperatureC());
      Serial.println(" C \t");
      Serial.print("Temperature = ");
      Serial.print(meteoSensor.getTemperatureK());
      Serial.println(" K \t");
      Serial.print("Temperature = ");
      Serial.print(meteoSensor.getTemperatureF());
      Serial.println(" F \t");
      Serial.print("Humidity = ");
      Serial.print(meteoSensor.getHumidity());
      Serial.println(" %\r\n");
      */
      temperature = meteoSensor.getTemperatureC();
      // pressure = bme.readPressure() / 133.3224;
      humidity = meteoSensor.getHumidity();
    
      Serial.print("Temperature = ");
      Serial.print(temperature);
      Serial.println(" °C");
      // Serial.print("Pressure = ");
      // Serial.print(pressure);
      // Serial.println(" mm");
      Serial.print("Humidity = ");
      Serial.print(humidity);
      Serial.println(" %");
    
      client.publish(temperature_topic, String(temperature).c_str(), retain_flag);
      client.publish(humidity_topic, String(humidity).c_str(), retain_flag);
      // client.publish(pressure_topic, String(pressure).c_str(), retain_flag);

      json.add("timestamp", timestamp);
      json.add("temperature", temperature);
      json.add("humidity", humidity);
      success = Firebase.RTDB.getInt(&fbdo, F("/climate_reports/count"));
      count = 0;
      if (success) {
        count = fbdo.to<int>();
      }
      else if (fbdo.errorCode() != FIREBASE_ERROR_PATH_NOT_EXIST) {
        Serial.print("Firebase.ready() == ");
        Serial.print(Firebase.ready());
        Serial.print(F(", "));
        Serial.println(fbdo.errorReason());
        break;
      }
      // new code
      
      success = Firebase.RTDB.getInt(&fbdo, F("/climate_reports/latest/timestamp"));
      latest_timestamp = 0;
      if (success) {
        latest_timestamp = fbdo.to<unsigned long>();
      }
      else if (fbdo.errorCode() != FIREBASE_ERROR_PATH_NOT_EXIST) {
        Serial.print("Firebase.ready() == ");
        Serial.print(Firebase.ready());
        Serial.print(F(", "));
        Serial.println(fbdo.errorReason());
        break;
      }
      if (0 != latest_timestamp && timestamp - latest_timestamp <= 15) {
        break;
      }
      
      // end of new code
      success = Firebase.RTDB.setInt(&fbdo, F("/climate_reports/count"), count + 1);
      if (!success) {
        Serial.print(F("setting /climate_reports/count failed: "));
        Serial.println(fbdo.errorReason());
        break;
      }
      success = Firebase.RTDB.updateNode(&fbdo, "/climate_reports/" + String(count), &json);
      if (!success) {
        Serial.print(F("setting /climate_reports/"));
        Serial.print(count);
        Serial.print(F(" failed: "));
        Serial.println(fbdo.errorReason());
      }
      success = Firebase.RTDB.updateNode(&fbdo, "/climate_reports/latest", &json);
      if (!success) {
        Serial.print(F("setting /climate_reports/latest failed: "));
        Serial.println(fbdo.errorReason());
      }
      
      break;
    // ошибка данных или сенсор не подключён
    case SHT_ERROR_DATA:
      Serial.println("Data error or sensor not connected");
      break; 
    // ошибка контрольной суммы
    case SHT_ERROR_CHECKSUM:
      Serial.println("Checksum error");
      break;
  }
}



void setup() {
  Serial.begin(115200);

  /*
  if (!bme.begin(0x76)) {
    Serial.println("Could not find a valid BME280 sensor, check wiring, address, sensor ID!");
    while (1){
      delay(10);
    }
  }
  */
  
  // начало работы с датчиком
  // meteoSensor.begin();
  TroykaMeteoSensor& meteoSensor = infra.tms();
  Serial.println("Meteo Sensor init OK");

  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  // NTP stuff:
  timeClient.begin();
  firebase_setup();
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  if (millis() - tmr1 >= (sending_period * 1000)) {
    tmr1 = millis();
    timeClient.update();
    Serial.println(timeClient.getFormattedTime());
    sendData();
  }
}
