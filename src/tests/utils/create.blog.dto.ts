export const createBlogDto = (number: number) => {
  return {
    name: `blog${number}`,
    description: `description${number}`,
    websiteUrl: `https://some-site${number}.ru`,
  };
};
