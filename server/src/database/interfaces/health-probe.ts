export const HEALTH_PROBE = Symbol('HEALTH_PROBE');

export interface IHealthProbe {
  /** True when the database answers a trivial query. */
  databaseReachable(): Promise<boolean>;
}
