import react, { Component } from "react";
import waitForPapaParse from "wait-for-papa-parse";
import HighCharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsHeatMap from "highcharts/modules/map";
import proj4 from "proj4";
import pkAll from "./pk-all";
import Select from "react-select";

if (typeof window !== "undefined") {
  window.proj4 = window.proj4 || proj4;
}
HighchartsHeatMap(HighCharts);

class HighChart extends Component {
  state = {
    options: {},
    selectedSize: null,
    selectedBathNo: null,
    options1: [
      {
        label: "4 Marla",
        value: "4 Marla",
      },
      {
        label: "8 Marla",
        value: "8 Marla",
      },
      {
        label: "10 Marla",
        value: "10 Marla",
      },
      {
        label: "12 Marla",
        value: "12 Marla",
      },
      {
        label: "1 Kanal",
        value: "1 Kanal",
      },
      {
        label: "2 Kanal",
        value: "2 Kanal",
      },
    ],
    bathNo: [
      {
        label: "1",
        value: "1",
      },
      {
        label: "2",
        value: "2",
      },
      {
        label: "3",
        value: "3",
      },
      {
        label: "4",
        value: "4",
      },
      {
        label: "5",
        value: "5",
      },
      {
        label: "6",
        value: "6",
      },
      {
        label: "7",
        value: "7",
      },
      {
        label: "8",
        value: "8",
      },
      {
        label: "9",
        value: "9",
      },
      {
        label: "10",
        value: "10",
      },
    ],
  };

  //get CSV data from the updated CSV
  fetchCsv() {
    return fetch("/data/outlierremovedZameen.csv").then(function (response) {
      let reader = response.body.getReader();
      let decoder = new TextDecoder("utf-8");

      return reader.read().then(function (result) {
        return decoder.decode(result.value);
      });
    });
  }

  gis = async (JS, plotSize, bathNo) => {
    console.log("JS", JS);

    let csvData = await this.fetchCsv();

    const file = waitForPapaParse(csvData);

    let chartText = "Currently Showing Plot Size: " + plotSize;
    if (typeof bathNo !== "undefined") {
      chartText = chartText + " & No. of BathRooms: " + bathNo;
    }
    chartText = chartText + " in Multiple cities of Pakistan";

    file.then((csv) => {
      //get data array from csv with first row in header and rest rows in property
      let [headers, ...property] = csv.data;

      //get data object with lat lon name and price from property data
      let data = property
        .filter((r) => {
          return r[11] == plotSize ? true : false;
        })
        .filter((d) => {
          if (typeof bathNo !== "undefined") {
            console.log("undefined");
            return d[10] == bathNo ? true : false;
          } else {
            return d;
          }
        })
        .map((row, index) => {
          let dataObj = {
            lat: parseFloat(row[8]),
            lon: parseFloat(row[9]),
            name: row[5],
            price: parseFloat(row[4]),
            z: index + 100,
            color: row[12] == "For Sale" ? "#123ABC" : "#ABC123",
            status: row[12],
            City: row[6],
          };
          return dataObj;
        });
      console.log(data);

      //from csv get data

      //load map json data from pkAll file
      const map = JS;
      var options = {
        chart: {
          type: "map",
        },
        title: {
          text: chartText,
        },

        tooltip: {
          pointFormat:
            "{point.capital}, {point.parentState}<br>" +
            "Lat: {point.lat}<br>" +
            "Lon: {point.lon}<br>" +
            "Price: {point.price}<br>" +
            "Area:{point.name}<br>" +
            "City: {point.City}<br>" +
            "Status: {point.status}<br>",
        },

        xAxis: {
          crosshair: {
            zIndex: 5,
            dashStyle: "dot",
            snap: false,
            color: "gray",
          },
        },
        mapNavigation: {
          enabled: true,
          buttonOptions: {
            theme: {
              fill: "white",
              "stroke-width": 1,
              stroke: "silver",
              r: 0,
              states: {
                hover: {
                  fill: "#a4edba",
                },
                select: {
                  stroke: "#039",
                  fill: "#a4edba",
                },
              },
            },
            verticalAlign: "bottom",
          },
        },

        yAxis: {
          crosshair: {
            zIndex: 5,
            dashStyle: "dot",
            snap: false,
            color: "gray",
          },
        },

        series: [
          {
            name: "Basemap",
            mapData: map,
            borderColor: "#606060",
            nullColor: "rgba(200, 200, 200, 0.2)",
            showInLegend: false,
          },
          {
            type: "mapbubble",
            dataLabels: {
              enabled: true,
              format: "{point.capital}",
            },
            name: "Property",
            data: data,
            maxSize: "0.00001 %",
          },
        ],
      };
      this.setState({ options: options });
    });
  };
  handleChangeOnMarla = (selectedSize) => {
    this.setState({ selectedSize: selectedSize });
    this.gis(pkAll, selectedSize.value);
  };

  handleChangeOnBath = (selectedBathNo) => {
    console.log(
      "selected bath : ",
      this.state.selectedSize,
      " ",
      selectedBathNo
    );
    this.gis(pkAll, this.state.selectedSize.value, selectedBathNo.value);
  };
  render() {
    return (
      <div>
        <div>
          Plot Size
          <Select
            onChange={this.handleChangeOnMarla}
            options={this.state.options1}
          />
        </div>
        <div>
          No. of Baths
          <Select
            onChange={this.handleChangeOnBath}
            options={this.state.bathNo}
          />
        </div>

        <div>
          <HighchartsReact
            constructorType={"mapChart"}
            highcharts={HighCharts}
            options={this.state.options}
          />
        </div>
      </div>
    );
  }
}
export default HighChart;
