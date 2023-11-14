import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogQueryRepository } from '../../features/blog/infrastructure/mongo/blog.query.repository';

@ValidatorConstraint({ name: 'CheckBlogId', async: true })
@Injectable()
export class CheckBlogId implements ValidatorConstraintInterface {
  constructor(private blogQueryRepository: BlogQueryRepository) {}

  async validate(blogId: string) {
    try {
      const blog = await this.blogQueryRepository.findBlogById(blogId);
      if (!blog) return false;
    } catch (e) {
      return false;
    }

    return true;
  }

  defaultMessage() {
    return `Blog not found`;
  }
}
