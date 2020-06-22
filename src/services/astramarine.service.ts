import {getService} from '@loopback/service-proxy';
import {inject, Provider} from '@loopback/core';
import {AstramarineDataSource} from '../datasources';

export interface AstramarineService {
  getServices(body: StrJSONParam): Promise<SOAPResp>;
}

export class AstramarineProvider implements Provider<AstramarineService> {
  constructor(
    // astramarine must match the name property in the datasource json file
    @inject('datasources.astramarine')
    protected dataSource: AstramarineDataSource = new AstramarineDataSource(),
  ) {}

  value(): Promise<AstramarineService> {
    return getService(this.dataSource);
  }
}

interface StrJSONParam {
  StringJSON: string;
}

interface SOAPResp {
  result: {
    return: {
      [node: string]: {
        StringJSON: string;
      };
    };
  };
}
