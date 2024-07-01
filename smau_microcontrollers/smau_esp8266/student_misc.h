struct student_info
{
  String rfid_uid;     // из студенческого билета, в hex
  String last_name;    // фамилия
  String first_name;   // имя
  String middle_name;  // матчество или отчество
};

struct timestamp_rfid_mark
{
  unsigned long timestamp;
  String rfid_uid;
  int mark;
};

const int backlog_size = 10;
timestamp_rfid_mark backlog[backlog_size];
int backlog_placed = 0;
int backlog_done = 0;
int backlog_todo = 0;
#define BACKLOG_ADVANCE(COUNTER) ((COUNTER) = ((COUNTER) + 1) % backlog_size)
#define BACKLOG_NEXT(COUNTER) (((COUNTER) + 1) % backlog_size)
#define BACKLOG_PREV(COUNTER) (((COUNTER) + backlog_size - 1) % backlog_size)

int backlog_available() {
  if (backlog_todo < backlog_done) {
    return backlog_size + backlog_todo - backlog_done;
  }
  return backlog_todo - backlog_done;
}


void send_timestamp_rfid_mark_if_changed(bool force_send=false)
{
  static String temp_rfid_uid;
  static timestamp_rfid_mark temp_obj;
  static timestamp_rfid_mark defer_obj;
  temp_rfid_uid = "";
  static bool pending = false;
  buf_to_hex_string(rfid.uid.uidByte, rfid.uid.size, temp_rfid_uid);
  if (force_send || temp_obj.rfid_uid != temp_rfid_uid) {
    temp_obj.timestamp = timeClient.getEpochTime();
    temp_obj.rfid_uid = temp_rfid_uid;
    temp_obj.mark = get_mark();
    which_button = 0;
    display.showNumber(times_button_pressed);
    pending = true;
    backlog[backlog_placed] = temp_obj;
    BACKLOG_ADVANCE(backlog_placed);
    switch (temp_obj.mark) {
      case 3:
      case 4:
      case 5:
        break;
      default:
        backlog_todo = backlog_placed;
    }
  }
  while (backlog_available()) {
    // check if 15 seconds passed
    if (backlog[BACKLOG_PREV(backlog_todo)].timestamp - backlog[backlog_done].timestamp > 15) {
      BACKLOG_ADVANCE(backlog_done);
      continue;
    }
    // send
    bool success = Firebase.RTDB.getInt(&fbdo, F("/reports/count"));
    int count = 0;
    if (success) {
      count = fbdo.to<int>();
    }
    else if (fbdo.errorCode() != FIREBASE_ERROR_PATH_NOT_EXIST) {
      Serial.print("Firebase.ready() == ");
      Serial.print(Firebase.ready());
      Serial.print(F(", "));
      Serial.println(fbdo.errorReason());
      return;
    }
    success = Firebase.RTDB.setInt(&fbdo, F("/reports/count"), count + 1);
    if (!success) {
      Serial.print(F("setting /reports/count failed: "));
      Serial.println(fbdo.errorReason());
      return;
    }
    FirebaseJson json;
    json.add("timestamp", backlog[backlog_done].timestamp);
    json.add("rfid_uid", backlog[backlog_done].rfid_uid);
    json.add("mark", backlog[backlog_done].mark);
    success = Firebase.RTDB.updateNode(&fbdo, "/reports/" + String(count), &json);
    if (success) {
      BACKLOG_ADVANCE(backlog_done);
    }
    else {
      Serial.print("Failed to make a report: ");
      Serial.println(fbdo.errorReason());
      return;
    }
  }
}

#include "db_abstraction.h"
