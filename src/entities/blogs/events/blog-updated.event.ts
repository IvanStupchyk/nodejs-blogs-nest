export class BlogUpdatedEvent {
  constructor(
    public name: string,
    public id: string,
    public updatedAt: Date,
  ) {}
}
