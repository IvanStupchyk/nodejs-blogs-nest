import { SortOrder } from '../../constants/sort.order';
import { Game } from '../../entities/game/Game.entity';

export class GamesQueryDto {
  sortBy: keyof Game = 'pairCreatedDate';
  sortDirection: SortOrder.asc | SortOrder.desc;
  pageNumber: string;
  pageSize: string;
}
