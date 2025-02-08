import { randomUUID } from "crypto";
import Prometheus from "prom-client";
import { singleton } from "../singleton";

@singleton(PrometheusClient)
export class PrometheusClient {
  HostId: string = randomUUID();

  DBInsertCounter = new Prometheus.Counter({
    name: "db_insert_counter",
    help: "db_insert_help",
    labelNames: ["collection", "worker_id"],
  });

  DBQueryHistogram = new Prometheus.Histogram({
    name: "db_query_duration_seconds",
    help: "db_query_duration_help",
    labelNames: ["collection", "worker_id", "operation", "status"],
  });
}
