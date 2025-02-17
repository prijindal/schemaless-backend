/* eslint-disable @typescript-eslint/no-explicit-any */
import { DecorateAll } from "decorate-all";
import { inject } from "inversify";
import { provide } from "inversify-binding-decorators";
import { type FindOptionsOrder, type FindOptionsSelect, type FindOptionsWhere, In, Repository } from "typeorm";
import type { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";
import { TypeOrmConnection } from "../db/typeorm";
import { logger } from "../logger";
import { PrometheusClient } from "../prometheus";

export type GroupByReturnType<K extends string> = {
  [k in K]?: string | boolean;
} & {
  count: number;
};

function durationMetrics(
  _: any,
  propertyKey: string | symbol,
  descriptor: PropertyDescriptor
) {
  const original = descriptor.value;
  descriptor.value = async function (...props: any) {
    const selfClass = this as any;
    const endFn = (
      selfClass.prometheusClient as PrometheusClient
    ).DBQueryHistogram.startTimer({
      collection: selfClass.model.metadata.tableName,
      operation: propertyKey.toString(),
      worker_id: selfClass.prometheusClient.HostId,
    });
    let status: "success" | "error" = "success";
    try {
      const result = await original.call(this, ...props);
      return result;
    } catch (e) {
      status = "error";
      throw e;
    } finally {
      endFn({ status });
    }
  };
}

@provide(BaseTypeOrmService)
@DecorateAll(durationMetrics, {
  exclude: ["groupByQueryBuilder"],
})
export abstract class BaseTypeOrmService<T extends { id: string }> {
  abstract get model(): Repository<T>;

  constructor(
    @inject(TypeOrmConnection) protected conn: TypeOrmConnection,
    @inject(PrometheusClient) protected prometheusClient: PrometheusClient
  ) { }

  async getAll(): Promise<T[]> {
    return await this.model.find();
  }

  async getMany(
    where: FindOptionsWhere<T>,
    { select, order }: { select?: FindOptionsSelect<T>, order?: FindOptionsOrder<T> } = {}
  ): Promise<T[]> {
    return await this.model.find({ where, select, order });
  }

  async distinct(where: FindOptionsWhere<T>, column: keyof T): Promise<T[keyof T][]> {
    const a = await this.model.createQueryBuilder().where(where).distinctOn([column.toString()]).getMany();
    return a.map(a => a[column]);
  }

  async getById(id: string): Promise<T | null> {
    try {
      return this.model.findOneBy({ id: id as any });
    } catch (e) {
      logger.debug(e);
      return null;
    }
  }

  async getByIds(ids: string[]): Promise<T[]> {
    return await this.model.find({ where: { id: In(ids) as any } });
  }

  async getOne(query: FindOptionsWhere<T>): Promise<T | null> {
    return await this.model.findOneBy(query);
  }

  async exists(where: FindOptionsWhere<T>) {
    return await this.model.exists({ where });
  }

  async createWithId(
    newResource: Omit<T, "created_at" | "updated_at">
  ): Promise<T> {
    const saved = await this.model.save(newResource as T);
    this.prometheusClient.DBInsertCounter.labels({
      collection: this.model.metadata.tableName,
      worker_id: this.prometheusClient.HostId,
    }).inc(1);
    return saved;
  }

  async create(
    newResource: Omit<T, "id" | "created_at" | "updated_at">
  ): Promise<T> {
    const saved = await this.model.save(newResource as T);
    this.prometheusClient.DBInsertCounter.labels({
      collection: this.model.metadata.tableName,
      worker_id: this.prometheusClient.HostId,
    }).inc(1);
    return saved;
  }

  async insert(
    newResources: Omit<T, "id" | "created_at" | "updated_at">[]
  ): Promise<T[]> {
    const saved = await this.model.save(newResources as T[]);
    this.prometheusClient.DBInsertCounter.labels({
      collection: this.model.metadata.tableName,
      worker_id: this.prometheusClient.HostId,
    }).inc(saved.length);
    return saved;
  }

  async update(
    filter: FindOptionsWhere<T>,
    updatedResource: QueryDeepPartialEntity<T>
  ) {
    const updated = await this.model.update(filter, updatedResource);
    return updated.affected;
  }

  async delete(id: string) {
    return await this.model.delete({ id: id as any });
  }

  async deleteMany(filter: FindOptionsWhere<T>) {
    const deleteResult = await this.model.delete(filter);
    return deleteResult;
  }

  getRawMany(
    groupBy: string[],
    filter: FindOptionsWhere<T> = {},
    select: string[] = groupBy
  ) {
    return this.groupByQueryBuilder(groupBy, filter, select).getRawMany();
  }

  private groupByQueryBuilder(
    groupBy: string[],
    filter: FindOptionsWhere<T> = {},
    select: string[] = groupBy
  ) {
    const query = this.model
      .createQueryBuilder()
      .select([...select, "count(*) as count"])
      .where(filter);
    groupBy.forEach((group) => {
      query.addGroupBy(group);
    });
    return query;
  }

  async count(): Promise<number> {
    return this.model.count();
  }
}
