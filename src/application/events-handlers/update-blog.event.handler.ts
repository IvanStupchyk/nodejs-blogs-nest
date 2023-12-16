import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import fs from 'fs';
import { BlogUpdatedEvent } from '../../entities/blogs/events/blog-updated.event';

@EventsHandler(BlogUpdatedEvent)
export class BlogUpdateHandler implements IEventHandler<BlogUpdatedEvent> {
  handle(event: BlogUpdatedEvent) {
    fs.appendFileSync(
      'src/logs/blog-logs.txt',
      `UPDATED BLOG id: ${event.id}, name: ${event.name},  updatedAt: ${event.updatedAt},\n`,
    );
  }
}
