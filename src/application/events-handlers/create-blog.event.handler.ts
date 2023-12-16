import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BlogCreatedEvent } from '../../entities/blogs/events/blog-created.event';
import fs from 'fs';

@EventsHandler(BlogCreatedEvent)
export class BlogCreateHandler implements IEventHandler<BlogCreatedEvent> {
  handle(event: BlogCreatedEvent) {
    fs.appendFileSync(
      'src/logs/blog-logs.txt',
      `CREATED BLOG id: ${event.id}, name: ${event.name},  createdAt: ${event.createdAt},\n`,
    );
  }
}
