function transform(inJson) {
  var obj = JSON.parse(inJson);
  obj.AppointmentId = obj.Data.AppointmentId;
  obj.TimestampUtc = obj.Data.TimestampUtc;
  obj.Discipline = obj.Data.Discipline;
  delete obj.Data;
  return JSON.stringify(obj);
}
