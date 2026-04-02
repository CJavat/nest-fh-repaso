import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

import type { Car } from './interfaces';
import { CreateCarDTO } from './dtos/create-car.dto';
import { UpdateCarDTO } from './dtos';

@Injectable()
export class CarsService {
  private cars: Car[] = [
    {
      id: uuid(),
      brand: 'Toyota',
      model: 'Corolla',
    },
    {
      id: uuid(),
      brand: 'Honda',
      model: 'Civic',
    },
    {
      id: uuid(),
      brand: 'Jeep',
      model: 'Cherokee',
    },
  ];

  public findAll() {
    return this.cars;
  }

  public finOneById(id: string) {
    const car = this.cars.find((car) => car.id == id);
    if (!car) throw new NotFoundException(`Car with id ${id} not found`);

    return car;
  }

  public create(createCarDTO: CreateCarDTO) {
    const car: Car = {
      id: uuid(),
      ...createCarDTO,
    };

    this.cars.push(car);

    return car;
  }

  public update(id: string, updateCarDTO: UpdateCarDTO) {
    let carDB: Car = this.finOneById(id);

    this.cars = this.cars.map((car) => {
      if (car.id === id) {
        carDB = {
          ...carDB,
          ...updateCarDTO,
          id,
        };

        return carDB;
      }

      return car;
    });

    return carDB;
  }

  public delete(id: string) {
    this.finOneById(id);

    this.cars = this.cars.filter((car) => car.id !== id);

    return {
      ok: true,
      message: 'Eliminado',
    };
  }

  fillCarsWithSeedData(cars: Car[]) {
    this.cars = cars;
  }
}
