import React, { useEffect, useState } from "react";
import { ReactComponent as Arrow } from "../assets/arrow.svg";
import { ReactComponent as Ellipse1 } from "../assets/Ellipse 19.svg";
import { ReactComponent as Ellipse2 } from "../assets/Ellipse 17.svg";
import { ReactComponent as Ellipse3 } from "../assets/Ellipse 16.svg";
import moment from "moment";
import { CanvasJS, CanvasJSChart } from "canvasjs-react-charts";

const USCrudeOil = () => {
  const [news, setNews] = useState([]);
  const [data, setData] = useState([]);
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [number, setNumber] = useState(0);
  const [tab, setTab] = useState("Home");
  const [tableData, setTableData] = useState([]);
  const [downloadData, setDownloadData] = useState([]);
  const [accuracy, setAccuracy] = useState();
  const [options, setOptions] = useState({});
  const [time, setTime] = useState();

  const API_URL = "https://api.spacevision.app/";
  CanvasJS.addColorSet("CustomColorSet", ["#32386442", "#01F1E3", "#981BFB"]);

  const getPreviousDay = (date = new Date()) => {
    const previous = new Date(date.getTime());
    previous.setDate(date.getDate() - 3);

    return previous;
  };

  const getUpdateDate = (date = new Date()) => {
    const previous = new Date(date.getTime() - 17 * 3600000);
    const day = (date.getDay() + 5) % 7;
    previous.setDate(date.getDate() - day);
    const d = moment(previous).format("MM/DD/YYYY");
    setDate(d + " 08:00 CDT");
  };

  const getTableData = async (n, data1, data2, h) => {
    setLoading(true);
    const list = [];
    for (let i = 0; i < n; i++) {
      if (h < 24) {
        const forth = data2[i];
        const eia = data1.find((item) => item.date === forth.date);

        list.push({
          date: forth?.date,
          crude: {
            SAS: forth?.SAS,
            SAX: forth?.SAX,
            SAE: forth?.SAE,
          },
          eia: {
            SAS: eia ? eia.SAS : "N/A",
            SAX: eia ? eia.SAX : "N/A",
            SAE: eia ? eia.SAE : "N/A",
          },
          accuracy: eia
            ? ((1 - Math.abs(forth.SAE - eia.SAE) / eia.SAE) * 100).toFixed(2)
            : "N/A",
        });
      } else {
        const eia = data1[i];
        const forth = data2.find((item) => item.date === eia?.date);

        list.push({
          date: forth?.date,
          crude: {
            SAS: forth?.SAS,
            SAX: forth?.SAX,
            SAE: forth?.SAE,
          },
          eia: {
            SAS: eia ? eia.SAS : "N/A",
            SAX: eia ? eia.SAX : "N/A",
            SAE: eia ? eia.SAE : "N/A",
          },
          accuracy: eia
            ? ((1 - Math.abs(forth.SAE - eia.SAE) / eia.SAE) * 100).toFixed(2)
            : "N/A",
        });
      }
    }
    return list;
  };

  const timeDistance = (date = new Date()) => {
    const distance = Math.abs(new Date() - new Date(date));
    let duration = "";
    const days = Math.floor(distance / 86400000);
    const hours = Math.floor(distance / 3600000);
    const minutes = Math.floor(distance / 60000);
    const seconds = Math.floor(distance / 1000);
    if (days > 0) {
      duration = days + "d";
    } else if (hours > 0) {
      duration = hours + "h";
    } else if (minutes > 0) {
      duration = minutes + "m";
    } else {
      duration = seconds + "s";
    }
    return duration;
  };

  const getTillTime = () => {
    const day = new Date().getDay();
    const hour = new Date().getHours();
    const minutes = new Date().getMinutes();
    const offset = new Date().getTimezoneOffset();
    const t1 = day * 1440 + hour * 60 + minutes + offset;
    var t = 5250 - t1;
    if (t < 0) t += 10080;
    const h = Math.floor(t / 60);
    const m = t - 60 * h;

    setTime(`${h} hr ${m} min`);
    return h;
  };

  const getFetchData = async () => {
    const h = await getTillTime();
    const response1 = await fetch(
      API_URL +
        `eia/?start=${moment(new Date("2022-04-01")).format("YYYY-MM-DD")}`
    );
    const res1 = await response1.json();
    const resdata1 = res1.data.sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    );
    const response2 = await fetch(
      API_URL +
        `crude/?start=${moment(new Date("2022-04-01")).format("YYYY-MM-DD")}`
    );
    const res2 = await response2.json();

    const resdata2 = res2.data.sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    );

    const list1 = await getTableData(4, resdata1, resdata2, h);
    setData(list1);

    const list2 = await getTableData(10, resdata1, resdata2, h);
    setTableData(list2);

    const length = resdata2.length;
    setNumber(length);

    const list3 = await getTableData(length, resdata1, resdata2, h);
    setDownloadData(list3);

    getUpdateDate();
    var sum = 0;
    var len = 0;

    for (let i = 0; i < length; i++) {
      const item = list3[i];
      if (item?.accuracy !== "N/A") {
        sum += parseFloat(
          (1 - Math.abs(item.crude.SAE - item.eia.SAE) / item.eia.SAE) * 100
        );
        len++;
      }
    }

    const accuracy = (sum / len).toFixed(2);
    setAccuracy(accuracy);

    const data = [];
    const data1 = [];
    const data2 = [];

    for (let i = 0; i < 8; i++) {
      if (h < 24) {
        const forth = resdata2[i];
        const eia = resdata1.find((item) => item.date === forth.date);
        data.push(
          { x: new Date(forth?.date + " 04:00:00"), y: 1000 },
          {
            x: getPreviousDay(new Date(forth?.date)),
            y: 0,
          }
        );
        if (eia)
          data1.push({
            x: new Date(eia?.date + " 04:00:00"),
            y: eia?.SAE / 1000,
          });
        data2.push({
          x: new Date(forth?.date + " 04:00:00"),
          y: forth?.SAE / 1000,
        });
      } else {
        const eia = resdata1[i];
        const forth = resdata2.find((item) => item.date === eia.date);
        data.push(
          { x: new Date(forth?.date + " 04:00:00"), y: 1000 },
          {
            x: getPreviousDay(new Date(forth?.date)),
            y: 0,
          }
        );
        if (eia)
          data1.push({
            x: new Date(eia?.date + " 04:00:00"),
            y: eia?.SAE / 1000,
          });
        data2.push({
          x: new Date(forth?.date + " 04:00:00"),
          y: forth?.SAE / 1000,
        });
      }
    }

    const options = {
      animationEnabled: true,
      backgroundColor: "#191932",
      colorSet: "CustomColorSet",
      height: 260,
      title: {
        text: "Comparison of last 8 weeks in thousands of barrels",
        fontFamily: "Open Sans",
        fontColor: "#9F9FDA",
        fontSize: 12,
        fontWeight: 400,
        horizontalAlign: "left",
      },
      axisX: {
        valueFormatString: "MMM-DD",
        labelFontColor: "#6A6A9F",
        labelTextAlign: "center",
        labelFontSize: 10,
        labelLineHeight: 16,
        labelFontWeight: 400,
        interval: 1,
        intervalType: "week",
      },
      axisY: {
        maximum: 1000,
        minimum: 600,
        labelFontColor: "#6A6A9F",
        labelTextAlign: "center",
        labelFontSize: 10,
        labelLineHeight: 16,
        labelFontWeight: 400,
        includeZero: false,
      },
      legend: {
        horizontalAlign: "left",
        verticalAlign: "top",
        fontSize: 14,
        fontWeight: 400,
        fontColor: "#9F9FDA",
        fontFamily: "Open Sans",
        cursor: "pointer",
        itemWrap: false,
      },
      toolTip: {
        shared: true,
        contentFormatter: function (e) {
          var str = `<div style="padding: 3px; color: #05050f">`;
          str += moment(e.entries[0]?.dataPoint.x).format("MMM DD,YYYY");
          if (e.entries[1]?.dataPoint.y) {
            str += `<br/><span style="color: #01F1E3;">EIA: </span><span>${e.entries[1]?.dataPoint.y}</span>`;
          }
          if (e.entries[2]?.dataPoint.y) {
            str += `<br/><span style="color: #991CFA;">SpaceVision: </span><span>${e.entries[2]?.dataPoint.y}</span>`;
          }
          str += "</div>";
          return str;
        },
      },
      data: [
        {
          type: "column",
          dataPoints: data,
        },
        {
          type: "spline",
          xValueFormatString: "MMM YYYY",
          showInLegend: true,
          name: "EIA",
          dataPoints: data1,
        },
        {
          type: "spline",
          xValueFormatString: "MMM YYYY",
          showInLegend: true,
          name: "ForthGrid",
          dataPoints: data2,
        },
      ],
    };
    setOptions(options);

    setLoading(false);
    try {
      const response3 = await fetch(API_URL + "article/");
      const res3 = await response3.json();
      let articles = [];
      res3.data.forEach((item) => {
        const list = item.meta.split(" at ");
        const date = list[0];
        const time = list[1].split(" | ")[0];

        const article = {
          ...item,
          meta: timeDistance(date + " " + time),
        };
        articles.push(article);

        setNews(articles);
      });
    } catch (error) {
      console.error(error);
    }
  };

  const download = (filename) => {
    filename = filename || "historic_data.csv";
    var csv, ctr, keys, columnDelimiter, lineDelimiter, csvData, link;
    if (downloadData == null || !downloadData.length) {
      return;
    }

    var data = [];

    downloadData.map((item) =>
      data.push({
        "Week Ending": item.date,
        "Ending Stocks of Crude Oil": item.crude.SAE || 0,
        "Ending Stocks excluding SPR of Crude Oil": item.crude.SAX || 0,
        "Ending Stocks of Crude Oil in SPR": item.crude.SAS || 0,
        "EIA Ending Stocks of Crude Oil": item.eia.SAE || 0,
        "EIA Ending Stocks excluding SPR of Crude Oil": item.eia.SAX || 0,
        "EIA Ending Stocks of Crude Oil in SPR": item.eia.SAS || 0,
        "Weekly Accuracy SpaceVision vs EIA": item.accuracy,
      })
    );

    columnDelimiter = ",";
    lineDelimiter = "\n";
    keys = Object.keys(data[0]);

    csv = "";
    csv += keys.join(columnDelimiter);
    csv += lineDelimiter;

    data.forEach(function (item) {
      ctr = 0;
      keys.forEach(function (key) {
        if (ctr > 0) csv += columnDelimiter;
        csv += item[key];
        ctr++;
      });
      csv += lineDelimiter;
    });

    if (!csv.match(/^data:text\/csv/i)) {
      csv = "data:text/csv;charset=utf-8," + csv;
    }

    csvData = encodeURI(csv);
    link = document.createElement("a");
    link.setAttribute("href", csvData);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /* eslint-disable */
  useEffect(() => {
    getFetchData();
  }, []);
  /* eslint-enable */

  return (
    <>
      {!loading && (
        <>
          <div className="title">Space Powered US Oil Insights</div>
          <div className="main-content">
            {tab === "Home" && (
              <>
                <div className="left">
                  <div className="detail text">
                    Last Satellite Download: {date}
                  </div>
                  <div className="date text">
                    Last Satellite Download
                    <br />
                    {date}
                  </div>
                  <div className="card-group-2">
                    <div className="card">
                      <div className="text">Crude Stock Est.</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[0].crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div className="indicator">Thds BBL</div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="text">Crude Stock Est.</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[0].crude.SAE > downloadData[1].crude.SAE
                            ? "Build"
                            : "Draw"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-group-2">
                    <div className="card">
                      <div className="text">WoW Crude Stock</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[1].crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div
                          className={
                            downloadData[0].crude.SAE >
                            downloadData[1].crude.SAE
                              ? "indicator plus"
                              : "indicator minus"
                          }
                        >
                          <Arrow />
                          <div className="percent">
                            {(
                              (100 *
                                Math.abs(
                                  downloadData[1].crude.SAE -
                                    downloadData[0].crude.SAE
                                )) /
                              downloadData[1].crude.SAE
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <div className="text">MoM Crude Stock</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[4].crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div
                          className={
                            downloadData[0].crude.SAE >
                            downloadData[4].crude.SAE
                              ? "indicator plus"
                              : "indicator minus"
                          }
                        >
                          <Arrow />
                          <div className="percent">
                            {(
                              (100 *
                                Math.abs(
                                  downloadData[4].crude.SAE -
                                    downloadData[0].crude.SAE
                                )) /
                              downloadData[4].crude.SAE
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-group-2">
                    <div className="card primary">
                      <div className="text">Time Till EIA</div>
                      <div className="value">
                        <div className="amount">{time}</div>
                      </div>
                    </div>
                    <div className="card chart">
                      <div className="text small">
                        <span className="name">Est Accuracy</span>
                        <span className="amount">{accuracy}%</span>
                      </div>
                      <div className="diagram">
                        <div
                          className="purple diagram"
                          style={{ width: `${accuracy}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="card-group">
                    <div className="card card-3">
                      <div className="text">WoW Crude Stock</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[1].crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div
                          className={
                            downloadData[0].crude.SAE >
                            downloadData[1].crude.SAE
                              ? "indicator plus"
                              : "indicator minus"
                          }
                        >
                          <Arrow />
                          <div className="percent">
                            {(
                              (100 *
                                Math.abs(
                                  downloadData[1].crude.SAE -
                                    downloadData[0].crude.SAE
                                )) /
                              downloadData[1].crude.SAE
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card card-3">
                      <div className="text">MoM Crude Stock</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[4].crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div
                          className={
                            downloadData[0].crude.SAE >
                            downloadData[4].crude.SAE
                              ? "indicator plus"
                              : "indicator minus"
                          }
                        >
                          <Arrow />
                          <div className="percent">
                            {(
                              (100 *
                                Math.abs(
                                  downloadData[4].crude.SAE -
                                    downloadData[0].crude.SAE
                                )) /
                              downloadData[4].crude.SAE
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="card card-3">
                      <div className="text">YoY Crude Stock</div>
                      <div className="value">
                        <div className="amount">
                          {downloadData[52].crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div
                          className={
                            downloadData[0].crude.SAE >
                            downloadData[52].crude.SAE
                              ? "indicator plus"
                              : "indicator minus"
                          }
                        >
                          <Arrow />
                          <div className="percent">
                            {(
                              (100 *
                                Math.abs(
                                  downloadData[52].crude.SAE -
                                    downloadData[0].crude.SAE
                                )) /
                              downloadData[52].crude.SAE
                            ).toFixed(2)}
                            %
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card">
                    <div className="text recent">Recent News</div>
                    <div className="table classic">
                      {news.map((item, index) => (
                        <a className="row text" key={index} href={item.link}>
                          <div className="time">{item.meta}</div>
                          <div className="text">{item.description}</div>
                        </a>
                      ))}
                      {/* <div className="row text">
                        <div className="time">40m</div>
                        <div className="text">
                          EU gas markets have seen a sudden bout of volatility
                          over the last 10 days. The gas trading market in
                          Europe is seeing an influx of traders who do not
                          normally play on that market.
                        </div>
                      </div>
                      <div className="row text">
                        <div className="time">1h</div>
                        <div className="text">
                          Crude oil inventories in the United States decreased
                          this week by 2.408 million barrels, the American
                          Petroleum Institute (API) data showed on Tuesday,
                          after falling by 1.246 million barrels in the week
                          prior.
                        </div>
                      </div>
                      <div className="row text">
                        <div className="time">2h</div>
                        <div className="text">
                          Despite the delay in the Final Investment Decision
                          (FID) by TotalEnergies for offshore Block 58, recent
                          successful oil discoveries have reignited Suriname's
                          hopes for an oil boom.
                        </div>
                      </div> */}
                    </div>
                  </div>
                  <div className="card-group">
                    <div className="card card-2">
                      <div className="text">Accuracy of SpaceVision</div>
                      <div className="chart">
                        <Ellipse3 className="ellipse3" />
                        <Ellipse2 className="ellipse2" />
                        <Ellipse1 className="ellipse1" />
                        <div className="text">{accuracy + "%"}</div>
                      </div>
                    </div>
                    <div className="card card-2 primary">
                      <div className="text">Number of Weeks</div>
                      <div className="weeks">{number}</div>
                    </div>
                  </div>
                  <div
                    className="btn primary report"
                    onClick={() => download()}
                  >
                    Download SpaceVision Report
                  </div>
                </div>
                <div className="right">
                  <div className="card table">
                    <div className="card-header">
                      <div className="card-title">
                        Last Four Weeks of US Crude Oil Stock in Thousands of
                        Barrels
                      </div>
                      <div
                        className="btn primary"
                        onClick={() => setTab("Historic")}
                      >
                        Historic
                      </div>
                    </div>
                    <div className="row table-header">
                      <div className="col">Week Ending</div>
                      <div className="col">Ending Stocks of Crude Oil</div>
                      <div className="col">
                        Ending Stocks excluding SPR of Crude Oil
                      </div>
                      <div className="col">
                        Ending Stocks of Crude Oil in SPR
                      </div>
                      <div className="col">EIA Ending Stocks of Crude Oil</div>
                      <div className="col">
                        EIA Ending Stocks excluding SPR of Crude Oil
                      </div>
                      <div className="col">
                        EIA Ending Stocks of Crude Oil in SPR
                      </div>
                      <div className="col">
                        Weekly Accuracy SpaceVision vs. EIA
                      </div>
                    </div>
                    {data.map((item, index) => (
                      <div className="row table-row" key={"new-" + index}>
                        <div className="col">{item.date}</div>
                        <div className="col crude">
                          {item.crude.SAE.toLocaleString("es-US")}
                        </div>
                        <div className="col crude">
                          {item.crude.SAX.toLocaleString("es-US")}
                        </div>
                        <div className="col crude">
                          {item.crude.SAS.toLocaleString("es-US")}
                        </div>
                        <div className="col eia">
                          {item.eia.SAE.toLocaleString("es-US")}
                        </div>
                        <div className="col eia">
                          {item.eia.SAX.toLocaleString("es-US")}
                        </div>
                        <div className="col eia">
                          {item.eia.SAS.toLocaleString("es-US")}
                        </div>
                        <div className="col">{item.accuracy + "%"}</div>
                      </div>
                    ))}
                  </div>
                  <div className="card chart">
                    <div className="subtitle">SpaceVision vs EIA Report</div>
                    <CanvasJSChart options={options} className="crude-chart" />
                  </div>
                </div>
              </>
            )}
            {tab === "Historic" && (
              <div className="historic">
                <div className="detail text">Last Updated: 06/16/2023</div>
                <div className="card table">
                  <div className="card-header">
                    <div className="card-title">Historic Crude Oil Stock</div>
                    <div className="btn-group">
                      <div
                        className="btn primary"
                        onClick={() => setTab("Home")}
                      >
                        Back To Home
                      </div>
                      <div className="btn primary" onClick={() => download()}>
                        Download CSV
                      </div>
                    </div>
                  </div>
                  <div className="row table-header">
                    <div className="col">Week Ending</div>
                    <div className="col">
                      <span>
                        Ending Stocks of <br />
                        Crude Oil
                      </span>
                    </div>
                    <div className="col">
                      <span>
                        Ending Stocks excluding
                        <br />
                        SPR of Crude Oil
                      </span>
                    </div>
                    <div className="col">
                      <span>
                        Ending Stocks of
                        <br />
                        Crude Oil in SPR
                      </span>
                    </div>
                    <div className="col">
                      <span>
                        EIA Ending Stocks of
                        <br />
                        Crude Oil
                      </span>
                    </div>
                    <div className="col">
                      <span>
                        EIA Ending Stocks excluding
                        <br />
                        SPR of Crude Oil
                      </span>
                    </div>
                    <div className="col">
                      <span>
                        EIA Ending Stocks of
                        <br />
                        Crude Oil in SPR
                      </span>
                    </div>
                    <div className="col">
                      <span>
                        Weekly Accuracy
                        <br />
                        SpaceVision vs. EIA
                      </span>
                    </div>
                  </div>
                  {tableData.map((item, index) => (
                    <div className="row table-row" key={"table" + index}>
                      <div className="col">{item.date}</div>
                      <div className="col crude">
                        {item.crude.SAE.toLocaleString("es-US")}
                      </div>
                      <div className="col crude">
                        {item.crude.SAX.toLocaleString("es-US")}
                      </div>
                      <div className="col crude">
                        {item.crude.SAS.toLocaleString("es-US")}
                      </div>
                      <div className="col eia">
                        {item.eia.SAE.toLocaleString("es-US")}
                      </div>
                      <div className="col eia">
                        {item.eia.SAX.toLocaleString("es-US")}
                      </div>
                      <div className="col eia">
                        {item.eia.SAS.toLocaleString("es-US")}
                      </div>
                      <div className="col">{item.accuracy + "%"}</div>
                    </div>
                  ))}
                  <div className="row card-footer"></div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default USCrudeOil;
