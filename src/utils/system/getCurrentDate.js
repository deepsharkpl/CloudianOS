function getCurrentDate() {
  const now = new Date();

  const day = now.getDate();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const month = months[now.getMonth()];

  return `${day} ${month}`;
}

module.exports = {
  getCurrentDate,
};
