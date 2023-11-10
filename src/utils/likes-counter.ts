import { likeStatus } from '../types/general.types';

type LikesInfoType = {
  likesCount: number;
  dislikesCount: number;
};

export const likesCounter = (
  myStatus: string,
  initialNewStatus: likeStatus,
  initialStatus: likeStatus | undefined,
  initialLikesInfo: LikesInfoType,
): { likesInfo: LikesInfoType; newStatus: likeStatus } => {
  let newStatus: likeStatus = initialNewStatus;

  const likesInfo = { ...initialLikesInfo };

  if (initialStatus) {
    if (myStatus === 'Like' && initialStatus === 'Dislike') {
      likesInfo.likesCount = ++likesInfo.likesCount;
      likesInfo.dislikesCount = --likesInfo.dislikesCount;
      newStatus = likeStatus.Like;
    }

    if (myStatus === 'Like' && initialStatus === 'None') {
      likesInfo.likesCount = ++likesInfo.likesCount;
      newStatus = likeStatus.Like;
    }

    if (myStatus === 'Dislike' && initialStatus === 'Like') {
      likesInfo.dislikesCount = ++likesInfo.dislikesCount;
      likesInfo.likesCount = --likesInfo.likesCount;
      newStatus = likeStatus.Dislike;
    }

    if (myStatus === 'Dislike' && initialStatus === 'None') {
      likesInfo.dislikesCount = ++likesInfo.dislikesCount;
      newStatus = likeStatus.Dislike;
    }

    if (myStatus === 'None' && initialStatus === 'Like') {
      likesInfo.likesCount = --likesInfo.likesCount;
      newStatus = likeStatus.None;
    }

    if (myStatus === 'None' && initialStatus === 'Dislike') {
      likesInfo.dislikesCount = --likesInfo.dislikesCount;
      newStatus = likeStatus.None;
    }
  } else {
    switch (myStatus) {
      case 'Like':
        likesInfo.likesCount = ++likesInfo.likesCount;
        newStatus = likeStatus.Like;
        break;
      case 'Dislike':
        likesInfo.dislikesCount = ++likesInfo.dislikesCount;
        newStatus = likeStatus.Dislike;
        break;
      default:
        return { likesInfo, newStatus };
    }
  }

  return { likesInfo, newStatus };
};
