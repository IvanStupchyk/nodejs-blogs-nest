import { HttpStatus } from '@nestjs/common';
import { PostsRepository } from '../../../infrastructure/repositories/posts.repository';
import { ObjectId } from 'mongodb';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPostDto } from '../../../dtos/posts/new-post.dto';

export class UpdatePostCommand {
  constructor(
    public id: string,
    public body: NewPostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand): Promise<number> {
    const { title, content, shortDescription, blogId } = command.body;

    if (!ObjectId.isValid(command.id)) return HttpStatus.NOT_FOUND;
    if (!ObjectId.isValid(blogId)) return HttpStatus.NOT_FOUND;

    const post = await this.postsRepository.findPostById(
      new ObjectId(command.id),
    );
    if (!post) return HttpStatus.NOT_FOUND;

    post.updatePost(title, content, shortDescription);

    await this.postsRepository.save(post);
    return HttpStatus.NO_CONTENT;
  }
}
