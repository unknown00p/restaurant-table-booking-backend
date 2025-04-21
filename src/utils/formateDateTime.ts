const isValidTime = (time: string): boolean => {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);
};

const convertTo24Hour = (time: string): string | null => {
  const date = new Date(`1970-01-01T${time}`);
  if (!isNaN(date.getTime())) {
    return date.toISOString().substring(11, 16);
  }

  const match = time.match(/^(\d{1,2})(?::(\d{2}))?\s?(am|pm)$/i);
  if (match) {
    let [, hour, minutes = "00", period] = match;
    let hr = parseInt(hour);
    if (period.toLowerCase() === "pm" && hr < 12) hr += 12;
    if (period.toLowerCase() === "am" && hr === 12) hr = 0;
    return `${hr.toString().padStart(2, "0")}:${minutes}`;
  }

  return null;
};

const convertStringToDate = (reservationDate: string) => {
  const year = new Date().getFullYear();
  const fullDateString = `${reservationDate} ${year}`;
  const parsedDate = new Date(fullDateString);

  if (isNaN(parsedDate.getTime())) {
    throw new Error("Invalid date string");
  }

  // parsedDate.setHours(0, 0, 0, 0);
  return new Date(
    Date.UTC(
      parsedDate.getFullYear(),
      parsedDate.getMonth(),
      parsedDate.getDate(),
      0,
      0,
      0,
      0
    )
  );
};

const addMinutesToTime = (timeStr: string, minutesToAdd: number) => {
  const [hours, minutes] = timeStr.split(":");

  // console.log("timeStr",timeStr)
  // console.log(hours)
  // console.log(minutes)

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);
  date.setMinutes(date.getMinutes() + minutesToAdd);

  const newHour = String(date.getHours()).padStart(2, "0");
  const newMinute = String(date.getMinutes()).padStart(2, "0");

  return `${newHour}:${newMinute}`;
};

export { isValidTime, convertTo24Hour, convertStringToDate, addMinutesToTime };
