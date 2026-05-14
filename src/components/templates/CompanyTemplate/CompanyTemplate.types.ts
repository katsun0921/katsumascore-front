import type { Company } from '@/types/entity';
import type { Post } from '@/types/post';

export type CompanyTemplateProps = {
  company: Company;
  productionPosts: Post[];
  distributorPosts: Post[];
};
