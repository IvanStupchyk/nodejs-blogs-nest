import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Post } from "../posts/Post.entity";
import { User } from "../users/User.entity";
import { AggregateRoot } from "@nestjs/cqrs";
import { BlogCreatedEvent } from "./events/blog-created.event";
import { v4 as uuidv4 } from "uuid";
import { HttpStatus } from "@nestjs/common";
import { exceptionHandler } from "../../utils/errors/exception.handler";
import { BlogUpdatedEvent } from "./events/blog-updated.event";

@Entity('blogs')
export class Blog extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', width: 15 })
  name: string;

  @Column({ type: 'varchar', width: 500 })
  description: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @Column({ type: 'varchar' })
  websiteUrl: string;

  @ManyToOne(() => User, (user) => user.blog, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => Post, (post) => post.blog)
  post: Post[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(
    name: string,
    description: string,
    websiteUrl: string,
    user: User,
  ) {
    const blog = new Blog();
    blog.id = uuidv4();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.user = user;
    blog.createdAt = new Date();

    const event = new BlogCreatedEvent(name, blog.id, blog.createdAt);
    blog.apply(event);

    return blog;
  }

  static update(
    blog: Blog | null,
    description: string,
    websiteUrl: string,
    name: string,
    userId: string,
  ) {
    if (blog && blog.user && blog.user.id !== userId) {
      return exceptionHandler(HttpStatus.FORBIDDEN);
    }
    if (!blog) {
      return exceptionHandler(HttpStatus.NOT_FOUND);
    } else {
      blog.name = name;
      blog.websiteUrl = websiteUrl;
      blog.description = description;

      const event = new BlogUpdatedEvent(name, blog.id, new Date());
      blog.apply(event);

      return blog;
    }
  }
}
