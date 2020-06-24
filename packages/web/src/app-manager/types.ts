export interface AppProps {
  name: string;
  title?: string;
  version?: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  userProperties?: { [key: string]: any };
}
