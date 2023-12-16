export class BlogCreatedEvent {
  constructor(
    public name: string,
    public id: string,
    public createdAt: Date,
  ) {}
}
