import { APIRequestsCountType } from '../../types/general.types';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ApiRequest,
  ApiRequestDocument,
} from '../../schemas/api-request.schema';

@Injectable()
export class ApiRequestRepository {
  constructor(
    @InjectModel(ApiRequest.name)
    private ApiRequestModel: Model<ApiRequestDocument>,
  ) {}

  async addAPIRequest(newRequest: APIRequestsCountType): Promise<boolean> {
    const apiRequestsCountInstance = new this.ApiRequestModel();

    // apiRequestsCountInstance.ip = newRequest.ip;
    // apiRequestsCountInstance.URL = newRequest.URL;
    // apiRequestsCountInstance.date = newRequest.date;
    //
    // await apiRequestsCountInstance.save();

    return true;
  }

  async getCountApiRequestToOneEndpoint(
    URL: string,
    ip: string,
    date: Date,
  ): Promise<number> {
    return this.ApiRequestModel.countDocuments({
      URL,
      ip,
      date: { $gte: date },
    });
  }
}
