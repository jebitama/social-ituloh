import { environments } from '../../environtments/environtments';
import { PublicFile } from '../../features/files/entities/file.entity';
import { PostEntity } from '../../features/posts/entities/post.entity';
import { PostFeed } from '../../features/posts/entities/postFeed.entity';
import { DataSource } from 'typeorm';
import { User } from '../../features/users/entities/user.entity';

export const appDataSource = new DataSource({
  type: 'postgres',
  host: environments.dbHost,
  port: environments.dbPort,
  username: environments.dbUser,
  password: environments.dbPass,
  database: environments.dbName,
  entities: [User, PublicFile, PostEntity, PostFeed],
  synchronize: true,
});
