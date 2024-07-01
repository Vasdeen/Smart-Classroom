// NTP stuff:
#include <NTPClient.h>

// WiFi stuff from NTP example:
// change next line to use with another board/shield
#include <ESP8266WiFi.h>
//#include <WiFi.h>  // for WiFi shield
//#include <WiFi101.h>  // for WiFi 101 shield or MK1000
#include <WiFiUdp.h>

// WiFi credentials hardcoded as C strings:
const char *ssid     = "<SSID>";
const char *password = "<PASSWORD>";

// because NTPClient needs a WiFiUDP
WiFiUDP ntpUDP;

// By default 'pool.ntp.org' is used with 60 seconds update interval and
// no offset
NTPClient timeClient(ntpUDP);

// You can specify the time server pool and the offset (in seconds),
// additionally you can specify the update interval (in milliseconds).
// NTPClient timeClient(ntpUDP, "europe.pool.ntp.org", 3600, 60000);

// Firebase from Google stuff:
// #include <FirebaseArduino.h>
#define FIREBASE_HOST "https://*********-default-rtdb.europe-west1.firebasedatabase.app/"
#define FIREBASE_AUTH "****************************************"
#define WIFI_SSID "SSID"
#define WIFI_PASSWORD "PASSWORD"

// TM1637 i2c 7 segment display stuff:
// #include <TM1637Display.h>
const int CLK = D3;
const int DIO = D4;
// TM1637Display display(CLK, DIO);
#include <TM1637TinyDisplay.h>
TM1637TinyDisplay display(CLK, DIO);

// RFID stuff:
// https://www.aranacorp.com/en/using-an-rfid-module-with-an-esp8266/
#include <SPI.h>
#include <MFRC522.h>
#define SS_PIN D8
#define RST_PIN D0

MFRC522 rfid(SS_PIN, RST_PIN); // Instance of the class
void handleHex();  // to be defined below in the web server stuff section

MFRC522::MIFARE_Key key;

// Init array that will store new NUID
byte nuidPICC[4];
/**
    Helper routine to dump a byte array as hex values to Serial.
*/
void printHex(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
      Serial.print(buffer[i] < 0x10 ? " 0" : " ");
      Serial.print(buffer[i], HEX);
  }
}
// buf to hex string
void buf_to_hex_string(byte *buffer, byte bufferSize, String &result) {
  if (!bufferSize) {
    return;
  }
  static const char* digit = "0123456789ABCDEF";
  uint8_t cur = buffer[0];
  result += digit[cur / 16];
  result += digit[cur % 16];
  for (byte i = 1; i < bufferSize; i++) {
      cur = buffer[i];
      result += ' ';
      result += digit[cur / 16];
      result += digit[cur % 16];
  }
}
// semi-temp helper function
void printName(byte *buffer, byte bufferSize) {
  String human;
  String digit = "0123456789ABCDEF";
  for (int i = 0; i < bufferSize; i++)
  {
    uint8_t cur = buffer[i];
    human += digit[cur / 16];
    human += digit[cur % 16];
    if (bufferSize - 1 == i)
    {
      human += ' ';
    }
  }
  // Serial.println(FIREBASE_ID_TO_STUDENT(human));
  String wtf = "Hello, " + human + " world!";
}
/**
    Helper routine to dump a byte array as dec values to Serial.
*/
void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
      Serial.print(buffer[i] < 0x10 ? " 0" : " ");
      Serial.print(buffer[i], DEC);
  }
}
// to be called from main setup function
void rfid_setup() {
  SPI.begin();  // Init SPI bus
  rfid.PCD_Init();  // Init MFRC522
  Serial.println();
  Serial.print(F("Reader :"));
  rfid.PCD_DumpVersionToSerial();

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  Serial.println();
  Serial.println(F("This code scan the MIFARE Classic NUID."));
  Serial.println(F("Using the following key:"));
  printHex(key.keyByte, MFRC522::MF_KEY_SIZE);
}


// Button stuff
void button_setup() {
  // buzzer pin initialization
  pinMode(D2, OUTPUT);
  digitalWrite(D2, HIGH);
  // button read pin initialization
  pinMode(D1, INPUT);
  pinMode(D3, INPUT);
  pinMode(D4, INPUT);
  // led setup
}


// Web server stuff:
// https://circuitdigest.com/microcontroller-projects/ajax-with-esp8266-dynamic-web-page-update-without-reloading
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include "index.h"
#define LED BUILTIN_LED  // custom by me
// verbatim copy from tutorial
ESP8266WebServer server(80);
void handleRoot() {
  String s = webpage;
  server.send(200, "text/html", s);
}
void sensor_data() {
  int a = analogRead(A0);
  int temp = a / 4.35;
  String sensor_value = String(temp);
  server.send(200, "text/plane", sensor_value);
}
void led_control() {
  String state = "OFF";
  String act_state = server.arg("state");
  if (act_state == "1") {
    digitalWrite(LED, HIGH); //LED ON
    state = "ON";
  }
  else {
    digitalWrite(LED, LOW); //LED OFF
    state = "OFF";
  }
  server.send(200, "text/plane", state);
}
void handleHex()  // for rfid
{
  String s;
  String digit = "0123456789ABCDEF";
  for (int i = 0; i < rfid.uid.size; i++)
  {
    uint8_t cur = rfid.uid.uidByte[i];
    s += digit[cur / 16];
    s += digit[cur % 16];
    s += ' ';
  }
  s += R"=====(
    <script>setInterval(function(){window.location.reload()}, 10000)</script>
  )=====";
  server.send(200, "text/html", s);
}
void(* resetFunc) (void) = 0;
void auxiliary_control() {
  String wifi_disconnect = server.arg("wifi-disconnect");
  String reset_board = server.arg("reset-board");
  server.send(200, "text/plane", "wifi-disconnect=" + wifi_disconnect + ",reset-board=" + reset_board);
  if (wifi_disconnect == "true") {
    WiFi.disconnect();
  }
  if (reset_board == "true") {
    resetFunc();
  }
}
// to be called from main setup function
void webserver_setup() {
  Serial.println("setting web server handles...");
  server.on("/", handleRoot);
  server.on("/led_set", led_control);
  server.on("/adcread", sensor_data);
  server.on("/rfid/uid", handleHex);
  server.on("/auxiliary_control", auxiliary_control);
  server.begin();
}

// Traditional WiFi connect:
void traditional_wifi_connect(const char *arg_ssid, const char *arg_password) {
  WiFi.begin(arg_ssid, arg_password);
  Serial.print("traditional WiFi connecting");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("connected: ");
  Serial.println(WiFi.localIP());
}

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
void firebase_loop() {
  // Firebase.ready() should be called repeatedly to handle authentication tasks.
  Serial.println("before if");
  Serial.print("Firebase.ready() == ");
  Serial.println(Firebase.ready());

  if (Firebase.ready() && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0))
  {
    Serial.println("inside if");
    sendDataPrevMillis = millis();

    Serial.printf("Set bool... %s\n", Firebase.RTDB.setBool(&fbdo, F("/test/bool"), count % 2 == 0) ? "ok" : fbdo.errorReason().c_str());

    Serial.printf("Get bool... %s\n", Firebase.RTDB.getBool(&fbdo, FPSTR("/test/bool")) ? fbdo.to<bool>() ? "true" : "false" : fbdo.errorReason().c_str());

    bool bVal;
    Serial.printf("Get bool ref... %s\n", Firebase.RTDB.getBool(&fbdo, F("/test/bool"), &bVal) ? bVal ? "true" : "false" : fbdo.errorReason().c_str());

    Serial.printf("Set int... %s\n", Firebase.RTDB.setInt(&fbdo, F("/test/int"), count) ? "ok" : fbdo.errorReason().c_str());

    Serial.printf("Get int... %s\n", Firebase.RTDB.getInt(&fbdo, F("/test/int")) ? String(fbdo.to<int>()).c_str() : fbdo.errorReason().c_str());

    int iVal = 0;
    Serial.printf("Get int ref... %s\n", Firebase.RTDB.getInt(&fbdo, F("/test/int"), &iVal) ? String(iVal).c_str() : fbdo.errorReason().c_str());

    Serial.printf("Set float... %s\n", Firebase.RTDB.setFloat(&fbdo, F("/test/float"), count + 10.2) ? "ok" : fbdo.errorReason().c_str());

    Serial.printf("Get float... %s\n", Firebase.RTDB.getFloat(&fbdo, F("/test/float")) ? String(fbdo.to<float>()).c_str() : fbdo.errorReason().c_str());

    Serial.printf("Set double... %s\n", Firebase.RTDB.setDouble(&fbdo, F("/test/double"), count + 35.517549723765) ? "ok" : fbdo.errorReason().c_str());

    Serial.printf("Get double... %s\n", Firebase.RTDB.getDouble(&fbdo, F("/test/double")) ? String(fbdo.to<double>()).c_str() : fbdo.errorReason().c_str());

    Serial.printf("Set string... %s\n", Firebase.RTDB.setString(&fbdo, F("/test/string"), F("Hello World!")) ? "ok" : fbdo.errorReason().c_str());

    Serial.printf("Get string... %s\n", Firebase.RTDB.getString(&fbdo, F("/test/string")) ? fbdo.to<const char *>() : fbdo.errorReason().c_str());

    // For the usage of FirebaseJson, see examples/FirebaseJson/BasicUsage/Create_Edit_Parse.ino
    FirebaseJson json;

    if (count == 0)
    {
      json.set("value/round/" + String(count), F("cool!"));
      json.set(F("value/ts/.sv"), F("timestamp"));
      Serial.printf("Set json... %s\n", Firebase.RTDB.set(&fbdo, F("/test/json"), &json) ? "ok" : fbdo.errorReason().c_str());
    }
    else
    {
      json.add(String(count), F("smart!"));
      Serial.printf("Update node... %s\n", Firebase.RTDB.updateNode(&fbdo, F("/test/json/value/round"), &json) ? "ok" : fbdo.errorReason().c_str());
    }

    Serial.println();

    // For generic set/get functions.

    // For generic set, use Firebase.RTDB.set(&fbdo, <path>, <any variable or value>)

    // For generic get, use Firebase.RTDB.get(&fbdo, <path>).
    // And check its type with fbdo.dataType() or fbdo.dataTypeEnum() and
    // cast the value from it e.g. fbdo.to<int>(), fbdo.to<std::string>().

    // The function, fbdo.dataType() returns types String e.g. string, boolean,
    // int, float, double, json, array, blob, file and null.

    // The function, fbdo.dataTypeEnum() returns type enum (number) e.g. firebase_rtdb_data_type_null (1),
    // firebase_rtdb_data_type_integer, firebase_rtdb_data_type_float, firebase_rtdb_data_type_double,
    // firebase_rtdb_data_type_boolean, firebase_rtdb_data_type_string, firebase_rtdb_data_type_json,
    // firebase_rtdb_data_type_array, firebase_rtdb_data_type_blob, and firebase_rtdb_data_type_file (10)

    count++;
  }
  Serial.println("after if");
}


int times_button_pressed = 0;  // obsolete
int which_button = 0;
#include "student_misc.h"


// Run once at the startup:
void setup() {
  Serial.begin(115200);
  pinMode(LED, OUTPUT);  // for AJAX with ESP8266 tutorial
  display.begin();
  display.flipDisplay();

  // WiFiManager WiFi connection:
  wifimanager_wifi_connect();

  // setup for rfid
  rfid_setup();

  // setup for web server
  webserver_setup();

  // NTP stuff:
  timeClient.begin();

  // Firebase from Google stuff:
  // Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);
  firebase_setup();

  // Button stuff:
  button_setup();
}

// from Firebase from Google example:
int n = 0;

// from Firebase from Google example to be run in loop
void play_with_firebase() {
  // Firebase from Google stuff:
  // set value
  /*Firebase.setFloat("number", 42.0);
  // handle error
  if (Firebase.failed()) {
    Serial.print("setting /number failed: ");
    Serial.println(Firebase.error());
    return;
  }
  delay(1000);

  // update value
  Firebase.setFloat("number", 43.0);
  // handle error
  if (Firebase.failed()) {
    Serial.print("setting /number failed: ");
    Serial.println(Firebase.error());
    return;
  }
  delay(1000);

  // get value
  Serial.print("number: ");
  Serial.println(Firebase.getFloat("number"));
  delay(1000);

  // remove value
  Firebase.remove("number");

  // set string value
  Firebase.setString("message", "hello world");
  // handle error
  if (Firebase.failed()) {
    Serial.print("setting /message failed: ");
    Serial.println(Firebase.error());
    return;
  }
  delay(1000);

  // set bool value
  Firebase.setBool("truth", false);
  // handle error
  if (Firebase.failed()) {
    Serial.print("setting /truth failed: ");
    Serial.println(Firebase.error());
    return;
  }
  delay(1000);

  // append a new value to /logs
  String name = Firebase.pushInt("logs", n++);
  // handle error
  if (Firebase.failed()) {
    Serial.print("pushing /logs failed: ");
    Serial.println(Firebase.error());
    return;
  }
  Serial.print("pushed: /logs/");
  Serial.println(name);
  delay(1000);
  // end of Firebase from Google example*/
}


unsigned long beep_limit = millis();
// RFID update from the respective example, with custom changes
void rfid_update() {
  // Reset the loop if no new card present on the sensor/reader. This saves the entire process when idle.
  if ( ! rfid.PICC_IsNewCardPresent())
      return;

  // Verify if the NUID has been readed
  if ( ! rfid.PICC_ReadCardSerial())
      return;

  Serial.print(F("PICC type: "));
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.println(rfid.PICC_GetTypeName(piccType));

  // Check is the PICC of Classic MIFARE type
  if (piccType != MFRC522::PICC_TYPE_MIFARE_MINI &&
          piccType != MFRC522::PICC_TYPE_MIFARE_1K &&
          piccType != MFRC522::PICC_TYPE_MIFARE_4K) {
      Serial.println(F("Your tag is not of type MIFARE Classic."));
      // return;
  }

  if (rfid.uid.uidByte[0] != nuidPICC[0] ||
          rfid.uid.uidByte[1] != nuidPICC[1] ||
          rfid.uid.uidByte[2] != nuidPICC[2] ||
          rfid.uid.uidByte[3] != nuidPICC[3] ) {
      Serial.println(F("A new card has been detected."));

      // Store NUID into nuidPICC array
      for (byte i = 0; i < 4; i++) {
          nuidPICC[i] = rfid.uid.uidByte[i];
      }

      Serial.println(F("The NUID tag is:"));
      Serial.print(F("In hex: "));
      printHex(rfid.uid.uidByte, rfid.uid.size);
      Serial.println();
      Serial.print(F("In dec: "));
      printDec(rfid.uid.uidByte, rfid.uid.size);
      Serial.println();
  }
  else Serial.println(F("Card read previously."));

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();

  // force send report
  send_timestamp_rfid_mark_if_changed(true);
  beep_limit = millis() + 250;
}


void experiment() {
  //
}


unsigned long last_check_alive = millis();
void check_alive(unsigned long cur_check) {
  if (cur_check - last_check_alive > 5000) {
    Serial.println("cheking alive...");
    bool success = Firebase.RTDB.setInt(&fbdo, F("/etc/check_alive"), 5);  // 5 is a random number
    if (!success) {
      Serial.print(F("setting /etc/check_alive failed: "));
      Serial.println(fbdo.errorReason());
      Serial.println("rebooting...");
      resetFunc();
      return;
    }
    last_check_alive = millis();
  }
}


int consecutive_HIGH = 0;
int consecutive_LOW = 0;
unsigned long last_checkpoint = millis();
const unsigned long period = 10;
const int consecutive_required = 5;
unsigned long button_timeout_time = 10000;
unsigned long button_timeout = millis() + button_timeout_time;
unsigned long last_time_down = 0;
int when_button = millis();
unsigned long last_time_up = millis();
void button_check(unsigned long busy_ms) {
  unsigned long first_check = millis();
  unsigned long cur_check = first_check;
  do {
    // beeping
    if (cur_check < beep_limit) {
      digitalWrite(D2, LOW);
    }
    else {
      digitalWrite(D2, HIGH);
      beep_limit = cur_check;
    }
    // check buttons
    if (digitalRead(D1) == LOW) {
      if ((which_button != 911) && (millis() - last_time_up < 3000)) {
        which_button = 1;
      }
      else {
        which_button = 911;
      }
      when_button = millis();
      beep_limit = millis() + 100;
    }
    else if (digitalRead(D3) == LOW) {
      which_button = 2;
      when_button = millis();
      beep_limit = millis() + 100;
    }
    else if (digitalRead(D4) == LOW) {
      which_button = 3;
      when_button = millis();
      beep_limit = millis() + 100;
    }
    else {
      last_time_up = millis();
    }
    cur_check = millis();
    delay(0);
    check_alive(cur_check);
  }
  while (cur_check - first_check < busy_ms);
}

int get_mark() {
  if (millis() - when_button > 15000) {
    return 0;
  }
  switch (which_button) {
    case 0:
      return 0;
    case 1:
    case 2:
    case 3:
      return 6 - which_button;
  }
  return which_button;
}


// Run in a loop:
void loop() {
  // NTP stuff:
  timeClient.update();
  Serial.println(timeClient.getFormattedTime());
  button_check(1000);

  // other
  play_with_firebase();
  server.handleClient();
  rfid_update();
  // firebase_loop();
  send_timestamp_rfid_mark_if_changed();
}
