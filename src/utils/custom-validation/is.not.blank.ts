import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotBlank' })
@Injectable()
export class IsNotBlank implements ValidatorConstraintInterface {
  async validate(str: string) {
    try {
      if (str.trim().length === 0) return false;
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `should be not blank`;
  }
}
