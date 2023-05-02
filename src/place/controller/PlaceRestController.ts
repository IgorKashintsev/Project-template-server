import {NullableId, Params} from '@feathersjs/feathers';
import {BadRequest, NotFound} from '@feathersjs/errors';
import Joi from 'joi';
import {Place} from '../Place';
import {PlaceRepository} from '../repository/PlaceRepository';
import {FilterPayload} from './FilterPayload';
import {BookingPayload} from './BookingPayload';
import {Filter} from '../repository/Filter';
import {Booking} from '../repository/Booking';
import {DateHelper} from '../../helpers/DateHelper';

export class PlaceRestController {
  constructor(private placeRepository: PlaceRepository) {}

  public async get(id: NullableId, params?: Params): Promise<Place> {
    const numericId = Number(id);
    if (!isFinite(numericId) || numericId <= 0) {
      throw new BadRequest();
    }

    // const coordinates: string = params?.query?.coordinates || '';
    const place = await this.placeRepository.get(numericId);

    // if (place != null && coordinates === '') {
    //   place.remoteness = 0;
    // }

    return place;
  }

  public async find(params?: Params): Promise<Place[]> {
    const query: Partial<FilterPayload> = params?.query || {};
    const minDate = DateHelper.resetTimeInDate(new Date());
    const filterSchema = Joi.object<FilterPayload>({
      coordinates: Joi.string()
        .pattern(new RegExp('^[0-9]{1,3}.[0-9]{1,15},[0-9]{1,3}.[0-9]{1,15}$'))
        .required(),
      checkInDate: Joi.date().timestamp('unix').min(minDate).required(),
      checkOutDate: Joi.date().timestamp('unix').greater(Joi.ref('checkInDate')).required(),
      maxPrice: Joi.number().min(0).default(0)
    });
    const validationResult = filterSchema.validate(query);
    
    if (validationResult.error != null) {
      throw new BadRequest(validationResult.error.message, validationResult.error.details);
    }

    const validatedParams: FilterPayload = validationResult.value;
    const coordinatesArray = validatedParams.coordinates.split(',');
    const filter: Filter = {
      coordinates: [Number(coordinatesArray[0]), Number(coordinatesArray[1])],
      startDate: validatedParams.checkInDate,
      endDate: validatedParams.checkOutDate,
      maxPrice: validatedParams.maxPrice
    }
    
    return await this.placeRepository.find(filter);
  }

  public async patch(id: NullableId, data: Partial<Place>, params?: Params): Promise<Place> {
    const numericId = Number(id);
    if (!isFinite(numericId) || numericId <= 0) {
      throw new BadRequest('Place ID is not correct.');
    }

    const placeToBook = await this.get(id);
    if (placeToBook == null) {
      throw new NotFound('Place not found.');
    }

    const minDate = DateHelper.resetTimeInDate(new Date());
    const query: Partial<BookingPayload> = params?.query || {};
    const bookingSchema = Joi.object<BookingPayload>({
      checkInDate: Joi.date().timestamp('unix').min(minDate).required(),
      checkOutDate: Joi.date().timestamp('unix').greater(Joi.ref('checkInDate')).required(),
    });
    const validationResult = bookingSchema.validate(query);

    if (validationResult.error != null) {
      throw new BadRequest(validationResult.error.message, validationResult.error.details);
    }

    const validatedParams: BookingPayload = validationResult.value;
    const booking: Booking = validatedParams;
    const dateToBook = DateHelper.generateDateRange(booking.checkInDate, booking.checkOutDate);

    return await this.placeRepository.book(
      placeToBook,
      dateToBook
    );
  }
}
