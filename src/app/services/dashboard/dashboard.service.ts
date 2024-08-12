import { inject, Injectable } from "@angular/core";
import { BehaviorSubject, combineLatest, map, switchMap } from "rxjs";
import { IAllCollection } from "src/app/interfaces";
import { PaymentsService } from "../Payments/payments.service";
import moment from "moment";
import * as Highcharts from "highcharts";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  readonly paymentsService = inject(PaymentsService);
  allCollection$: BehaviorSubject<IAllCollection> = new BehaviorSubject({
    flats: [],
    floors: [],
    vendors: [],
    expenses: [],
    expenseTypes: [],
    inventory: [],
    vehicleTypes: [],
    vehicles: [],
    maintenances: [],
    inventoryItemStatus: [],
    payments: [],
    paymentsBy: [],
    users: [],
  } as IAllCollection);

  paymentsByMaintenance$ = this.allCollection$.pipe(
    map((allCollection) =>
      allCollection.maintenances
        .filter((maintenance) => !!maintenance.id)
        .map((maintenance) => maintenance.id)
    ),
    switchMap((maintenanceIds) =>
      combineLatest(
        maintenanceIds.map((maintenanceId) => {
          return this.paymentsService.getPaymentsBYMaintenanceId(
            maintenanceId || ""
          );
        })
      ).pipe(
        map((payments) => {
          const returnValue: any[] = [];
          payments.forEach((element) => {
            if (element.length > 0) {
              returnValue.push(...element);
            }
          });
          return returnValue;
        })
      )
    )
  );

  maintainenaceData$ = combineLatest([
    this.allCollection$,
    this.paymentsByMaintenance$,
  ]).pipe(
    map(([allCollection, paymentsByMaintenance]) => {
      return allCollection.maintenances
        .map((maintenance) => {
          const paidAmounts = paymentsByMaintenance
            .filter((payment) => payment.maintenanceId === maintenance.id)
            .map((p) => p.amount)
            .reduce(
              (accumulator, currentValue) => accumulator + currentValue,
              0
            );
          const totalAmount = maintenance.amount * allCollection.flats.length;
          const notPaidAmount = totalAmount - paidAmounts;
          return {
            id: maintenance.id,
            month: maintenance.month,
            totalAmount,
            paidAmounts,
            notPaidAmount,
          };
        })
        .sort((a, b) => {
          const monthA: moment.Moment = moment(a.month, "YYYY-MM");
          const monthB: moment.Moment = moment(b.month, "YYYY-MM");
          return monthA.diff(monthB);
        });
    })
  );

  maintainenaceChatData$ = this.maintainenaceData$.pipe(
    map((maintainenaceData) => {
      return {
        height: maintainenaceData.length * 80,
        config: {
          chart: {
            type: "bar",
          },
          title: { text: "", align: "center" },
          xAxis: {
            categories: maintainenaceData.map((data) =>
              moment(data.month, "YYYY-MM").format("MMM-YYYY")
            ),
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
          colors: ["#ffc107", "#198754", "#dc3545"],
          credits: {
            enabled: false,
          },
          series: [
            {
              name: "Total",
              type: "bar",
              data: maintainenaceData.map((data) => data.totalAmount),
            },
            {
              name: "Paid",
              type: "bar",
              data: maintainenaceData.map((data) => data.paidAmounts),
            },
            {
              name: "Not Paid",
              type: "bar",
              data: maintainenaceData.map((data) => data.notPaidAmount),
            },
          ],
        } as Highcharts.Options,
      };
    })
  );

  flatsMaintainenaceChatData$ = combineLatest([
    this.allCollection$,
    this.paymentsByMaintenance$,
  ]).pipe(
    map(([{ maintenances, flats }, paymentsByMaintenance]) => {
      return flats.map((f) => {
        return {
          ...f,
          maintenances: maintenances.map((m) => {
            const payment = paymentsByMaintenance.find(
              (p) => p.maintenanceId == m.id && p.flatId == f.id
            );
            return {
              amount: m.amount,
              flat: f.id,
              year: m.year,
              dueOn: m.month + "-01",
              paidOn: payment ? payment.paymentDate : "",
            };
          }),
        };
      });
    }),
    map((data) => {
      const flatData = data.map((flat) => {
        const unpaidMonths = flat.maintenances
          .filter((m) => !m.paidOn)
          .map((m) => ({
            count: 1,
            date: moment(m.dueOn, "YYYY-MM-DD").format("MMM DD, YYYY"),
          }));

        const filterPayments = (m: { amount?: number; flat?: string | undefined; year?: string; dueOn: any; paidOn: any; }, isLate = false) => {
          const startDate = moment(m.dueOn, "YYYY-MM-DD");
          const endDate = moment(m.dueOn, "YYYY-MM-DD").add(5, "days");
          const targetDate = moment(m.paidOn, "YYYY-MM-DD");
          return (
            m.paidOn &&
            (isLate
              ? targetDate.isAfter(endDate)
              : targetDate.isBetween(startDate, endDate, null, "[]"))
          );
        };

        const onPayments = flat.maintenances
          .filter((m) => filterPayments(m))
          .map((m) => ({
            count: 1,
            date: moment(m.paidOn, "YYYY-MM-DD").format("MMM DD, YYYY"),
          }));

        const latePayments = flat.maintenances
          .filter((m) => filterPayments(m, true))
          .map((m) => ({
            count: 1,
            date: moment(m.paidOn, "YYYY-MM-DD").format("MMM DD, YYYY"),
          }));

        return {
          name: flat.name,
          id: flat.id,
          unpaidMonths,
          onPayments,
          latePayments,
        };
      });

      // Define a custom interface for points with paymentDates
      interface CustomPoint extends Highcharts.Point {
        paymentDates: string[];
      }

      const getSeriesData = (
        key: "onPayments" | "latePayments" | "unpaidMonths"
      ) =>
        flatData.map((flat) => {
          const payments = flat[key];
          return {
            y: payments.length,
            paymentDates: payments.map((p) => p.date),
          };
        });

      return {
        height: 500,
        config: {
          chart: {
            type: "bar",
          },
          title: {
            text: "",
          },
          xAxis: {
            categories: flatData.map((flat) => flat.name),
          },
          yAxis: {
            title: {
              text: "Count",
            },
          },
          colors: ["#dc3545", "#ffc107", "#198754"],
          series: [
            {
              name: "Unpaid Months",
              data: getSeriesData("unpaidMonths"),
            },
            {
              name: "Late Payments",
              data: getSeriesData("latePayments"),
            },
            {
              name: "On Payments",
              data: getSeriesData("onPayments"),
            },
          ],
          tooltip: {
            formatter: function (
              this: Highcharts.TooltipFormatterContextObject
            ): string {
              const point = this.point as CustomPoint; // Cast to CustomPoint
              const dates = point.paymentDates.join("<br>");
              return `<b>${this.series.name}</b>: ${this.y}<br><b>Dates:</b><br>${dates}`;
            },
          },
        } as unknown as Highcharts.Options,
      };
    })
  );
}

/* 
amount : 1000
flatId : "egzrgPiPCz9SOrYnYZVb"
id : "21rmlHRU0HK6gm9LXtpO"
maintenanceId : "lAPNophXHVrFOysb9X1i"
paymentBy : "upi"
paymentDate : "2024-08-11"
 */
