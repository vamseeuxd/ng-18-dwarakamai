import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import { MatTabsModule } from "@angular/material/tabs";
import { DashboardService } from "src/app/services/dashboard/dashboard.service";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, HighchartsChartModule, MatTabsModule],
  templateUrl: "./dashboard.component.html",
  styleUrl: "./dashboard.component.scss",
})
export class DashboardComponent {
  Highcharts: typeof Highcharts = Highcharts;
  readonly dashboardService = inject(DashboardService);
  chartOptions: Highcharts.Options = {
    chart: {
      type: "bar",
    },
    title: { text: "", align: "center" },
    xAxis: {
      categories: [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC",
      ],
      title: {
        text: null,
      },
      gridLineWidth: 1,
      lineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: { text: "Amount (₹)", align: "high" },
      labels: {
        overflow: "justify",
      },
      gridLineWidth: 0,
    },
    tooltip: {
      valueSuffix: " ₹",
    },
    plotOptions: {
      bar: {
        borderRadius: "50%",
        dataLabels: { enabled: true },
        groupPadding: 0.1,
      },
    },
    colors: ["#6edff6", "#75b798", "#ea868f"],
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "top",
      x: -40,
      y: 80,
      floating: true,
      borderWidth: 1,
      backgroundColor:
        Highcharts.defaultOptions.legend?.backgroundColor || "#fef1f4",
      shadow: true,
    },
    credits: {
      enabled: false,
    },
    series: [
      {
        name: "Total",
        type: "bar",
        data: [
          16000, 16000, 16000, 16000, 16000, 16000, 16000, 16000, 16000, 16000,
          16000, 16000,
        ],
      },
      {
        name: "Paid",
        type: "bar",
        data: [8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 0, 0, 0, 0],
      },
      {
        name: "Not Paid",
        type: "bar",
        data: [
          8000, 8000, 8000, 8000, 8000, 8000, 8000, 8000, 16000, 16000, 16000,
          16000,
        ],
      },
    ],
  };
}
