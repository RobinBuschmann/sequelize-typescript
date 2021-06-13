import { FindOptions } from 'sequelize';

export type AssociationGetOptions = {
  scope?: string | string[] | boolean;
  schema?: string;
} & FindOptions;
