export class TopPlayersQueryDto {
  sort: string = 'sort=avgScores desc&sort=sumScore desc';
  pageNumber: string;
  pageSize: string;
}
