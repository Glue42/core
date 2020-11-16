import { Glue42 } from "@glue42/desktop";

export type Glue42GDOriginalGlue = {
  [key: string]: any;
  instances: Glue42.Glue[];
};

export type Glue42GD = Glue42.GDObject & {
  fdc3InitsGlue: boolean;
  originalGlue?: Glue42GDOriginalGlue;
};
