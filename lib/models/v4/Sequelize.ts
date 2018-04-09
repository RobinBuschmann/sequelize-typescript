import 'reflect-metadata';
import * as OriginSequelize from 'sequelize';
import {Model} from "../Model";
import {SequelizeConfig} from "../../types/SequelizeConfig";
import {getModelName, getAttributes, getOptions} from "../../services/models";
import {BaseSequelize} from "../BaseSequelize";
import {Table} from "../../annotations/Table";
import {BaseAssociation} from "../association/BaseAssociation";
import {Repository, ModelType} from "./repositoryMode/helpers";

export class Sequelize extends OriginSequelize implements BaseSequelize {
  throughMap: { [through: string]: any };
  _: { [modelName: string]: typeof Model };
  init: (config: SequelizeConfig) => void;
  addModels: (models: Array<typeof Model> | string[]) => void;
  getRepository: <T extends Model<T>>(model: ModelType<T>) => Repository<T>;
  associateModels: (models: Array<typeof Model>) => void;
  connectionManager: any;
  _repos: {};
  repositoryMode: boolean;

  constructor(config: SequelizeConfig | string) {
    if (typeof config === "string") {
      super(config);
    } else if (BaseSequelize.isISequelizeUriConfig(config)) {
      super(config.url, config);
    } else {
      super(BaseSequelize.prepareConfig(config));
    }

    this.throughMap = {};
    this._ = {};
    this._repos = {};

    if (typeof config !== "string") {
      this.init(config);
    }
  }

  getModelRepository(model: any): any {
    return class extends model { };
  }

  getThroughModel(through: string): typeof Model {
    // tslint:disable:max-classes-per-file
    @Table({tableName: through, modelName: through})
    class Through extends Model<Through> {
    }

    return Through;
  }

  adjustAssociation(model: any, association: BaseAssociation): void {
  }

  /**
   * Creates sequelize models and registers these models
   * in the registry
   */
  defineModels(models: Array<typeof Model>): void {
    models.forEach(model => {
      const modelName = getModelName(model.prototype);
      const attributes = getAttributes(model.prototype);
      const options = getOptions(model.prototype);

      if (!options) throw new Error(`@Table annotation is missing on class "${model['name']}"`);

      options['modelName'] = modelName;
      options['sequelize'] = this;

      model['init'](attributes, options);
    });
  }
}
