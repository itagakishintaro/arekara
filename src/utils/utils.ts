export const periodMap = {
  day: { display: "日", days: 1 },
  week: { display: "週", days: 7 },
  month: { display: "月", days: 30 },
  year: { display: "年", days: 365 }
};

export const calcPace = r => {
  if (!r || !r.records) {
    return;
  }
  const firstDay = Object.keys(r.records).reduce(
    (pre, cur) => (pre > cur ? cur : pre),
    moment().format()
  );
  const fromFirstDay = moment().diff(moment(firstDay), "days");
  const times = Object.keys(r.records).length;
  let period = periodMap[r.period].days;
  return Math.round((times / (fromFirstDay + 1)) * period * 10) / 10;
};