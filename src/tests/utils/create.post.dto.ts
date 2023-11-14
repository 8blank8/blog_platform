export const createPostDto = (number: number) => {
  return {
    title: `post${number}`,
    shortDescription: `post_${number} short content length`,
    content: `content post_${number}`,
  };
};
