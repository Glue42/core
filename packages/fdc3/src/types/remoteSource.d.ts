export type RemoteSource = {
  /**
   * The url of the remote source of application definitions. The remote source needs to follow the [FDC3 AppDirectory standard](https://github.com/finos/FDC3). The applications provided by the remote need to either be of type Glue42WebApplicationDefinition or FDC3Definition.
   */
  url: string;

  /**
   * The polling interval for fetching application definitions from the remote source in milliseconds.
   * @default 3000
   */
  pollingInterval?: number;

  /**
   * The request timeout for fetching application definitions from the remote source in milliseconds.
   * @default 3000
   */
  requestTimeout?: number;
};
